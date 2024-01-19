// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {GhoToken} from "./GhoToken.sol";

contract GhoBridge is OwnerIsCreator, CCIPReceiver {
    IRouterClient public router;
    LinkTokenInterface public linkToken;

    GhoToken public ghoToken;

    uint8 public totalSupportedChains;

    mapping(uint64 => address) public supportedContracts;
    uint64[] public supportedChains;

    uint256 constant GAS_LIMIT = 150_000;

    event SupportChainAdded(uint64 chainSelector, address contractAddress);
    event SupportChainRemoved(uint64 chainSelector);

    error SupportedContractCannotBeZeroAddress();
    error ChainNotSupported();
    error ReceiverCannotBeZeroAddress();
    error InsufficientBalance();
    error OnlySupportedContracts();

    mapping(address => uint256) public credit;

    constructor(
        IRouterClient _router,
        LinkTokenInterface _linkToken,
        GhoToken _ghoToken
    ) CCIPReceiver(address(_router)) {
        router = _router;
        linkToken = _linkToken;
        ghoToken = _ghoToken;
    }

    function addSupportedContract(
        uint64 chainSelector,
        address contractAddress
    ) public onlyOwner {
        if (contractAddress == address(0))
            revert SupportedContractCannotBeZeroAddress();
        if (supportedContracts[chainSelector] == address(0))
            totalSupportedChains++;
        supportedChains.push(chainSelector);
        supportedContracts[chainSelector] = contractAddress;
        emit SupportChainAdded(chainSelector, contractAddress);
    }

    function removeSupportedContract(uint64 chainSelector) public onlyOwner {
        if (supportedContracts[chainSelector] == address(0))
            revert ChainNotSupported();
        supportedContracts[chainSelector] = address(0);
        for (uint256 i = 0; i < totalSupportedChains; i++) {
            if (supportedChains[i] == chainSelector) {
                supportedChains[i] = supportedChains[--totalSupportedChains];
                delete supportedChains[--totalSupportedChains];
                break;
            }
        }
        emit SupportChainRemoved(chainSelector);
    }

    function initiateBridging(
        uint256 destinationChainSelector,
        uint256 amount
    ) public {
        initiateBridging(destinationChainSelector, msg.sender, amount);
    }

    function initiateBridging(
        uint256 destinationChainSelector,
        address receiver,
        uint256 amount
    ) public {
        if (supportedContracts[destinationChainSelector] == address(0))
            revert ChainNotSupported();
        if (reciver == address(0)) revert ReceiverCannotBeZeroAddress();

        ghoToken.transferFrom(msg.sender, address(this), amount);

        ghoToken.burn(amount);

        address votingContractAddress = supportedContracts[
            destinationChainSelector
        ];
        _sendMessage(
            destinationChainSelector,
            votingContractAddress,
            abi.encode(receiver, amount)
        );
    }

    function _completeBridging(address receiver, uint256 amount) internal {
        credit[receiver] += amount;
    }

    function _sendMessage(
        uint64 destinationChainSelector,
        address receiver,
        bytes memory data
    ) internal returns (bytes32 messageId) {
        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver),
            data: data,
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 200_000, strict: false})
            ),
            feeToken: address(linkToken)
        });

        uint256 fees = router.getFee(destinationChainSelector, evm2AnyMessage);

        if (fees > linkToken.balanceOf(address(this)))
            revert NotEnoughBalance(linkToken.balanceOf(address(this)), fees);

        linkToken.approve(address(router), fees);

        messageId = router.ccipSend(destinationChainSelector, evm2AnyMessage);

        return messageId;
    }

    function _ccipReceive(
        Client.Any2EVMMessage memory any2EvmMessage
    ) internal override {
        address sender = abi.decode(any2EvmMessage.sender, (address));
        if (supportedContracts[any2EvmMessage.sourceChainSelector] != sender)
            revert OnlySupportedContracts();

        (address receiver, uint256 amount) = abi.decode(
            any2EvmMessage.data,
            (address, uint256)
        );

        _completeBridging(receiver, amount);
    }

    function withdraw(uint256 amount) external {
        if (credit[msg.sender] == 0 || credit[msg.sender] < amount)
            revert InsufficientBalance();

        credit[msg.sender] -= amount;

        ghoToken.mint(msg.sender, amount);
    }
}

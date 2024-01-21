# GhoBridge: Cross-Chain Token Bridging with Chainlink CCIP

GhoBridge is a decentralized, secure, and efficient cross-chain bridging solution powered by Chainlink's Cross-Chain Interoperability Protocol (CCIP), and Gho Token's Facilitator Logic designed for the Gho Token.

## Features

- **Cross-Chain Bridging**: Securely transfer Gho Token across supported blockchains with minimal trust assumptions.
- **Chainlink CCIP Integration**: Utilizes Chainlink's Cross-Chain Interoperability Protocol for decentralized message passing.
- **Fee Management**: Manages LINK token fees for cross-chain messaging, ensuring efficient and cost-effective operations.
- **Access Control**: Implements ownership-based access control for administrative functions.
- **Credit System**: Credits the recipient's account on the destination chain, allowing for flexible withdrawal of bridged tokens.
- **Event Logging**: Comprehensive event logs for key actions, enhancing transparency and auditability.

## Quick Start

### Prerequisites

- Node.js and npm installed
- An Ethereum wallet with ETH and LINK for deploying contracts and paying transaction fees

### Installation

1. **Clone the Repository**

   ```
   git clone https://github.com/GhoBridge/smart-contracts.git
   cd gho-bridge
   ```

2. **Install Dependencies**

   ```
   npm install
   ```

3. **Add the env variables**

   ```
   cp .env.template .env
   ```

4. **Compile Contracts**

   ```
   npx hardhat compile
   ```

5. **Deploy Contracts**

   Run all the scripts in the sequense on all the supported networks, to deploy the contracts

### Usage

#### Adding Supported Chains and Contracts

Only the contract owner can add or remove supported chains and their corresponding GhoToken contracts on those chains.

```solidity
// Add a supported chain and contract
addSupportedContract(uint64 chainSelector, address contractAddress);

// Remove a supported chain
removeSupportedContract(uint64 chainSelector);
```

#### Bridging Tokens

Users can bridge tokens to a supported chain by calling `initiateBridging`.

```solidity
// Bridge tokens to the recipient on the destination chain
initiateBridging(uint64 destinationChainSelector, address receiver, uint256 amount);
```

#### Withdrawing Tokens

Recipients can withdraw their credited tokens on the destination chain.

```solidity
// Withdraw credited tokens
withdraw(uint256 amount);
```

## Security

This project is in the development stage and has not been audited. Use at your own risk. Before using this contract in a production environment, it is highly recommended to undergo a comprehensive security audit.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues to discuss proposed changes or report bugs.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

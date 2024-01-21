import hre from "hardhat";
import { chains } from "./common";
import fs from "fs";
import type { Address } from "viem";
import { parseEther } from "viem";

async function depositFunds() {
  const network = hre.network.name;

  const chain = chains[network];

  if (!chain) throw `Chain ${network} is not supported`;

  const linkToken = await hre.viem.getContractAt(
    "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol:LinkTokenInterface",
    chain.linkToken
  );

  let ghoBridgeAddress: Address;

  try {
    const deploymentFile = fs.readFileSync(
      `./deployments/${network}.json`,
      "utf-8"
    );
    const deployment = JSON.parse(deploymentFile);
    ghoBridgeAddress = deployment.address;
  } catch (e) {
    throw `The gho bridge contract is not yet deployed on ${network}`;
  }

  await linkToken.write.transfer([ghoBridgeAddress, parseEther("5")]);
}

depositFunds().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

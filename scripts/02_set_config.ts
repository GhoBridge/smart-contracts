import hre from "hardhat";
import { chains } from "./common";
import fs from "fs";
import type { Address } from "viem";

async function setConfig() {
  const network = hre.network.name;

  const chain = chains[network];

  if (!chain) throw `Chain ${network} is not supported`;

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

  // the config will go here
}

setConfig().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

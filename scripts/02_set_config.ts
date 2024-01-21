import hre from "hardhat";
import { chains } from "./common";
import fs from "fs";
import type { Address } from "viem";
import { parseEther } from "viem";

async function setConfig() {
  const network = hre.network.name;

  const chain = chains[network];

  if (!chain) throw `Chain ${network} is not supported`;
  const account = (await hre.viem.getWalletClients())[0].account.address;

  let ghoBridgeAddress: Address;
  let ghoTokenAddress: Address;

  try {
    const deploymentFile = fs.readFileSync(
      `./deployments/${network}.json`,
      "utf-8"
    );
    const deployment = JSON.parse(deploymentFile);
    ghoBridgeAddress = deployment.address;
    ghoTokenAddress = deployment.token;
  } catch (e) {
    throw `The gho bridge contract is not yet deployed on ${network}`;
  }

  const token = await hre.viem.getContractAt("GhoToken", ghoTokenAddress);

  await token.write.grantRole([
    await token.read.FACILITATOR_MANAGER_ROLE(),
    account,
  ]);

  await token.write.addFacilitator([
    ghoBridgeAddress,
    "bridge",
    parseEther("10000000000000000"),
  ]);
}

setConfig().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

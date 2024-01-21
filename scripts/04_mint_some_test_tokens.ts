import hre from "hardhat";
import { chains, delay } from "./common";
import fs from "fs";
import type { Address } from "viem";
import { parseEther } from "viem";

async function mintSomeTestTokens() {
  const network = hre.network.name;

  const chain = chains[network];

  if (!chain) throw `Chain ${network} is not supported`;

  const account = (await hre.viem.getWalletClients())[0].account.address;

  let ghoTokenAddress: Address;

  try {
    const deploymentFile = fs.readFileSync(
      `./deployments/${network}.json`,
      "utf-8"
    );
    const deployment = JSON.parse(deploymentFile);
    ghoTokenAddress = deployment.token;
  } catch (e) {
    throw `The gho bridge contract is not yet deployed on ${network}`;
  }

  const token = await hre.viem.getContractAt("GhoToken", ghoTokenAddress);

  await token.write.grantRole([
    await token.read.FACILITATOR_MANAGER_ROLE(),
    account,
  ]);

  await delay(10000);

  await token.write.addFacilitator([
    account,
    "tester",
    parseEther("1000000000"),
  ]);

  await delay(10000);

  await token.write.mint([account, parseEther("1000000000")]);
}

mintSomeTestTokens().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import hre from "hardhat";
import { chains } from "./common";
import fs from "fs";
import type { Address } from "viem";

async function connectContracts() {
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

  const ghoBridge = await hre.viem.getContractAt("GhoBridge", ghoBridgeAddress);

  const deployedNetworks = fs
    .readdirSync("./deployments")
    .filter(
      (fileName) =>
        fileName.split(".")[fileName.split(".").length - 1] === "json"
    )
    .map((fileName) => fileName.split(".")[0])
    .filter((deploymentChain) => deploymentChain !== network)
    .map((deploymentChain) => {
      const { address } = JSON.parse(
        fs
          .readFileSync(`./deployments/${deploymentChain}.json`)
          .toString("utf-8")
      );
      return {
        address,
        chain: deploymentChain,
        ...chains[deploymentChain],
      };
    });

  for (const deployedNetworkInfo of deployedNetworks) {
    await ghoBridge.write.addSupportedContract([
      BigInt(deployedNetworkInfo.selector),
      deployedNetworkInfo.address,
    ]);
  }
}

connectContracts().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

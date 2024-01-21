import hre from "hardhat";
import fs from "fs";
import path from "path";
import { chains } from "./common";

async function writeJSONToFile(
  data: any,
  fileName: string,
  dirPath = "./deployments"
) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);

  const filePath = path.join(dirPath, fileName);

  if (fs.existsSync(filePath)) return false;

  fs.writeFileSync(filePath, JSON.stringify(data));
  return true;
}

async function deployContracts() {
  const network = hre.network.name;
  console.log(network);

  const chain = chains[network];

  const admin = (await hre.viem.getWalletClients())[0].account.address;

  const ghoToken = await hre.viem.deployContract("GhoToken", [admin], {
    confirmations: 2,
  });

  console.log(`Gho Token is deployed to ${ghoToken.address}`);

  try {
    await hre.run("verify:verify", {
      address: ghoToken.address,
      constructorArguments: [admin],
    });
  } catch (e) {
    console.log(e);
  }

  const ghoBridge = await hre.viem.deployContract(
    "GhoBridge",
    [chain.relayer, chain.linkToken, ghoToken.address],
    { confirmations: 2 }
  );

  console.log(`Gho Bridge is deployed to ${ghoBridge.address}`);

  try {
    await hre.run("verify:verify", {
      address: ghoBridge.address,
      constructorArguments: [chain.relayer, chain.linkToken, ghoToken.address],
    });
  } catch (e) {
    console.log(e);
  }

  const fileName = `${network}.json`;
  const data = { token: ghoToken.address, address: ghoBridge.address };
  writeJSONToFile(data, fileName);
}

deployContracts().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

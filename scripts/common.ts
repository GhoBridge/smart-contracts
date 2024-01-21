import type { Address } from "viem";

interface ChainInfo {
  relayer: Address;
  linkToken: Address;
  selector: string;
}

export const supportedNetworks: Record<number, string> = {
  11155111: "sepolia",
  80001: "polygon-mumbai",
};

export const chains: Record<string, ChainInfo> = {
  sepolia: {
    relayer: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59",
    linkToken: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    selector: "16015286601757825753",
  },
  "polygon-mumbai": {
    relayer: "0x1035CabC275068e0F4b745A29CEDf38E13aF41b1",
    linkToken: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
    selector: "12532609583862916517",
  },
};

export const delay = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

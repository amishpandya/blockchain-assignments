import { createPublicClient, http, getAddress, formatUnits } from "viem";

// Minimal ERC-20 ABI
const ERC20_ABI = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] }
];

const RPC_URL = "https://hh-10.didlab.org"; // your DIDLab RPC URL
const CHAIN_ID = 31346;
const TOKEN_ADDRESS = "0xF1478f211F027EBA42ca369ea976F1eB43C6bB53";
const ACCOUNT = "0x71bE63f3384f5fb98995898A86B02Fb2426c5788";

const publicClient = createPublicClient({
  chain: {
    id: CHAIN_ID,
    name: "DIDLab Team 10",
    rpcUrls: { default: { http: [RPC_URL] } },
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  },
  transport: http(),
});

async function main() {
  // read decimals
  const decimals = await publicClient.readContract({
    address: TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "decimals",
  });

  // read balance
  const balance = await publicClient.readContract({
    address: TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [ACCOUNT],
  });

  console.log("Balance:", formatUnits(balance, Number(decimals)));
}

main().catch(console.error);

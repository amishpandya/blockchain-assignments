import "dotenv/config";
import fs from "node:fs/promises";
import { artifacts } from "hardhat";
import { createWalletClient, createPublicClient, http, parseUnits, getAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const RPC_URL = process.env.RPC_URL!;
const CHAIN_ID = Number(process.env.CHAIN_ID || 31337);
const PRIVATE_KEY = (process.env.PRIVATE_KEY || "").replace(/^0x/, "");
const NAME = process.env.TOKEN_NAME || "CampusCredit";
const SYMBOL = process.env.TOKEN_SYMBOL || "CAMP";
const CAP_HUMAN = process.env.TOKEN_CAP || "2000000";
const INIT_HUMAN = process.env.TOKEN_INITIAL || "1000000";

async function main() {
  if (!RPC_URL || !CHAIN_ID || !PRIVATE_KEY) throw new Error("Missing env vars (RPC_URL, CHAIN_ID, PRIVATE_KEY)");

  const { abi, bytecode } = await artifacts.readArtifact("CampusCreditV2");

  const chain = {
    id: CHAIN_ID,
    name: `didlab-${CHAIN_ID}`,
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: [RPC_URL] } },
  } as const;

  const account = privateKeyToAccount(`0x${PRIVATE_KEY}`);
  const wallet = createWalletClient({ account, chain, transport: http(RPC_URL) });
  const publicClient = createPublicClient({ chain, transport: http(RPC_URL) });

  // parseUnits: decimals as number (not bigint) — use 18
  const cap = parseUnits(CAP_HUMAN, 18);
  const initialMint = parseUnits(INIT_HUMAN, 18);

  console.log("Deploying CampusCreditV2...");

  // bytecode typing expects a 0x-prefixed template type; ensure it starts with 0x and cast
  const bytecode0x = bytecode.startsWith("0x") ? bytecode : `0x${bytecode}`;

  const hash = await wallet.deployContract({
    abi,
    bytecode: bytecode0x as `0x${string}`,
    args: [NAME, SYMBOL, cap, getAddress(account.address), initialMint],
    maxPriorityFeePerGas: 2_000_000_000n,
    maxFeePerGas: 20_000_000_000n,
  });

  console.log("Deploy tx:", hash);

  // wait for receipt
  const rcpt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Deployed at:", rcpt.contractAddress);
  console.log("Block:", rcpt.blockNumber?.toString());

  // Save hashes for analyze scripts
  await fs.appendFile("tx-hashes.txt", `${hash}\n`);
  await fs.writeFile("tx-last.txt", `${hash}\n`);
  console.log(`Wrote tx-hashes.txt and tx-last.txt`);
  console.log(`\nAdd this to .env if you want: TOKEN_ADDRESS=${rcpt.contractAddress}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

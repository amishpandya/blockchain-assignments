// scripts/deploy.ts
import "dotenv/config";
import { artifacts } from "hardhat";
import {
  createWalletClient,
  createPublicClient,
  http,
  parseUnits,
  getAddress,
  type Abi,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

const RPC_URL = process.env.RPC_URL ?? "";
const CHAIN_ID = process.env.CHAIN_ID ? Number(process.env.CHAIN_ID) : undefined;
const PRIVATE_KEY = (process.env.PRIVATE_KEY || "").replace(/^0x/, "");
const NAME = process.env.TOKEN_NAME || "CampusCredit";
const SYMBOL = process.env.TOKEN_SYMBOL || "CAMP";
const CAP_HUMAN = process.env.TOKEN_CAP || "2000000";
const INIT_HUMAN = process.env.TOKEN_INITIAL || "1000000";

async function main() {
  if (!RPC_URL || !CHAIN_ID || !PRIVATE_KEY) {
    throw new Error("Missing env vars: RPC_URL, CHAIN_ID, or PRIVATE_KEY");
  }

  // read artifact (Hardhat)
  const artifact = await artifacts.readArtifact("CampusCreditV2");

  // narrow types for viem
  const abi = artifact.abi as unknown as Abi;
  let bytecode = artifact.bytecode as string;
  if (!bytecode.startsWith("0x")) bytecode = "0x" + bytecode;
  // satisfy viem's template literal type
  const bytecode0x = bytecode as `0x${string}`;

  // build chain descriptor viem expects
  const chain = {
    id: CHAIN_ID,
    name: `didlab-${CHAIN_ID}`,
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: [RPC_URL] } },
  } as const;

  // wallet + provider clients
  const account = privateKeyToAccount(`0x${PRIVATE_KEY}`);
  const wallet = createWalletClient({ account, chain, transport: http(RPC_URL) });
  const publicClient = createPublicClient({ chain, transport: http(RPC_URL) });

  // parse human amounts -> wei (NOTE: decimals is a number, not BigInt)
  const cap = parseUnits(CAP_HUMAN, 18); // use number 18
  const initialMint = parseUnits(INIT_HUMAN, 18);

  console.log("Deploying CampusCreditV2...");
  const txHash = await wallet.deployContract({
    abi,
    bytecode: bytecode0x,
    args: [NAME, SYMBOL, cap, getAddress(account.address), initialMint],
    // EIP-1559 style values (bigints)
    maxPriorityFeePerGas: 2_000_000_000n, // 2 gwei
    maxFeePerGas: 20_000_000_000n, // 20 gwei
  });

  console.log("Deploy tx:", txHash);

  // wait for receipt
  const rcpt = await publicClient.waitForTransactionReceipt({ hash: txHash });

  console.log("Deployed at:", rcpt.contractAddress);
  console.log("Block:", rcpt.blockNumber?.toString());

  // Print environment hint for subsequent scripts
  console.log(`\nAdd this to .env (or copy it):\nTOKEN_ADDRESS=${rcpt.contractAddress}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

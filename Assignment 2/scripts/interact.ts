import "dotenv/config";
import fs from "node:fs/promises";
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  formatUnits,
  http,
  parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

const PRIVKEY = process.env.PRIVKEY as `0x${string}`;
if (!PRIVKEY) throw new Error("Missing PRIVKEY in .env");

const HH = process.env.HARDHAT_NETWORK;
const RPC_URL =
  HH === "localhost"
    ? "http://127.0.0.1:8545"
    : (process.env.RPC_URL || "http://127.0.0.1:8545");

async function detectChain() {
  const probe = createPublicClient({ transport: http(RPC_URL) });
  const rpcChainId = await probe.getChainId();
  return defineChain({
    id: rpcChainId,
    name: `rpc-${rpcChainId}`,
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: [RPC_URL] } },
  });
}

async function main() {
  const chain = await detectChain();

  const account = privateKeyToAccount(PRIVKEY);
  const publicClient = createPublicClient({ chain, transport: http(RPC_URL) });
  const walletClient = createWalletClient({ chain, transport: http(RPC_URL), account });

  // Load ABI + address
  const { abi } = JSON.parse(
    await fs.readFile("artifacts/contracts/CampusCredit.sol/CampusCredit.json", "utf8")
  );
  const { address: tokenAddress } = JSON.parse(
    await fs.readFile(`deployments/${chain.id}-CampusCredit.json`, "utf8")
  );

  console.log("Using token:", tokenAddress);

  // Second account
  const acct2 = privateKeyToAccount(
    process.env.ACCT2_PRIV as `0x${string}` ||
      "0x59c6995e998f97a5a0044976f9d7a2b32e2f8d6d4f6f5f8f24f4f3e6f2d8d5b9"
  );

  // ---- Transaction 1: Transfer 100 tokens ----
  const tx1 = await walletClient.writeContract({
    address: tokenAddress,
    abi,
    functionName: "transfer",
    args: [acct2.address, parseUnits("100", 18)],
  });
  console.log("Tx1 hash (transfer):", tx1);
  await publicClient.waitForTransactionReceipt({ hash: tx1 });

  // ---- Transaction 2: Approve acct2 to spend 50 tokens ----
  const tx2 = await walletClient.writeContract({
    address: tokenAddress,
    abi,
    functionName: "approve",
    args: [acct2.address, parseUnits("50", 18)],
  });
  console.log("Tx2 hash (approve):", tx2);
  await publicClient.waitForTransactionReceipt({ hash: tx2 });

  // ---- Transaction 3: Transfer another 25 tokens ----
  const tx3 = await walletClient.writeContract({
    address: tokenAddress,
    abi,
    functionName: "transfer",
    args: [acct2.address, parseUnits("25", 18)],
  });
  console.log("Tx3 hash (transfer again):", tx3);
  await publicClient.waitForTransactionReceipt({ hash: tx3 });

  // Save the 3 hashes for analyze.ts
  await fs.writeFile("tx-last.txt", [tx1, tx2, tx3].join("\n"));
  console.log("Saved all 3 tx hashes to tx-last.txt");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

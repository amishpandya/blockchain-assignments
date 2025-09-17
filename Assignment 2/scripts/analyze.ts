// scripts/analyze.ts
import "dotenv/config";
import fs from "node:fs/promises";
import {
  createPublicClient,
  defineChain,
  formatUnits,
  http,
  parseAbi,
  parseEventLogs,
} from "viem";

/**
 * Resolve RPC URL same way as other scripts:
 * - If HARDHAT_NETWORK === "localhost" use local node URL
 * - Otherwise prefer RPC_URL from .env
 */
const HH = process.env.HARDHAT_NETWORK;
const RPC_URL =
  HH === "localhost"
    ? "http://127.0.0.1:8545"
    : (process.env.RPC_URL || "http://127.0.0.1:8545");

/** Load tx hashes:
 * - If TX_HASH env var is set it can contain one hash or comma/space/newline separated hashes
 * - Otherwise read tx-last.txt (one hash per line)
 */
async function loadTxHashes(): Promise<`0x${string}`[]> {
  const env = (process.env.TX_HASH || "").trim();
  if (env) {
    return env
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter((s) => /^0x[0-9a-fA-F]{64}$/.test(s)) as `0x${string}`[];
  }

  try {
    const file = (await fs.readFile("tx-last.txt", "utf8")).trim();
    if (!file) throw new Error("tx-last.txt is empty");
    return file
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => /^0x[0-9a-fA-F]{64}$/.test(s)) as `0x${string}`[];
  } catch (e) {
    throw new Error(
      "No tx hash found. Set TX_HASH in .env (can have multiple hashes) or put hashes (one per line) in tx-last.txt."
    );
  }
}

/** Ask the RPC for its real chainId (so you can switch RPCs freely) */
async function detectChain() {
  const probe = createPublicClient({ transport: http(RPC_URL) });
  const id = await probe.getChainId();
  return defineChain({
    id,
    name: `rpc-${id}`,
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: [RPC_URL] } },
  });
}

// ERC-20 events we’ll decode if present
const erc20Events = parseAbi([
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
]);

async function analyzeHash(publicClient: ReturnType<typeof createPublicClient>, chainId: number, hash: `0x${string}`) {
  const tx = await publicClient.getTransaction({ hash });
  const rcpt = await publicClient.getTransactionReceipt({ hash });
  if (!rcpt) {
    console.log(`\n=== Analysis for ${hash} (chain ${chainId}) ===`);
    console.log("No receipt found (tx may be pending or invalid).");
    return;
  }
  const block = await publicClient.getBlock({ blockNumber: rcpt.blockNumber });

  const baseFee = block.baseFeePerGas ?? 0n;
  const gasUsed = rcpt.gasUsed ?? 0n;
  const effectiveGasPrice =
    (rcpt as any).effectiveGasPrice ?? // EIP-1559 receipts
    tx.gasPrice ??                     // legacy fallback
    0n;

  const totalFee = gasUsed * effectiveGasPrice;

  console.log(`\n=== Analysis for ${hash} (chain ${chainId}) ===`);
  console.log("Status:", rcpt.status);
  console.log("Block number:", rcpt.blockNumber?.toString());
  console.log("Timestamp (UTC):", new Date(Number(block.timestamp) * 1000).toISOString());
  console.log("From:", tx.from, "To:", tx.to);
  console.log("Nonce:", tx.nonce?.toString());
  console.log("Gas limit:", tx.gas?.toString());
  console.log("Gas used:", gasUsed.toString());
  console.log("Base fee per gas:", baseFee.toString());
  console.log("Max fee per gas:", (tx.maxFeePerGas ?? 0n).toString());
  console.log("Max priority fee per gas:", (tx.maxPriorityFeePerGas ?? 0n).toString());
  console.log("Effective gas price:", effectiveGasPrice.toString());
  console.log("Total fee (wei):", totalFee.toString(), `(≈ ${formatUnits(totalFee, 18)} ETH)`);

  // Try to decode standard ERC-20 logs if present
  const decoded = parseEventLogs({ abi: erc20Events, logs: rcpt.logs, strict: false });
  if (decoded.length === 0) {
    console.log("No standard ERC-20 Transfer/Approval logs decoded (or none present).");
  }
  for (const ev of decoded) {
    const { eventName, args } = ev as any;
    const human = args?.value ? formatUnits(args.value, 18) : "";
    console.log(`Event: ${eventName}`, {
      from: args?.from ?? args?.owner,
      to: args?.to ?? args?.spender,
      valueRaw: args?.value?.toString?.(),
      valueHuman: human,
    });
  }
}

async function main() {
  const chain = await detectChain();
  const publicClient = createPublicClient({ chain, transport: http(RPC_URL) });
  const hashes = await loadTxHashes();

  for (const hash of hashes) {
    try {
      await analyzeHash(publicClient, chain.id, hash);
    } catch (err) {
      console.error(`Error analyzing ${hash}:`, err);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

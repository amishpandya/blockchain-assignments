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

// RPC selection (favor local)
const HH = process.env.HARDHAT_NETWORK;
const RPC_URL = HH === "localhost" ? "http://127.0.0.1:8545" : (process.env.RPC_URL || "http://127.0.0.1:8545");

async function loadTxHash(): Promise<`0x${string}`> {
  const envHash = (process.env.TX_HASH || "").trim();
  if (envHash && /^0x[0-9a-fA-F]{64}$/.test(envHash)) return envHash as `0x${string}`;
  try {
    const fileHash = (await fs.readFile("tx-last.txt", "utf8")).trim();
    if (fileHash && /^0x[0-9a-fA-F]{64}$/.test(fileHash)) return fileHash as `0x${string}`;
  } catch {}
  throw new Error("No tx hash found. Set TX_HASH in .env or put the hash in tx-last.txt (single line).");
}

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

const erc20Events = parseAbi([
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
]);

async function main() {
  const chain = await detectChain();
  const publicClient = createPublicClient({ chain, transport: http(RPC_URL) });
  const hash = await loadTxHash();

  const tx = await publicClient.getTransaction({ hash });
  const rcpt = await publicClient.getTransactionReceipt({ hash });
  const block = await publicClient.getBlock({ blockNumber: rcpt.blockNumber });

  const baseFee = block.baseFeePerGas ?? 0n;
  const gasUsed = rcpt.gasUsed ?? 0n;
  const effectiveGasPrice = (rcpt as any).effectiveGasPrice ?? tx.gasPrice ?? 0n;
  const totalFee = gasUsed * effectiveGasPrice;

  console.log(`\n=== Analysis for ${hash} (chain ${chain.id}) ===`);
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

  const decoded = parseEventLogs({ abi: erc20Events, logs: rcpt.logs, strict: false });
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

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

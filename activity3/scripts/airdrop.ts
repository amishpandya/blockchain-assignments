import "dotenv/config";
import fs from "node:fs/promises";
import { artifacts } from "hardhat";
import { createWalletClient, createPublicClient, http, parseUnits, getAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const RPC_URL = process.env.RPC_URL!;
const CHAIN_ID = Number(process.env.CHAIN_ID || 31337);
const PRIVATE_KEY = (process.env.PRIVATE_KEY || "").replace(/^0x/, "");
const TOKEN = process.env.TOKEN_ADDRESS as `0x${string}` | undefined;

async function main() {
  if (!RPC_URL || !CHAIN_ID || !PRIVATE_KEY || !TOKEN) throw new Error("Missing env (RPC_URL, CHAIN_ID, PRIVATE_KEY, TOKEN_ADDRESS)");
  const { abi } = await artifacts.readArtifact("CampusCreditV2");
  const chain = { id: CHAIN_ID, name:`didlab-${CHAIN_ID}`, nativeCurrency:{ name:"ETH",symbol:"ETH",decimals:18 }, rpcUrls:{ default:{ http:[RPC_URL] } } } as const;
  const account = privateKeyToAccount(`0x${PRIVATE_KEY}`);
  const wallet = createWalletClient({ account, chain, transport: http(RPC_URL) });
  const publicClient = createPublicClient({ chain, transport: http(RPC_URL) });

  const recipients = [
    getAddress(account.address),
    // add more addresses if you want teammates
  ];
  const amounts = recipients.map(()=>parseUnits("10", 18));

  // Batch airdrop
  const txBatch = await wallet.writeContract({
    address: TOKEN,
    abi,
    functionName: "airdrop",
    args: [recipients, amounts],
    maxPriorityFeePerGas: 2_000_000_000n,
    maxFeePerGas: 22_000_000_000n
  });

  console.log("Airdrop tx:", txBatch);
  await fs.appendFile("tx-hashes.txt", `${txBatch}\n`);
  await fs.writeFile("tx-last.txt", `${txBatch}\n`);
  const rBatch = await publicClient.waitForTransactionReceipt({ hash: txBatch });
  const feeBatch = rBatch.gasUsed * (rBatch.effectiveGasPrice ?? 0n);
  console.log("Airdrop done gasUsed:", rBatch.gasUsed?.toString(), "fee(wei):", feeBatch.toString());

  // Singles compare
  let totalGas = 0n;
  let totalFee = 0n;
  for (let i = 0; i < recipients.length; i++) {
    const tx = await wallet.writeContract({
      address: TOKEN,
      abi,
      functionName: "transfer",
      args: [recipients[i], amounts[i]],
      maxPriorityFeePerGas: 2_000_000_000n,
      maxFeePerGas: 22_000_000_000n
    });
    await fs.appendFile("tx-hashes.txt", `${tx}\n`);
    const r = await publicClient.waitForTransactionReceipt({ hash: tx });
    totalGas += r.gasUsed ?? 0n;
    totalFee += (r.gasUsed ?? 0n) * (r.effectiveGasPrice ?? 0n);
  }

  console.log("Singles total gasUsed:", totalGas.toString(), "fee(wei):", totalFee.toString());
  if (totalGas > 0n) {
    const saved = (Number(totalGas - rBatch.gasUsed!) / Number(totalGas) * 100).toFixed(2);
    console.log(`Batch saved ≈ ${saved}% gas vs singles`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  formatUnits,
  http,
  parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

// Optional: you can set TOKEN_ADDRESS in .env to override the file lookup
const TOKEN_ENV = process.env.TOKEN_ADDRESS as `0x${string}` | undefined;

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

async function loadTokenAddress(chainId: number): Promise<`0x${string}`> {
  if (TOKEN_ENV) return TOKEN_ENV;
  const file = path.join("deployments", `${chainId}-CampusCredit.json`);
  try {
    const { address } = JSON.parse(await fs.readFile(file, "utf8"));
    return address as `0x${string}`;
  } catch {
    throw new Error(
      `No token address found. Either deploy first or set TOKEN_ADDRESS in .env. Expected file: ${file}`
    );
  }
}

async function main() {
  const chain = await detectChain();

  const account = privateKeyToAccount(PRIVKEY);
  const publicClient = createPublicClient({ chain, transport: http(RPC_URL) });
  const walletClient = createWalletClient({ chain, transport: http(RPC_URL), account });

  // Load ABI
  const artifactPath = path.join("artifacts", "contracts", "CampusCredit.sol", "CampusCredit.json");
  const { abi } = JSON.parse(await fs.readFile(artifactPath, "utf8"));

  const tokenAddress = await loadTokenAddress(chain.id);
  console.log("Using token:", tokenAddress);

  const show = async (label: string, addr1: `0x${string}`, addr2: `0x${string}`) => {
    const b1 = (await publicClient.readContract({
      address: tokenAddress,
      abi,
      functionName: "balanceOf",
      args: [addr1],
    })) as bigint;

    const b2 = (await publicClient.readContract({
      address: tokenAddress,
      abi,
      functionName: "balanceOf",
      args: [addr2],
    })) as bigint;

    console.log(`${label} | Deployer: ${formatUnits(b1, 18)} CAMP | Acct2: ${formatUnits(b2, 18)} CAMP`);
  };

  // For acct2: use a second key (on localhost you can use another default HH key;
  // on remote, set ACCT2_PRIV with funds)
  const ACCT2_PRIV = (process.env.ACCT2_PRIV as `0x${string}`) ||
    "0x59c6995e998f97a5a0044976f9d7a2b32e2f8d6d4f6f5f8f24f4f3e6f2d8d5b9";
  const acct2 = privateKeyToAccount(ACCT2_PRIV);

  await show("Before", account.address, acct2.address);

  const txHash = await walletClient.writeContract({
    address: tokenAddress,
    abi,
    functionName: "transfer",
    args: [acct2.address, parseUnits("100", 18)],
    // fee fields optional; leave out if your RPC estimates
    maxPriorityFeePerGas: 1_000_000_000n,
    maxFeePerGas: 20_000_000_000n,
  });
  console.log("Tx1 hash:", txHash);

  await publicClient.waitForTransactionReceipt({ hash: txHash });

  await show("After", account.address, acct2.address);

  console.log("HASHES:", JSON.stringify({ tx1: txHash }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

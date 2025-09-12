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

const SUPPLY = process.env.TOKEN_SUPPLY ?? "1000000";
const PRIVKEY = process.env.PRIVKEY as `0x${string}`;
if (!PRIVKEY) throw new Error("Missing PRIVKEY in .env");

// Respect --network localhost; otherwise use RPC_URL or default to localhost.
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

  const initialSupply = parseUnits(SUPPLY, 18);

  // Load compiled artifact
  const artifactPath = path.join("artifacts", "contracts", "CampusCredit.sol", "CampusCredit.json");
  const { abi, bytecode } = JSON.parse(await fs.readFile(artifactPath, "utf8"));

  // Deploy
  const hash = await walletClient.deployContract({ abi, bytecode, args: [initialSupply] });
  console.log("Deploy tx hash:", hash);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const address = receipt.contractAddress!;
  console.log("CampusCredit deployed to:", address);
  console.log("Deployer:", account.address);

  // Check balance
  const bal = (await publicClient.readContract({
    address,
    abi,
    functionName: "balanceOf",
    args: [account.address],
  })) as bigint;
  console.log("Deployer CAMP balance:", formatUnits(bal, 18));

  // Save deployment for later scripts
  await fs.mkdir("deployments", { recursive: true });
  const file = path.join("deployments", `${chain.id}-CampusCredit.json`);
  await fs.writeFile(file, JSON.stringify({ address, chainId: chain.id }, null, 2));
  console.log("Saved deployment →", file);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

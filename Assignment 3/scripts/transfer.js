import fs from "fs";
import dotenv from "dotenv";
import { createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts.js";
import { encodeFunctionData } from "viem";

dotenv.config();

const client = createPublicClient({
  transport: http(process.env.RPC_URL),
});

const account = privateKeyToAccount(process.env.PRIVATE_KEY);
const contractAddress = process.env.TOKEN_ADDRESS;
const artifact = JSON.parse(fs.readFileSync("./artifacts/contracts/MyToken.sol/MyToken.json", "utf8"));

async function main() {
  // Example transfer: send tokens to a second address
  const recipient = process.env.SECOND_ACCOUNT_ADDRESS; // set in .env
  const amount = BigInt(1000) * 10n ** 18n; // 1000 tokens

  const data = encodeFunctionData({
    abi: artifact.abi,
    functionName: "transfer",
    args: [recipient, amount],
  });

  const tx = await client.sendTransaction({
    account,
    to: contractAddress,
    data,
    gas: 100_000n,
  });

  console.log("Transfer tx hash:", tx.hash);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
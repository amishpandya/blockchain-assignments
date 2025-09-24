import fs from "fs";
import dotenv from "dotenv";
import { createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts.js";
import { encodeFunctionData } from "viem";
import { parseUnits } from "viem";

dotenv.config();

const client = createPublicClient({
  transport: http(process.env.RPC_URL),
});

const account = privateKeyToAccount(process.env.PRIVATE_KEY);
const contractAddress = process.env.TOKEN_ADDRESS;
const artifact = JSON.parse(fs.readFileSync("./artifacts/contracts/MyToken.sol/MyToken.json", "utf8"));

async function main() {
  const recipients = [
    "0xabc...1",
    "0xabc...2",
    "0xabc...3",
  ];

  const amounts = recipients.map(() => parseUnits("100", 18)); // 100 tokens each

  // Batch airdrop
  const batchData = encodeFunctionData({
    abi: artifact.abi,
    functionName: "airdrop",
    args: [recipients, amounts],
  });

  const txBatch = await client.sendTransaction({
    account,
    to: contractAddress,
    data: batchData,
    gas: 500_000n,
  });

  console.log("Batch tx hash:", txBatch.hash);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
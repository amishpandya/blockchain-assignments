import fs from "fs";
import dotenv from "dotenv";
import { createPublicClient, http } from "viem";
import { parseAbi } from "viem";

dotenv.config();

const client = createPublicClient({
  transport: http(process.env.RPC_URL),
});

const contractAddress = process.env.TOKEN_ADDRESS;
const artifact = JSON.parse(fs.readFileSync("./artifacts/contracts/MyToken.sol/MyToken.json", "utf8"));

// Parse ABI
const abi = parseAbi(artifact.abi);

async function main() {
  const events = await client.getLogs({
    address: contractAddress,
    fromBlock: BigInt(0),
    toBlock: "latest",
    event: abi.find((item) => item.name === "Transfer"),
  });

  for (const e of events) {
    console.log("Block:", e.blockNumber, "From:", e.args.from, "To:", e.args.to, "Value:", e.args.value.toString());
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
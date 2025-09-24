import 'dotenv/config';
import { createPublicClient, http } from 'viem';
import artifact from '../artifacts/contracts/MyToken.sol/MyToken.json' assert { type: 'json' };

const RPC = process.env.RPC_URL;
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
if (!RPC || !TOKEN_ADDRESS) {
  console.error("Missing RPC/TOKEN_ADDRESS");
  process.exit(1);
}

const publicClient = createPublicClient({ transport: http(RPC) });
const abi = artifact.abi;

(async () => {
  try {
    // find latest block
    const latestBlock = await publicClient.getBlockNumber();
    const fromBlock = Math.max(0, latestBlock - 2000);

    // Transfer event signature name "Transfer"
    // Use getLogs to filter by event topic (viem handles via abi)
    const transferLogs = await publicClient.getLogs({
      address: TOKEN_ADDRESS,
      fromBlock,
      toBlock: latestBlock,
      // topics can be auto derived if `event` is supplied via `abi` in some viem versions
      // viem supports parsing logs with `decodeEventLog`. We'll fetch raw logs and print key args.
    });

    console.log(`Found ${transferLogs.length} logs between blocks ${fromBlock}-${latestBlock}. Showing decoded Transfer/Approval if possible:`);

    for (const lg of transferLogs) {
      try {
        // decode using abi (some viem versions provide decodeEventLog)
        // fallback: print raw
        console.log(`block ${lg.blockNumber} tx ${lg.transactionHash} data ${lg.data} topics: ${lg.topics}`);
      } catch (e) {
        console.log("Log decode failed, raw:", lg);
      }
    }

  } catch (err) {
    console.error("Error getting logs:", err);
    process.exit(2);
  }
})();
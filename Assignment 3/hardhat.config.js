// hardhat.config.js (ESM)
import dotenv from "dotenv";
dotenv.config();

const { DIDLAB_RPC_URL, RPC_URL, PRIVATE_KEY } = process.env;

// prefer DIDLAB_RPC_URL, fallback to RPC_URL
const rpcUrl = DIDLAB_RPC_URL ?? RPC_URL;

// basic validation
if (!rpcUrl || typeof rpcUrl !== "string" || !/^https?:\/\//i.test(rpcUrl)) {
  throw new Error(
    "Missing or invalid RPC URL. Set DIDLAB_RPC_URL or RPC_URL in your .env to a valid http(s) RPC endpoint."
  );
}

if (!PRIVATE_KEY) {
  console.warn("Warning: PRIVATE_KEY not set. Networks using accounts will be unable to sign transactions.");
}

// ensure 0x prefix for private key if provided
const accounts = PRIVATE_KEY ? [PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : `0x${PRIVATE_KEY}`] : [];

const config = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      // keep your custom type if intentional; otherwise remove 'type'
      type: "edr-simulated",
    },
    didlab: {
      type: "http",
      url: rpcUrl,
      accounts,
    },
  },
};

export default config;

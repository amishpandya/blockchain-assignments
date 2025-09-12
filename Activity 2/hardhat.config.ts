import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-viem";
import * as dotenv from "dotenv";
dotenv.config();

const RPC_URL = process.env.RPC_URL;          // e.g. https://hh-10.didlab.org
const CHAIN_ID = Number(process.env.CHAIN_ID ?? 31337);
const PRIVKEY  = process.env.PRIVKEY;         // ⚠️ test key only

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      type: "edr-simulated",
      chainType: "l1",
      chainId: 31337,
      initialBaseFeePerGas: 1_000_000_000
    },
    localhost: {
      type: "http",
      chainType: "l1",
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
    // NEW: remote RPC from .env
    didlab: {
      type: "http",
      chainType: "l1",
      url: RPC_URL!,
      chainId: CHAIN_ID,
      // Provide the signer for writes. If undefined, writes will fail.
      accounts: PRIVKEY ? [PRIVKEY] : []
    }
  }
};

export default config;

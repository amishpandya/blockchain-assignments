// scripts/transfer.js
import fs from "fs";
import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

function requireEnv(name) {
  if (!process.env[name]) throw new Error(`${name} not set in .env`);
  return process.env[name];
}

async function main() {
  const rpcUrl = process.env.DIDLAB_RPC_URL || process.env.RPC_URL;
  if (!rpcUrl) throw new Error("RPC_URL or DIDLAB_RPC_URL not set in .env");

  const pkRaw = requireEnv("PRIVATE_KEY").trim();
  const privateKey = pkRaw.startsWith("0x") ? pkRaw : `0x${pkRaw}`;

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  console.log("Using RPC:", rpcUrl);

  // create wallet
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log("Using wallet:", wallet.address);

  // choose mode by env variables: if TOKEN_ADDRESS is set -> ERC20 transfer, otherwise native transfer
  const to = requireEnv("TO");
  if (process.env.TOKEN_ADDRESS) {
    // ERC20 transfer
    const tokenAddress = process.env.TOKEN_ADDRESS;
    const decimals = parseInt(process.env.TOKEN_DECIMALS ?? "18", 10);
    if (!process.env.AMOUNT_TOKENS) throw new Error("AMOUNT_TOKENS not set in .env for ERC20 transfer");

    const amountHuman = process.env.AMOUNT_TOKENS;
    const amount = ethers.parseUnits(amountHuman, decimals);

    // minimal ERC20 ABI for transfer
    const erc20Abi = [
      "function transfer(address to, uint256 amount) returns (bool)",
      "function symbol() view returns (string)",
      "function name() view returns (string)",
      "function decimals() view returns (uint8)",
    ];
    const token = new ethers.Contract(tokenAddress, erc20Abi, wallet);

    console.log(`Sending ${amountHuman} tokens (decimals ${decimals}) to ${to} from ${wallet.address}`);
    const tx = await token.transfer(to, amount);
    console.log("Tx hash:", tx.hash);
    const rc = await tx.wait();
    console.log("Tx mined in block", rc.blockNumber, "status:", rc.status);
  } else {
    // Native transfer
    if (!process.env.AMOUNT_ETH) throw new Error("AMOUNT_ETH not set in .env for native transfer");
    const amountEth = process.env.AMOUNT_ETH;
    const tx = await wallet.sendTransaction({
      to,
      value: ethers.parseEther(amountEth),
    });
    console.log("Tx hash:", tx.hash);
    const rc = await tx.wait();
    console.log("Tx mined in block", rc.blockNumber, "status:", rc.status);
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exitCode = 1;
});

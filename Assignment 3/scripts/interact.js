// scripts/interact.js
import fs from "fs";
import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

async function main() {
  // Connect to RPC
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

  // Create wallet
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  console.log("Using account:", wallet.address);

  // Load deployed contract address
  const deployed = JSON.parse(fs.readFileSync("./deployed-address.json", "utf8"));
  const contractAddress = deployed.address;
  console.log("Using contract at:", contractAddress);

  // Load compiled artifact
  const artifact = JSON.parse(
    fs.readFileSync("./artifacts/contracts/CampusCreditV2.sol/CampusCreditV2.json", "utf8")
  );

  // Connect contract
  const contract = new ethers.Contract(contractAddress, artifact.abi, wallet);

  // Check admin role
  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const isAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, wallet.address);
  console.log("Wallet has admin role:", isAdmin);

  if (!isAdmin) {
    console.error("This wallet cannot mint tokens. Exiting...");
    return;
  }

  // Check token decimals
  const decimals = await contract.decimals();
  console.log("Token decimals:", decimals);

  // Check if contract is paused
  let paused = false;
  if (contract.paused) {
    paused = await contract.paused();
  }
  console.log("Contract paused:", paused);

  if (paused) {
    console.error("Contract is paused. Cannot mint or transfer tokens.");
    return;
  }

  // --- MINT TOKENS TO SELF ---
  const mintAmount = ethers.parseUnits("1000", decimals);
  console.log(`Minting ${ethers.formatUnits(mintAmount, decimals)} CC to self...`);
  try {
    const tx = await contract.mint(wallet.address, mintAmount);
    await tx.wait();
    console.log("Mint successful!");
  } catch (err) {
    console.error("Mint failed:", err.reason || err);
  }

  // Check total supply and sender balance
  const totalSupply = await contract.totalSupply();
  let senderBalance = await contract.balanceOf(wallet.address);

  // --- TRANSFER TOKENS ---
  const recipient = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
  const transferAmount = ethers.parseUnits("250", decimals);

  console.log(`Transferring ${ethers.formatUnits(transferAmount, decimals)} CC to ${recipient}...`);
  try {
    const tx = await contract.transfer(recipient, transferAmount);
    await tx.wait();
    console.log("Transfer successful!");
  } catch (err) {
    console.error("Transfer failed:", err.reason || err);
  }

  // Check balances after transfer
  senderBalance = await contract.balanceOf(wallet.address);
  const recipientBalance = await contract.balanceOf(recipient);

  // --- SUMMARY ---
  console.log("\n===== ASSIGNMENT 3 SUMMARY =====");
  console.log(`Contract address: ${contractAddress}`);
  console.log(`Total supply: ${ethers.formatUnits(totalSupply, decimals)} CC`);
  console.log(`Sender balance (${wallet.address}): ${ethers.formatUnits(senderBalance, decimals)} CC`);
  console.log(`Recipient balance (${recipient}): ${ethers.formatUnits(recipientBalance, decimals)} CC`);
  console.log("================================\n");
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
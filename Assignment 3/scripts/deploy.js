// scripts/deploy.js
import fs from "fs";
import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

function findConstructorAbi(abi) {
  return abi.find((item) => item.type === "constructor") || null;
}

function buildArgForInput(input, env, deployer) {
  const t = input.type;
  const name = input.name || "";

  // Common patterns:
  if (t.startsWith("uint")) {
    // Treat numeric CAPs as human readable (e.g. "1000000") and convert using decimals
    // If DECIMALS env is not present, assume 18 decimals (typical ERC20)
    const human = env.CAP_AMOUNT || env.CAP || "1000000";
    const decimals = parseInt(env.DECIMALS ?? "18", 10);
    return ethers.parseUnits(human, decimals);
  }

  if (t === "string") {
    // If the constructor expects name or symbol, read from env or use defaults
    if (/name/i.test(name) || /(token)?name/i.test(name)) return env.NAME || "CampusCredit";
    if (/symbol/i.test(name)) return env.SYMBOL || "CC";
    return env[name.toUpperCase()] || env.STRING_ARG || "argument";
  }

  if (t === "address") {
    // default to deployer as admin/minter unless env provides another address
    return env[ name.toUpperCase() ] || env.ADMIN || deployer.address;
  }

  if (t === "bool") {
    const val = (env[name.toUpperCase()] ?? env.BOOL ?? "false").toLowerCase();
    return val === "true" || val === "1";
  }

  // fallback: try to use corresponding ENV var (uppercased name) or a generic ARGn
  const fallback = env[name.toUpperCase()] || env[`ARG_${name.toUpperCase()}`] || env.ARG1;
  if (fallback !== undefined) {
    // try parse number if input is numeric-like
    if (/^0x[0-9a-f]+$/i.test(fallback)) return fallback; // hex address-like
    if (/^\d+$/.test(fallback)) return BigInt(fallback);
    return fallback;
  }

  // as last resort, throw so user sees missing mapping
  throw new Error(`No mapping for constructor input "${name}:${t}". Provide env var ${name.toUpperCase()} or update the script defaults.`);
}

async function main() {
  // 1️⃣ Connect to RPC
  if (!process.env.RPC_URL) throw new Error("RPC_URL not set in .env");
  if (!process.env.PRIVATE_KEY) throw new Error("PRIVATE_KEY not set in .env");

  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

  // 2️⃣ Create wallet with deployer private key
  const deployer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  console.log("Deploying contract with account:", deployer.address);

  // 3️⃣ Load compiled contract artifact
  const artifactPath = "./artifacts/contracts/CampusCreditV2.sol/CampusCreditV2.json";
  if (!fs.existsSync(artifactPath)) throw new Error(`Artifact not found at ${artifactPath}`);
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  // 4️⃣ Create contract factory
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, deployer);

  // 4.1 Inspect constructor ABI (helpful for debugging)
  const constructorAbi = findConstructorAbi(artifact.abi);
  const inputs = constructorAbi ? constructorAbi.inputs || [] : [];
  console.log("Constructor inputs:", inputs.map(i => `${i.name}:${i.type}`));

  // 5️⃣ Build args dynamically from ABI + env defaults
  let args = [];
  try {
    args = inputs.map((input) => buildArgForInput(input, process.env, deployer));
  } catch (err) {
    console.error("Failed to build constructor args:", err.message);
    process.exit(1);
  }

  console.log("Deploy args (prepared):", args);

  // 6️⃣ Deploy contract (pass args if any)
  let contract;
  if (args.length > 0) {
    contract = await factory.deploy(...args);
  } else {
    contract = await factory.deploy();
  }

  await contract.waitForDeployment();
  // For ethers v6 the deployed address may be available as contract.target or contract.address
  const deployedAddress = contract.target ?? contract.address;
  console.log("Contract deployed at:", deployedAddress);

  // 7️⃣ Save deployed address
  fs.writeFileSync("./deployed-address.json", JSON.stringify({ address: deployedAddress }, null, 2));
  console.log("Saved deployed address to deployed-address.json");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exit(1);
});

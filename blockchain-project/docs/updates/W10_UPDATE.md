TraceLite – A QR-Based Product Passport System Using Blockchain

Team: Amish, Pranav, Lahari, Priya

 Project Summary

TraceLite is a blockchain-based decentralized application (DApp) built to enhance supply chain transparency and authenticity.
Each product receives a unique NFT passport on the DIDLab blockchain, linked to a QR code that allows real-time verification of product origin, custody, and authenticity.

Architecture Overview

Frontend (Next.js): QR-based user interface for scanning and verification

Backend (Express.js): Handles IPFS uploads and blockchain transactions

Smart Contracts: ActorRegistry, TraceNFT, PassportEvents

Storage: IPFS for decentralized metadata and product event storage

 Deployment Details (EVM)
Contract	Address	Deploy Tx Hash	Block No.
ActorRegistry	0x4c02f0a1d8e532c9AfE71c8FBeD34aC6b80B56f2	0x831a05f695b10a54940647f2cc47c006a7d43f37b2a33f806896169b31af5aec	1116035
TraceNFT	0x1a7B3Ea7b9e7cc7Aaf8482134b9CFddCC3287218	0x4bc67e266373994660a4f52cc8b36343728ca0b12086206b2cd4ac9e518	1116036
PassportEvents	0x5758bD7951eb20fFa38487D549623C989842E35C4c	0x16a325f3e144e197f63affbce510b1dacdee1ebf1adfee188cc6ea5c3fabba67	1116038
 Network Information

Network: DIDLab (EVM-compatible)

Chain ID: 252501

RPC URL: https://eth.didlab.org

Deployer / Owner: 0xF85C4f42550f480b689a347394FAF56A29CDA10f

 Successful Interaction (Non-view Transaction)

Transaction Hash:
0x903c0bda8b8feac1ce0541b7372429e3130210ce687ab525b91b44ab46840a51
Purpose: Granting MINTER role on TraceNFT contract.

📂 ABI File Locations
artifacts/contracts/ActorRegistry.sol/ActorRegistry.json
artifacts/contracts/TraceNFT.sol/TraceNFT.json
artifacts/contracts/PassportEvents.sol/PassportEvents.json

 How to Run
Compile and Deploy
# Compile contracts
npx hardhat compile

# Deploy to DIDLab network
npx hardhat run scripts/deploy.ts --network didlab

Interact with the DApp
# Register a new actor
npx hardhat run scripts/registerActor.ts --network didlab

# Mint a product passport NFT
npx hardhat run scripts/mintPassport.ts --network didlab

# Record a product event
npx hardhat run scripts/recordEvent.ts --network didlab

🗃️ IPFS Usage
CID	Description
Qmabc123...	Product metadata JSON (name, batch, manufacturer, timestamp)
Qmxyz789...	Event log JSON (manufacturing, shipping, retail)

Example Metadata Schema:

{
  "name": "Organic Cocoa Bar",
  "batch": "SMR-1025",
  "manufacturer": "RSC Foods",
  "origin": "Missouri, USA",
  "timestamp": 1730440000
}

 Security Notes
Access Control Roles

DEFAULT_ADMIN_ROLE → 0xF85C4f42550f480b689a347394FAF56A29CDA10f

MINTER → Same deployer (authorized NFT issuer)

ACTOR → Granted to verified supply chain participants

Security Features

Role-based access control via OpenZeppelin AccessControl

TraceNFT.sol includes ReentrancyGuard for minting safety

Sensitive keys stored in .env file (never committed)

Example .env.sample

PRIVATE_KEY=
RPC_URL=https://eth.didlab.org

 Repository Info

Repository: https://github.com/amish123/traceilit

Commit: <insert_latest_commit_hash_here>

 Team Contributions
Member	Contribution
Amish	Smart contract development, Hardhat configuration, DIDLab deployment
Pranav	Backend (Express.js), Hardhat scripting and automation
Lahari	Frontend (Next.js) for QR scanning and NFT visualization
Priya	IPFS metadata structure, testing, and final documentation
 Conclusion

TraceLite delivers a transparent and tamper-proof supply chain by combining blockchain, NFTs, and IPFS.
Each product’s QR-based passport provides verifiable information on its origin, manufacturing, and handling, promoting trust across the entire supply chain.

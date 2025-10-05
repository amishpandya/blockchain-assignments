Supply Chain DApp – Week 6 (W6) Submission

Team

October 5, 2025

**Objective**

Everyone can build and run the program; skeleton exists; first test passes; CI works.

# **Submission Details**

* Submit on Canvas: PR link \+ repo \+ docs/updates/W6 UPDATE.md

* Required Artifacts in Repo:

  * Updated README.md (local run steps) \+ link to project board

  * Hardhat skeleton: contracts/\<YourContract\>.sol, scripts/deploy.js, test/\<YourContrac **–** CI workflow: .github/workflows/ci.yml

# **Project Overview**

A decentralized supply chain management application built with Next.js, Solidity, and Hardhat. This DApp enables suppliers and receivers to track, verify, and complete shipments on the blockchain.

# **Architecture**

* **Frontend:** Next.js \+ Tailwind CSS

* **Smart Contract:** Solidity (Hardhat framework)

* **Blockchain Tools:** Hardhat (local node), Ethers.js, Web3Modal, MetaMask

* **Testing:** Mocha \+ Chai (Hardhat test suite)

* **CI/CD:** GitHub Actions

# **Local Run Instructions**

## **1\. Clone Repository**

git clone https://github.com/\<your-username\>/\<repo-name\>.git cd \<repo-name\>

2. **Install Dependencies**npm install

3. **Run Local Blockchain**

npx hardhat node

4. **Deploy Contract Locally**

npx hardhat run scripts/deploy.js \--network localhost

## **5\. Run Frontend**

npm run dev

Access the app at: [http://localhost:3000](http://localhost:3000/)

# **Run Tests**

npx hardhat test

Example output:

Tracking Contract should deploy correctly should create and fetch shipment

# **Folder Structure**

supply-chain-dapp/

contracts/

Tracking.sol

scripts/ deploy.js test/  
Tracking.test.js

frontend/ pages/ components/ styles/

.github/ workflows/ ci.yml

docs/ updates/  
W6\_UPDATE.md

README.md

**Project Board**

Link: [https://github.com/amishpandya/blockchain-assignments/tree/main/blockchain-project](https://github.com/amishpandya/blockchain-assignments/tree/main/blockchain-project)

# **User Stories**

## **MVP (Must-Have)**

1. Create Shipment – Supplier creates shipment with receiver address, distance, and price.

2. Track Shipment – Receiver views shipment details.

3. Start Shipment – Supplier marks shipment as *In Transit*.

4. Complete Shipment – Receiver confirms delivery and releases payment.

5. View All Shipments – User sees all shipments.

6. Connect Wallet – User connects MetaMask wallet.

## **Stretch Goals**

1. Payment Escrow – Funds held until shipment completion.

2. Shipment Ratings – Users rate experience.

3. Analytics Dashboard – Shows shipment metrics.

# **Docs/Updates**

**File:** docs/updates/W6 UPDATE.md

Include:

* CI screenshot (green)

* Terminal output from local run

* Link to PR

* Link to project board

Screenshots:


Week 7 Progress Update

Team: Amish, Pranav, Lahari, Priya

October 13, 2025

**Weekly Rubric Breakdown**

# **Progress**

* Completed implementation of the core Solidity smart contract tracking.sol for decentralized supply chain tracking.

* Defined contract structure using pragma solidity 0.8.0 and set SPDX license identifier.

* Implemented key data types:

  * **Enum:** Shipment status states (Pending, InTransit, Delivered).

  * **Structs:** Shipment for blockchain persistence and TypeShipment for frontend display.

  * **Mapping:** Tracks shipments per sender address.

  * **Array:** Maintains list of all transactions for transparency.

* Implemented four main **state-changing functions**:

  1. createShipment() — initializes a new shipment, validates payment amount, stores data, and emits ShipmentCreated.

  2. startShipment() — updates shipment status to InTransit and emits ShipmentInTransit.

  3. completeShipment() — marks shipment as delivered, transfers Ether to sender, and emits both ShipmentDelivered and ShipmentPaid.

  4. getShipment() — returns stored shipment data for read-back verification.

* Added query functions:

  * getShipmentsCount() — counts total shipments created by a given sender.

  * getAllTransactions() — retrieves entire transaction list for audit purposes.

* Configured **Hardhat scripts** to compile and deploy the contract with clean deployment configuration.

* Created directory structure:

  * /contracts/tracking.sol

  * /context/ — React Context API for Web3 connection logic.

  * /components/ — UI components (Table, Navbar, modal pop-ups).

# **Architecture Overview**

* **End-to-end path:**

  1. Client (Next.js \+ Web3Modal) connects wallet and triggers shipment creation.

  2. Transaction sent through **Ethers.js** to deployed tracking.sol contract.

  3. Smart contract updates on-chain state (Shipment struct) and emits an event.

  4. Frontend listens to emitted event and reflects the updated shipment status.

* Architecture diagram stored in docs/diagrams/week7 architecture.png highlighting the path: *Client → Ethers.js → Smart Contract → Blockchain State/Event → UI*

*Feedback*.

# **Evidence**

* Contract successfully compiled with Hardhat compiler v2.22.2.

* Local deployment confirmed on Hardhat test network (npx hardhat node \+ npx hardhat run scripts/deploy.js \--network localhost).

* Event logs show emission of ShipmentCreated after function call.

* Screenshots and terminal outputs attached in docs/updates/W7 UPDATE.md.

* Architecture diagram: ¡¿

* Repository: [https://github.com/amishpandya/blockchain-assignments/tree/mai](https://github.com/amishpandya/blockchain-assignments/tree/main/blockchain-project)n/ [blockchain-project](https://github.com/amishpandya/blockchain-assignments/tree/main/blockchain-project)

# **Technical Depth**

* Demonstrated full smart-contract lifecycle: definition, deployment, and on-chain state mutation.

* Integrated Solidity events for transaction observability and real-time frontend updates.

* Understood use of memory vs storage for state management.

* Implemented payable functions with msg.value verification for secure Ether transfer.

* Applied clean contract architecture enabling future test automation.

* Prepared groundwork for CI pipeline verifying the “create → complete” shipment flow.

# **Next Plan**

* Implement a minimal Web3 client call to trigger createShipment() and capture emitted ShipmentCreated event.

* Write unit tests using chai and ethers to cover:

  * Happy path — successful shipment creation and completion.

  * Edge case — mismatched payment amount.

* Automate tests in GitHub Actions with CI output artifacts.

* Record GIF demonstrating call → event/state update → read-back verification.

# **Collaboration**

* **Amish:** Implemented Solidity contract, event logic, and deployment script cleanup.

* **Pranav:** Version management for dependencies (ethers@5.7.2, web3modal@1.x), and Hardhat compilation testing.

* **Lahari:** Architecture diagram and directory structure alignment.

* **Priya:** Frontend integration, Documentation,and verification test planning.

* Team conducted peer-review session validating contract functions against project rubric.
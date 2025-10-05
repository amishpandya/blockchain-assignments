## **Title and One-Line Value Proposition** 

Decentralized Inventory Tracker with transparent shipment lifecycle from supplier to receiver.

## **Problem and Stakeholders**

Current supply chain tracking systems are fragmented and centralized, which creates delays, trust gaps, and opportunities for fraud. Suppliers often struggle to provide proof of delivery, while recipients cannot independently verify shipment status. Auditors and regulators lack reliable visibility into product movement. A decentralized approach ensures end-to-end transparency and reduces disputes.

## **Research Alignment**

This project extends **supply-chain traceability** themes, focusing on anti-counterfeit verification and role-based flows with on-chain proofs.

## **Platform and Rationale**

We will use **Ethereum (Hardhat local \+ testnet)**. Ethereum is a public EVM platform with strong ecosystem support, wallet compatibility (e.g., MetaMask), and event-driven UIs. Hardhat offers developer-friendly testing, ABI generation, and local blockchain simulation, which fits our need for iterative prototyping and deployment.

## **MVP Features (must-have) \+ Stretch**

**MVP:**	 	 	 	

* Smart contract to manage batch lifecycle (manufacture → ship → receive → dispense)  
* Role-based access control for supply chain actors  
* QR/NFC scan event logging with timestamp and hash  
* Frontend UI to visualize batch history and verification status

**Stretch (if time):**	 	 	 	

* Temperature breach alerts simulated via sensor data, flagged on-chain  
* KPI dashboard showing on-time delivery rates and breach percentages with differential privacy noise

## 

## **Architecture Sketch (diagram)**

**High Level Diagram**

![Mining Output](./Screenshots/Shot1.png)

**Low Level Diagram**

![Mining Output](./Screenshots/Shot2.png)

## 

## **Security and Privacy Requirements**

We will secure operations through wallet-gated actions (only sender/receiver can update shipments). Contracts will validate input (e.g., shipment IDs, wallet addresses) to prevent invalid state changes. Sensitive metadata (e.g., recipient contact info) will remain off-chain; only hashes or necessary identifiers will be stored publicly. Rate-limiting and transaction ownership checks will mitigate misuse. Unit tests and assertions will ensure contract integrity.

## **Milestones (Weeks 6–14)**

* **W6**: Repo setup, Hardhat local deployment, basic contract scaffold.

* **W7**: Vertical slice  UI button triggers shipment creation on-chain.

* **W8**: Implement shipment status updates \+ events.

* **W9**: UI table displays queried shipments with statuses.

* **W10**: MVP demo: connect wallet, create/update/track shipment.

* **W11**: Threat model \+ mitigations (e.g., input validation, role restrictions).

* **W12**: Stretch: analytics dashboard or fee system.

* **W13**: Testnet deployment \+ documentation.

* **W14**: Final polish, presentation, and submission.

## **Team and Roles \+ Logistics**

* Amish \- Creating smart contract, handling metamask and hardhat  
* Pranav \- Backend Logic  
* Lahari \- Frontend Styling  
* Priya \- Web3 Integration and Deployment

**Logistics**: Weekly standups, Whatsapp channel for communication, 

**GitHub repo:** `https:<>`

## 

## 

## **Top Risks and Mitigations**

1. **Event integrity →** QR/NFC scan data may be spoofed or duplicated. We’ll hash each scan with a timestamp and actor ID, and validate uniqueness before logging on-chain.  
2. **Role enforcement →** Incorrect role transitions (e.g., shipper updating dispense status) could break lifecycle logic. We’ll enforce strict role-based access via smart contract modifiers and allow-list mappings.  
3. **Contract reliability →** Bugs in lifecycle transitions or event logging could compromise traceability. We’ll use Hardhat unit tests, event assertions, and static analysis to validate contract behavior.


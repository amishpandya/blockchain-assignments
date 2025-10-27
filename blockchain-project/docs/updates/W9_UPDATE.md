# TraceLite – QR-Based Supply Chain DApp  
**Course:** CS 5576 – Blockchain Technologies  
**University:** University of Missouri–Kansas City  
**Team:** Amish, Pranav, Lahari, Priya Viswanadharao  
**Date:** October 2025  

---

## 1. Problem and Motivation

### Problem Statement
Counterfeits, mislabeling, and opaque product handoffs continue to erode trust in global supply chains.  
Traditional systems rely on centralized databases that can be altered or tampered with, creating gaps in transparency and traceability.  
Products often pass through multiple actors—manufacturers, distributors, and retailers—with limited visibility into authenticity or ownership history.

### Motivation
The inspiration behind **TraceLite** comes from the need to ensure verifiable product provenance.  
Consumers and companies increasingly demand proof of authenticity, ethical sourcing, and origin.  
Blockchain technology provides an immutable, distributed ledger that can store product events, while IPFS provides decentralized storage for metadata and event logs.

This project aligns with the objectives of CS 5590 by demonstrating a real-world blockchain implementation that enhances transparency, trust, and traceability in supply chains.

### Goal
Develop a blockchain-based decentralized application (DApp) that demonstrates end-to-end traceability using QR codes linked to NFTs.  
Each product unit will have a digital passport with verifiable metadata, custody events, and ownership details accessible through QR scanning.

**Key Values**
- **Authenticity:** Each physical item is linked to a unique on-chain NFT.  
- **Transparency:** Product history is viewable to all stakeholders.  
- **Security:** On-chain event logging prevents tampering and forgery.  
- **Efficiency:** Real-time provenance tracking reduces manual audits.

---

## 2. System Architecture

### Overview
The architecture integrates blockchain, decentralized storage, and web technologies to create a verifiable, tamper-proof supply chain system.

**Major Components**
- **QR Label:** Physical tag printed on each product or pallet.  
- **Next.js Frontend:** Web DApp to scan QR codes, view product history, and perform custody actions.  
- **Express Backend:** Handles IPFS interactions, QR generation, and API calls.  
- **Smart Contracts:** Manage NFTs, roles, and custody events on the DIDLab network.  
- **IPFS Storage:** Stores product metadata and event logs off-chain, accessible through content hashes.

![TraceLite Architecture](images/Screenshot%202025-10-22%20at%204.24.55 PM.png)
*System Architecture Flow: QR → Frontend → Backend → Smart Contracts → IPFS*

### Component Flow
1. QR code links to the NFT’s token ID and metadata.  
2. When scanned, the frontend fetches product details via backend API.  
3. IPFS returns metadata (lot number, actor details, timestamps).  
4. Smart contracts log every HANDOFF or RECEIVE event.  
5. Timeline view displays custody events from minting to retail.

---

## 3. Functional Requirements

**Core Requirements**
1. Mint an ERC-721 NFT (Product Passport) for each product level (pallet, case, unit).  
2. Generate QR codes linking directly to product details.  
3. Record custody events (HANDOFF, RECEIVE, INSPECT) and pin them to IPFS.  
4. Verify actor roles before allowing custody actions.  
5. Display full product history and current owner on the DApp.

**Non-Functional Requirements**
- Gas-optimized and finishable within five days.  
- Role-based permissions using AccessControl.  
- No PII stored on-chain.  
- Modular design for easy extension.

---

## 4. Technical Design

### Smart Contracts
Core contracts include:
- **ActorRegistry:** Defines roles and associates each actor with a DID.  
- **TraceNFT:** Implements ERC-721; mints unique tokens with parent-child relationships.  
- **PassportEvents:** Records custody events and emits logs for verification.  

**Security Features**
- Role-based access control (OpenZeppelin AccessControl)  
- ReentrancyGuard to prevent exploits  
- Event-based architecture for auditable, lightweight storage  

### Backend (Express.js)
- Pins metadata and event logs to IPFS  
- Generates QR codes  
- Provides API endpoints for minting and event logging  

### Frontend (Next.js + Wagmi + Viem)
- UI for scanning and viewing NFTs  
- Wallet connection for authorized actions  
- Product timeline visualization combining IPFS + on-chain events  

---

## 5. Features

### Core Features
- **Product Minting:** NFTs tied to physical goods  
- **QR Integration:** Scannable codes linking to on-chain records  
- **Custody Events:** Secure product handoffs  
- **Role Verification:** Controlled access  
- **Timeline View:** Provenance from creation to retail  

### Extended Capabilities
- Parent-child token linking for packaging hierarchy  
- Event hashing for proof of record integrity  
- Integration with decentralized identity frameworks (DID)

---

## 6. Challenges and Solutions

### Deployment Issues
**Challenge:** Contract deployment failed due to incorrect private key format and DIDLab connection errors.  
**Solution:** Verified 32-byte MetaMask private key and corrected `.env` variables. Deployment succeeded.

### Network Limitations
**Challenge:** IPFS pinning delays.  
**Solution:** Added asynchronous pinning and local caching for faster reads.

### Learning Curve
**Challenge:** Integrating EIP-712 signatures for verifiable credentials.  
**Solution:** Simulated mock verification through backend middleware.

---

## 7. Conclusion

**Summary**  
TraceLite demonstrates how blockchain and decentralized storage enhance transparency and trust in supply chains.  
By integrating NFTs, IPFS, and smart contracts, each product gains a verifiable digital twin for provenance tracking.

**Future Enhancements**
- Real-time event streaming via WebSockets  
- IoT integration for automated event capture  
- Deployment to Ethereum testnets (Sepolia/Polygon)  
- Analytics dashboards and alerts  

---

**End of Report**

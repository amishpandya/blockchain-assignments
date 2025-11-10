# Week 11 Update — Team Immutable

---

##  Overview
During Week 11, our team continued to strengthen the functional aspects of **TraceLite**, focusing on stability, integration testing, and decentralized storage setup. The goal this week was to move from isolated contract testing toward a more connected system where blockchain, backend, and storage components work seamlessly.

---

## Technical Progress
1. **Smart Contract Validation**  
   We verified and retested the deployment of all three core contracts — `ActorRegistry`, `TraceNFT`, and `PassportEvents` — on the **DIDLab blockchain network** (Chain ID: 252501). Each contract was successfully interacted with to confirm permissions, event emissions, and NFT minting logic.

2. **Backend Integration Work**  
   Our backend (Express.js) is now configured to connect with DIDLab RPC endpoints using environment variables defined in `.env`. We refined scripts for role assignment, NFT creation, and event logging to ensure consistent blockchain communication.

3. **IPFS and Cloudflare Integration**  
   We initiated integration of **IPFS** for storing product metadata and event logs in a decentralized way. Additionally, we started setting up **Cloudflare’s IPFS gateway** for faster and more reliable access.  
   - Encountered temporary issues with pinning and upload authentication.  
   - Actively debugging connection reliability and CID verification.  

4. **Testing and Deployment Validation**  
   Test transactions were executed to verify minting and event logging functionalities. The `MINTER` role and NFT event flow are functioning as expected, and we confirmed data propagation on the DIDLab Explorer.

---

##  Team Collaboration
- **Amish:** Focused on contract debugging and redeployment verification on DIDLab.  
- **Pranav:** Worked on backend automation scripts for actor registration and event submission.  
- **Lahari:** Continued preparing frontend interface for live blockchain integration and QR display testing.  
- **Priya:** Handled IPFS setup, metadata structuring, and documentation updates.  

---

##  Challenges and Learnings
- IPFS uploads through Cloudflare sometimes failed due to rate limits and authorization errors.  
- Learned how to generate and verify CIDs manually using `ipfs-http-client`.  
- Gained better understanding of on-chain role-based security through AccessControl logic.

---

##  Next Steps (Week 12)
- Resolve IPFS/Cloudflare upload and pinning issues.  
- Connect the live blockchain data to the frontend QR scanning interface.  
- Conduct an end-to-end test — from product registration → minting → IPFS upload → QR verification.  
- Prepare short demo recording for project review.


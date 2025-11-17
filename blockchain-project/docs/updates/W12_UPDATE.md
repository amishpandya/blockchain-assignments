# Week 12 Project Update — Team Immutable

## Project: Tracelite – A QR-Based Product Passport System Using Blockchain
Team Members: Amish, Pranav, Lahari, Priya

## Overview

During Week 12, Team Immutable achieved a significant deployment milestone by successfully migrating the Tracelite system from development to a production-ready virtual machine environment. This week's work focused on infrastructure setup, live environment configuration, and establishing external accessibility, bringing us closer to a fully functional demo-ready system.

## Technical Progress

### 1. VM Deployment & Configuration
- Deployed full-stack application (frontend, backend, blockchain interfaces) to virtual machine
- Configured all services to run persistently in Linux environment
- Set up environment variables and production settings

### 2. Live Tunnel Setup
- Established secure tunnel for external system access
- Verified stable connectivity and accessibility
- Configured proper security measures for live environment

### 3. System Integration
- Confirmed persistent connectivity to DIDLab blockchain (Chain ID: 252501)
- Validated end-to-end workflow: product registration → NFT minting → IPFS storage → QR display
- Verified all components working together in live environment

## Team Collaboration
- **Amish:** Led VM deployment and service configuration
- **Pranav:** Ensured backend stability and blockchain connectivity in the live environment
- **Lahari:** Finalized frontend integration with live data and QR scanning interface
- **Priya:** Assisted with deployment checks and updated system documentation

## Challenges and Learnings
- **Service Persistence:** Implemented systemd services for automatic recovery
- **Network Access:** Configured secure tunnel with proper authentication
- **Environment Consistency:** Created deployment scripts for reliable setup

## Next Steps (Week 13)
- Conduct comprehensive end-to-end testing with real product data
- Optimize system performance based on live observations
- Prepare demo scenarios and presentation materials
- Finalize all project documentation

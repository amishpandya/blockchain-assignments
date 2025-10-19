import React, { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import tracking from "../Context/Tracking.json";

const ContractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE";
const ContractABI = tracking.abi;

// Helper to connect to contract
const fetchContract = (signerOrProvider) =>
  new ethers.Contract(ContractAddress, ContractABI, signerOrProvider);

export const TrackingContext = React.createContext();

export const TrackingProvider = ({ children }) => {
  const DappName = "Product Tracking DApp";
  const [currentUser, setCurrentUser] = useState("");

  // 🧩 Connect Wallet
  const checkIfWalletConnected = async () => {
    if (!window.ethereum) return alert("Please install MetaMask!");
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (accounts.length) setCurrentUser(accounts[0]);
  };

  useEffect(() => {
    checkIfWalletConnected();
  }, []);

  // 🚚 Create Shipment
  const createShipment = async (items) => {
    const { receiver, pickupTime, distance, price } = items;

    if (!receiver || !pickupTime || !distance || !price) {
      alert("All fields are required!");
      return;
    }

    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);

      const tx = await contract.createShipment(
        receiver,
        Math.floor(new Date(pickupTime).getTime() / 1000),
        distance,
        ethers.parseUnits(price, 18),
        { value: ethers.parseUnits(price, 18) }
      );

      await tx.wait();
      console.log("✅ Shipment Created:", tx);
    } catch (error) {
      console.error("❌ Error creating shipment:", error);
    }
  };

  // 📋 Fetch all shipments
  const getAllShipments = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider();
      const contract = fetchContract(provider);
      const shipments = await contract.getAllTranscations();

      const allShipments = shipments.map((s) => ({
        sender: s.sender,
        receiver: s.receiver,
        pickupTime: s.pickupTime.toString(),
        deliveryTime: s.deliveryTime.toString(),
        distance: s.distance.toString(),
        price: ethers.formatEther(s.price),
        status: s.status,
        isPaid: s.isPaid,
      }));

      console.log("📦 All Shipments:", allShipments);
      return allShipments;
    } catch (error) {
      console.error("❌ Error fetching shipments:", error);
    }
  };

  // 🔢 Get Shipment Count
  const getShipmentsCount = async () => {
    try {
      if (!window.ethereum) return alert("Install MetaMask");
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      const provider = new ethers.providers.JsonRpcProvider();
      const contract = fetchContract(provider);
      const count = await contract.getShipmentsCount(accounts[0]);
      console.log("📊 Shipment count:", count.toString());
      return count.toNumber();
    } catch (error) {
      console.error("❌ Error getting count:", error);
    }
  };

  // ✅ Complete Shipment
  const completeShipment = async ({ receiver, index }) => {
    if (!receiver || index === undefined) {
      alert("Receiver and index required!");
      return;
    }

    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      const contract = fetchContract(signer);

      const tx = await contract.completeShipment(accounts[0], receiver, index, {
        gasLimit: 300000,
      });

      await tx.wait();
      console.log("✅ Shipment completed:", tx);
    } catch (error) {
      console.error("❌ Error completing shipment:", error);
    }
  };

  // 📡 Listen for events
  useEffect(() => {
    const provider = new ethers.providers.JsonRpcProvider();
    const contract = fetchContract(provider);

    contract.on("ShipmentCreated", (sender, receiver, pickupTime, distance, price) => {
      console.log("🚀 Event: ShipmentCreated", { sender, receiver, pickupTime, distance, price });
    });

    contract.on("ShipmentInTransit", (sender, receiver, pickupTime) => {
      console.log("🚚 Event: ShipmentInTransit", { sender, receiver, pickupTime });
    });

    contract.on("ShipmentDelivered", (sender, receiver, deliveryTime) => {
      console.log("📦 Event: ShipmentDelivered", { sender, receiver, deliveryTime });
    });

    contract.on("ShipmentPaid", (sender, receiver, amount) => {
      console.log("💰 Event: ShipmentPaid", { sender, receiver, amount });
    });

    return () => {
      contract.removeAllListeners();
    };
  }, []);

  return (
    <TrackingContext.Provider
      value={{
        DappName,
        currentUser,
        createShipment,
        getAllShipments,
        getShipmentsCount,
        completeShipment,
      }}
    >
      {children}
    </TrackingContext.Provider>
  );
};

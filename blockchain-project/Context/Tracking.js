import React, {useState, useEffect } from "react";
import web3modal from "web3modal";
import { ethers } from "ethers";

//internal import 
import tracking from "../Context/Tracking.json";
import { connection } from "next/server";
const ContractAddress =""
const ContractABI = tracking.abi;

// Fetching smart contract 
const fetchContract = (signerOrProvider) => 
    new ethers.Contract(ContractAddress, ContractABI, signerOrProvider);

export const TrackingContext = React.createContext();
export const TrackingProvider = ({children}) => {
    //State Variable 
    const DappName = "Product Tracking Dapp";
    const [currentUser, setCurrentUser] = useState("");

    const createShipment = async (items) => {

        console.log(items);
        const {receiver, pickupTime, distance, price } = items;

    try {
        const web3modal  = new Web3Modal();
        const connection = await web3modal.connect();
        const provider = new ether.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract = fetchContract(signer);
        const createItem = await contract.createShipment(
            receiver,
            new Date(pickupTime).getTime(),
            distance,
            ethers.utils.parseUnits(price,18),
            {
                value: ethers.utils.parseUnits(price,18),
            }
        );
        await createItem.wait();
        console.log(createItem)    
    }   catch(error){
        console.log("Something went wrong", error);
    }
    };
    const getAllShipment = async () => {
        try{
            const provider = new ethers.providers.JsonRpcProvider();
            const contract = fetchContract(provider);
            
            const shipments = await contract.getAllTransactions();
            const AllShipment =     shipments.map((shipment) => ({
                    sender: shipment.sender,
                    receiver: shipment.receiver,
                    price: ethers.utils.formatEther(shipment.price.toString()),
                    pickupTime: shipment.pickupTime.toNumber(),
                    deliverTime: shipment.deliverTime.toNumber(),
                    distance: shipment.distance.toNumber(),
                    isPaid: shipment.isPaid,
                    status: shipment.status,
            

            }));
            return allShipments;
        }catch (error) {
            console.log("error went, getting shipment");
        }
    };
    const getShipmentsCount = async () => {
        try {
            if (!window.ethereum) return "Install Metamask";
                 const accounts = await window.ethereum.request({
                method: "eth_accounts",
  });

        const provider = new ethers.providers.JsonRpcProvider();
        const contract = fetchContract(provider);
        const shipmentsCount = await contract.getShipmentsCount(accounts[0]);

         return shipmentsCount.toNumber();
        } catch (error) {
        console.log("error want, getting shipment");
        }

    };
    
    constCompleteShipment = async (completeShip) => {
        console.log(completeShip);

        const {receiver, index} = completeShip;
        try{
            if(!window.ethereum) return "Install Metamask";
            const accounts = await window.ethereum.request({
                method: "eth_accounts",

            });

            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = fetchContract(signer);
            
            const transaction = await contract.CompleteShipment(
            accounts[0],
            receiver,
            index,
            {
                gasLimit: 300000
            });
        
            transaction.wait();
            console.log(transaction);

        }catch (error) {
            console.log("wrong completeShipment ", error);  
        }
    };
}



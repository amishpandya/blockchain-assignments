// const hre = require("hardhat");

// async function main(){
//     const Lock = await hre.ethers.getContractFactory("Lock");
//     const lock = await Lock.deploy(unlockTime, {value:lockedAmount});

//     await lock.deployed();

//     console.log(
//         `Tracking deployed to ${lock.address}`
//     );
// }

// main().catch((error)=>{
//     console.error(error);
//     process.exitCode=1;
// });

const hre = require("hardhat");

async function main(){
    const Tracking = await hre.ethers.getContractFactory("Tracking");
    const tracking = await Lock.deploy();

    await tracking.deployed();

    console.log(
        `Tracking deployed to ${tracking.address}`
    );
}

main().catch((error)=>{
    console.error(error);
    process.exitCode=1;
});

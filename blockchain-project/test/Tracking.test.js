const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Tracking Smart Contract", function () {
  let Tracking, tracking, owner, sender, receiver;

  beforeEach(async () => {
    [owner, sender, receiver] = await ethers.getSigners();
    Tracking = await ethers.getContractFactory("Tracking");
    tracking = await Tracking.deploy();
    await tracking.waitForDeployment();
  });

  //  Positive Test 1: Create Shipment
  it("should create a shipment successfully", async () => {
    const price = ethers.parseEther("1");
    const distance = 100;
    const pickupTime = Math.floor(Date.now() / 1000);

    await expect(
      tracking.connect(sender).createShipment(receiver.address, pickupTime, distance, price, { value: price })
    )
      .to.emit(tracking, "ShipmentCreated")
      .withArgs(sender.address, receiver.address, pickupTime, distance, price);

    const shipmentsCount = await tracking.getShipmentsCount(sender.address);
    expect(shipmentsCount).to.equal(1n);
  });

  // Positive Test 2: Start + Complete Shipment
  it("should allow shipment completion and emit correct events", async () => {
    const price = ethers.parseEther("1");
    const distance = 150;
    const pickupTime = Math.floor(Date.now() / 1000);

    // Create shipment first
    await tracking.connect(sender).createShipment(receiver.address, pickupTime, distance, price, { value: price });

    // Start shipment
    await expect(
      tracking.connect(sender).startShipment(sender.address, receiver.address, 0)
    )
      .to.emit(tracking, "ShipmentInTransit")
      .withArgs(sender.address, receiver.address, pickupTime);

    // Complete shipment
    await expect(
      tracking.connect(receiver).completeShipment(sender.address, receiver.address, 0)
    )
      .to.emit(tracking, "ShipmentDelivered")
      .and.to.emit(tracking, "ShipmentPaid");

    const shipment = await tracking.getShipment(sender.address, 0);
    expect(shipment[6]).to.equal(2); // status = DELIVERED
    expect(shipment[7]).to.equal(true); // isPaid = true
  });

  // Negative Test: Invalid Payment
  it("should revert if payment amount does not match the price", async () => {
    const price = ethers.parseEther("1");
    const wrongValue = ethers.parseEther("0.5");
    const distance = 50;
    const pickupTime = Math.floor(Date.now() / 1000);

    await expect(
      tracking.connect(sender).createShipment(receiver.address, pickupTime, distance, price, { value: wrongValue })
    ).to.be.revertedWith("Payment amount must match the price.");
  });
});

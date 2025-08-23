// scripts/deploy.js
import hre from "hardhat";

async function main() {
  const eventTicketNFT = await hre.ethers.getContractFactory("EventTicketNFT");
  // Deploy without constructor arguments if none are required
  const ticket = await eventTicketNFT.deploy("web3Chain","web3",10,1000,"baseURI");

  await ticket.waitForDeployment();
  console.log("Voting deployed to:", await ticket.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

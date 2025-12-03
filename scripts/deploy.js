const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the contract
  const CampusCoin = await hre.ethers.getContractFactory("CampusCoin");
  const token = await CampusCoin.deploy();

  await token.deployed();

  console.log("----------------------------------------------------");
  console.log("SUCCESS! CampusCoin deployed to:", token.address);
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

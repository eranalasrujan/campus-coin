const hre = require("hardhat");

async function main() {
  const [admin] = await hre.ethers.getSigners();
  const COIN_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"; // <--- CHECK THIS ADDRESS!

  console.log("Connect to Admin Wallet:", admin.address);

  const CampusCoin = await hre.ethers.getContractFactory("CampusCoin");
  const token = CampusCoin.attach(COIN_ADDRESS);

  // Mint 1 Million Coins to Admin
  // Note: We use 'mint' which is restricted to ADMIN_ROLE
  // If your contract only has 'rewardStudent', we might need to use that or grant roles.
  // Assuming standard setup:

  console.log("Minting 1,000,000 CAMP to Admin...");
  const tx = await token.mint(
    admin.address,
    hre.ethers.utils.parseUnits("1000000", 18)
  );
  await tx.wait();

  const balance = await token.balanceOf(admin.address);
  console.log("New Admin Balance:", hre.ethers.utils.formatUnits(balance, 18));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

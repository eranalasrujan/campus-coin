async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from:", deployer.address);

  const CampusCoin = await ethers.getContractFactory("CampusCoin");
  const token = await CampusCoin.deploy();

  await token.deployed();
  console.log("CampusCoin deployed to:", token.address);

  const REWARD_MANAGER = await token.REWARD_MANAGER();
  await token.grantRole(REWARD_MANAGER, deployer.address);
  console.log("Granted REWARD_MANAGER to:", deployer.address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

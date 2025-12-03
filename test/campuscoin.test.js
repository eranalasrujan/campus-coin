const { expect } = require("chai");

describe("CampusCoin", function () {
  it("should mint only by REWARD_MANAGER", async function () {
    const [deployer, user] = await ethers.getSigners();

    const Coin = await ethers.getContractFactory("CampusCoin");
    const coin = await Coin.deploy();
    await coin.deployed();

    const REWARD_MANAGER = await coin.REWARD_MANAGER();
    await coin.grantRole(REWARD_MANAGER, deployer.address);

    await coin.mint(user.address, ethers.utils.parseUnits("50", 18));
    const bal = await coin.balanceOf(user.address);

    expect(bal.toString()).to.equal(
      ethers.utils.parseUnits("50", 18).toString()
    );
  });
});

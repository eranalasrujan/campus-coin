const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

const providerUrl = process.env.PROVIDER_URL || "http://127.0.0.1:8545";
const provider = new ethers.JsonRpcProvider(providerUrl);

const contractAddress = process.env.CONTRACT_ADDRESS;
if (!contractAddress) {
  console.warn("WARNING: CONTRACT_ADDRESS not set in .env");
}

// Load ABI from coinABI.json (should already be in backend folder)
const abiPath = path.join(__dirname, "..", "coinABI.json");
if (!fs.existsSync(abiPath)) {
  console.error(
    "coinABI.json not found in backend folder. Place your ABI file there."
  );
}
const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));

const contract = new ethers.Contract(contractAddress, abi, provider);

async function getBalance(req, res) {
  try {
    const address = req.query.address;
    if (!address)
      return res.status(400).json({ error: "address query param required" });
    const balance = await contract.balanceOf(address);
    // balance is BigInt-like; convert to string
    return res.json({ address, balance: balance.toString() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

async function getTotalSupply(req, res) {
  try {
    const total = await contract.totalSupply();
    return res.json({ totalSupply: total.toString() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

async function transfer(req, res) {
  try {
    const { fromPrivateKey, to, amount } = req.body;
    if (!fromPrivateKey || !to || !amount)
      return res
        .status(400)
        .json({ error: "fromPrivateKey, to, amount required" });

    const wallet = new ethers.Wallet(fromPrivateKey, provider);
    const contractWithSigner = new ethers.Contract(
      contractAddress,
      abi,
      wallet
    );

    const tx = await contractWithSigner.transfer(
      to,
      ethers.parseUnits(amount.toString(), 18)
    );
    const receipt = await tx.wait();
    return res.json({ txHash: receipt.transactionHash });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { getBalance, transfer, mint, getTotalSupply };

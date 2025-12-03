require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const fs = require("fs");
const { ethers } = require("ethers");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const abiPath = __dirname + "/coinABI.json";

function loadAbiSafe(path) {
  try {
    const raw = fs.readFileSync(path);
    // show a short diagnostic of first bytes
    const firstBytes = raw.slice(0, 8);
    console.log("ABI raw length:", raw.length);
    console.log(
      "ABI first bytes:",
      Array.from(firstBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" ")
    );
    // convert to string assuming utf8 and strip BOM if present
    let text = raw.toString("utf8");
    // strip common BOM
    text = text.replace(/^\uFEFF/, "");
    text = text.trim();
    return JSON.parse(text);
  } catch (err) {
    console.error("Failed to load ABI file. Raw error:", err && err.message);
    // show file as utf8 and as hex for debugging
    try {
      const raw2 = fs.readFileSync(path);
      console.log("--- ABI as utf8 (first 200 chars) ---");
      console.log(raw2.toString("utf8").slice(0, 200));
      console.log("--- ABI as hex (first 32 bytes) ---");
      console.log(raw2.slice(0, 32).toString("hex"));
    } catch (e2) {
      console.error(
        "Also failed to read ABI file for diagnostics:",
        e2.message
      );
    }
    process.exit(1);
  }
}

const ABI = loadAbiSafe(abiPath);

const provider = new ethers.providers.JsonRpcProvider(
  process.env.RPC_URL || "http://127.0.0.1:8545"
);
const signer = new ethers.Wallet(
  process.env.BACKEND_PRIVATE_KEY || "",
  provider
);
const coin = new ethers.Contract(process.env.COIN_ADDRESS || "", ABI, signer);

app.post("/mint", async (req, res) => {
  try {
    const { studentAddress, amount } = req.body;
    if (!studentAddress || !amount)
      return res.status(400).json({ error: "Missing fields" });

    const tx = await coin.mint(
      studentAddress,
      ethers.utils.parseUnits(amount, 18)
    );
    await tx.wait();
    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/balance/:address", async (req, res) => {
  try {
    const bal = await coin.balanceOf(req.params.address);
    res.json({ balance: ethers.utils.formatUnits(bal, 18) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 4000, () => {
  console.log("Backend running");
});

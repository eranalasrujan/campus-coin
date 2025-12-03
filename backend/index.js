require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const { ethers } = require("ethers");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// --- DATABASE UTILS ---
const DB_FILE = "./database.json";

function getDb() {
  if (!fs.existsSync(DB_FILE)) return { users: [], events: [] };
  return JSON.parse(fs.readFileSync(DB_FILE));
}
function saveDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// --- BLOCKCHAIN CONNECTION ---
const artifact = require("./coinABI.json");
const provider = new ethers.providers.JsonRpcProvider(
  process.env.RPC_URL || "http://127.0.0.1:8545"
);
const signer = new ethers.Wallet(process.env.BACKEND_PRIVATE_KEY, provider);

// !!! IMPORTANT: UPDATE THIS IF YOU DEPLOY A NEW CONTRACT !!!
const COIN_ADDRESS =
  process.env.COIN_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

const coin = new ethers.Contract(COIN_ADDRESS, artifact.abi, signer);

// --- ROUTES ---

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const db = getDb();
  const user = db.users.find(
    (u) => u.username === username && u.password === password
  );
  if (user) res.json({ success: true, user });
  else res.json({ success: false, error: "Invalid Credentials" });
});

// ADMIN: Add User
app.post("/admin/add-user", (req, res) => {
  const { username, password, role, name, walletAddress } = req.body;
  const db = getDb();
  if (db.users.find((u) => u.username === username))
    return res.status(400).json({ error: "Username exists" });
  db.users.push({ username, password, role, name, walletAddress });
  saveDb(db);
  res.json({ success: true });
});

// ADMIN: Create Event
app.post("/admin/create-event", (req, res) => {
  const { eventName, date } = req.body;
  const db = getDb();
  const newEvent = { id: Date.now(), name: eventName, date, participants: [] };
  db.events.push(newEvent);
  saveDb(db);
  res.json({ success: true });
});

// ADMIN: Add Student to Event
app.post("/admin/add-participant", (req, res) => {
  const { eventId, studentUsername, prizeAmount, position } = req.body;
  const db = getDb();
  const event = db.events.find((e) => e.id == eventId);
  const student = db.users.find((u) => u.username === studentUsername);

  if (!event || !student) return res.status(404).json({ error: "Not found" });

  event.participants.push({
    studentName: student.name,
    studentWallet: student.walletAddress,
    amount: prizeAmount,
    position: position,
    status: "Pending",
  });
  saveDb(db);
  res.json({ success: true });
});

// FACULTY: Get Events
app.get("/faculty/events", (req, res) => {
  res.json(getDb().events);
});

// FACULTY: Verify & Reward
app.post("/faculty/verify", async (req, res) => {
  const { eventId, studentWallet } = req.body;
  const db = getDb();
  const event = db.events.find((e) => e.id == eventId);
  const participant = event.participants.find(
    (p) => p.studentWallet === studentWallet
  );

  if (!participant) return res.status(404).json({ error: "Not found" });
  if (participant.status === "Verified")
    return res.status(400).json({ error: "Verified" });

  try {
    console.log(`Minting ${participant.amount} to ${studentWallet}`);
    const tx = await coin.rewardStudent(
      studentWallet,
      ethers.utils.parseUnits(participant.amount.toString(), 18),
      event.name
    );
    await tx.wait();
    participant.status = "Verified";
    participant.txHash = tx.hash;
    saveDb(db);
    res.json({ success: true, txHash: tx.hash });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUBLIC LEDGER
app.get("/ledger", async (req, res) => {
  try {
    const rewardFilter = coin.filters.RewardPaid();
    const rewardLogs = await coin.queryFilter(rewardFilter, 0, "latest");
    const transferFilter = coin.filters.Transfer();
    const transferLogs = await coin.queryFilter(transferFilter, 0, "latest");

    const history = [];
    rewardLogs.forEach((log) =>
      history.push({
        type: "REWARD",
        from: "University",
        to: log.args.student,
        amount: ethers.utils.formatUnits(log.args.amount, 18),
        reason: log.args.eventName,
        hash: log.transactionHash,
        block: log.blockNumber,
      })
    );
    transferLogs.forEach((log) => {
      if (log.args.from !== ethers.constants.AddressZero)
        history.push({
          type: "TRANSFER",
          from: log.args.from,
          to: log.args.to,
          amount: ethers.utils.formatUnits(log.args.value, 18),
          reason: "Payment",
          hash: log.transactionHash,
          block: log.blockNumber,
        });
    });
    history.sort((a, b) => b.block - a.block);
    res.json(history);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(4000, () => console.log("Backend Running on 4000"));

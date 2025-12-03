const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ==========================================
// ⚡ MEMORY MODE (No Database Required)
// ==========================================

// 1. HARDCODED DATA
// We manually set your Admin Account with 1 Million Coins here.
let users = [
  {
    name: "System Admin",
    email: "admin@campuscoin.com",
    // This is the address from your screenshot
    walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    balance: 1000000,
    isAdmin: true,
  },
];

// 2. THE LEDGER (Starts empty)
let transactions = [];

// ==========================================
// 👇 ROUTES
// ==========================================

// ROUTE 1: Get the Ledger
app.get("/ledger", (req, res) => {
  // Return the list of transactions
  res.json(transactions);
});

// ROUTE 2: Make a Transaction
app.post("/api/transaction", (req, res) => {
  const { toAddress, amount, reason } = req.body;

  // A. Find the Admin (Sender)
  const admin = users.find((u) => u.isAdmin === true);

  // B. Find or Create the Student (Receiver)
  let student = users.find((u) => u.walletAddress === toAddress);
  if (!student) {
    // If student is new, add them to our memory list
    student = {
      name: "Student",
      walletAddress: toAddress,
      balance: 0,
      isAdmin: false,
    };
    users.push(student);
  }

  // C. Check Funds
  if (admin.balance < amount) {
    return res.status(400).json({ message: "Not enough coins!" });
  }

  // D. Transfer the Money
  admin.balance -= Number(amount);
  student.balance += Number(amount);

  // E. Add to Ledger
  const newTx = {
    hash: "0x" + Math.random().toString(16).slice(2),
    from: admin.walletAddress,
    to: student.walletAddress,
    amount: Number(amount),
    reason: reason || "Reward",
    timestamp: new Date(),
  };
  transactions.unshift(newTx); // Add to top of list

  console.log(`✅ Sent ${amount} CAMP to ${toAddress}`);

  res.json({ message: "Success", newBalance: student.balance });
});

// ROUTE 3: Get User Balance (Helper)
app.get("/api/user/:address", (req, res) => {
  const user = users.find((u) => u.walletAddress === req.params.address);
  if (user) {
    res.json(user);
  } else {
    res.json({ balance: 0 });
  }
});

// START SERVER
app.listen(4000, () => {
  console.log("---------------------------------------");
  console.log("🚀 SERVER ONLINE (Memory Mode)");
  console.log("💰 Admin loaded with 1,000,000 Coins");
  console.log("---------------------------------------");
});

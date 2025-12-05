const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ==========================================
// ⚡ MEMORY MODE: SIMULATED BLOCKCHAIN STORAGE
// ==========================================

// 1. INITIALIZE TREASURY (Admin Account)
// The Admin is hardcoded with 1 Million Coins to act as the central bank.
let users = [
  {
    name: "System Admin",
    email: "admin@campuscoin.com",
    walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    balance: 1000000, // Initial Supply
    isAdmin: true,
  },
];

let transactions = []; // The In-Memory Public Ledger

// ==========================================
// 👇 API ROUTES
// ==========================================

// ROUTE 1: GET USER BALANCE
// Dashboard calls this to display "1,000,000 CAMP" without needing MetaMask.
app.get("/api/user/:address", (req, res) => {
  const user = users.find((u) => u.walletAddress === req.params.address);
  if (user) {
    res.json(user);
  } else {
    res.json({ balance: 0 });
  }
});

// ROUTE 2: EXECUTE TRANSACTION (Ratio Adjustment)
// This function replaces the Smart Contract 'transfer' function.
app.post("/api/transaction", (req, res) => {
  const { toAddress, amount, reason } = req.body;

  // A. Identify Sender (Admin) and Receiver (Student)
  const admin = users.find((u) => u.isAdmin === true);
  let student = users.find((u) => u.walletAddress === toAddress);

  // B. Auto-Create Student if new
  if (!student) {
    student = {
      name: "Student",
      walletAddress: toAddress,
      balance: 0,
      isAdmin: false,
    };
    users.push(student);
  }

  // C. Validate Funds
  if (admin.balance < amount) {
    return res.status(400).json({ message: "Insufficient Treasury Funds!" });
  }

  // D. Perform Ratio Adjustment (The Transfer)
  admin.balance -= Number(amount); // Decrease Admin
  student.balance += Number(amount); // Increase Student

  // E. Record to Public Ledger (Immutability Simulation)
  const newTx = {
    hash: "0x" + Math.random().toString(16).slice(2), // Generate Mock Hash
    from: admin.walletAddress,
    to: student.walletAddress,
    amount: Number(amount),
    reason: reason || "Reward",
    timestamp: new Date(),
  };
  transactions.unshift(newTx); // Add to top of Ledger

  res.json({ message: "Success", newBalance: student.balance });
});

// ROUTE 3: PUBLIC LEDGER
app.get("/ledger", (req, res) => {
  res.json(transactions);
});

// START SERVER
app.listen(4000, () => {
  console.log("🚀 CAMPUS COIN SERVER ONLINE (Memory Mode)");
  console.log("💰 Treasury Loaded: 1,000,000 CAMP");
});

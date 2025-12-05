const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ==========================================
// ⚡ FULL MEMORY BACKEND (No DB Required)
// ==========================================

// 1. DATA STORAGE (RAM)
let users = [
  {
    username: "admin", // Matches Login.js "admin"
    password: "123", // Matches Login.js "123"
    role: "admin",
    name: "System Admin",
    walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // YOUR ADDRESS
    balance: 1000000,
  },
  {
    username: "faculty",
    password: "123",
    role: "faculty",
    name: "Dr. Faculty",
    walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    balance: 50,
  },
  {
    username: "student",
    password: "123",
    role: "student",
    name: "John Student",
    walletAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    balance: 10,
  },
];

let events = []; // Stores events created by Admin
let transactions = []; // Stores the Public Ledger

// ==========================================
// 👇 ROUTES
// ==========================================

// --- AUTHENTICATION ---
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(401).json({ error: "Invalid username or password" });
  }
});

// --- ADMIN: CREATE USER ---
app.post("/admin/add-user", (req, res) => {
  const newUser = { ...req.body, balance: 0 };
  users.push(newUser);
  res.json({ success: true, user: newUser });
});

// --- EVENTS & FACULTY ---
app.get("/events", (req, res) => res.json(events));

app.get("/list/faculty", (req, res) => {
  const facultyNames = users
    .filter((u) => u.role === "faculty")
    .map((u) => u.name);
  res.json(facultyNames);
});

app.post("/admin/create-event", (req, res) => {
  const newEvent = {
    id: Math.random().toString(36).substr(2, 9),
    name: req.body.eventName,
    date: req.body.date,
    assignedFaculty: req.body.assignedFaculty,
    participants: [],
  };
  events.push(newEvent);
  res.json({ success: true, event: newEvent });
});

app.post("/admin/add-participant", (req, res) => {
  const { eventId, studentUsername, prizeAmount, position } = req.body;
  const event = events.find((e) => e.id === eventId);

  // Find student wallet
  const student = users.find((u) => u.username === studentUsername);
  const studentWallet = student ? student.walletAddress : "0x000...";
  const studentName = student ? student.name : studentUsername;

  if (event) {
    event.participants.push({
      studentUsername,
      studentName,
      studentWallet,
      amount: prizeAmount,
      position,
      status: "Pending",
    });
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Event not found" });
  }
});

// --- TRANSACTIONS & LEDGER ---
app.get("/ledger", (req, res) => res.json(transactions));

app.post("/api/transaction", (req, res) => {
  const { toAddress, amount, reason } = req.body;

  // Find Admin (Sender)
  const admin = users.find((u) => u.role === "admin");
  // Find Student (Receiver)
  let student = users.find((u) => u.walletAddress === toAddress);

  // If student doesn't exist in our memory list, create a temp one so app doesn't crash
  if (!student) {
    student = { name: "Unknown", walletAddress: toAddress, balance: 0 };
    users.push(student);
  }

  if (admin.balance < amount) {
    return res.status(400).json({ message: "Not enough coins!" });
  }

  // Transfer Logic
  admin.balance -= Number(amount);
  student.balance += Number(amount);

  // Add to Ledger
  const newTx = {
    hash: "0x" + Math.random().toString(16).slice(2),
    from: admin.walletAddress,
    to: student.walletAddress,
    amount: Number(amount),
    reason: reason || "Reward",
    timestamp: new Date(),
  };
  transactions.unshift(newTx);

  console.log(`✅ Sent ${amount} CAMP to ${student.name}`);
  res.json({ message: "Success", newBalance: student.balance });
});

// --- HELPER: Verify Button for Faculty ---
app.post("/faculty/verify", (req, res) => {
  const { eventId, studentWallet } = req.body;
  // In memory mode, we just auto-send the transaction
  // Find the event and mark verified
  const event = events.find((e) => e.id === eventId);
  if (event) {
    const p = event.participants.find(
      (part) => part.studentWallet === studentWallet
    );
    if (p) p.status = "Verified";
  }

  // Simulate Blockchain Transaction
  const txHash = "0x" + Math.random().toString(16).slice(2);
  res.json({ success: true, txHash });
});

// START SERVER
app.listen(4000, () => {
  console.log("---------------------------------------");
  console.log("🚀 SERVER ONLINE (Full Memory Mode)");
  console.log("💰 Login with: admin / 123");
  console.log("---------------------------------------");
});

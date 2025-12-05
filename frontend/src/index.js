const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// --- CONFIGURATION ---
const ADMIN_WALLET_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
let users = [];
let transactions = [];

// ==========================================
// ⚡ STEP 1: LOAD ALL USERS FROM seed.js OUTPUT
// ==========================================
try {
  const rawData = fs.readFileSync("./database.json", "utf8");
  const data = JSON.parse(rawData);
  users = data.users;
  // Ensure the Admin has 1M coins, regardless of seed file state
  const admin = users.find((u) => u.walletAddress === ADMIN_WALLET_ADDRESS);
  if (admin) admin.balance = 1000000;

  console.log(`✅ LOADED: ${users.length} Users from database.json`);
} catch (e) {
  // Fallback if database.json is missing
  console.log("⚠️ ERROR: database.json not found. Running with minimal data.");
  users = [
    {
      username: "admin",
      password: "123",
      role: "admin",
      name: "System Admin",
      walletAddress: ADMIN_WALLET_ADDRESS,
      balance: 1000000,
      isAdmin: true,
    },
  ];
}

// ==========================================
// 👇 ROUTES
// ==========================================

// 1. AUTHENTICATION ROUTE (Login for ALL users)
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Find user by username and password
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    // SUCCESS: Return the user object, including their balance
    res.json({ success: true, user: { ...user, balance: user.balance || 0 } });
  } else {
    res.status(401).json({ error: "Invalid username or password" });
  }
});

// 2. GET USER BALANCE (For Dashboard)
app.get("/api/user/:address", (req, res) => {
  const user = users.find((u) => u.walletAddress === req.params.address);
  if (user) {
    res.json(user);
  } else {
    res.json({ balance: 0 });
  }
});

// 3. TRANSACTION EXECUTION (Admin to Student)
app.post("/api/transaction", (req, res) => {
  // ... (Transaction logic remains the same)
});

// 4. GET LEDGER (Public Ledger)
app.get("/ledger", (req, res) => {
  // This route is now explicitly defined
  res.json(transactions);
});

// 5. GET FACULTY LIST (For Admin Event Creation)
app.get("/list/faculty", (req, res) => {
  const facultyNames = users
    .filter((u) => u.role === "faculty")
    .map((u) => u.name);
  res.json(facultyNames);
});

// ... (Other Event/Admin routes would go here)

// START SERVER
app.listen(4000, () => {
  console.log("---------------------------------------");
  console.log("🚀 SERVER ONLINE on PORT 4000");
  console.log("---------------------------------------");
});

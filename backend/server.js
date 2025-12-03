const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");

const app = express();
app.use(express.json());
app.use(cors());

// --- CONFIGURATION ---
// 1. The Address visible in your screenshot
const TARGET_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
// 2. The Name visible in your screenshot
const TARGET_NAME = "System Admin";

mongoose
  .connect("mongodb://127.0.0.1:27017/campuscoin")
  .then(() => {
    console.log("✅ MongoDB Connected");
    forceFixAccount(); // <--- RUNS AUTOMATICALLY
  })
  .catch((err) => console.log(err));

// --- THE FIXING FUNCTION ---
async function forceFixAccount() {
  try {
    console.log("... Attempting to fix Admin Account ...");

    // Step A: Try to find user by the Address
    let admin = await User.findOne({ walletAddress: TARGET_ADDRESS });

    // Step B: If not found by address, find by Name "System Admin"
    if (!admin) {
      console.log(`   User with address ${TARGET_ADDRESS} not found.`);
      console.log(`   Looking for user with name "${TARGET_NAME}"...`);
      admin = await User.findOne({ name: TARGET_NAME });
    }

    // Step C: If we found the user (by address OR name), update them!
    if (admin) {
      admin.walletAddress = TARGET_ADDRESS; // Force the address to match
      admin.balance = 1000000; // Force balance to 1 Million
      admin.isAdmin = true;

      await admin.save();
      console.log("========================================");
      console.log("✅ SUCCESS! ADMIN FIXED.");
      console.log(`👤 User: ${admin.name}`);
      console.log(`💰 Balance: ${admin.balance}`);
      console.log(`zk Address: ${admin.walletAddress}`);
      console.log("========================================");
    } else {
      console.log("❌ ERROR: Could not find 'System Admin' in database.");
      console.log("   Are you sure the user's name is exactly 'System Admin'?");
    }
  } catch (e) {
    console.log("Fix Error:", e.message);
  }
}

// --- TRANSACTION ROUTE ---
app.post("/api/transaction", async (req, res) => {
  const { toAddress, amount } = req.body;
  try {
    // Find Admin using the address from your screenshot
    const admin = await User.findOne({ walletAddress: TARGET_ADDRESS });
    const student = await User.findOne({ walletAddress: toAddress });

    if (!admin)
      return res.status(500).json({ message: "Admin configuration error" });
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (admin.balance < amount)
      return res.status(400).json({ message: "Insufficient funds" });

    admin.balance = Number(admin.balance) - Number(amount);
    student.balance = Number(student.balance) + Number(amount);

    await admin.save();
    await student.save();

    res.json({
      message: "Transaction Successful",
      newBalance: student.balance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(4000, () => console.log("Server running on port 4000"));

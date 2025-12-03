const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// 1. DATABASE
mongoose
  .connect("mongodb://127.0.0.1:27017/campuscoin")
  .then(() => console.log("✅ DATABASE CONNECTED"))
  .catch((err) => console.log("❌ DB ERROR:", err));

// 2. SIMPLE TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend is ONLINE and Working!");
});

// 3. START
app.listen(4000, () => {
  console.log("🚀 SERVER STARTED ON PORT 4000");
});

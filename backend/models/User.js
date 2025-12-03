const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  walletAddress: { type: String, unique: true }, // The ID used for sending money
  balance: { type: Number, default: 0 }, // Regular users start with 0
  isAdmin: { type: Boolean, default: false }, // Only true for the Admin
});

module.exports = mongoose.model("User", UserSchema);

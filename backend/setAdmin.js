const mongoose = require("mongoose");
const User = require("./models/User");

// --- THE FIX: Removed the deprecated options ---
mongoose
  .connect("mongodb://localhost:27017/campuscoin")
  .then(() => console.log("Connected to Database..."))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

const setBalance = async () => {
  // CHANGE THIS EMAIL to the one you want to be the Admin
  const targetEmail = "admin@college.edu";

  try {
    const admin = await User.findOne({ email: targetEmail });

    if (admin) {
      admin.balance = 1000000; // Set 1 Million
      admin.isAdmin = true; // Make sure they have admin rights
      await admin.save();
      console.log(`SUCCESS: ${targetEmail} now has 1,000,000 Coins.`);
    } else {
      console.log(`ERROR: User with email '${targetEmail}' not found.`);
      console.log(
        "Please register this user in your app first, then run this script again."
      );
    }
  } catch (error) {
    console.error("Error updating balance:", error);
  } finally {
    mongoose.connection.close();
  }
};

setBalance();

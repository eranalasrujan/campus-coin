const express = require("express");
const router = express.Router();
const controller = require("../controllers/coinController");

// GET balance by address
router.get("/balance", controller.getBalance);

// GET total supply
router.get("/total-supply", controller.getTotalSupply);

// POST transfer { fromPrivateKey, to, amount }
router.post("/transfer", controller.transfer);

// POST mint { to, amount } (requires OWNER_PRIVATE_KEY in .env)
router.post("/mint", controller.mint);

module.exports = router;

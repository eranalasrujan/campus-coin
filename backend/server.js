require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Simple health check
app.get("/", (req, res) => res.json({ ok: true, name: "CampusCoin Backend" }));

// Load routes
const coinRoutes = require("./routes/coin");
app.use("/api/coin", coinRoutes);

app.listen(port, () => {
  console.log(`CampusCoin backend listening on port ${port}`);
});

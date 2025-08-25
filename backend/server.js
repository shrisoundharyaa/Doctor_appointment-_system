// server.js
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");

dotenv.config();   
connectDB();      

const app = express();

app.get("/", (req, res) => {
  res.send("MongoDB connection is working!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

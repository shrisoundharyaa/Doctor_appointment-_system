// server.js
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");

dotenv.config();   
connectDB();      

const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());

app.use("/api/admin", require("./src/routes/adminRoutes"));
app.use("/api/patient", require("./src/routes/patientRoutes"));
app.use("/api/doctor", require("./src/routes/doctorRoutes"));
app.use("/api/hospital", require("./src/routes/hospitalRoutes"));
app.use("/api/booking", require("./src/routes/bookingRoutes"));


app.get("/", (req, res) => {
  res.send("MongoDB connection is working!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

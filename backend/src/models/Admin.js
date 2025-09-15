const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  location: String,   // added location here
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" }
});

module.exports = mongoose.model("Admin", adminSchema);

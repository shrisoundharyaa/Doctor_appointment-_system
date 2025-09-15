const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: String,
  specialization: String,
  contact: String,
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" }
});

module.exports = mongoose.model("Doctor", doctorSchema);

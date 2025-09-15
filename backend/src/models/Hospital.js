const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: String,
  contact: String,
  email: String,
   accessStatus: { type: String, enum: ["pending", "granted", "declined"], default: "pending" },
  doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }],
  requests: [
    {
      fromHospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
      status: { type: String, enum: ["pending", "granted", "declined"], default: "pending" },
    },
  ],
  grantedAccess: [
    {
      hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
      grantedAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Hospital", hospitalSchema);

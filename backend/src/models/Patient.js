// models/Patient.js
const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
   aadhar: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^\d{12}$/.test(v); // must be exactly 12 digits
      },
      message: (props) => `${props.value} is not a valid 12-digit Aadhar number!`,
    },
  },
});

module.exports = mongoose.model("Patient", patientSchema);

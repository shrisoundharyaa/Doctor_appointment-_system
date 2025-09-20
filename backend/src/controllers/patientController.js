// controllers/patientController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Patient = require("../models/Patient");

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register patient
exports.registerPatient = async (req, res) => {
  try {
    const { name, email, password, phone, aadhar } = req.body;

    if (!name || !email || !password || !phone || !aadhar) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingPatient = await Patient.findOne({ $or: [{ email }, { aadhar }] });
    if (existingPatient) {
      return res.status(400).json({ error: "Email or Aadhar already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const patient = new Patient({
      name,
      email,
      password: hashedPassword,
      phone,
      aadhar,
    });

    await patient.save();

    const token = generateToken(patient._id);

    res.status(201).json({
      message: "Patient registered successfully",
      token,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        aadhar: patient.aadhar,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login patient
exports.loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = generateToken(patient._id);

    res.status(200).json({
      message: "Login successful",
      token,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        aadhar: patient.aadhar,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fetch patient by Aadhar (for doctors)
exports.getPatientByAadhar = async (req, res) => {
  try {
    const { aadhar } = req.params;
    const patient = await Patient.findOne({ aadhar });

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.status(200).json({ patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Get single patient by ID (without auth)
exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id).select("-password");

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.status(200).json({ patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


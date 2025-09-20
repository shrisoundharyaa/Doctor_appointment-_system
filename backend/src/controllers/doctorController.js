const Doctor = require("../models/Doctor");

// ✅ Get doctors by hospital
exports.getDoctorsByHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const doctors = await Doctor.find({ hospital: hospitalId });
    res.status(200).json({ doctors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Doctor login
exports.loginDoctor = async (req, res) => {
  const { name, specialization, hospitalId } = req.body;

  try {
    // Find doctor with hospital reference
    const doctor = await Doctor.findOne({ name, specialization }).populate("hospital");

    if (!doctor) {
      return res.status(400).json({ error: "Doctor not found" });
    }

    // Validate hospital id
    if (doctor.hospital._id.toString() !== hospitalId) {
      return res.status(400).json({ error: "Invalid Hospital ID" });
    }

    res.json({ message: "Login successful", doctor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

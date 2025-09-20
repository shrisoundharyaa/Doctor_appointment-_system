const Hospital = require("../models/Hospital");

// Get all hospitals
exports.getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find().populate("doctors");
    res.status(200).json({ hospitals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get hospitals by location
exports.getHospitalsByLocation = async (req, res) => {
  try {
    const { location } = req.query; // ?location=cityname
    const hospitals = await Hospital.find({ location: { $regex: location, $options: "i" } });
    res.status(200).json({ hospitals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all unique hospital locations
exports.getHospitalLocations = async (req, res) => {
  try {
    const locations = await Hospital.distinct("location");
    res.status(200).json({ locations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

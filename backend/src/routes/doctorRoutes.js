const express = require("express");
const { getDoctorsByHospital, loginDoctor } = require("../controllers/doctorController");

const router = express.Router();

// ✅ Only method definitions here
router.get("/hospital/:hospitalId", getDoctorsByHospital);
router.post("/login", loginDoctor);

module.exports = router;

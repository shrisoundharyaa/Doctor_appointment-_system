
// routes/patientRoutes.js
const express = require("express");
const { registerPatient, loginPatient, getPatientByAadhar,getPatientById } = require("../controllers/patientController");


const router = express.Router();

router.post("/register", registerPatient);
router.post("/login", loginPatient);
// routes/patientRoutes.js
router.get("/aadhar/:aadhar", getPatientByAadhar);
router.get("/id/:id", getPatientById);




module.exports = router;
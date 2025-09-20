const express = require("express");
const { getAllHospitals, getHospitalsByLocation, getHospitalLocations } = require("../controllers/hospitalController");

const router = express.Router();

router.get("/all", getAllHospitals);
router.get("/", getHospitalsByLocation);
router.get("/locations", getHospitalLocations); // NEW: endpoint for dropdown

module.exports = router;

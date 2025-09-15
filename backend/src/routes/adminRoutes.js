const express = require("express");
const { registerAdmin, loginAdmin, addDoctor, getHospitalDetails, getAllHospitals, handleAccessRequest,updateHospitalAccess,sendAccessRequest} = require("../controllers/adminController");
const auth = require("../middleware/auth");


const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/doctor", addDoctor);
router.get("/hospital",getHospitalDetails);
router.get("/hospitals", getAllHospitals);
router.post("/access-request", handleAccessRequest);
router.put("/update-access", updateHospitalAccess);
router.post("/send-request", sendAccessRequest);


module.exports = router;

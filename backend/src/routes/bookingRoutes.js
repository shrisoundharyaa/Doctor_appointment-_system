const express = require("express");
const {
  bookSlot,
  getPatientBookings,
  getDoctorBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");

const router = express.Router();

// Book a slot
router.post("/book", bookSlot);

// Get bookings
router.get("/patient/:patientId", getPatientBookings);
router.get("/doctor/:doctorId", getDoctorBookings);

// Update booking status
router.put("/status", updateBookingStatus); // ✅ body: { bookingId, status }

module.exports = router;

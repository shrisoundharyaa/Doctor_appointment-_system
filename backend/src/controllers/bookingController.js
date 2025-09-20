const Booking = require("../models/Booking");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

// ✅ Book a slot
exports.bookSlot = async (req, res) => {
  try {
    const { patientId, doctorId, date, time, ampm } = req.body;
    if (!patientId || !doctorId || !date || !time || !ampm) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const booking = new Booking({ patient: patientId, doctor: doctorId, date, time, ampm });
    await booking.save(); // ✅ make sure MongoDB is connected properly

    res.status(201).json({ message: "Slot booked successfully", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


// ✅ Get bookings for a patient
exports.getPatientBookings = async (req, res) => {
  try {
    const { patientId } = req.params;
    const bookings = await Booking.find({ patient: patientId })
      .populate("doctor", "name specialization contact")
      .sort({ createdAt: -1 });
    res.status(200).json({ bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get bookings for a doctor
exports.getDoctorBookings = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const bookings = await Booking.find({ doctor: doctorId })
      .populate("patient", "name email phone aadhar") // ✅ include aadhar
      .sort({ createdAt: -1 });
    res.status(200).json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Accept / Decline a booking
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body; // status: "Accepted" or "Declined"
    if (!["Accepted", "Declined"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    )
      .populate("patient", "name email phone")
      .populate("doctor", "name specialization");

    res.status(200).json({ message: "Booking updated", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

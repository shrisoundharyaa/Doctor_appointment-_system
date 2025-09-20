import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const DoctorDashboard = () => {
  const { id: doctorId } = useParams();
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/booking/doctor/${doctorId}`);
      setBookings(res.data.bookings);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (doctorId) fetchBookings();
  }, [doctorId]);

  const updateStatus = async (bookingId, status) => {
    try {
      await axios.put("http://localhost:5000/api/booking/status", { bookingId, status });
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Incoming Bookings</h2>
      <ul>
  {bookings.map((b) => (
    <li key={b._id} className="mb-2">
      {b.patient.name} (Aadhar: {b.patient.aadhar}) wants appointment on {b.date} at {b.time} {b.ampm} - Status: {b.status}
      {b.status === "Pending" && (
        <span className="ml-2">
          <button
            onClick={() => updateStatus(b._id, "Accepted")}
            className="bg-green-500 text-white p-1 mr-1 rounded"
          >
            Accept
          </button>
          <button
            onClick={() => updateStatus(b._id, "Declined")}
            className="bg-red-500 text-white p-1 rounded"
          >
            Decline
          </button>
        </span>
      )}
    </li>
  ))}
</ul>

    </div>
  );
};

export default DoctorDashboard;

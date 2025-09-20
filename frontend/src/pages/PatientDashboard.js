import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; 
import axios from "axios";

const PatientDashboard = () => {
  const { id } = useParams(); 
  const [patient, setPatient] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [ampm, setAmpm] = useState("AM");
  const [bookings, setBookings] = useState([]);

  // ✅ Fetch patient profile
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/patient/id/${id}`);
        setPatient(res.data.patient);
      } catch (err) {
        console.error("Error fetching patient:", err);
      }
    };
    fetchPatient();
  }, [id]);

  // ✅ Fetch hospital locations for dropdown
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/hospital/locations");
        setLocations(res.data.locations);
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    };
    fetchLocations();
  }, []);

  // ✅ Fetch hospitals based on selected location
  const handleLocationChange = async (e) => {
    const location = e.target.value;
    setSelectedLocation(location);
    if (!location) return setHospitals([]);

    try {
      const res = await axios.get(`http://localhost:5000/api/hospital?location=${location}`);
      setHospitals(res.data.hospitals);
      setSelectedHospital("");
      setDoctors([]);
      setSelectedDoctor("");
    } catch (err) {
      console.error("Error fetching hospitals:", err);
    }
  };

  // ✅ Fetch doctors for selected hospital
  const handleHospitalSelect = async (hospitalId) => {
    setSelectedHospital(hospitalId);
    try {
      const res = await axios.get(`http://localhost:5000/api/doctor/hospital/${hospitalId}`);
      setDoctors(res.data.doctors);
      setSelectedDoctor("");
    } catch (err) {
      console.error("Error fetching doctors:", err);
    }
  };

  // ✅ Fetch patient bookings
  const fetchBookings = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/booking/patient/${id}`);
      setBookings(res.data.bookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  useEffect(() => {
    if (id) fetchBookings();
  }, [id]);

  // ✅ Book a slot
const handleBooking = async () => {
  if (!selectedDoctor || !date || !time) return alert("All fields required");

  try {
    const res = await axios.post("http://localhost:5000/api/booking/book", {
      patientId: id,
      doctorId: selectedDoctor,
      date,
      time,
      ampm,
    });
    alert("Slot booked successfully");

    // Add the new booking to the bookings state
    setBookings((prev) => [res.data.booking, ...prev]);
  } catch (err) {
    console.error("Error booking slot:", err);
  }
};


  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Patient Dashboard</h1>

      {patient && (
        <div className="mb-6">
          <h2 className="font-semibold">Profile</h2>
          <p>Name: {patient.name}</p>
          <p>Email: {patient.email}</p>
          <p>Phone: {patient.phone}</p>
          <p>Aadhar: {patient.aadhar}</p>
        </div>
      )}

      {/* Search hospitals */}
      <div className="mb-6">
        <h2 className="font-semibold">Search Hospitals by Location</h2>
        <select
          value={selectedLocation}
          onChange={handleLocationChange}
          className="border p-2"
        >
          <option value="">-- Select Location --</option>
          {locations.map((loc, idx) => (
            <option key={idx} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {hospitals.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold">Hospitals</h2>
          <ul>
            {hospitals.map((hospital) => (
              <li key={hospital._id} className="mb-2">
                <span>{hospital.name} ({hospital.location})</span>
                <button
                  onClick={() => handleHospitalSelect(hospital._id)}
                  className="ml-2 bg-green-500 text-white p-1"
                >
                  View Doctors
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {doctors.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold">Doctors</h2>
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="border p-2 w-full mb-2"
          >
            <option value="">-- Select Doctor --</option>
            {doctors.map((doc) => (
              <option key={doc._id} value={doc._id}>
                {doc.name} ({doc.specialization})
              </option>
            ))}
          </select>

          {/* Book Slot */}
          <div className="mb-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border p-2 w-full mb-2"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="border p-2 w-full mb-2"
            />
            <select
              value={ampm}
              onChange={(e) => setAmpm(e.target.value)}
              className="border p-2 w-full mb-2"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>

          <button
            onClick={handleBooking}
            className="bg-blue-500 text-white p-2 rounded"
          >
            Book Slot
          </button>
        </div>
      )}

      {/* Patient Bookings */}
      {bookings.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold">Your Bookings</h2>
          <ul>
            {bookings.map((b) => (
              <li key={b._id}>
                {b.doctor.name} on {b.date} at {b.time} {b.ampm} - Status: {b.status}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;

import React, { useState } from "react";
import { addDoctor } from "../api/adminApi";

function ManageDoctors() {
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [contact, setContact] = useState("");
  const [hospitalId, setHospitalId] = useState(""); // You can prefill based on logged-in admin

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoctor({ name, specialization, contact, hospitalId });
      alert("Doctor added successfully!");
    } catch (err) {
      alert("Error adding doctor");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Manage Doctors</h1>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow w-96">
        <input type="text" placeholder="Doctor Name" className="w-full mb-3 p-2 border rounded"
          value={name} onChange={(e) => setName(e.target.value)} />
        <input type="text" placeholder="Specialization" className="w-full mb-3 p-2 border rounded"
          value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
        <input type="text" placeholder="Contact" className="w-full mb-3 p-2 border rounded"
          value={contact} onChange={(e) => setContact(e.target.value)} />
        <input type="text" placeholder="Hospital ID" className="w-full mb-3 p-2 border rounded"
          value={hospitalId} onChange={(e) => setHospitalId(e.target.value)} />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">Add Doctor</button>
      </form>
    </div>
  );
}

export default ManageDoctors;

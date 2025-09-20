import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function DoctorLogin() {
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    hospitalId: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch("http://localhost:5000/api/doctor/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Login successful");
      localStorage.setItem("doctorData", JSON.stringify(data.doctor));

      // ✅ Navigate to dashboard with doctor ID
      navigate(`/doctor/dashboard/${data.doctor._id}`);
    } else {
      alert(data.error || "Login failed");
    }
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
};


  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-96"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Doctor Login</h2>

        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          name="specialization"
          placeholder="Specialization"
          value={formData.specialization}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          name="hospitalId"
          placeholder="Hospital ID"
          value={formData.hospitalId}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Login
        </button>

        <p className="text-center mt-4 text-gray-600">
          Go back to{" "}
          <Link to="/" className="text-blue-500">
            Home
          </Link>
        </p>
      </form>
    </div>
  );
}

export default DoctorLogin;

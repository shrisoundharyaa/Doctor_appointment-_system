import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";

function AdminDashboard() {
  const [hospital, setHospital] = useState(null);
  const [otherHospitals, setOtherHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // 🔹 Memoized fetchData so ESLint won't complain
  const fetchData = useCallback(async () => {
    try {
      const [hospitalRes, hospitalsRes] = await Promise.all([
        fetch("http://localhost:5000/api/admin/hospital", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/admin/hospitals", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const hospitalData = await hospitalRes.json();
      const hospitalsData = await hospitalsRes.json();

      setHospital(hospitalData.hospital);
      setOtherHospitals(hospitalsData.hospitals);
    } catch (err) {
      console.error("Error fetching:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ✅ Handle request (grant / decline / revoke)
  const handleRequest = async (requestId, status, targetHospitalId = null) => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/access-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId, status, targetHospitalId }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Action failed");
        return;
      }
      fetchData(); // refresh after action
    } catch (err) {
      console.error("Error handling request:", err);
    }
  };

  // ✅ Send new / resend access request
  const sendAccessRequest = async (hospitalId) => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/send-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ toHospitalId: hospitalId }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to send request");
        return;
      }

      alert("Request sent successfully!");
      fetchData();
    } catch (err) {
      console.error("Error sending request:", err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!hospital) return <p>No hospital data found</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* Hospital Info */}
      <div className="mb-6 bg-gray-100 p-4 rounded shadow">
        <h2 className="text-xl font-semibold">Hospital: {hospital.name}</h2>
        <p>
          <strong>Hospital ID:</strong> {hospital._id}
        </p>
        <p>
          <strong>Location:</strong> {hospital.location}
        </p>
      </div>

      {/* Doctors List */}
      <div className="mb-6 bg-blue-100 p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Doctors</h2>
        {hospital.doctors?.length === 0 ? (
          <p>No doctors added yet.</p>
        ) : (
          <ul className="list-disc ml-6">
            {hospital.doctors?.map((doc) => (
              <li key={doc._id}>
                <strong>{doc.name}</strong> - {doc.specialization}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Incoming Requests */}
      <div className="mb-6 bg-yellow-100 p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Access Requests</h2>
        {hospital.requests?.length === 0 ? (
          <p>No requests received.</p>
        ) : (
          <ul className="list-disc ml-6">
            {hospital.requests.map((req) => (
              <li key={req._id} className="flex justify-between items-center">
                From Hospital: {req.fromHospital?.name || req.fromHospital} |{" "}
                Status: {req.status}
                {req.status === "pending" && (
                  <div className="ml-4">
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                      onClick={() => handleRequest(req._id, "granted")}
                    >
                      Grant
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => handleRequest(req._id, "declined")}
                    >
                      Decline
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Granted Access */}
      <div className="mb-6 bg-green-100 p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Hospitals with Access</h2>
        {hospital.grantedAccess?.length === 0 ? (
          <p>No hospitals granted access.</p>
        ) : (
          <ul className="list-disc ml-6">
            {hospital.grantedAccess.map((g) => (
              <li key={g._id} className="flex justify-between items-center">
                {g.hospital?.name} ({g.hospital?.location})
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded ml-4"
                  onClick={() =>
                    handleRequest(g.hospital._id, "revoke", hospital._id)
                  }
                >
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Other Hospitals */}
      <div className="mb-6 bg-purple-100 p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Other Hospitals</h2>
        {otherHospitals.length === 0 ? (
          <p>No other hospitals found.</p>
        ) : (
          <ul className="list-disc ml-6">
            {otherHospitals.map((h) => (
              <li key={h._id} className="flex justify-between items-center">
                <span>
                  {h.name} ({h.location})
                </span>

                {/* Resend if declined */}
                {h.requestStatus === "declined" && (
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded ml-4"
                    onClick={() => sendAccessRequest(h._id)}
                  >
                    Resend Request
                  </button>
                )}

                {/* Show status if not declined */}
                {h.requestStatus && h.requestStatus !== "declined" && (
                  <span className="ml-4 text-sm text-gray-600">
                    Request: {h.requestStatus}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-center mt-4">
        To add Doctors:{" "}
        <Link to="/admin/manage-doctors" className="text-blue-500">
          Add Doctor
        </Link>
      </p>
    </div>
  );
}

export default AdminDashboard;

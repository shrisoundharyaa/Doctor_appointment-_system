const Hospital = require("../models/Hospital");
const Doctor = require("../models/Doctor");
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Helper: generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secretkey", { expiresIn: "1d" });
};

// ✅ Register Admin
// ✅ Register Admin
// ✅ Register Admin
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password, hospitalName, location } = req.body;

    if (!name || !email || !password || !hospitalName) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: "Admin with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let hospital = await Hospital.findOne({ name: hospitalName });
    if (!hospital) {
      hospital = new Hospital({ name: hospitalName, location });
      await hospital.save();

      // ✅ Get all other hospitals
      const otherHospitals = await Hospital.find({ _id: { $ne: hospital._id } });

      for (let other of otherHospitals) {
        // (1) New hospital requests access from existing hospitals
        other.requests.push({ fromHospital: hospital._id });
        await other.save();

        // (2) Existing hospitals request access from the new hospital
        hospital.requests.push({ fromHospital: other._id });
      }

      // Save hospital again with the reverse requests
      await hospital.save();
    }

    const admin = new Admin({
      name,
      email,
      password: hashedPassword,
      location,
      hospital: hospital._id,
    });
    await admin.save();

    const token = generateToken(admin._id);

    res.status(201).json({
      message: "Admin registered successfully",
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, hospital: hospital.name },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ Login Admin
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = generateToken(admin._id);

    res.json({
      message: "Login successful",
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Add Doctor (admin protected)
exports.addDoctor = async (req, res) => {
  try {
    const { name, specialization, contact, hospitalId } = req.body;

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ error: "Hospital not found" });

    const doctor = new Doctor({ name, specialization, contact, hospital: hospitalId });
    await doctor.save();

    hospital.doctors.push(doctor._id);
    await hospital.save();

    res.json({ message: "Doctor added successfully", doctor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get Hospital Details (requires token)
exports.getHospitalDetails = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const admin = await Admin.findById(decoded.id).populate("hospital");
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    const hospital = await Hospital.findById(admin.hospital)
  .populate("doctors", "name specialization contact")
  .populate({
    path: "requests.fromHospital",
    select: "name location"
  })
  .populate("grantedAccess.hospital", "name location");


    res.json({ hospital });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all hospitals except current
// ✅ Get all hospitals except current, including request status
exports.getAllHospitals = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    const admin = await Admin.findById(decoded.id).populate("hospital");
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    const currentHospitalId = admin.hospital._id;

    // Fetch all hospitals except current
    const hospitals = await Hospital.find({ _id: { $ne: currentHospitalId } })
      .select("name location requests");

    // Add requestStatus for each hospital wrt current hospital
    const enrichedHospitals = hospitals.map(h => {
      const request = h.requests.find(
        r => r.fromHospital.toString() === currentHospitalId.toString()
      );
      return {
        _id: h._id,
        name: h.name,
        location: h.location,
        requestStatus: request ? request.status : null
      };
    });

    res.json({ hospitals: enrichedHospitals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update request status
// ✅ Update request status (grant/decline/revoke)
// ✅ Update request status (grant/decline/revoke)
// ✅ Update request status (grant/decline/revoke)
exports.handleAccessRequest = async (req, res) => {
  try {
    const { requestId, status, targetHospitalId } = req.body;

    let hospital, request;

    if (status === "revoke") {
      // 🔹 Find the hospital that is revoking (the one sending the request)
      hospital = await Hospital.findById(targetHospitalId);
      if (!hospital) return res.status(404).json({ error: "Hospital not found" });

      // Remove from grantedAccess
      hospital.grantedAccess = hospital.grantedAccess.filter(
        (g) => g.hospital.toString() !== requestId.toString()
      );

      // Reset request status back to pending
      const reqToUpdate = hospital.requests.find(
        (r) => r.fromHospital.toString() === requestId.toString()
      );
      if (reqToUpdate) reqToUpdate.status = "pending";

      await hospital.save();

      // 🔹 Update reverse hospital
      const otherHospital = await Hospital.findById(requestId);
      if (otherHospital) {
        otherHospital.grantedAccess = otherHospital.grantedAccess.filter(
          (g) => g.hospital.toString() !== hospital._id.toString()
        );

        const reverseReq = otherHospital.requests.find(
          (r) => r.fromHospital.toString() === hospital._id.toString()
        );
        if (reverseReq) reverseReq.status = "pending";

        await otherHospital.save();
      }

      return res.json({ message: "Access revoked and reset to pending", hospital });
    }

    // 🔹 Normal grant/decline flow
    hospital = await Hospital.findOne({ "requests._id": requestId });
    if (!hospital) return res.status(404).json({ error: "Request not found" });

    request = hospital.requests.id(requestId);

    if (status === "granted") {
      request.status = "granted";

      const exists = hospital.grantedAccess.some(
        (g) => g.hospital.toString() === request.fromHospital.toString()
      );
      if (!exists) {
        hospital.grantedAccess.push({ hospital: request.fromHospital });
      }
    } else if (status === "declined") {
      request.status = "declined";

      hospital.grantedAccess = hospital.grantedAccess.filter(
        (g) => g.hospital.toString() !== request.fromHospital.toString()
      );
    }

    await hospital.save();

    // 🔹 Update reverse hospital
    const otherHospital = await Hospital.findById(request.fromHospital);
    if (status === "granted") {
      const exists = otherHospital.grantedAccess.some(
        (g) => g.hospital.toString() === hospital._id.toString()
      );
      if (!exists) {
        otherHospital.grantedAccess.push({ hospital: hospital._id });
      }
    } else if (status === "declined") {
      const otherReq = otherHospital.requests.find(
        (r) => r.fromHospital.toString() === hospital._id.toString()
      );
      if (otherReq) otherReq.status = "declined";

      otherHospital.grantedAccess = otherHospital.grantedAccess.filter(
        (g) => g.hospital.toString() !== hospital._id.toString()
      );
    }

    await otherHospital.save();

    res.json({ message: `Request ${status} successfully`, hospital });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Update hospital access (grant or decline)
exports.updateHospitalAccess = async (req, res) => {
  try {
    const { hospitalId, status } = req.body; // status = "granted" or "declined"

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found" });
    }

    hospital.accessStatus = status; // new field in schema
    await hospital.save();

    res.json({ message: `Access ${status} successfully`, hospital });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ✅ Admin sends request to another hospital
// ✅ Send or Resend Access Request
exports.sendAccessRequest = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    const admin = await Admin.findById(decoded.id).populate("hospital");
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    const fromHospitalId = admin.hospital._id;
    const { toHospitalId } = req.body;

    if (!toHospitalId) {
      return res.status(400).json({ error: "Target hospital required" });
    }

    const toHospital = await Hospital.findById(toHospitalId);
    if (!toHospital) return res.status(404).json({ error: "Target hospital not found" });

    // 🔹 Check if request already exists
    const existingRequest = toHospital.requests.find(
      (r) => r.fromHospital.toString() === fromHospitalId.toString()
    );

    if (existingRequest) {
      if (existingRequest.status === "declined") {
        existingRequest.status = "pending"; // Resend
      } else {
        return res.status(400).json({ error: `Request already ${existingRequest.status}` });
      }
    } else {
      // New request
      toHospital.requests.push({ fromHospital: fromHospitalId, status: "pending" });
    }

    await toHospital.save();

    res.json({ message: "Request sent successfully", toHospital });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};





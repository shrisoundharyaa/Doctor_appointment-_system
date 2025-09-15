import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister"; // ✅ import
import AdminDashboard from "./pages/AdminDashboard";
import ManageDoctors from "./pages/ManageDoctors";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/manage-doctors" element={<ManageDoctors />} />
      </Routes>
    </Router>
  );
}

export default App;

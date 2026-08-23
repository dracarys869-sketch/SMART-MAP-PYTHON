import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProgramDetail from "./pages/ProgramDetail";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/programs/:slug" element={<ProgramDetail />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}

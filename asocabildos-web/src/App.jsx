import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "./auth/AuthProvider";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Vacante from "./pages/Vacante";
import PostulacionFollow from "./pages/PostulacionFollow";
import AdminDashboard from "./pages/admin/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vacante/:id" element={<Vacante />} />
          <Route path="/login" element={<Login />} />
          <Route path="/seguimiento" element={<PostulacionFollow />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={["ADMIN", "RRHH", "JEFE_AREA"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </BrowserRouter>
    </AuthProvider>
  );
}

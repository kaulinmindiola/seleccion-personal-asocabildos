import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "./auth/AuthProvider";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Vacante from "./pages/Vacante";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import VacantesAdmin from "./pages/admin/VacantesList";
import PostulacionesAdmin from "./pages/admin/PostulantesList";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SeguimientoPublico from "./pages/seguimientoPublico";
import UsuariosAdmin from "./pages/admin/Usuarios";
import EvaluacionesAdmin from "./pages/admin/Evaluaciones";
import EstadisticasAdmin from "./pages/admin/Estadisticas";
import ConfiguracionAdmin from "./pages/admin/Configuracion";
import MiCuenta from "./pages/admin/MiCuenta";
import PublicLayout from "./layouts/PublicLayout";


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        
        <Routes>

          {/* 🌐 RUTAS PÚBLICAS */}
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="/vacante/:id" element={<Vacante />} />
            <Route path="/seguimiento" element={<SeguimientoPublico />} />
          </Route>

          {/* 🔑 LOGIN */}
          <Route path="/login" element={<Login />} />

          {/* 🧩 ADMIN */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["ADMIN", "RRHH", "JEFE_AREA"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="vacantes" element={<VacantesAdmin />} />
            <Route path="postulaciones" element={<PostulacionesAdmin />} />
            <Route path="usuarios" element={<UsuariosAdmin />} />
            <Route path="evaluaciones" element={<EvaluacionesAdmin />} />
            <Route path="estadisticas" element={<EstadisticasAdmin />} />
            <Route path="configuracion" element={<ConfiguracionAdmin />} />
            <Route path="cuenta" element={<MiCuenta />} />
          </Route>

        </Routes>

      </BrowserRouter>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </AuthProvider>
  );
}

import { NavLink, Outlet } from "react-router-dom";
import useAuth from "../auth/useAuth";
import {
  LogOut,
  BarChart3,
  Users,
  Briefcase,
  List,
  Settings,
  UserCircle2,
  ClipboardList,
} from "lucide-react";

export default function AdminLayout() {
  const { user, logout } = useAuth();

  const linkStyle = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-md transition ${
      isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100"
    }`;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col justify-between">
        <div>
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-bold text-lg text-blue-700">Panel RRHH</h2>
            <p className="text-sm text-gray-500">{user?.role}</p>
          </div>

          <nav className="flex flex-col gap-1 p-4">
            <NavLink to="/admin/dashboard" className={linkStyle}>
              <BarChart3 size={18} /> Dashboard
            </NavLink>

            <NavLink to="/admin/vacantes" className={linkStyle}>
              <Briefcase size={18} /> Vacantes
            </NavLink>

            <NavLink to="/admin/postulaciones" className={linkStyle}>
              <ClipboardList size={18} /> Postulaciones
            </NavLink>

            {user?.role === "ADMIN" && (
              <NavLink to="/admin/usuarios" className={linkStyle}>
                <Users size={18} /> Usuarios
              </NavLink>
            )}

            <NavLink to="/admin/evaluaciones" className={linkStyle}>
              <List size={18} /> Evaluaciones
            </NavLink>

            <NavLink to="/admin/estadisticas" className={linkStyle}>
              <BarChart3 size={18} /> Estadísticas
            </NavLink>

            <NavLink to="/admin/configuracion" className={linkStyle}>
              <Settings size={18} /> Configuración
            </NavLink>

            <NavLink to="/admin/cuenta" className={linkStyle}>
              <UserCircle2 size={18} /> Mi cuenta
            </NavLink>
          </nav>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 p-4 bg-red-600 text-white hover:bg-red-700"
        >
          <LogOut size={18} /> Cerrar sesión
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

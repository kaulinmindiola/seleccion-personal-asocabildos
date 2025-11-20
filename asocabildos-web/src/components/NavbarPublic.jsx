import { Link, useLocation } from "react-router-dom";

export default function NavbarPublic() {
  const location = useLocation();

  const linkClass = (path) =>
    `px-4 py-2 rounded-md transition ${
      location.pathname === path
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-blue-100"
    }`;

  return (
    <header className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
        <h1 className="text-xl font-bold text-blue-700">
          Sistema de Selección IPSI
        </h1>
        <nav className="flex gap-2">
          <Link to="/" className={linkClass("/")}>Vacantes</Link>
          <Link to="/seguimiento" className={linkClass("/seguimiento")}>Seguimiento</Link>
          <Link to="/login" className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Ingreso RRHH
          </Link>
        </nav>
      </div>
    </header>
  );
}

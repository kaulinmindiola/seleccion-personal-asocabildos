import { useEffect, useState } from "react";
import API from "../../api/apiClient";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [resumen, setResumen] = useState(null);

  useEffect(() => {
    API.get("/dashboard/resumen")
      .then((r) => setResumen(r.data))
      .catch((e) => console.error(e));
  }, []);

  if (!resumen) return <div className="p-6">Cargando...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Panel Administrativo</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <Card title="Vacantes activas" value={resumen.vacantesActivas} />
        <Card title="Postulaciones" value={resumen.totalPostulaciones} />
        <Card title="Evaluaciones completadas" value={resumen.totalEvaluaciones} />
      </div>

      <div>
        <Link
          to="/admin/vacantes"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Gestionar Vacantes
        </Link>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="p-4 bg-white border rounded shadow">
      <p className="text-gray-600">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

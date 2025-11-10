import { useEffect, useState } from "react";
import API from "../api/apiClient";
import { Link } from "react-router-dom";

export default function Home() {
  const [vacantes, setVacantes] = useState([]);

  useEffect(() => {
    API.get("/vacantes")
      .then((r) => setVacantes(r.data))
      .catch((e) => console.error(e));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Vacantes disponibles</h1>
      <div className="grid gap-4">
        {vacantes.map((v) => (
          <div key={v.id} className="p-4 border rounded">
            <h3 className="font-semibold">{v.titulo}</h3>
            <p className="text-sm">{v.area} • {v.estado}</p>
            <Link to={`/vacante/${v.id}`} className="text-blue-600">Ver y postular</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

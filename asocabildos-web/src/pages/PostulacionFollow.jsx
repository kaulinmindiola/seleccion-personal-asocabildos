import { useEffect, useState } from "react";
import API from "../api/apiClient";
import useAuth from "../auth/useAuth";

export default function PostulacionFollow(){
  const { Usuario } = useAuth();
  const [posts, setPosts] = useState([]);

  useEffect(()=> {
    API.get("/postulaciones/seguimiento")
      .then(r => setPosts(r.data))
      .catch(err => {
        console.error(err);
        alert(err.response?.data?.msg || "Error al cargar seguimiento");
      });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Mis Postulaciones</h1>
      {posts.length === 0 && <p>No tienes postulaciones.</p>}
      <div className="space-y-4">
        {posts.map(p => (
          <div key={p.id} className="p-4 border rounded">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">{p.vacante?.titulo || "Vacante eliminada"}</h3>
                <p className="text-sm">Estado: {p.estado}</p>
                {p.comentarios && <p className="text-sm text-orange-600">Feedback: {p.comentarios}</p>}
              </div>
              <div className="text-sm text-gray-600">
                {new Date(p.fechaPostulacion).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

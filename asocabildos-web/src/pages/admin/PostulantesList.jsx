import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/apiClient";
import { toast } from "react-toastify";
import EvaluacionForm from "./EvaluacionForm";

export default function PostulantesList() {
  const { id } = useParams(); // vacanteId
  const [postulaciones, setPostulaciones] = useState([]);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState("");

const cargar = useCallback(() => {
  API.get(`/postulaciones/vacante/${id}`)
    .then((r) => setPostulaciones(r.data))
    .catch(console.error);
}, [id]);

useEffect(() => {
  cargar();
}, [cargar]);

  const enviarFeedback = async (pid) => {
    try {
      await API.post(`/postulaciones/${pid}/feedback`, { comentario: feedback });
      toast.success("Feedback enviado");
      setFeedback("");
      cargar();
    } catch (e) {
  console.error(e);
  toast.error("Error al enviar feedback");
}
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Postulantes Vacante #{id}</h1>
      <div className="space-y-4">
        {postulaciones.map((p) => (
          <div key={p.id} className="p-4 border rounded">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{p.usuario?.nombre}</p>
                <p className="text-sm">Estado: {p.estado}</p>
                {p.comentarios && (
                  <p className="text-sm text-orange-700">Feedback: {p.comentarios}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  className="text-blue-600"
                  onClick={() => setSelected(p)}
                >
                  Evaluar
                </button>
              </div>
            </div>

            <div className="mt-2 flex gap-2">
              <input
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Escribir comentario"
                className="border p-2 rounded w-full"
              />
              <button
                onClick={() => enviarFeedback(p.id)}
                className="bg-green-600 text-white px-3 rounded"
              >
                Enviar
              </button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <EvaluacionForm postulacion={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

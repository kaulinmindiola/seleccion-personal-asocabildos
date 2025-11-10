import { useState } from "react";
import API from "../../api/apiClient";
import { toast } from "react-toastify";

export default function EvaluacionForm({ postulacion, onClose }) {
  const [form, setForm] = useState({ puntaje: "", observaciones: "", estado: "EN_REVISION" });

  const guardar = async (e) => {
    e.preventDefault();
    try {
      await API.post("/evaluaciones", {
        postulacionId: postulacion.id,
        puntaje: Number(form.puntaje),
        observaciones: form.observaciones,
        estado: form.estado,
      });
      toast.success("Evaluación guardada");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error al guardar evaluación");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h3 className="text-lg font-semibold mb-3">Evaluar Postulante</h3>
        <form onSubmit={guardar} className="space-y-3">
          <input
            type="number"
            placeholder="Puntaje (0-100)"
            className="border p-2 rounded w-full"
            value={form.puntaje}
            onChange={(e) => setForm({ ...form, puntaje: e.target.value })}
            required
          />
          <textarea
            placeholder="Observaciones"
            className="border p-2 rounded w-full"
            value={form.observaciones}
            onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
          />
          <select
            value={form.estado}
            onChange={(e) => setForm({ ...form, estado: e.target.value })}
            className="border p-2 rounded w-full"
          >
            <option value="EN_REVISION">En revisión</option>
            <option value="APROBADO">Aprobado</option>
            <option value="RECHAZADO">Rechazado</option>
          </select>
          <div className="flex gap-2 justify-end">
            <button onClick={onClose} type="button" className="px-3 py-2 border rounded">
              Cancelar
            </button>
            <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

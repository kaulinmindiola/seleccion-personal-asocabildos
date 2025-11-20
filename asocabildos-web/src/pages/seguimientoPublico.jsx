import { useState } from "react";
import API from "../api/apiClient";
import NavbarPublic from "../components/NavbarPublic";

export default function SeguimientoPublico() {
  const [form, setForm] = useState({ numeroDocumento: "", fechaExpedicion: "" });
  const [result, setResult] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/postulaciones/seguimiento-publico", form);
      setResult(res.data);
    } catch (err) {
      alert(err.response?.data?.msg || "Error al consultar seguimiento");
    }
  };

  return (
    <>
      <NavbarPublic />
      <div className="pt-24 p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Seguimiento de tu postulación</h2>
        <form onSubmit={submit} className="space-y-3">
          <input
            value={form.numeroDocumento}
            onChange={(e) => setForm({ ...form, numeroDocumento: e.target.value })}
            placeholder="Número de documento"
            className="border p-2 rounded w-full"
            required
          />
          <input
            type="date"
            value={form.fechaExpedicion}
            onChange={(e) => setForm({ ...form, fechaExpedicion: e.target.value })}
            className="border p-2 rounded w-full"
            required
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Consultar</button>
        </form>

        {result && (
          <div className="mt-6">
            <h3 className="font-semibold">Postulaciones de {result.usuario.nombre}</h3>
            {result.postulaciones.length === 0 && <p>No hay postulaciones.</p>}
            {result.postulaciones.map((p) => (
              <div key={p.id} className="p-3 border rounded mb-2">
                <div className="flex justify-between">
                  <div>
                    <div className="font-semibold">{p.vacante?.titulo || "Vacante eliminada"}</div>
                    <div className="text-sm">Estado: {p.estado}</div>
                    {p.comentarios && (
                      <div className="text-sm text-orange-700">Feedback: {p.comentarios}</div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(p.fechaPostulacion).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

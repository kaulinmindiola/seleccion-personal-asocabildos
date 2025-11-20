import { useEffect, useState } from "react";
import API from "../../api/apiClient";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function VacantesList() {
  const [vacantes, setVacantes] = useState([]);
  const [form, setForm] = useState({ titulo: "", descripcion: "", requisitos: "", area: "" });
  const [editingId, setEditingId] = useState(null);

  const cargar = () => {
    API.get("/vacantes")
      .then((r) => setVacantes(r.data))
      .catch(console.error);
  };

  useEffect(() => {
    cargar();
  }, []);

  const guardarVacante = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // editar
        await API.put(`/vacantes/${editingId}`, form);
        toast.success("Vacante actualizada");
      } else {
        // crear
        await API.post("/vacantes", form);
        toast.success("Vacante creada");
      }
      setForm({ titulo: "", descripcion: "", requisitos: "", area: "" });
      setEditingId(null);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error al guardar vacante");
    }
  };

  const editarVacante = (v) => {
    setForm({
      titulo: v.titulo,
      descripcion: v.descripcion,
      requisitos: v.requisitos,
      area: v.area,
    });
    setEditingId(v.id);
  };

  const eliminarVacante = async (id) => {
    if (!confirm("¿Eliminar esta vacante?")) return;
    try {
      await API.delete(`/vacantes/${id}`);
      toast.success("Vacante eliminada");
      cargar();
    } catch (err) {
      toast.error("Error al eliminar vacante");
    }
  };

  const cerrarVacante = async (id) => {
    if (!confirm("¿Cerrar esta vacante?")) return;
    try {
      await API.patch(`/vacantes/${id}`, { estado: "CERRADA" });
      toast.info("Vacante cerrada");
      cargar();
    } catch (err) {
      toast.error("Error al cerrar vacante");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Gestión de Vacantes</h1>

      <form onSubmit={guardarVacante} className="grid md:grid-cols-2 gap-3 mb-6 bg-white p-4 rounded shadow">
        <input
          placeholder="Título"
          value={form.titulo}
          onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <input
          placeholder="Área"
          value={form.area}
          onChange={(e) => setForm({ ...form, area: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <textarea
          placeholder="Descripción"
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          className="border p-2 rounded md:col-span-2"
        />
        <textarea
          placeholder="Requisitos"
          value={form.requisitos}
          onChange={(e) => setForm({ ...form, requisitos: e.target.value })}
          className="border p-2 rounded md:col-span-2"
        />
        <button className="bg-blue-600 text-white py-2 rounded md:col-span-2">
          {editingId ? "Actualizar vacante" : "Crear vacante"}
        </button>
      </form>

      <h2 className="text-lg font-semibold mb-3">Listado</h2>
      <div className="space-y-2">
        {vacantes.map((v) => (
          <div key={v.id} className="p-4 border rounded flex justify-between items-center">
            <div>
              <p className="font-semibold">{v.titulo}</p>
              <p className="text-sm text-gray-600">{v.estado}</p>
              <p className="text-xs text-gray-500">{v.area}</p>
            </div>
            <div className="flex gap-2">
              <Link to={`/admin/vacantes/${v.id}/postulantes`} className="text-blue-600 underline">
                Ver postulantes
              </Link>
              <button
                onClick={() => editarVacante(v)}
                className="text-yellow-600 border border-yellow-600 px-2 py-1 rounded hover:bg-yellow-50"
              >
                Editar
              </button>
              <button
                onClick={() => eliminarVacante(v.id)}
                className="text-red-600 border border-red-600 px-2 py-1 rounded hover:bg-red-50"
              >
                Eliminar
              </button>
              {v.estado === "ABIERTA" && (
                <button
                  onClick={() => cerrarVacante(v.id)}
                  className="text-gray-700 border border-gray-400 px-2 py-1 rounded hover:bg-gray-100"
                >
                  Cerrar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

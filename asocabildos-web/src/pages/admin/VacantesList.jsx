import { useEffect, useState } from "react";
import API from "../../api/apiClient";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function VacantesList() {
  const [vacantes, setVacantes] = useState([]);
  const [form, setForm] = useState({ titulo: "", descripcion: "", requisitos: "", area: "" });

  const cargar = () => {
    API.get("/vacantes")
      .then((r) => setVacantes(r.data))
      .catch(console.error);
  };

  useEffect(() => {
    cargar();
  }, []);

  const crearVacante = async (e) => {
    e.preventDefault();
    try {
      await API.post("/vacantes", form);
      toast.success("Vacante creada");
      setForm({ titulo: "", descripcion: "", requisitos: "", area: "" });
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error al crear vacante");
    }
  };

  const cerrarVacante = async (id) => {
    if (!confirm("¿Cerrar esta vacante?")) return;
    await API.patch(`/vacantes/${id}`, { estado: "CERRADA" });
    toast.info("Vacante cerrada");
    cargar();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Gestión de Vacantes</h1>

      <form onSubmit={crearVacante} className="grid md:grid-cols-2 gap-3 mb-6">
        <input placeholder="Título" value={form.titulo} onChange={(e)=>setForm({...form,titulo:e.target.value})} className="border p-2 rounded" required/>
        <input placeholder="Área" value={form.area} onChange={(e)=>setForm({...form,area:e.target.value})} className="border p-2 rounded" required/>
        <textarea placeholder="Descripción" value={form.descripcion} onChange={(e)=>setForm({...form,descripcion:e.target.value})} className="border p-2 rounded md:col-span-2"/>
        <textarea placeholder="Requisitos" value={form.requisitos} onChange={(e)=>setForm({...form,requisitos:e.target.value})} className="border p-2 rounded md:col-span-2"/>
        <button className="bg-blue-600 text-white py-2 rounded md:col-span-2">Crear vacante</button>
      </form>

      <h2 className="text-lg font-semibold mb-3">Listado</h2>
      <div className="space-y-2">
        {vacantes.map((v) => (
          <div key={v.id} className="p-4 border rounded flex justify-between items-center">
            <div>
              <p className="font-semibold">{v.titulo}</p>
              <p className="text-sm text-gray-600">{v.estado}</p>
            </div>
            <div className="flex gap-2">
              <Link to={`/admin/vacantes/${v.id}/postulantes`} className="text-blue-600 underline">Ver postulantes</Link>
              {v.estado === "ABIERTA" && (
                <button className="text-red-600" onClick={() => cerrarVacante(v.id)}>Cerrar</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

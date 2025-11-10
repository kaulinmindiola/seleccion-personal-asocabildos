import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/apiClient";
import CredentialsModal from "../components/CredentialsModal";

export default function Vacante() {
  const { id } = useParams();
  const [vacante, setVacante] = useState(null);
  const [form, setForm] = useState({ numeroDocumento: "", nombre: "", correo: "", telefono: "" });
  const [file, setFile] = useState(null);
  const [modalCred, setModalCred] = useState(null);

  useEffect(() => {
    API.get(`/vacantes/${id}`).then(r => setVacante(r.data)).catch(console.error);
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("vacanteId", id);
      fd.append("numeroDocumento", form.numeroDocumento);
      fd.append("nombre", form.nombre);
      if (form.correo) fd.append("correo", form.correo);
      if (form.telefono) fd.append("telefono", form.telefono);
      if (file) fd.append("documento", file);

      const res = await API.post("/postulaciones", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // backend returns { postulacion, credentials }
      setModalCred(res.data.credentials);
      // optional: show toast
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Error al postular");
    }
  };

  if (!vacante) return <div className="p-6">Cargando...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{vacante.titulo}</h1>
      <p className="mb-4">{vacante.descripcion}</p>

      <h2 className="font-semibold mt-6 mb-2">Formulario de Postulación</h2>
      <form onSubmit={handleSubmit} className="max-w-md space-y-3">
        <input value={form.numeroDocumento} onChange={(e)=>setForm({...form, numeroDocumento:e.target.value})} placeholder="Número de documento" className="w-full border p-2 rounded" required/>
        <input value={form.nombre} onChange={(e)=>setForm({...form, nombre:e.target.value})} placeholder="Nombre completo" className="w-full border p-2 rounded" required/>
        <input value={form.correo} onChange={(e)=>setForm({...form, correo:e.target.value})} placeholder="Correo (opcional)" className="w-full border p-2 rounded"/>
        <input value={form.telefono} onChange={(e)=>setForm({...form, telefono:e.target.value})} placeholder="Teléfono (opcional)" className="w-full border p-2 rounded"/>
        <div>
          <label className="block mb-1">Adjuntar CV (PDF)</label>
          <input type="file" accept="application/pdf" onChange={(e)=>setFile(e.target.files[0])}/>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Postular</button>
      </form>

      <CredentialsModal open={!!modalCred} credentials={modalCred} onClose={()=>setModalCred(null)} />
    </div>
  );
}

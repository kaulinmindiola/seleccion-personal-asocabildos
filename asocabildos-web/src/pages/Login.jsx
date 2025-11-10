import { useState } from "react";
import useAuth from "../auth/useAuth";
import { useNavigate } from "react-router-dom";

export default function Login(){
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(identifier, password);
      nav("/");
    } catch (err) {
      alert(err.response?.data?.msg || "Error al iniciar sesión");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Iniciar sesión</h2>
      <form onSubmit={submit} className="space-y-3">
        <input value={identifier} onChange={(e)=>setIdentifier(e.target.value)} placeholder="Correo o número de documento" className="w-full border p-2 rounded" required/>
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Contraseña" className="w-full border p-2 rounded" required/>
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Entrar</button>
      </form>
    </div>
  );
}

import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider";
import NavbarPublic from "../components/NavbarPublic";

export default function Login() {
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    const res = await login(numeroDocumento, password);
    if (res.ok) {
      // redirige según rol (opcional)
      nav("/");
    } else {
      alert(res.msg);
    }
  };

  return (
    <>
      <NavbarPublic />
      <div className="pt-24 p-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Iniciar sesión</h2>
        <form onSubmit={submit} className="space-y-3">
          <input
            value={numeroDocumento}
            onChange={(e) => setNumeroDocumento(e.target.value)}
            placeholder="Número de documento"
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full border p-2 rounded"
            required
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded">
            Entrar
          </button>
        </form>
      </div>
    </>
  );
}

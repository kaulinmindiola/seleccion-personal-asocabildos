import React from "react";

export default function CredentialsModal({ open, onClose, credentials }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded max-w-md w-full">
        <h3 className="text-xl font-bold mb-2">Credenciales generadas</h3>
        <p className="mb-4">Anota estas credenciales. Se mostrarán solo ahora.</p>
        <div className="mb-2">
          <strong>Usuario:</strong> <span>{credentials.username}</span>
        </div>
        <div className="mb-4">
          <strong>Contraseña:</strong> <span>{credentials.password}</span>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={() => navigator.clipboard.writeText(`${credentials.username}:${credentials.password}`)}>Copiar</button>
          <button className="px-4 py-2 border rounded" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

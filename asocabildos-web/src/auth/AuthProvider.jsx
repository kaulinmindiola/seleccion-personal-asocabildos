import React, { createContext, useState } from "react";
import { loginRequest } from "../api/auth";
import API from "../api/apiClient";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (numeroDocumento, password) => {
    try {
      const res = await loginRequest({ numeroDocumento, password });
      console.log("RES DEL LOGIN:", res);

      const { token, user: userData } = res;

      // guardar token en localStorage y en header axios
      localStorage.setItem("token", token);
      console.log("TOKEN GUARDADO:", localStorage.getItem("token"));

      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      

      setUser(userData);
      return { ok: true };
    } catch (err) {
      console.error("Login frontend error:", err.response?.data || err.message);
      return { ok: false, msg: err.response?.data?.msg || "Error al iniciar sesión" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete API.defaults.headers.common["Authorization"];
    setUser(null);
    window.location.href = "/";
  };

  // si ya hay token en localStorage, set header y pedir perfil (opcional)
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      API.get("/auth/me")
        .then(r => setUser(r.data))
        .catch(() => {
          localStorage.removeItem("token");
          delete API.defaults.headers.common["Authorization"];
        });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

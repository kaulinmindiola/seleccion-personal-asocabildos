import React, { createContext, useState, useEffect } from "react";
import API from "../api/apiClient";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const handler = () => logout();
    window.addEventListener("asocabildos:logout", handler);
    return () => window.removeEventListener("asocabildos:logout", handler);
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      // cargar perfil
      API.get("/auth/me")
        .then((r) => setUser(r.data))
        .catch(() => logout());
    } else {
      localStorage.removeItem("token");
      setUser(null);
    }
  }, [token]);

  const login = async (identifier, password) => {
    const res = await API.post("/auth/login", { identifier, password });
    setToken(res.data.token);
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

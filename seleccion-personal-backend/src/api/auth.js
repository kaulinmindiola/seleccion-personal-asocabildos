// src/api/auth.js
import API from "./apiClient";

export const loginRequest = ({ numeroDocumento, password }) => {
  return API.post("/auth/login", { numeroDocumento, password });
};

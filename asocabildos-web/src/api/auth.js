import apiClient from "./apiClient";

export const loginRequest = async (data) => {
  const res = await apiClient.post("/auth/login", data);
  return res.data;
};

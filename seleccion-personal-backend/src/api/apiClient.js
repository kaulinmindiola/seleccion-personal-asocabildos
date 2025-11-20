// src/api/apiClient.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000/api",
  timeout: 10000,
});

export default API;

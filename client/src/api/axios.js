import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// Attach token from localStorage (NOT Redux)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");  // ✅ FIX

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
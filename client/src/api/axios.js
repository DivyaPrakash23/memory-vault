import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
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
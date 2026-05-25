import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

// 🔥 هادي كتضيف token ف كل request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  console.log("TOKEN:", token); // Debug: Check if token is retrieved

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
// api.js
import axios from "axios";
import { logout } from "../utils/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL + "/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 403 &&
      error.response?.data?.code === "USER_BLOCKED"
    ) {
      logout();
      window.location.href = "/login?blocked=true";
    }

    return Promise.reject(error);
  }
);

export default api;

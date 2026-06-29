import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001",
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const tinhaToken = !!localStorage.getItem("token");

    if (error.response?.status === 401 && tinhaToken) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");

      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;

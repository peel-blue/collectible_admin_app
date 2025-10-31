import axios from "axios";

const URL = "http://localhost:3000/api";

const api = axios.create({
    baseURL: URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Optional: attach token automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;

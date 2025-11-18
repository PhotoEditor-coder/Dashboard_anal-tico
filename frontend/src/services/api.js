// frontend/src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost/dashboard_analitico/backend/api",
});

export const fetchStats = async () => {
  const response = await api.get("/stats.php?range=last_90_days");
  return response.data;
};

export default api;

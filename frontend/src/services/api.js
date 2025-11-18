import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL ||
    "http://localhost/dashboard_analitico/backend/api",
});

export const fetchStats = async (period = "month") => {
  const response = await api.get("/stats.php", { params: { period } });
  if (!response.data.success) {
    throw new Error(response.data.error || "Error en la API");
  }
  // devolvemos solo la parte útil para el Dashboard
  return response.data.data; // { kpis, charts, meta }
};

export default api;

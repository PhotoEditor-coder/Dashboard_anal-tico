// frontend/src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL ||
    "http://localhost/dashboard_analitico/backend/api",
});

export const fetchStats = async () => {
  const response = await api.get("/stats.php");
  // response.data = { success, data, error }
  if (!response.data.success) {
    throw new Error(response.data.error || "Error en la API");
  }
  return response.data.data; // <- aquí devolvemos directamente {kpis, charts, meta}
};

export default api;

// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL ||
    'http://localhost/dashboard_analitico/backend/api',
});

// ─── Interceptor global de errores ───────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg =
      error?.response?.data?.error ||
      error?.message ||
      'Error desconocido en la API';
    return Promise.reject(new Error(msg));
  }
);

// ─── Helper: extrae data.data de la respuesta estándar ───────────────────────
const extractData = (response) => {
  // El backend devuelve { success, data, error }
  if (response.data?.success === false) {
    throw new Error(response.data.error || 'Error en la API');
  }
  return response.data?.data ?? response.data;
};

// ─── Stats (Dashboard principal) ─────────────────────────────────────────────
// Devuelve: { kpis, charts, meta }
export const fetchStats = async (period = 'month') => {
  const response = await api.get('/stats.php', { params: { period } });
  return extractData(response);
};

// ─── Ventas ───────────────────────────────────────────────────────────────────
// Devuelve: { sales, statistics, monthly_data, pagination }
export const fetchSales = async ({ period, startDate, endDate, limit = 100 } = {}) => {
  const params = { limit };
  if (period)    params.period     = period;
  if (startDate) params.start_date = startDate;
  if (endDate)   params.end_date   = endDate;
  const response = await api.get('/sales.php', { params });
  return extractData(response);
};

// ─── Usuarios ─────────────────────────────────────────────────────────────────
// Devuelve: { users, statistics, pagination }
export const fetchUsers = async ({ active, role, limit = 50 } = {}) => {
  const params = { limit };
  if (active !== undefined) params.active = active ? 'true' : 'false';
  if (role)  params.role = role;
  const response = await api.get('/users.php', { params });
  return extractData(response);
};

// ─── Logs ─────────────────────────────────────────────────────────────────────
export const fetchLogs = async ({ limit = 100, type } = {}) => {
  const params = { limit };
  if (type) params.type = type;
  const response = await api.get('/logs.php', { params });
  return extractData(response);
};

export default api;

// ...existing code...
import axios from 'axios';

// Configuración base de axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost/Dashboard_analítico/backend/api';
// Si renombraste la carpeta a 'dashboard_analitico' usa:
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost/dashboard_analitico/backend/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Servicio de Usuarios
 */
export const usersService = {
  getUsers: (params = {}) => api.get('/users.php', { params }),
  getActiveUsers: () => api.get('/users.php', { params: { active: 'true' } }),
  getUsersByRole: (role) => api.get('/users.php', { params: { role } }),
};

/**
 * Servicio de Ventas
 */
export const salesService = {
  getSales: (params = {}) => api.get('/sales.php', { params }),
  getSalesByPeriod: (period) => api.get('/sales.php', { params: { period } }),
  getSalesByCategory: (category) => api.get('/sales.php', { params: { category } }),
  getSalesByDateRange: (startDate, endDate) =>
    api.get('/sales.php', { params: { start_date: startDate, end_date: endDate } }),
};

/**
 * Servicio de Logs
 */
export const logsService = {
  getLogs: (params = {}) => api.get('/logs.php', { params }),
  getLogsByAction: (action) => api.get('/logs.php', { params: { action } }),
  getLogsByUser: (userId) => api.get('/logs.php', { params: { user_id: userId } }),
};

/**
 * Servicio de Estadísticas
 */
export const statsService = {
  getStats: (filter = 'all', startDate = null, endDate = null) => {
    const params = { filter };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return api.get('/stats.php', { params });
  },
  getMonthlyStats: () => api.get('/stats.php', { params: { filter: 'month' } }),
  getWeeklyStats: () => api.get('/stats.php', { params: { filter: 'week' } }),
  getDailyStats: () => api.get('/stats.php', { params: { filter: 'today' } }),
};

export default api;
// ...existing code...
// src/services/api.js
import axios from 'axios';

// 1) Usa env o fallback SIN acentos
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  'http://localhost/dashboard_analitico/backend/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  // Si usas sesión PHP
  // withCredentials: true,
});

// Interceptor de respuesta (log claro de 500/CORS/Network)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response) {
      // El servidor respondió (p.ej. 500/404)
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      // No hubo respuesta (CORS, servidor caído, URL mal)
      console.error('API Error: no response from server', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      });
    } else {
      console.error('API Error: setup', error.message);
    }
    return Promise.reject(error);
  }
);

/** Servicios */
export const usersService = {
  getUsers: (params = {}) => api.get('/users.php', { params }),
  getActiveUsers: () => api.get('/users.php', { params: { active: 'true' } }),
  getUsersByRole: (role) => api.get('/users.php', { params: { role } }),
};

export const salesService = {
  getSales: (params = {}) => api.get('/sales.php', { params }),
  getSalesByPeriod: (period) => api.get('/sales.php', { params: { period } }),
  getSalesByCategory: (category) =>
    api.get('/sales.php', { params: { category } }),
  getSalesByDateRange: (startDate, endDate) =>
    api.get('/sales.php', { params: { start_date: startDate, end_date: endDate } }),
};

export const logsService = {
  getLogs: (params = {}) => api.get('/logs.php', { params }),
  getLogsByAction: (action) => api.get('/logs.php', { params: { action } }),
  getLogsByUser: (userId) => api.get('/logs.php', { params: { user_id: userId } }),
};

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

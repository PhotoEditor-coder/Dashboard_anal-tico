// Configuración base de axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost/dashboard_analitico/backend/api';ción base de axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost/dashboard_analitico/backend/api';

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
  // Obtener todos los usuarios
  getUsers: (params = {}) => {
    return api.get('/users.php', { params });
  },
  
  // Obtener usuarios activos
  getActiveUsers: () => {
    return api.get('/users.php', { params: { active: 'true' } });
  },
  
  // Obtener usuarios por rol
  getUsersByRole: (role) => {
    return api.get('/users.php', { params: { role } });
  }
};

/**
 * Servicio de Ventas
 */
export const salesService = {
  // Obtener todas las ventas
  getSales: (params = {}) => {
    return api.get('/sales.php', { params });
  },
  
  // Obtener ventas por período
  getSalesByPeriod: (period) => {
    return api.get('/sales.php', { params: { period } });
  },
  
  // Obtener ventas por categoría
  getSalesByCategory: (category) => {
    return api.get('/sales.php', { params: { category } });
  },
  
  // Obtener ventas por rango de fechas
  getSalesByDateRange: (startDate, endDate) => {
    return api.get('/sales.php', { 
      params: { 
        start_date: startDate, 
        end_date: endDate 
      } 
    });
  }
};

/**
 * Servicio de Logs
 */
export const logsService = {
  // Obtener todos los logs
  getLogs: (params = {}) => {
    return api.get('/logs.php', { params });
  },
  
  // Obtener logs por acción
  getLogsByAction: (action) => {
    return api.get('/logs.php', { params: { action } });
  },
  
  // Obtener logs por usuario
  getLogsByUser: (userId) => {
    return api.get('/logs.php', { params: { user_id: userId } });
  }
};

/**
 * Servicio de Estadísticas
 */
export const statsService = {
  // Obtener estadísticas generales
  getStats: (filter = 'all', startDate = null, endDate = null) => {
    const params = { filter };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    return api.get('/stats.php', { params });
  },
  
  // Obtener estadísticas mensuales
  getMonthlyStats: () => {
    return api.get('/stats.php', { params: { filter: 'month' } });
  },
  
  // Obtener estadísticas semanales
  getWeeklyStats: () => {
    return api.get('/stats.php', { params: { filter: 'week' } });
  },
  
  // Obtener estadísticas diarias
  getDailyStats: () => {
    return api.get('/stats.php', { params: { filter: 'today' } });
  }
};

export default api;

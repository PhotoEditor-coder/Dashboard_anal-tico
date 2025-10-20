# 📊 Dashboard Analítico - Portfolio Project

Un dashboard completo que demuestra habilidades en backend, frontend y análisis de datos.

## 🛠️ Stack Tecnológico

### Backend
- **PHP 8+** - API REST
- **MySQL** - Base de datos
- **PDO** - Conexión a BD

### Frontend  
- **React 18** - Framework frontend
- **Chart.js** - Gráficos interactivos
- **Axios** - Cliente HTTP
- **CSS3** - Estilos modernos

## 📁 Estructura del Proyecto

```
Dashboard_analítico/
├── backend/
│   ├── api/
│   │   ├── users.php
│   │   ├── sales.php
│   │   ├── logs.php
│   │   └── stats.php
│   ├── config/
│   │   └── database.php
│   └── data/
│       └── sample_data.sql
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── public/
│   └── package.json
└── README.md
```

## 🚀 Instalación Rápida

### 1. Backend (PHP + MySQL)
```bash
# 1. Instalar XAMPP desde https://www.apachefriends.org/
# 2. Iniciar Apache y MySQL en XAMPP Control Panel
# 3. Crear base de datos 'dashboard_db' en phpMyAdmin
# 4. Importar backend/data/sample_data.sql
# 5. Copiar carpeta backend a C:\xampp\htdocs\dashboard_analitico\
```

### 2. Frontend (React)
```bash
cd frontend
npm install
npm start
# Dashboard disponible en http://localhost:3000
```

📖 **Guía completa**: Ver [INSTALACION.md](INSTALACION.md) para instrucciones detalladas

## 📈 Features

- ✅ Dashboard con métricas en tiempo real
- ✅ Gráficos interactivos (Chart.js)
- ✅ Filtros por fecha y categoría
- ✅ API REST completa
- ✅ Diseño responsive
- ✅ Datos de ejemplo incluidos

## 🎯 Endpoints API

- `GET /api/users` - Lista de usuarios
- `GET /api/sales` - Datos de ventas
- `GET /api/logs` - Logs del sistema
- `GET /api/stats?filter=monthly` - Estadísticas con filtros

## 💼 Valor para Portfolio

Este proyecto demuestra:
- Integración backend-frontend
- Análisis de datos y visualización
- APIs REST bien estructuradas
- UI/UX moderna
- Código limpio y documentado

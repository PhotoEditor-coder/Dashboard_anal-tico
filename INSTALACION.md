# 🚀 Guía de Instalación - Dashboard Analítico

## 📋 Requisitos Previos

### Backend (PHP + MySQL)
- **XAMPP** o **WAMP** (recomendado para Windows)
- **PHP 8.0+**
- **MySQL 8.0+**
- **Apache** (incluido en XAMPP/WAMP)

### Frontend (React)
- **Node.js 16+**
- **npm** o **yarn**

## 🛠️ Instalación Paso a Paso

### 1. Configurar Backend

#### 1.1 Instalar XAMPP
1. Descarga XAMPP desde: https://www.apachefriends.org/
2. Instala XAMPP en `C:\xampp\`
3. Inicia XAMPP Control Panel
4. Inicia **Apache** y **MySQL**

#### 1.2 Configurar Base de Datos
1. Abre http://localhost/phpmyadmin
2. Crea una nueva base de datos llamada `dashboard_db`
3. Importa el archivo `backend/data/sample_data.sql`

```sql
-- Ejecutar en phpMyAdmin
CREATE DATABASE dashboard_db;
USE dashboard_db;
-- Luego importar el archivo sample_data.sql
```

#### 1.3 Configurar API
1. Copia la carpeta `backend` a `C:\xampp\htdocs\dashboard_analitico\`
2. Verifica que la estructura sea:
```
C:\xampp\htdocs\dashboard_analitico\
├── api/
│   ├── users.php
│   ├── sales.php
│   ├── logs.php
│   └── stats.php
├── config/
│   └── database.php
└── data/
    └── sample_data.sql
```

#### 1.4 Probar API
Visita: http://localhost/dashboard_analitico/backend/api/stats.php

Deberías ver una respuesta JSON con estadísticas.

### 2. Configurar Frontend

#### 2.1 Instalar Node.js
1. Descarga Node.js desde: https://nodejs.org/
2. Instala la versión LTS (recomendada)

#### 2.2 Instalar Dependencias
```bash
# Navegar a la carpeta frontend
cd frontend

# Instalar dependencias
npm install

# O si prefieres yarn
yarn install
```

#### 2.3 Configurar Variables de Entorno
Crea un archivo `.env` en la carpeta `frontend`:

```env
REACT_APP_API_URL=http://localhost/dashboard_analitico/backend/api
```

#### 2.4 Iniciar Frontend
```bash
npm start
```

El dashboard se abrirá en: http://localhost:3000

## 🔧 Configuración Avanzada

### Configurar Puerto Personalizado
Si quieres cambiar el puerto del frontend:

```bash
# En package.json, modifica el script start:
"start": "PORT=3001 react-scripts start"
```

### Configurar Base de Datos Personalizada
En `backend/config/database.php`, modifica:

```php
private $host = 'localhost';
private $db_name = 'tu_base_de_datos';
private $username = 'tu_usuario';
private $password = 'tu_contraseña';
```

## 🐛 Solución de Problemas

### Error: "No se puede conectar a la base de datos"
1. Verifica que MySQL esté ejecutándose en XAMPP
2. Revisa las credenciales en `database.php`
3. Asegúrate de que la base de datos `dashboard_db` existe

### Error: "CORS policy"
1. Verifica que el backend esté ejecutándose en el puerto correcto
2. Revisa la configuración de CORS en los archivos PHP

### Error: "Module not found"
1. Ejecuta `npm install` en la carpeta frontend
2. Verifica que todas las dependencias estén instaladas

### El dashboard no carga datos
1. Verifica que la API esté funcionando: http://localhost/dashboard_analitico/backend/api/stats.php
2. Revisa la consola del navegador para errores
3. Verifica la configuración de `REACT_APP_API_URL`

## 📊 Verificar Instalación

### 1. Backend Funcionando
- ✅ XAMPP Apache y MySQL ejecutándose
- ✅ Base de datos `dashboard_db` creada
- ✅ Datos de ejemplo importados
- ✅ API respondiendo en http://localhost/dashboard_analitico/backend/api/stats.php

### 2. Frontend Funcionando
- ✅ React iniciado en http://localhost:3000
- ✅ Dashboard cargando sin errores
- ✅ Gráficos mostrando datos
- ✅ Filtros funcionando

## 🚀 Estructura Final del Proyecto

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
│   │   ├── services/
│   │   └── App.js
│   ├── public/
│   └── package.json
├── README.md
└── INSTALACION.md
```

## 🎯 Próximos Pasos

1. **Personalizar datos**: Modifica `sample_data.sql` con tus propios datos
2. **Agregar más gráficos**: Crea nuevos componentes de Chart.js
3. **Implementar autenticación**: Añade login/logout
4. **Exportar datos**: Implementa funcionalidad de exportación
5. **Deploy**: Sube a un servidor web para producción

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de Apache y MySQL en XAMPP
2. Verifica la consola del navegador
3. Asegúrate de que todos los puertos estén libres
4. Revisa que las rutas de archivos sean correctas

¡Tu dashboard analítico está listo para impresionar en tu portfolio! 🎉

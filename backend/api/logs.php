<?php
/**
 * API Endpoint: Logs del Sistema
 * GET /api/logs - Lista todos los logs
 * GET /api/logs?action=login - Filtrar por acción
 * GET /api/logs?user_id=1 - Filtrar por usuario
 */

require_once '../config/database.php';

// CORS headers mejorados
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8080',
    'http://127.0.0.1:8080'
];

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: http://localhost:3000');
}

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    handleError('Método no permitido', 405);
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        handleError('Error de conexión a la base de datos', 500);
    }
    
    // Parámetros de consulta
    $action = isset($_GET['action']) ? $_GET['action'] : null;
    $user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;
    $start_date = isset($_GET['start_date']) ? $_GET['start_date'] : null;
    $end_date = isset($_GET['end_date']) ? $_GET['end_date'] : null;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
    
    // Construir consulta
    $sql = "SELECT 
                l.id,
                l.action,
                l.description,
                l.ip_address,
                l.created_at,
                u.name as user_name,
                u.email as user_email
            FROM system_logs l
            LEFT JOIN users u ON l.user_id = u.id";
    
    $conditions = [];
    $params = [];
    
    if ($action) {
        $conditions[] = "l.action = :action";
        $params[':action'] = $action;
    }
    
    if ($user_id) {
        $conditions[] = "l.user_id = :user_id";
        $params[':user_id'] = $user_id;
    }
    
    if ($start_date) {
        $conditions[] = "l.created_at >= :start_date";
        $params[':start_date'] = $start_date;
    }
    
    if ($end_date) {
        $conditions[] = "l.created_at <= :end_date";
        $params[':end_date'] = $end_date . ' 23:59:59';
    }
    
    if (!empty($conditions)) {
        $sql .= " WHERE " . implode(' AND ', $conditions);
    }
    
    $sql .= " ORDER BY l.created_at DESC LIMIT :limit";
    $params[':limit'] = $limit;
    
    $stmt = $db->prepare($sql);
    
    foreach ($params as $key => $value) {
        if ($key === ':limit') {
            $stmt->bindValue($key, $value, PDO::PARAM_INT);
        } else {
            $stmt->bindValue($key, $value);
        }
    }
    
    $stmt->execute();
    $logs = $stmt->fetchAll();
    
    // Estadísticas de logs
    $stats_sql = "SELECT 
                    COUNT(*) as total_logs,
                    COUNT(CASE WHEN action = 'login' THEN 1 END) as login_count,
                    COUNT(CASE WHEN action = 'logout' THEN 1 END) as logout_count,
                    COUNT(CASE WHEN action = 'purchase' THEN 1 END) as purchase_count,
                    COUNT(CASE WHEN action = 'admin_action' THEN 1 END) as admin_actions,
                    COUNT(DISTINCT user_id) as unique_users
                  FROM system_logs";
    
    if (!empty($conditions)) {
        $stats_sql .= " WHERE " . implode(' AND ', $conditions);
    }
    
    $stats_stmt = $db->prepare($stats_sql);
    foreach ($params as $key => $value) {
        if ($key !== ':limit') {
            $stats_stmt->bindValue($key, $value);
        }
    }
    $stats_stmt->execute();
    $stats = $stats_stmt->fetch();
    
    // Actividad por día (últimos 7 días)
    $daily_sql = "SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as log_count,
                    COUNT(CASE WHEN action = 'login' THEN 1 END) as logins
                  FROM system_logs";
    
    if (!empty($conditions)) {
        $daily_sql .= " WHERE " . implode(' AND ', $conditions);
    }
    
    $daily_sql .= " AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                    GROUP BY DATE(created_at) 
                    ORDER BY date DESC";
    
    $daily_stmt = $db->prepare($daily_sql);
    foreach ($params as $key => $value) {
        if ($key !== ':limit') {
            $daily_stmt->bindValue($key, $value);
        }
    }
    $daily_stmt->execute();
    $daily_data = $daily_stmt->fetchAll();
    
    $response = [
        'logs' => $logs,
        'pagination' => [
            'limit' => $limit,
            'total' => count($logs)
        ],
        'statistics' => $stats,
        'daily_activity' => $daily_data
    ];
    
    sendResponse($response);
    
} catch (Exception $e) {
    handleError('Error interno del servidor: ' . $e->getMessage(), 500);
}
?>

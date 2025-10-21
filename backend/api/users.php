<?php
/**
 * API Endpoint: Usuarios
 * GET /api/users - Lista todos los usuarios
 * GET /api/users?active=true - Solo usuarios activos
 * GET /api/users?role=admin - Filtrar por rol
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
    $active = isset($_GET['active']) ? $_GET['active'] : null;
    $role = isset($_GET['role']) ? $_GET['role'] : null;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    
    // Construir consulta SQL
    $sql = "SELECT 
                id, 
                name, 
                email, 
                role, 
                created_at, 
                last_login, 
                is_active,
                CASE 
                    WHEN last_login > DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 'recent'
                    WHEN last_login > DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 'active'
                    ELSE 'inactive'
                END as activity_status
            FROM users";
    
    $conditions = [];
    $params = [];
    
    if ($active !== null) {
        $conditions[] = "is_active = :active";
        $params[':active'] = $active === 'true' ? 1 : 0;
    }
    
    if ($role) {
        $conditions[] = "role = :role";
        $params[':role'] = $role;
    }
    
    if (!empty($conditions)) {
        $sql .= " WHERE " . implode(' AND ', $conditions);
    }
    
    $sql .= " ORDER BY created_at DESC LIMIT :limit";
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
    $users = $stmt->fetchAll();
    
    // Estadísticas adicionales
    $stats_sql = "SELECT 
                    COUNT(*) as total_users,
                    COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_users,
                    COUNT(CASE WHEN last_login > DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as recent_users,
                    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users
                  FROM users";
    
    $stats_stmt = $db->prepare($stats_sql);
    $stats_stmt->execute();
    $stats = $stats_stmt->fetch();
    
    $response = [
        'users' => $users,
        'pagination' => [
            'limit' => $limit,
            'total' => count($users)
        ],
        'statistics' => $stats
    ];
    
    sendResponse($response);
    
} catch (Exception $e) {
    handleError('Error interno del servidor: ' . $e->getMessage(), 500);
}
?>

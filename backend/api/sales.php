<?php
/**
 * API Endpoint: Ventas
 * GET /api/sales - Lista todas las ventas
 * GET /api/sales?period=monthly - Ventas por período
 * GET /api/sales?category=subscription - Filtrar por categoría
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
    $period = isset($_GET['period']) ? $_GET['period'] : null;
    $category = isset($_GET['category']) ? $_GET['category'] : null;
    $start_date = isset($_GET['start_date']) ? $_GET['start_date'] : null;
    $end_date = isset($_GET['end_date']) ? $_GET['end_date'] : null;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
    
    // Construir consulta base
    $sql = "SELECT 
                s.id,
                s.product_name,
                s.amount,
                s.quantity,
                s.category,
                s.sale_date,
                u.name as user_name,
                u.email as user_email,
                (s.amount * s.quantity) as total_amount
            FROM sales s
            LEFT JOIN users u ON s.user_id = u.id";
    
    $conditions = [];
    $params = [];
    
    // Filtro por categoría
    if ($category) {
        $conditions[] = "s.category = :category";
        $params[':category'] = $category;
    }
    
    // Filtro por fechas
    if ($start_date) {
        $conditions[] = "s.sale_date >= :start_date";
        $params[':start_date'] = $start_date;
    }
    
    if ($end_date) {
        $conditions[] = "s.sale_date <= :end_date";
        $params[':end_date'] = $end_date . ' 23:59:59';
    }
    
    // Filtro por período
    if ($period) {
        switch ($period) {
            case 'today':
                $conditions[] = "DATE(s.sale_date) = CURDATE()";
                break;
            case 'week':
                $conditions[] = "s.sale_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
                break;
            case 'month':
                $conditions[] = "s.sale_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
                break;
            case 'year':
                $conditions[] = "s.sale_date >= DATE_SUB(NOW(), INTERVAL 365 DAY)";
                break;
        }
    }
    
    if (!empty($conditions)) {
        $sql .= " WHERE " . implode(' AND ', $conditions);
    }
    
    $sql .= " ORDER BY s.sale_date DESC LIMIT :limit";
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
    $sales = $stmt->fetchAll();
    
    // Estadísticas de ventas
    $stats_sql = "SELECT 
                    COUNT(*) as total_sales,
                    SUM(amount * quantity) as total_revenue,
                    AVG(amount) as average_sale,
                    COUNT(DISTINCT user_id) as unique_customers,
                    COUNT(CASE WHEN category = 'subscription' THEN 1 END) as subscription_sales,
                    COUNT(CASE WHEN category = 'addon' THEN 1 END) as addon_sales
                  FROM sales";
    
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
    
    // Ventas por mes (para gráficos)
    $monthly_sql = "SELECT 
                      DATE_FORMAT(sale_date, '%Y-%m') as month,
                      COUNT(*) as sales_count,
                      SUM(amount * quantity) as revenue
                    FROM sales";
    
    if (!empty($conditions)) {
        $monthly_sql .= " WHERE " . implode(' AND ', $conditions);
    }
    
    $monthly_sql .= " GROUP BY DATE_FORMAT(sale_date, '%Y-%m') 
                      ORDER BY month DESC LIMIT 12";
    
    $monthly_stmt = $db->prepare($monthly_sql);
    foreach ($params as $key => $value) {
        if ($key !== ':limit') {
            $monthly_stmt->bindValue($key, $value);
        }
    }
    $monthly_stmt->execute();
    $monthly_data = $monthly_stmt->fetchAll();
    
    $response = [
        'sales' => $sales,
        'pagination' => [
            'limit' => $limit,
            'total' => count($sales)
        ],
        'statistics' => $stats,
        'monthly_data' => $monthly_data
    ];
    
    sendResponse($response);
    
} catch (Exception $e) {
    handleError('Error interno del servidor: ' . $e->getMessage(), 500);
}
?>

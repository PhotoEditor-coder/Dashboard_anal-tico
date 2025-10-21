<?php
/**
 * API Endpoint: Estadísticas Generales
 * GET /api/stats - Estadísticas generales del dashboard
 * GET /api/stats?filter=monthly - Estadísticas mensuales
 * GET /api/stats?filter=weekly - Estadísticas semanales
 */
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

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
    
    $filter = isset($_GET['filter']) ? $_GET['filter'] : 'all';
    $start_date = isset($_GET['start_date']) ? $_GET['start_date'] : null;
    $end_date = isset($_GET['end_date']) ? $_GET['end_date'] : null;
    
    // Determinar rango de fechas según filtro
    $date_condition = "";
    $params = [];
    
    switch ($filter) {
        case 'today':
            $date_condition = "AND DATE(created_at) = CURDATE()";
            break;
        case 'week':
            $date_condition = "AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
            break;
        case 'month':
            $date_condition = "AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
            break;
        case 'year':
            $date_condition = "AND created_at >= DATE_SUB(NOW(), INTERVAL 365 DAY)";
            break;
        case 'custom':
            if ($start_date && $end_date) {
                $date_condition = "AND created_at BETWEEN :start_date AND :end_date";
                $params[':start_date'] = $start_date;
                $params[':end_date'] = $end_date . ' 23:59:59';
            }
            break;
    }
    
    // Estadísticas generales
    $general_stats = [];
    
    // Usuarios
    $users_sql = "SELECT 
                    COUNT(*) as total_users
                  FROM users";
    
    $users_stmt = $db->prepare($users_sql);
    $users_stmt->execute();
    $general_stats['users'] = $users_stmt->fetch();
    
    // Órdenes
    $orders_sql = "SELECT 
                    COUNT(*) as total_orders,
                    SUM(o.total_amount) as total_revenue,
                    AVG(o.total_amount) as average_order
                  FROM orders o
                  WHERE 1=1 " . $date_condition;
    
    $orders_stmt = $db->prepare($orders_sql);
    foreach ($params as $key => $value) {
        $orders_stmt->bindValue($key, $value);
    }
    $orders_stmt->execute();
    $general_stats['orders'] = $orders_stmt->fetch();
    
    // Productos
    $products_sql = "SELECT 
                      COUNT(*) as total_products,
                      COUNT(DISTINCT category) as total_categories
                    FROM products";
    
    $products_stmt = $db->prepare($products_sql);
    $products_stmt->execute();
    $general_stats['products'] = $products_stmt->fetch();
    
    // Eventos
    $events_sql = "SELECT 
                    COUNT(*) as total_events,
                    COUNT(DISTINCT event_type) as event_types
                  FROM event_logs
                  WHERE 1=1 " . $date_condition;
    
    $events_stmt = $db->prepare($events_sql);
    foreach ($params as $key => $value) {
        $events_stmt->bindValue($key, $value);
    }
    $events_stmt->execute();
    $general_stats['activity'] = $events_stmt->fetch();
    
    // Datos para gráficos
    $charts_data = [];
    
    // Ventas por mes
    $monthly_orders_sql = "SELECT 
                            DATE_FORMAT(created_at, '%Y-%m') as month,
                            COUNT(*) as order_count,
                            SUM(total_amount) as revenue
                          FROM orders
                          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                          GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                          ORDER BY month";
    
    $monthly_orders_stmt = $db->prepare($monthly_orders_sql);
    $monthly_orders_stmt->execute();
    $charts_data['monthly_orders'] = $monthly_orders_stmt->fetchAll();
    
    // Productos más vendidos
    $top_products_sql = "SELECT 
                          p.name,
                          SUM(oi.quantity) as units_sold,
                          SUM(oi.quantity * oi.price) as revenue
                        FROM order_items oi
                        JOIN products p ON p.id = oi.product_id
                        GROUP BY p.id, p.name
                        ORDER BY units_sold DESC
                        LIMIT 10";
    
    $top_products_stmt = $db->prepare($top_products_sql);
    $top_products_stmt->execute();
    $charts_data['top_products'] = $top_products_stmt->fetchAll();
    
    $response = [
        'filter' => $filter,
        'date_range' => [
            'start_date' => $start_date,
            'end_date' => $end_date
        ],
        'statistics' => $general_stats,
        'charts_data' => $charts_data,
        'generated_at' => date('Y-m-d H:i:s')
    ];
    
    sendResponse($response);
    
} catch (Exception $e) {
    handleError('Error interno del servidor: ' . $e->getMessage(), 500);
}

// Si la columna debería ser diferente, ajusta el nombre en la consulta
$query = "SELECT * FROM users WHERE active = 1"; // Ejemplo de consulta corregida
?>

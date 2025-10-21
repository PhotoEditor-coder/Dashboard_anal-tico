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

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
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
                    COUNT(*) as total_users,
                    COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_users,
                    COUNT(CASE WHEN last_login > DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as recent_users,
                    COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users
                  FROM users";
    
    $users_stmt = $db->prepare($users_sql);
    $users_stmt->execute();
    $general_stats['users'] = $users_stmt->fetch();
    
    // Ventas
    $sales_sql = "SELECT 
                    COUNT(*) as total_sales,
                    SUM(amount * quantity) as total_revenue,
                    AVG(amount) as average_sale,
                    COUNT(DISTINCT user_id) as unique_customers
                  FROM sales
                  WHERE 1=1 " . $date_condition;
    
    $sales_stmt = $db->prepare($sales_sql);
    foreach ($params as $key => $value) {
        $sales_stmt->bindValue($key, $value);
    }
    $sales_stmt->execute();
    $general_stats['sales'] = $sales_stmt->fetch();
    
    // Logs
    $logs_sql = "SELECT 
                    COUNT(*) as total_logs,
                    COUNT(CASE WHEN action = 'login' THEN 1 END) as login_count,
                    COUNT(CASE WHEN action = 'purchase' THEN 1 END) as purchase_count,
                    COUNT(DISTINCT user_id) as active_users
                  FROM system_logs
                  WHERE 1=1 " . $date_condition;
    
    $logs_stmt = $db->prepare($logs_sql);
    foreach ($params as $key => $value) {
        $logs_stmt->bindValue($key, $value);
    }
    $logs_stmt->execute();
    $general_stats['activity'] = $logs_stmt->fetch();
    
    // Adopciones
    $adoptions_sql = "SELECT 
                        COUNT(*) as total_adoptions,
                        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_adoptions,
                        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_adoptions,
                        COUNT(CASE WHEN pet_type = 'Perro' THEN 1 END) as dog_adoptions,
                        COUNT(CASE WHEN pet_type = 'Gato' THEN 1 END) as cat_adoptions
                      FROM adoptions
                      WHERE 1=1 " . $date_condition;
    
    $adoptions_stmt = $db->prepare($adoptions_sql);
    foreach ($params as $key => $value) {
        $adoptions_stmt->bindValue($key, $value);
    }
    $adoptions_stmt->execute();
    $general_stats['adoptions'] = $adoptions_stmt->fetch();
    
    // Datos para gráficos
    $charts_data = [];
    
    // Ventas por mes (últimos 12 meses)
    $monthly_sales_sql = "SELECT 
                            DATE_FORMAT(sale_date, '%Y-%m') as month,
                            COUNT(*) as sales_count,
                            SUM(amount * quantity) as revenue
                          FROM sales
                          WHERE sale_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                          GROUP BY DATE_FORMAT(sale_date, '%Y-%m')
                          ORDER BY month";
    
    $monthly_sales_stmt = $db->prepare($monthly_sales_sql);
    $monthly_sales_stmt->execute();
    $charts_data['monthly_sales'] = $monthly_sales_stmt->fetchAll();
    
    // Usuarios activos por día (últimos 30 días)
    $daily_users_sql = "SELECT 
                          DATE(created_at) as date,
                          COUNT(DISTINCT user_id) as active_users
                        FROM system_logs
                        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                        GROUP BY DATE(created_at)
                        ORDER BY date";
    
    $daily_users_stmt = $db->prepare($daily_users_sql);
    $daily_users_stmt->execute();
    $charts_data['daily_users'] = $daily_users_stmt->fetchAll();
    
    // Ventas por categoría
    $category_sales_sql = "SELECT 
                            category,
                            COUNT(*) as sales_count,
                            SUM(amount * quantity) as revenue
                          FROM sales
                          WHERE 1=1 " . $date_condition . "
                          GROUP BY category
                          ORDER BY revenue DESC";
    
    $category_sales_stmt = $db->prepare($category_sales_sql);
    foreach ($params as $key => $value) {
        $category_sales_stmt->bindValue($key, $value);
    }
    $category_sales_stmt->execute();
    $charts_data['category_sales'] = $category_sales_stmt->fetchAll();
    
    // Adopciones por tipo
    $adoption_types_sql = "SELECT 
                            pet_type,
                            COUNT(*) as adoption_count
                          FROM adoptions
                          WHERE 1=1 " . $date_condition . "
                          GROUP BY pet_type";
    
    $adoption_types_stmt = $db->prepare($adoption_types_sql);
    foreach ($params as $key => $value) {
        $adoption_types_stmt->bindValue($key, $value);
    }
    $adoption_types_stmt->execute();
    $charts_data['adoption_types'] = $adoption_types_stmt->fetchAll();
    
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

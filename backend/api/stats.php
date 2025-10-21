<?php
/**
 * API Endpoint: Estadísticas Generales
 * GET /api/stats.php?filter=month|week|today|year|custom&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
 */




ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// ---------- Helpers ----------
function json_headers() {
    header('Content-Type: application/json; charset=utf-8');
}

function sendResponse(array $payload, int $code = 200): void {
    json_headers();
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function handleError(string $message, int $code = 500, array $extra = []): void {
    json_headers();
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $message, 'detail' => $extra], JSON_UNESCAPED_UNICODE);
    exit;
}

// ---------- CORS ----------
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
];

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: http://localhost:3000');
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    handleError('Método no permitido', 405);
}

// ---------- DB ----------
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/utils.php';
try {
    $database = new Database();
    $db = $database->getConnection();
    if (!$db) {
        handleError('Error de conexión a la base de datos', 500);
    }
    // Asegura errores con excepciones si tu clase no lo hace
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (Throwable $e) {
    handleError('No se pudo iniciar la conexión', 500, ['exception' => $e->getMessage()]);
}

// ---------- Parámetros ----------
$filter     = $_GET['filter']      ?? 'all';   // valores esperados: today|week|month|year|custom|all
$start_date = $_GET['start_date']  ?? null;    // YYYY-MM-DD
$end_date   = $_GET['end_date']    ?? null;    // YYYY-MM-DD

// Normaliza filtros "mensuales/semanales" si tu frontend antiguo los usa
if ($filter === 'monthly') $filter = 'month';
if ($filter === 'weekly')  $filter = 'week';

// ---------- Rango de fechas ----------
$date_condition = '';
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
            $params[':start_date'] = $start_date . ' 00:00:00';
            $params[':end_date']   = $end_date   . ' 23:59:59';
        } else {
            handleError('Para filter=custom debes enviar start_date y end_date (YYYY-MM-DD)', 400);
        }
        break;
    default:
        // 'all' -> sin condición
        $date_condition = '';
}

// ---------- Consultas ----------
try {
    $general_stats = [];

    // 1) Usuarios
    $stmt = $db->query("SELECT COUNT(*) AS total_users FROM users");
    $general_stats['users'] = $stmt->fetch();

    // 2) Órdenes (nota: verifica que created_at exista; si tu columna es otra, cámbiala aquí)
    $sqlOrders = "
        SELECT 
            COUNT(*) AS total_orders,
            COALESCE(SUM(o.total_amount),0) AS total_revenue,
            COALESCE(AVG(o.total_amount),0) AS average_order
        FROM orders o
        WHERE 1=1 $date_condition
    ";
    $stmt = $db->prepare($sqlOrders);
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->execute();
    $general_stats['orders'] = $stmt->fetch();

    // 3) Productos
    $stmt = $db->query("
        SELECT 
            COUNT(*) AS total_products,
            COUNT(DISTINCT category) AS total_categories
        FROM products
    ");
    $general_stats['products'] = $stmt->fetch();

    // 4) Eventos (verifica que event_logs.created_at exista)
    $sqlEvents = "
        SELECT 
            COUNT(*) AS total_events,
            COUNT(DISTINCT event_type) AS event_types
        FROM event_logs
        WHERE 1=1 $date_condition
    ";
    $stmt = $db->prepare($sqlEvents);
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->execute();
    $general_stats['activity'] = $stmt->fetch();

    // ---------- Datos para gráficos ----------
    $charts_data = [];

    // Ventas por mes (usa created_at; cámbialo si tu campo es order_date)
    $stmt = $db->query("
        SELECT 
            DATE_FORMAT(created_at, '%Y-%m') AS month,
            COUNT(*) AS order_count,
            COALESCE(SUM(total_amount),0) AS revenue
        FROM orders
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month
    ");
    $charts_data['monthly_orders'] = $stmt->fetchAll();

    // Top productos (verifica nombres de columnas y claves)
    $stmt = $db->query("
        SELECT 
            p.name,
            SUM(oi.quantity) AS units_sold,
            SUM(oi.quantity * oi.price) AS revenue
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        GROUP BY p.id, p.name
        ORDER BY units_sold DESC
        LIMIT 10
    ");
    $charts_data['top_products'] = $stmt->fetchAll();

    // ---------- Respuesta ----------
    sendResponse([
        'ok' => true,
        'filter' => $filter,
        'date_range' => [
            'start_date' => $start_date,
            'end_date'   => $end_date,
        ],
        'statistics' => $general_stats,
        'charts_data' => $charts_data,
        'generated_at' => date('Y-m-d H:i:s'),
    ]);

} catch (Throwable $e) {
    handleError('Error interno del servidor', 500, ['exception' => $e->getMessage()]);
}

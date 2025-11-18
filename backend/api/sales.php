<?php
// backend/api/sales.php
// Lista de ventas basada en orders + order_items + products

require_once __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    respond('Método no permitido', 405);
}

// Parámetros de consulta
$period     = $_GET['period']      ?? null;      // today | week | month | year
$startDate  = $_GET['start_date']  ?? null;
$endDate    = $_GET['end_date']    ?? null;
$limit      = isset($_GET['limit']) ? (int) $_GET['limit'] : 100;

try {
    $conditions = [];
    $params     = [];

    // Filtro por fechas manual (rango)
    if ($startDate) {
        $conditions[]          = "o.created_at >= :start_date";
        $params[':start_date'] = $startDate;
    }

    if ($endDate) {
        $conditions[]        = "o.created_at <= :end_date";
        $params[':end_date'] = $endDate . ' 23:59:59';
    }

    // Filtro por período relativo
    if ($period) {
        switch ($period) {
            case 'today':
                $conditions[] = "DATE(o.created_at) = CURDATE()";
                break;
            case 'week':
                $conditions[] = "o.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
                break;
            case 'month':
                $conditions[] = "o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
                break;
            case 'year':
                $conditions[] = "o.created_at >= DATE_SUB(NOW(), INTERVAL 365 DAY)";
                break;
        }
    }

    $whereSql = '';
    if (!empty($conditions)) {
        $whereSql = ' WHERE ' . implode(' AND ', $conditions);
    }

    // -------------------------------------
    // 1) Listado de ventas (por order_items)
    // -------------------------------------
    $sql = "
        SELECT
            oi.id AS id,
            p.name AS product_name,
            oi.unit_price AS amount,
            oi.quantity,
            'artwork' AS category, -- categoría dummy, puedes cambiarla si luego añades campo real
            o.created_at AS sale_date,
            u.id AS user_id,
            u.email AS user_email,
            (oi.unit_price * oi.quantity) AS total_amount
        FROM order_items oi
        JOIN orders o   ON o.id = oi.order_id
        JOIN products p ON p.id = oi.product_id
        LEFT JOIN users u ON u.id = o.user_id
        $whereSql
        ORDER BY o.created_at DESC
        LIMIT :limit
    ";

    $stmt = $db->prepare($sql);

    // Vincular parámetros (menos el LIMIT)
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);

    $stmt->execute();
    $sales = $stmt->fetchAll();

    // -------------------------------------
    // 2) Estadísticas globales de ventas
    // -------------------------------------
    $statsSql = "
        SELECT
            COUNT(*) AS total_sales,
            IFNULL(SUM(oi.unit_price * oi.quantity), 0) AS total_revenue,
            IFNULL(AVG(oi.unit_price * oi.quantity), 0) AS average_sale,
            COUNT(DISTINCT o.user_id) AS unique_customers
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        $whereSql
    ";

    $statsStmt = $db->prepare($statsSql);
    foreach ($params as $key => $value) {
        $statsStmt->bindValue($key, $value);
    }
    $statsStmt->execute();
    $stats = $statsStmt->fetch() ?: [
        'total_sales'      => 0,
        'total_revenue'    => 0,
        'average_sale'     => 0,
        'unique_customers' => 0,
    ];

    // Campos que tenías en el código original pero que aquí no aplican
    $stats['subscription_sales'] = 0;
    $stats['addon_sales']        = 0;

    // -------------------------------------
    // 3) Ventas por mes (para gráficos)
    // -------------------------------------
    $monthlySql = "
        SELECT
            DATE_FORMAT(o.created_at, '%Y-%m') AS month,
            COUNT(*) AS sales_count,
            IFNULL(SUM(oi.unit_price * oi.quantity), 0) AS revenue
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        $whereSql
        GROUP BY DATE_FORMAT(o.created_at, '%Y-%m')
        ORDER BY month DESC
        LIMIT 12
    ";

    $monthlyStmt = $db->prepare($monthlySql);
    foreach ($params as $key => $value) {
        $monthlyStmt->bindValue($key, $value);
    }
    $monthlyStmt->execute();
    $monthlyData = $monthlyStmt->fetchAll();

    // -------------------------------------
    // 4) Respuesta final
    // -------------------------------------
    respond([
        'sales' => $sales,
        'pagination' => [
            'limit' => $limit,
            'total' => count($sales),
        ],
        'statistics'   => $stats,
        'monthly_data' => $monthlyData,
    ]);

} catch (Throwable $e) {
    // Si quieres loguear:
    // error_log($e->getMessage());
    respond('Error interno del servidor', 500);
}

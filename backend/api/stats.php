<?php
// backend/api/stats.php
require_once __DIR__ . '/bootstrap.php';

$period = $_GET['period'] ?? 'month';

try {

    // -----------------------------------
    // 1) Rango de fechas dinámico
    // -----------------------------------
    switch ($period) {
        case 'week':
            $interval = '7 DAY';
            break;
        case 'year':
            $interval = '365 DAY';
            break;
        case 'month':
        default:
            $interval = '30 DAY';
            $period = 'month';
            break;
    }

    // -----------------------------------
    // 2) KPI: Total Revenue
    // -----------------------------------
    $stmt = $db->query("
        SELECT IFNULL(SUM(total_amount), 0) AS total_revenue
        FROM orders
        WHERE status = 'completed'
    ");
    $totalRevenue = (float) $stmt->fetch()['total_revenue'];

    // -----------------------------------
    // 3) KPI: Total Orders (completed)
    // -----------------------------------
    $stmt = $db->query("
        SELECT COUNT(*) AS total_orders
        FROM orders
        WHERE status = 'completed'
    ");
    $totalOrders = (int) $stmt->fetch()['total_orders'];

    // -----------------------------------
    // 4) KPI: Total Users
    // -----------------------------------
    $stmt = $db->query("SELECT COUNT(*) AS total_users FROM users");
    $totalUsers = (int) $stmt->fetch()['total_users'];

    // -----------------------------------
    // 5) KPI: Active users (last 30 days)
    // -----------------------------------
    $stmt = $db->query("
        SELECT COUNT(*) AS active_users
        FROM users
        WHERE last_login_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    ");
    $activeUsers = (int) $stmt->fetch()['active_users'];

    // -----------------------------------
    // 6) CHART: Revenue by day
    // -----------------------------------
    $stmt = $db->query("
        SELECT DATE(created_at) AS date, SUM(total_amount) AS revenue
        FROM orders
        WHERE status = 'completed'
          AND created_at >= DATE_SUB(CURDATE(), INTERVAL $interval)
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
    ");
    $revenueByDay = $stmt->fetchAll();

    // -----------------------------------
    // 7) CHART: Top products by revenue
    // -----------------------------------
    $stmt = $db->query("
        SELECT p.name,
               SUM(oi.quantity * oi.unit_price) AS total_revenue
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        JOIN orders o ON o.id = oi.order_id
        WHERE o.status = 'completed'
        GROUP BY p.id
        ORDER BY total_revenue DESC
        LIMIT 5
    ");
    $topProducts = $stmt->fetchAll();

    // -----------------------------------
    // 8) CHART: Events by type
    // -----------------------------------
    $stmt = $db->query("
        SELECT type, COUNT(*) AS total
        FROM event_logs
        GROUP BY type
    ");
    $eventStats = $stmt->fetchAll();

    // -----------------------------------
    // 9) Respuesta final para React
    // -----------------------------------
    respond([
        'kpis' => [
            'totalRevenue' => $totalRevenue,
            'totalOrders'  => $totalOrders,
            'totalUsers'   => $totalUsers,
            'activeUsers'  => $activeUsers,
        ],
        'charts' => [
            'revenueByDay' => $revenueByDay,
            'topProducts'  => $topProducts,
            'eventsByType' => $eventStats,
        ],
        'meta' => [
            'period' => $period,
            'generated_at' => date('c'),
        ]
    ]);

} catch (Throwable $e) {
    respond([
        'success' => false,
        'error' => 'Internal server error',
        'details' => $e->getMessage()
    ], 500);
}

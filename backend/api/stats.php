<?php
// backend/api/stats.php
require_once __DIR__ . '/bootstrap.php';

$range = $_GET['range'] ?? 'last_90_days';

try {
    // 1) KPIs generales
    // Total de ingresos (solo órdenes completadas)
    $stmt = $db->query("
        SELECT IFNULL(SUM(total_amount), 0) AS total_revenue
        FROM orders
        WHERE status = 'completed'
    ");
    $totalRevenue = (float) $stmt->fetch()['total_revenue'];

    // Número total de pedidos completados
    $stmt = $db->query("
        SELECT COUNT(*) AS total_orders
        FROM orders
        WHERE status = 'completed'
    ");
    $totalOrders = (int) $stmt->fetch()['total_orders'];

    // Total de usuarios
    $stmt = $db->query("SELECT COUNT(*) AS total_users FROM users");
    $totalUsers = (int) $stmt->fetch()['total_users'];

    // Usuarios activos último mes (login en últimos 30 días)
    $stmt = $db->query("
        SELECT COUNT(*) AS active_users
        FROM users
        WHERE last_login_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    ");
    $activeUsers = (int) $stmt->fetch()['active_users'];

    // 2) Ingresos por día (últimos 90 días)
    $stmt = $db->query("
        SELECT DATE(created_at) AS date, SUM(total_amount) AS revenue
        FROM orders
        WHERE status = 'completed'
          AND created_at >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
    ");
    $revenueByDay = $stmt->fetchAll();

    // 3) Top productos por ingresos
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

    // 4) Eventos por tipo (signup, login, purchase, page_view)
    $stmt = $db->query("
        SELECT type, COUNT(*) AS total
        FROM event_logs
        GROUP BY type
    ");
    $eventStats = $stmt->fetchAll();

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
            'range' => $range,
            'generated_at' => date('c'),
        ]
    ]);

} catch (Throwable $e) {
    respond('Internal server error', 500);
}

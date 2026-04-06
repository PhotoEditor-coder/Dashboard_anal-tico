<?php
// backend/api/stats.php
require_once __DIR__ . '/bootstrap.php';

$period = $_GET['period'] ?? 'month';

try {
    // ─────────────────────────────────────────
    // 1) Rango de fechas: período actual y anterior
    // ─────────────────────────────────────────
    switch ($period) {
        case 'week':
            $days = 7;   break;
        case 'year':
            $days = 365; break;
        case 'month':
        default:
            $days    = 30;
            $period  = 'month';
    }

    // Período actual:   [hoy - $days .. hoy]
    // Período anterior: [hoy - 2*$days .. hoy - $days]  (para calcular cambio %)
    $intervalCurrent  = "{$days} DAY";
    $intervalPrevious = ($days * 2) . " DAY";

    // ─────────────────────────────────────────
    // 2) Helper: calcula el % de cambio
    // ─────────────────────────────────────────
    $pctChange = function(float $current, float $previous): ?float {
        if ($previous == 0) return null;
        return round((($current - $previous) / $previous) * 100, 1);
    };

    // ─────────────────────────────────────────
    // 3) KPI: Total Revenue (actual vs anterior)
    // ─────────────────────────────────────────
    $stmt = $db->query("
        SELECT
            IFNULL(SUM(CASE WHEN created_at >= DATE_SUB(CURDATE(), INTERVAL {$intervalCurrent})  THEN total_amount END), 0) AS current_revenue,
            IFNULL(SUM(CASE WHEN created_at >= DATE_SUB(CURDATE(), INTERVAL {$intervalPrevious})
                             AND created_at <  DATE_SUB(CURDATE(), INTERVAL {$intervalCurrent})  THEN total_amount END), 0) AS prev_revenue
        FROM orders
        WHERE status = 'completed'
    ");
    $row = $stmt->fetch();
    $totalRevenue     = (float) $row['current_revenue'];
    $totalRevenuePrev = (float) $row['prev_revenue'];

    // ─────────────────────────────────────────
    // 4) KPI: Total Orders
    // ─────────────────────────────────────────
    $stmt = $db->query("
        SELECT
            COUNT(CASE WHEN created_at >= DATE_SUB(CURDATE(), INTERVAL {$intervalCurrent})  THEN 1 END) AS current_orders,
            COUNT(CASE WHEN created_at >= DATE_SUB(CURDATE(), INTERVAL {$intervalPrevious})
                        AND created_at <  DATE_SUB(CURDATE(), INTERVAL {$intervalCurrent})  THEN 1 END) AS prev_orders
        FROM orders
        WHERE status = 'completed'
    ");
    $row = $stmt->fetch();
    $totalOrders     = (int) $row['current_orders'];
    $totalOrdersPrev = (int) $row['prev_orders'];

    // ─────────────────────────────────────────
    // 5) KPI: Total Users
    // ─────────────────────────────────────────
    $stmt = $db->query("SELECT COUNT(*) AS total_users FROM users");
    $totalUsers = (int) $stmt->fetch()['total_users'];

    // ─────────────────────────────────────────
    // 6) KPI: Active Users (últimos 30 días vs anteriores 30)
    // ─────────────────────────────────────────
    $stmt = $db->query("
        SELECT
            COUNT(CASE WHEN last_login_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) AS active_current,
            COUNT(CASE WHEN last_login_at >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
                        AND last_login_at <  DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) AS active_prev
        FROM users
    ");
    $row         = $stmt->fetch();
    $activeUsers     = (int) $row['active_current'];
    $activeUsersPrev = (int) $row['active_prev'];

    // ─────────────────────────────────────────
    // 7) CHART: Revenue por día (período actual)
    // ─────────────────────────────────────────
    $stmt = $db->query("
        SELECT DATE(created_at) AS date, SUM(total_amount) AS revenue
        FROM orders
        WHERE status = 'completed'
          AND created_at >= DATE_SUB(CURDATE(), INTERVAL {$intervalCurrent})
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
    ");
    $revenueByDay = $stmt->fetchAll();

    // ─────────────────────────────────────────
    // 8) CHART: Top 5 productos por ingresos
    // ─────────────────────────────────────────
    $stmt = $db->query("
        SELECT p.name,
               SUM(oi.quantity * oi.unit_price) AS total_revenue
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        JOIN orders   o ON o.id = oi.order_id
        WHERE o.status = 'completed'
        GROUP BY p.id, p.name
        ORDER BY total_revenue DESC
        LIMIT 5
    ");
    $topProducts = $stmt->fetchAll();

    // ─────────────────────────────────────────
    // 9) CHART: Eventos por tipo
    // ─────────────────────────────────────────
    $stmt = $db->query("
        SELECT type, COUNT(*) AS total
        FROM event_logs
        GROUP BY type
    ");
    $eventStats = $stmt->fetchAll();

    // ─────────────────────────────────────────
    // 10) CHART: Ventas mensuales (últimos 12 meses) — compatible con SalesChart
    // ─────────────────────────────────────────
    $stmt = $db->query("
        SELECT
            DATE_FORMAT(o.created_at, '%Y-%m') AS month,
            COUNT(*)                            AS sales_count,
            IFNULL(SUM(oi.quantity * oi.unit_price), 0) AS revenue
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE o.status = 'completed'
          AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(o.created_at, '%Y-%m')
        ORDER BY month ASC
        LIMIT 12
    ");
    $monthlySales = $stmt->fetchAll();

    // ─────────────────────────────────────────
    // 11) Respuesta final — contrato unificado
    // ─────────────────────────────────────────
    respond([
        'kpis' => [
            'totalRevenue'  => $totalRevenue,
            'totalOrders'   => $totalOrders,
            'totalUsers'    => $totalUsers,
            'activeUsers'   => $activeUsers,
            // Cambios reales respecto al período anterior
            'changes' => [
                'revenue'     => $pctChange($totalRevenue, $totalRevenuePrev),
                'orders'      => $pctChange($totalOrders, (float)$totalOrdersPrev),
                'activeUsers' => $pctChange($activeUsers, (float)$activeUsersPrev),
            ]
        ],
        'charts' => [
            'revenueByDay'  => $revenueByDay,
            'topProducts'   => $topProducts,
            'eventsByType'  => $eventStats,
            'monthlySales'  => $monthlySales,   // ← usado por SalesChart
        ],
        'meta' => [
            'period'       => $period,
            'days'         => $days,
            'generated_at' => date('c'),
        ]
    ]);

} catch (Throwable $e) {
    respond([
        'success' => false,
        'error'   => 'Internal server error',
        'details' => $e->getMessage()
    ], 500);
}

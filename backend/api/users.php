<?php
// backend/api/users.php
// GET /api/users.php           → lista de usuarios
// GET /api/users.php?active=true
// GET /api/users.php?role=admin
// GET /api/users.php?limit=100

require_once __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    respond('Método no permitido', 405);
}

try {
    $active = $_GET['active'] ?? null;
    $role   = $_GET['role']   ?? null;
    $limit  = isset($_GET['limit']) ? max(1, min(500, (int) $_GET['limit'])) : 50;

    // ─────────────────────────────────────────
    // 1) Listado de usuarios
    // ─────────────────────────────────────────
    $conditions = [];
    $params     = [];

    if ($active !== null) {
        $conditions[]       = 'is_active = :active';
        $params[':active']  = $active === 'true' ? 1 : 0;
    }

    if ($role) {
        $conditions[]    = 'role = :role';
        $params[':role'] = $role;
    }

    $whereSql = $conditions ? ' WHERE ' . implode(' AND ', $conditions) : '';

    $sql = "
        SELECT
            id,
            name,
            email,
            role,
            is_active,
            created_at,
            last_login_at,
            CASE
                WHEN last_login_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)  THEN 'recent'
                WHEN last_login_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 'active'
                ELSE 'inactive'
            END AS activity_status
        FROM users
        {$whereSql}
        ORDER BY created_at DESC
        LIMIT :limit
    ";

    $stmt = $db->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $users = $stmt->fetchAll();

    // ─────────────────────────────────────────
    // 2) Estadísticas de usuarios
    // ─────────────────────────────────────────
    $statsStmt = $db->query("
        SELECT
            COUNT(*)                                                                 AS total_users,
            COUNT(CASE WHEN is_active = 1 THEN 1 END)                               AS active_users,
            COUNT(CASE WHEN last_login_at >= DATE_SUB(NOW(), INTERVAL  7 DAY) THEN 1 END) AS recent_users,
            COUNT(CASE WHEN last_login_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) AS users_last_30d,
            COUNT(CASE WHEN role = 'admin' THEN 1 END)                              AS admin_users,
            COUNT(CASE WHEN created_at    >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) AS new_last_30d
        FROM users
    ");
    $statistics = $statsStmt->fetch();

    // ─────────────────────────────────────────
    // 3) Respuesta unificada
    // ─────────────────────────────────────────
    respond([
        'users' => $users,
        'pagination' => [
            'limit' => $limit,
            'total' => count($users),
        ],
        'statistics' => $statistics,
    ]);

} catch (Throwable $e) {
    respond('Error interno del servidor: ' . $e->getMessage(), 500);
}

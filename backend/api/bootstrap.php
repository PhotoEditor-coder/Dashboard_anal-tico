<?php
// backend/api/bootstrap.php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();

function respond($data, int $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode([
        'success' => $statusCode >= 200 && $statusCode < 300,
        'data'    => $statusCode >= 200 && $statusCode < 300 ? $data : null,
        'error'   => $statusCode >= 400 ? $data : null,
    ]);
    exit;
}

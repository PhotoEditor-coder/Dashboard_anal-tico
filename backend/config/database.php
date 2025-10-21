<?php
class Database {
    // ...igual que ya lo tienes...
}

/** Helpers JSON (protegidos) */
if (!function_exists('sendResponse')) {
    function sendResponse($data, $status = 200) {
        http_response_code($status);
        header('Content-Type: application/json');

        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $allowedOrigins = [
            'http://localhost:3000','http://127.0.0.1:3000',
            'http://localhost:8080','http://127.0.0.1:8080',
            'http://localhost','http://127.0.0.1'
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

        echo json_encode([
            'status' => $status < 400 ? 'success' : 'error',
            'data' => $data,
            'timestamp' => date('Y-m-d H:i:s')
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

if (!function_exists('handleError')) {
    function handleError($message, $status = 400) {
        sendResponse(['error' => $message], $status);
    }
}

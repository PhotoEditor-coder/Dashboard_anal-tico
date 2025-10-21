<?php
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
    echo json_encode(['ok'=>false,'error'=>$message,'detail'=>$extra], JSON_UNESCAPED_UNICODE);
    exit;
}

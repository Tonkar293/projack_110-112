<?php
// config/api_helpers.php

function get_json_input() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

function send_json_response($status, $data = [], $httpCode = 200) {
    http_response_code($httpCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'status' => $status,
        'data'   => $data,
        'message' => $data['message'] ?? ($data['data']['message'] ?? '')
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

function send_json_error($message, $httpCode = 400) {
    send_json_response('error', ['message' => $message], $httpCode);
}

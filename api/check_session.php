<?php
// api/check_session.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/api_helpers.php';

if (empty($_SESSION['user_id'])) {
    send_json_error('ไม่ได้เข้าสู่ระบบ', 401);
}

send_json_response('success', [
    'user' => [
        'id'       => $_SESSION['user_id'],
        'username' => $_SESSION['username'] ?? '',
        'fullname' => $_SESSION['fullname'] ?? '',
        'role'     => $_SESSION['role'] ?? 'user',
        'email'    => $_SESSION['email'] ?? '',
        'phone'    => $_SESSION['phone'] ?? ''
    ]
]);

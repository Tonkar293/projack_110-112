<?php
// config/auth.php

require_once __DIR__ . '/api_helpers.php';

function check_auth() {
    if (!isset($_SESSION['user_id'])) {
        return false;
    }
    return true;
}

function get_current_user_data() {
    if (!check_auth()) {
        return null;
    }
    return [
        'id'       => $_SESSION['user_id'] ?? null,
        'username' => $_SESSION['username'] ?? '',
        'fullname' => $_SESSION['fullname'] ?? '',
        'role'     => $_SESSION['role'] ?? 'user',
        'email'    => $_SESSION['email'] ?? '',
        'phone'    => $_SESSION['phone'] ?? ''
    ];
}

function require_login_api() {
    if (!check_auth()) {
        send_json_error('กรุณาเข้าสู่ระบบก่อนใช้งาน', 401, ['unauthenticated' => true]);
    }
}

function require_admin_api() {
    require_login_api();
    $user = get_current_user_data();
    if ($user['role'] !== 'admin') {
        send_json_error('คุณไม่มีสิทธิ์เข้าถึงส่วนนี้', 403);
    }
}

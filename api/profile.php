<?php
// api/profile.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

require_login_api();
$user = get_current_user_data();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare("SELECT id, username, fullname, email, phone, role, created_at FROM users WHERE id = :id LIMIT 1");
    $stmt->execute(['id' => $user['id']]);
    $userData = $stmt->fetch();

    send_json_success('', ['user' => $userData]);
} elseif ($method === 'POST') {
    $input = get_json_input();
    $fullname = trim($input['fullname'] ?? '');
    $email    = trim($input['email'] ?? '');
    $phone    = trim($input['phone'] ?? '');
    $password = trim($input['password'] ?? '');

    if (empty($fullname)) {
        send_json_error('กรุณากรอกชื่อ-นามสกุล');
    }

    if (!empty($password)) {
        if (strlen($password) < 6) {
            send_json_error('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
        }
        $hashedPass = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("
            UPDATE users 
            SET fullname = :fullname, email = :email, phone = :phone, password = :password 
            WHERE id = :id
        ");
        $stmt->execute([
            'fullname' => $fullname,
            'email'    => $email ?: null,
            'phone'    => $phone ?: null,
            'password' => $hashedPass,
            'id'       => $user['id']
        ]);
    } else {
        $stmt = $pdo->prepare("
            UPDATE users 
            SET fullname = :fullname, email = :email, phone = :phone 
            WHERE id = :id
        ");
        $stmt->execute([
            'fullname' => $fullname,
            'email'    => $email ?: null,
            'phone'    => $phone ?: null,
            'id'       => $user['id']
        ]);
    }

    // Update session data
    $_SESSION['fullname'] = $fullname;
    $_SESSION['email']    = $email;
    $_SESSION['phone']    = $phone;

    send_json_success('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว', [
        'user' => [
            'id'       => $user['id'],
            'username' => $user['username'],
            'fullname' => $fullname,
            'email'    => $email,
            'phone'    => $phone,
            'role'     => $user['role']
        ]
    ]);
} else {
    send_json_error('Method Not Allowed', 405);
}

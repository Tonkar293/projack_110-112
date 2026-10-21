<?php
// api/login.php - Secure Database Authentication

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/api_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json_error('Method Not Allowed', 405);
}

$input = get_json_input();
$username = trim($input['username'] ?? '');
$password = trim($input['password'] ?? '');

if (empty($username) || empty($password)) {
    send_json_error('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน', 400);
}

if ($pdo === null) {
    send_json_error('ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาตรวจสอบสถานะเซิร์ฟเวอร์ MySQL', 500);
}

try {
    $stmt = $pdo->prepare("SELECT id, username, password, fullname, role, email, phone, status FROM users WHERE username = :username LIMIT 1");
    $stmt->execute(['username' => $username]);
    $user = $stmt->fetch();

    if (!$user) {
        send_json_error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 401);
    }

    if ($user['status'] !== 'active') {
        send_json_error('บัญชีผู้ใช้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ', 403);
    }

    // Verify hashed password strictly against database
    if (!password_verify($password, $user['password'])) {
        send_json_error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 401);
    }

    // Regenerate session ID to prevent Session Fixation
    if (session_status() === PHP_SESSION_ACTIVE) {
        session_regenerate_id(true);
    }

    // Set secure session variables
    $_SESSION['user_id']  = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['fullname'] = $user['fullname'];
    $_SESSION['role']     = $user['role'];
    $_SESSION['email']    = $user['email'];
    $_SESSION['phone']    = $user['phone'];

    $redirectTarget = ($user['role'] === 'admin') ? 'admin/dashboard.html' : 'user/dashboard.html';

    send_json_response('success', [
        'message'  => 'เข้าสู่ระบบสำเร็จ',
        'redirect' => $redirectTarget,
        'data'     => [
            'user' => [
                'id'       => $user['id'],
                'username' => $user['username'],
                'fullname' => $user['fullname'],
                'role'     => $user['role'],
                'email'    => $user['email'],
                'phone'    => $user['phone']
            ],
            'redirect' => $redirectTarget
        ]
    ]);

} catch (Exception $e) {
    send_json_error('เกิดข้อผิดพลาดในการตรวจสอบข้อมูลในระบบ', 500);
}

<?php
// api/logout.php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/api_helpers.php';

$_SESSION = [];
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}
session_destroy();

send_json_response('success', ['message' => 'ออกจากระบบเรียบร้อยแล้ว']);

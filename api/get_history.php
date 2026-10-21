<?php
// api/get_history.php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

require_login_api();
$user = get_current_user_data();
$userId = (int)$user['id'];
$history = [];

if ($pdo) {
    try {
        $stmt = $pdo->prepare("SELECT r.*, 'แบบประเมินสุขภาพจิต (2Q/9Q)' as assessment_title FROM assessment_results r WHERE r.user_id = :uid ORDER BY r.created_at DESC");
        $stmt->execute(['uid' => $userId]);
        $history = $stmt->fetchAll();
    } catch (Exception $e) {
        $history = [];
    }
}

send_json_response('success', [
    'history' => $history
]);

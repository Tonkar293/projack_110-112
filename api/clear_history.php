<?php
// api/clear_history.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

require_login_api();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json_error('Method Not Allowed', 405);
}

$user = get_current_user_data();

$stmt = $pdo->prepare("DELETE FROM assessment_results WHERE user_id = :user_id");
$stmt->execute(['user_id' => $user['id']]);

send_json_success('ลบประวัติการประเมินทั้งหมดเรียบร้อยแล้ว');

<?php
// api/doctors.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

require_login_api();

$stmt = $pdo->prepare("
    SELECT d.id, u.fullname as name, d.specialty, d.phone, d.email, d.line_id, d.working_days, d.working_time
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    WHERE u.status = 'active'
    ORDER BY d.id ASC
");
$stmt->execute();
$doctors = $stmt->fetchAll();

send_json_success('', ['doctors' => $doctors]);

<?php
// api/db_status.php - XAMPP MySQL Connection Status Checker

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/api_helpers.php';

if ($pdo === null) {
    send_json_error('ไม่สามารถเชื่อมต่อฐานข้อมูล XAMPP MySQL ได้ กรุณาเปิด Apache และ MySQL ใน XAMPP Control Panel', 500);
}

try {
    $dbInfoStmt = $pdo->query("SELECT DATABASE() as db_name, VERSION() as db_version");
    $dbInfo = $dbInfoStmt->fetch();

    $tablesStmt = $pdo->query("SHOW TABLES");
    $tables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);

    $tableStats = [];
    foreach ($tables as $tbl) {
        $countStmt = $pdo->query("SELECT COUNT(*) FROM `{$tbl}`");
        $tableStats[$tbl] = (int)$countStmt->fetchColumn();
    }

    send_json_response('success', [
        'database'     => $dbInfo['db_name'] ?? 'mental_health',
        'server_type'  => 'XAMPP MariaDB/MySQL',
        'version'      => $dbInfo['db_version'] ?? '',
        'host'         => '127.0.0.1:3306',
        'connected'    => true,
        'table_counts' => $tableStats
    ]);
} catch (Exception $e) {
    send_json_error('เกิดข้อผิดพลาดในการตรวจสอบฐานข้อมูล: ' . $e->getMessage(), 500);
}

<?php
// config/database.php - XAMPP MySQL Database Connection

if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}

// XAMPP Default MySQL Connection Settings
$db_host = '127.0.0.1';
$db_port = 3306;
$db_name = 'mental_health';
$db_user = 'root';
$db_pass = ''; // Default XAMPP root password is empty

try {
    $dsn = "mysql:host={$db_host};port={$db_port};dbname={$db_name};charset=utf8mb4";
    $pdo = new PDO($dsn, $db_user, $db_pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
} catch (PDOException $e) {
    $pdo = null;
    error_log("Database connection error: " . $e->getMessage());
}

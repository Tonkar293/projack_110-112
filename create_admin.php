<?php
// create_admin.php
// Script to create or reset default admin and test user

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/api_helpers.php';

try {
    $adminPassword = password_hash('admin123', PASSWORD_BCRYPT);
    $userPassword  = password_hash('123456', PASSWORD_BCRYPT);

    // Create or update admin user
    $stmt = $pdo->prepare("
        INSERT INTO users (id, username, password, fullname, email, role, status)
        VALUES (1, 'admin', :admin_pass, 'ผู้ดูแลระบบ', 'admin@example.com', 'admin', 'active')
        ON DUPLICATE KEY UPDATE password = :admin_pass2, role = 'admin', status = 'active'
    ");
    $stmt->execute(['admin_pass' => $adminPassword, 'admin_pass2' => $adminPassword]);

    // Create or update test user01
    $stmt = $pdo->prepare("
        INSERT INTO users (id, username, password, fullname, email, phone, role, status)
        VALUES (2, 'user01', :user_pass, 'ทดสอบ ผู้ใช้งาน01', 'user01@example.com', '0812345678', 'user', 'active')
        ON DUPLICATE KEY UPDATE password = :user_pass2, role = 'user', status = 'active'
    ");
    $stmt->execute(['user_pass' => $userPassword, 'user_pass2' => $userPassword]);

    echo "<h3>สร้างบัญชีเริ่มต้นสำเร็จ!</h3>";
    echo "<ul>";
    echo "<li><strong>Admin:</strong> Username: <code>admin</code> | Password: <code>admin123</code></li>";
    echo "<li><strong>User:</strong> Username: <code>user01</code> | Password: <code>123456</code></li>";
    echo "</ul>";
    echo "<p><a href='login.html'>ไปยังหน้าเข้าสู่ระบบ</a></p>";

} catch (Exception $e) {
    echo "เกิดข้อผิดพลาด: " . $e->getMessage();
}

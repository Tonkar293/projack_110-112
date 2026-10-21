<?php
// api/diary.php - Mood & Symptom Diary Handler

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

require_login_api();
$user = get_current_user_data();
$userId = (int)$user['id'];

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $limit = intval($_GET['limit'] ?? 30);
    $diaries = [];

    if ($pdo !== null) {
        try {
            $pdo->exec("CREATE TABLE IF NOT EXISTS `mood_diaries` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `user_id` INT NOT NULL,
                `mood_level` INT NOT NULL,
                `symptoms` VARCHAR(255) DEFAULT '',
                `note` TEXT DEFAULT NULL,
                `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                INDEX (`user_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

            $stmt = $pdo->prepare("SELECT id, user_id, mood_level as mood, symptoms, note, DATE(created_at) as diary_date, created_at FROM mood_diaries WHERE user_id = :user_id ORDER BY created_at DESC LIMIT :limit");
            $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            $diaries = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            $diaries = [];
        }
    }

    send_json_response('success', ['diaries' => $diaries]);

} elseif ($method === 'POST') {
    $input = get_json_input();
    $mood = isset($input['mood']) ? intval($input['mood']) : 3;
    $symptoms = is_array($input['symptoms'] ?? null) ? implode(', ', $input['symptoms']) : trim($input['symptoms'] ?? '');
    $note = trim($input['note'] ?? '');
    $diaryDate = trim($input['diary_date'] ?? date('Y-m-d'));

    $entryId = time();

    if ($pdo !== null) {
        try {
            $pdo->exec("CREATE TABLE IF NOT EXISTS `mood_diaries` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `user_id` INT NOT NULL,
                `mood_level` INT NOT NULL,
                `symptoms` VARCHAR(255) DEFAULT '',
                `note` TEXT DEFAULT NULL,
                `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                INDEX (`user_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

            $stmt = $pdo->prepare("INSERT INTO mood_diaries (user_id, mood_level, symptoms, note, created_at) VALUES (:user_id, :mood, :symptoms, :note, NOW())");
            $stmt->execute([
                'user_id'  => $userId,
                'mood'     => $mood,
                'symptoms' => $symptoms,
                'note'     => $note
            ]);
            $entryId = $pdo->lastInsertId();
        } catch (Exception $e) {
            send_json_error('เกิดข้อผิดพลาดในการบันทึกไดอารี่', 500);
        }
    }

    send_json_response('success', [
        'message' => 'บันทึกอาการและอารมณ์เรียบร้อยแล้ว',
        'entry' => [
            'id'         => $entryId,
            'user_id'    => $userId,
            'mood'       => $mood,
            'symptoms'   => $symptoms,
            'note'       => $note,
            'diary_date' => $diaryDate
        ]
    ]);
} else {
    send_json_error('Method Not Allowed', 405);
}

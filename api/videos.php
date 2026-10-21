<?php
// api/videos.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

require_login_api();
$user = get_current_user_data();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $search = trim($_GET['search'] ?? '');
    
    $sql = "
        SELECT v.*, 
               IF(vh.id IS NOT NULL, 1, 0) AS is_watched
        FROM videos v
        LEFT JOIN video_history vh ON v.id = vh.video_id AND vh.user_id = :user_id
    ";
    
    $params = ['user_id' => $user['id']];
    
    if ($user['role'] !== 'admin') {
        $sql .= " WHERE v.status = 'active'";
    } else {
        $sql .= " WHERE 1=1";
    }

    if (!empty($search)) {
        $sql .= " AND (v.title LIKE :search OR v.description LIKE :search)";
        $params['search'] = "%{$search}%";
    }
    
    $sql .= " ORDER BY v.id DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $videos = $stmt->fetchAll();

    send_json_success('', ['videos' => $videos]);

} elseif ($method === 'POST') {
    $input = get_json_input();
    $action = $input['action'] ?? 'watch';

    if ($action === 'watch') {
        $videoId = intval($input['video_id'] ?? 0);
        if ($videoId <= 0) {
            send_json_error('ระบุรหัสวิดีโอไม่ถูกต้อง');
        }

        $stmt = $pdo->prepare("
            INSERT IGNORE INTO video_history (user_id, video_id, watched_at)
            VALUES (:user_id, :video_id, NOW())
        ");
        $stmt->execute(['user_id' => $user['id'], 'video_id' => $videoId]);

        send_json_success('บันทึกประวัติการรับชมแล้ว');
    }

    // Admin CRUD operations
    if ($user['role'] !== 'admin') {
        send_json_error('ไม่มีสิทธิ์ดำเนินการ', 403);
    }

    $extractYouTubeId = function($url) {
        if (empty($url)) return null;
        if (preg_match('/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/|watch\?.+&v=))([\w-]{11})/', $url, $m)) {
            return $m[1];
        }
        if (preg_match('/^[a-zA-Z0-9_-]{11}$/', $url)) {
            return $url;
        }
        return null;
    };

    if ($action === 'add') {
        $title = trim($input['title'] ?? '');
        $description = trim($input['description'] ?? '');
        $videoUrl = trim($input['video_url'] ?? '');
        $thumbnail = trim($input['thumbnail'] ?? '');
        $status = $input['status'] ?? 'active';

        if (empty($title) || empty($videoUrl)) {
            send_json_error('กรุณาระบุชื่อวิดีโอและ URL วิดีโอ');
        }

        // Auto-generate thumbnail from YouTube if not provided
        $ytId = $extractYouTubeId($videoUrl);
        if (empty($thumbnail) && $ytId) {
            $thumbnail = "https://img.youtube.com/vi/{$ytId}/hqdefault.jpg";
        }

        $stmt = $pdo->prepare("
            INSERT INTO videos (title, description, video_url, thumbnail, status)
            VALUES (:title, :description, :video_url, :thumbnail, :status)
        ");
        $stmt->execute([
            'title'       => $title,
            'description' => $description,
            'video_url'   => $videoUrl,
            'thumbnail'   => $thumbnail ?: null,
            'status'      => $status
        ]);

        send_json_success('เพิ่มวิดีโอเรียบร้อยแล้ว');
    }

    if ($action === 'edit') {
        $id = intval($input['id'] ?? 0);
        $title = trim($input['title'] ?? '');
        $description = trim($input['description'] ?? '');
        $videoUrl = trim($input['video_url'] ?? '');
        $thumbnail = trim($input['thumbnail'] ?? '');
        $status = $input['status'] ?? 'active';

        if ($id <= 0 || empty($title) || empty($videoUrl)) {
            send_json_error('ข้อมูลไม่ครบถ้วน');
        }

        // Auto-generate thumbnail from YouTube if not provided
        $ytId = $extractYouTubeId($videoUrl);
        if (empty($thumbnail) && $ytId) {
            $thumbnail = "https://img.youtube.com/vi/{$ytId}/hqdefault.jpg";
        }

        $stmt = $pdo->prepare("
            UPDATE videos 
            SET title = :title, description = :description, video_url = :video_url, thumbnail = :thumbnail, status = :status
            WHERE id = :id
        ");
        $stmt->execute([
            'id'          => $id,
            'title'       => $title,
            'description' => $description,
            'video_url'   => $videoUrl,
            'thumbnail'   => $thumbnail ?: null,
            'status'      => $status
        ]);

        send_json_success('แก้ไขข้อมูลวิดีโอเรียบร้อยแล้ว');
    }

    if ($action === 'delete') {
        $id = intval($input['id'] ?? 0);
        if ($id <= 0) {
            send_json_error('ระบุรหัสวิดีโอไม่ถูกต้อง');
        }

        $stmt = $pdo->prepare("DELETE FROM videos WHERE id = :id");
        $stmt->execute(['id' => $id]);

        send_json_success('ลบวิดีโอเรียบร้อยแล้ว');
    }

    send_json_error('คำขอไม่ถูกต้อง');
} else {
    send_json_error('Method Not Allowed', 405);
}

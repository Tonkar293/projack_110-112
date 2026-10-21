-- mental_health.sql
-- Complete MySQL Database Schema and Seed Data for XAMPP

CREATE DATABASE IF NOT EXISTS `mental_health` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `mental_health`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `fullname` VARCHAR(100) NOT NULL,
  `role` ENUM('user', 'admin') DEFAULT 'user',
  `email` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `status` ENUM('active', 'suspended') DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Seed Users (Default: user01 / 123456 and admin / admin123)
INSERT INTO `users` (`id`, `username`, `password`, `fullname`, `role`, `email`, `phone`, `status`) VALUES
(1, 'user01', '$2y$10$wT5H3pQxPqYyE.u.1xG7c.Hq/M/9kYq1M9A0X5Zg7Z8fE4H5c.A1e', 'สมชาย ใส่ใจ (ผู้ใช้งานทั่วไป)', 'user', 'user01@example.com', '081-234-5678', 'active'),
(2, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ผู้ดูแลระบบ (Admin)', 'admin', 'admin@mentalhealth.com', '081-999-8888', 'active')
ON DUPLICATE KEY UPDATE `fullname` = VALUES(`fullname`);

-- 2. Assessment Results Table
CREATE TABLE IF NOT EXISTS `assessment_results` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `assessment_id` INT DEFAULT 1,
  `total_score` INT NOT NULL,
  `level` VARCHAR(100) NOT NULL,
  `result_text` TEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Sample Assessment Record for user01
INSERT INTO `assessment_results` (`user_id`, `assessment_id`, `total_score`, `level`, `result_text`) VALUES
(1, 1, 2, 'ระดับปกติ', 'คุณมีสภาวะสุขภาพใจที่ดีอยู่ในเกณฑ์ปกติ สามารถรับมือกับความตึงเครียดได้ดี\nควรหมั่นออกกำลังกายอย่างน้อย 30 นาทีต่อวัน 3-5 วัน/สัปดาห์ เพื่อกระตุ้นสารความสุข (Endorphins)\nนอนหลับพักผ่อนให้เพียงพอ 7-8 ชั่วโมงต่อวัน และเข้านอนตรงเวลา\nฝึกการหายใจลึกๆ (Deep Breathing) และทำกิจกรรมงานอดิเรกที่ชื่นชอบเมื่อรู้สึกเหนื่อยล้า\nทำแบบประเมินและบันทึกอารมณ์สัปดาห์ละ 1-2 ครั้งเพื่อติดตามสุขภาพใจอย่างต่อเนื่อง');

-- 3. Mood Diaries Table
CREATE TABLE IF NOT EXISTS `mood_diaries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `mood_level` INT NOT NULL,
  `symptoms` VARCHAR(255) DEFAULT '',
  `note` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Videos Table
CREATE TABLE IF NOT EXISTS `videos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) DEFAULT 'ทั่วไป',
  `duration` VARCHAR(50) DEFAULT '10:00',
  `url` VARCHAR(255) DEFAULT '',
  `thumbnail` VARCHAR(255) DEFAULT '',
  `description` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `videos` (`title`, `category`, `duration`, `description`) VALUES
('เทคนิคฝึกสมาธิผ่อนคลายความเครียด 10 นาที', 'ฝึกสมาธิ', '10:15', 'แบบฝึกสมาธิเพื่อปรับคลื่นสมอง ลดความวิตกกังวลและเพิ่มความผ่อนคลาย'),
('การปรับทัศนคติเมื่อต้องเผชิญกับวันหนักๆ', 'สร้างกำลังใจ', '15:30', 'แนวคิดทางการแพทย์ในการดูแลสุขภาพใจเมื่อรู้สึกท้อแท้และเหนื่อยล้า'),
('ดนตรีบำบัดช่วยการนอนหลับลึก', 'ผ่อนคลายความเครียด', '20:00', 'คลื่นเสียงความถี่ธรรมชาติช่วยให้สมองผ่อนคลายและหลับสนิท');

-- 5. Consultations Table
CREATE TABLE IF NOT EXISTS `consultations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `doctor_name` VARCHAR(100) NOT NULL,
  `specialty` VARCHAR(100) NOT NULL,
  `hospital` VARCHAR(150) NOT NULL,
  `availability` VARCHAR(100) DEFAULT 'จันทร์ - ศุกร์',
  `status` VARCHAR(50) DEFAULT 'พร้อมให้บริการ'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `consultations` (`doctor_name`, `specialty`, `hospital`, `availability`) VALUES
('นพ. สมศักดิ์ ใส่ใจดี', 'จิตแพทย์ผู้เชี่ยวชาญด้านโรคซึมเศร้า', 'โรงพยาบาลสุขภาพจิตกรุงเทพ', 'จันทร์ - ศุกร์ (09:00 - 16:00)'),
('พญ. วิภาวรรณ รักษ์ใจ', 'นักจิตวิทยาคลินิก', 'ศูนย์บริการสุขภาพจิตเวช', 'เสาร์ - อาทิตย์ (10:00 - 17:00)');

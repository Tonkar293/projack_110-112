-- =====================================================================
--  mental_health : สคริปต์สร้างฐานข้อมูลใหม่ทั้งหมด
--  ระบบติดตามและดูแลอาการผู้ป่วยโรคซึมเศร้า
--
--  วิธีใช้ใน phpMyAdmin:
--    หน้าแรก (Server: 127.0.0.1) > แท็บ Import > เลือกไฟล์นี้ > กด Import
--
--  หมายเหตุ
--    - ไฟล์นี้ไม่มีคำสั่ง DROP / TRUNCATE จึงไม่ลบข้อมูลที่มีอยู่
--    - รันซ้ำได้ ตารางที่มีแล้วจะถูกข้าม ข้อมูลเริ่มต้นที่มีแล้วจะไม่ถูกเพิ่มซ้ำ
--    - อย่ารันไฟล์นี้ถ้ากำลังจะกู้ข้อมูลเดิมจาก data_old (ให้กู้ข้อมูลเดิมก่อน)
--
--  ตาราง (10 ตาราง)
--    ตารางเดิม  : users, assessment_results, daily_diary, doctors,
--                 videos, video_history
--    ตารางใหม่  : assessments, questions, feedback, alerts
-- =====================================================================

SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS `mental_health`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `mental_health`;


-- =====================================================================
--  1) users : ผู้ใช้ทุกประเภท (admin / user / doctor)
-- =====================================================================

CREATE TABLE IF NOT EXISTS `users` (
    `id`         INT          NOT NULL AUTO_INCREMENT,
    `username`   VARCHAR(100) NOT NULL,
    `password`   VARCHAR(255) NOT NULL,
    `fullname`   VARCHAR(150) NOT NULL,
    `email`      VARCHAR(150) DEFAULT NULL,
    `phone`      VARCHAR(30)  DEFAULT NULL,
    `role`       ENUM('admin','user','doctor')  DEFAULT 'user',
    `status`     ENUM('active','inactive')      DEFAULT 'active',
    `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================================
--  2) assessments : ชุดแบบประเมิน/แบบคัดกรอง (ตารางใหม่)
--     ขอบเขตผู้ดูแล ข้อ 2 : เพิ่ม แก้ไข ลบ ชุดแบบคัดกรอง
--     ถ้าชุดไหนมีผลประเมินแล้ว จะลบไม่ได้ ให้ตั้ง status = 'inactive' แทน
-- =====================================================================

CREATE TABLE IF NOT EXISTS `assessments` (
    `id`          INT          NOT NULL AUTO_INCREMENT,
    `title`       VARCHAR(255) NOT NULL,
    `description` TEXT         DEFAULT NULL,
    `status`      ENUM('active','inactive') NOT NULL DEFAULT 'active',
    `created_at`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================================
--  3) questions : คำถามในแบบประเมิน (ตารางใหม่)
--     คำตอบของแต่ละข้อให้คะแนน 0 ถึง max_score
-- =====================================================================

CREATE TABLE IF NOT EXISTS `questions` (
    `id`            INT       NOT NULL AUTO_INCREMENT,
    `assessment_id` INT       NOT NULL,
    `question_text` TEXT      NOT NULL,
    `max_score`     TINYINT   NOT NULL DEFAULT 3,
    `sort_order`    INT       NOT NULL DEFAULT 0,
    `status`        ENUM('active','inactive') NOT NULL DEFAULT 'active',
    `created_at`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `assessment_id` (`assessment_id`, `sort_order`),
    CONSTRAINT `fk_questions_assessment`
        FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================================
--  4) assessment_results : ผลการประเมินของผู้ใช้
--     save_assessment.php บันทึกลงตารางนี้
--     history.html / get_history.php อ่านจากตารางนี้
-- =====================================================================

CREATE TABLE IF NOT EXISTS `assessment_results` (
    `id`            INT         NOT NULL AUTO_INCREMENT,
    `user_id`       INT         NOT NULL,
    `assessment_id` INT         NOT NULL,
    `total_score`   INT         NOT NULL,
    `level`         VARCHAR(50) NOT NULL,
    `result_text`   TEXT        DEFAULT NULL,
    `created_at`    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `user_id` (`user_id`, `created_at`),
    KEY `assessment_id` (`assessment_id`),
    CONSTRAINT `fk_results_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE,
    CONSTRAINT `fk_results_assessment`
        FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================================
--  5) daily_diary : บันทึกประจำวัน (1 วัน = 1 บันทึกต่อผู้ใช้)
--     mood 1-5, symptoms เก็บเป็นข้อความคั่นด้วย ", "
-- =====================================================================

CREATE TABLE IF NOT EXISTS `daily_diary` (
    `id`         INT       NOT NULL AUTO_INCREMENT,
    `user_id`    INT       NOT NULL,
    `mood`       INT       DEFAULT NULL,
    `symptoms`   TEXT      DEFAULT NULL,
    `note`       TEXT      DEFAULT NULL,
    `diary_date` DATE      NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_user_date` (`user_id`, `diary_date`),
    CONSTRAINT `fk_diary_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================================
--  6) doctors : ข้อมูลแพทย์ (ชื่อแพทย์อยู่ที่ users.fullname ผ่าน user_id)
-- =====================================================================

CREATE TABLE IF NOT EXISTS `doctors` (
    `id`           INT          NOT NULL AUTO_INCREMENT,
    `user_id`      INT          NOT NULL,
    `specialty`    VARCHAR(150) DEFAULT NULL,
    `phone`        VARCHAR(30)  DEFAULT NULL,
    `email`        VARCHAR(150) DEFAULT NULL,
    `line_id`      VARCHAR(100) DEFAULT NULL,
    `working_days` VARCHAR(255) DEFAULT NULL,
    `working_time` VARCHAR(100) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `user_id` (`user_id`),
    CONSTRAINT `fk_doctors_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================================
--  7) videos : วิดีโอบำบัด
-- =====================================================================

CREATE TABLE IF NOT EXISTS `videos` (
    `id`          INT          NOT NULL AUTO_INCREMENT,
    `title`       VARCHAR(255) NOT NULL,
    `description` TEXT         DEFAULT NULL,
    `video_url`   TEXT         NOT NULL,
    `thumbnail`   VARCHAR(255) DEFAULT NULL,
    `status`      ENUM('active','inactive') DEFAULT 'active',
    `created_at`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================================
--  8) video_history : ประวัติการดูวิดีโอ (1 คนต่อ 1 วิดีโอ บันทึกครั้งเดียว)
-- =====================================================================

CREATE TABLE IF NOT EXISTS `video_history` (
    `id`         INT       NOT NULL AUTO_INCREMENT,
    `user_id`    INT       NOT NULL,
    `video_id`   INT       NOT NULL,
    `watched_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_user_video` (`user_id`, `video_id`),
    KEY `video_id` (`video_id`),
    CONSTRAINT `fk_vh_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE,
    CONSTRAINT `fk_vh_video`
        FOREIGN KEY (`video_id`) REFERENCES `videos` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================================
--  9) feedback : ข้อความตอบกลับอัตโนมัติตามระดับอาการ (ตารางใหม่)
--     ขอบเขตผู้ดูแล ข้อ 4 : ตั้งค่าระบบถามตอบกลับให้เหมาะกับระดับอาการ
--     ขอบเขตผู้ใช้ ข้อ 4  : ได้รับข้อความและคำแนะนำเบื้องต้นตามระดับ
--     เลือกข้อความจากช่วงคะแนน min_score ถึง max_score ของแบบประเมินนั้น
-- =====================================================================

CREATE TABLE IF NOT EXISTS `feedback` (
    `id`            INT          NOT NULL AUTO_INCREMENT,
    `assessment_id` INT          NOT NULL,
    `level`         VARCHAR(50)  NOT NULL,
    `min_score`     INT          NOT NULL,
    `max_score`     INT          NOT NULL,
    `title`         VARCHAR(255) DEFAULT NULL,
    `message`       TEXT         NOT NULL,
    `status`        ENUM('active','inactive') NOT NULL DEFAULT 'active',
    `created_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                                 ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `assessment_id` (`assessment_id`, `min_score`, `max_score`),
    CONSTRAINT `fk_feedback_assessment`
        FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================================
--  10) alerts : การแจ้งเตือนวิกฤต (ตารางใหม่)
--     ขอบเขตผู้ดูแล ข้อ 6 : รับแจ้งเตือนเมื่อพบผู้ป่วยระดับวิกฤต
--     ขอบเขตผู้ใช้ ข้อ 7  : การแจ้งเตือนเรียลไทม์ภายในแอปพลิเคชัน
--     status : new = ยังไม่มีใครรับทราบ
--              acknowledged = รับทราบแล้ว  resolved = ดำเนินการเสร็จ
-- =====================================================================

CREATE TABLE IF NOT EXISTS `alerts` (
    `id`         INT         NOT NULL AUTO_INCREMENT,
    `user_id`    INT         NOT NULL,
    `result_id`  INT         DEFAULT NULL,
    `level`      VARCHAR(50) NOT NULL DEFAULT 'ระดับสูง',
    `message`    TEXT        NOT NULL,
    `status`     ENUM('new','acknowledged','resolved') NOT NULL DEFAULT 'new',
    `handled_by` INT         DEFAULT NULL,
    `handled_at` DATETIME    DEFAULT NULL,
    `created_at` TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `user_id` (`user_id`),
    KEY `result_id` (`result_id`),
    KEY `handled_by` (`handled_by`),
    KEY `status_created` (`status`, `created_at`),
    CONSTRAINT `fk_alerts_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE,
    CONSTRAINT `fk_alerts_result`
        FOREIGN KEY (`result_id`) REFERENCES `assessment_results` (`id`)
        ON DELETE SET NULL,
    CONSTRAINT `fk_alerts_handler`
        FOREIGN KEY (`handled_by`) REFERENCES `users` (`id`)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================================
--  ข้อมูลเริ่มต้น (INSERT IGNORE : ถ้ามีแล้วจะข้าม ไม่เพิ่มซ้ำ)
-- =====================================================================

-- บัญชีเริ่มต้น (รหัสผ่านเก็บเป็นแฮช bcrypt)
--   admin    / admin123   (id 1)
--   user01   / 123456     (id 2)
--   doctor01 : เข้าสู่ระบบไม่ได้ (หน้า login ยังไม่รองรับบทบาทแพทย์)
-- ** เปลี่ยนรหัสผ่านก่อนใช้งานจริง **

INSERT IGNORE INTO `users`
    (`id`, `username`, `password`, `fullname`, `email`, `phone`, `role`, `status`)
VALUES
    (1, 'admin',
        '$2y$10$SqfwWT9cn1HTEgkTs3YGcuUqQQlkEI3WqR0nRcioMYV0Ov1.CDU4S',
        'ผู้ดูแลระบบ', 'admin@example.com', NULL, 'admin', 'active'),
    (2, 'user01',
        '$2y$10$xcwEFRxspdXu1UhDXAB15eOV.utpwoxZAWBJP5nnzZ6GNwCl8/dyS',
        'ทดสอบ ผู้ใช้งาน01', 'user01@example.com', '0812345678', 'user', 'active'),
    (3, 'doctor01',
        '$2y$10$E9Wzd0CskWdvfwNXeJ1UhuNDD358fmR3ZlBNgObffgxT6X11bvms2',
        'นพ.ตัวอย่าง ใจดี', 'doctor01@example.com', '0812345678', 'doctor', 'active');


-- แบบประเมินชุดที่ 1 (assessment.html ส่ง assessment_id = 1 เสมอ)

INSERT IGNORE INTO `assessments` (`id`, `title`, `description`, `status`)
VALUES
    (1, 'แบบประเมินอาการซึมเศร้า',
        'แบบคัดกรองเบื้องต้น 3 ข้อ ประเมินอาการในช่วงที่ผ่านมา (คะแนนรวม 0-9)',
        'active');

INSERT IGNORE INTO `questions`
    (`id`, `assessment_id`, `question_text`, `max_score`, `sort_order`, `status`)
VALUES
    (1, 1, 'ในช่วงที่ผ่านมา ท่านรู้สึกเศร้า หดหู่ หรือสิ้นหวังบ่อยเพียงใด?',
        3, 1, 'active'),
    (2, 1, 'ท่านรู้สึกเบื่อหรือไม่สนใจสิ่งที่เคยทำหรือไม่?',
        3, 2, 'active'),
    (3, 1, 'ท่านรู้สึกเหนื่อย ไม่มีแรง หรือไม่มีพลังในการทำกิจกรรมต่าง ๆ หรือไม่?',
        3, 3, 'active');


-- ข้อความตอบกลับอัตโนมัติ 3 ระดับ (ช่วงคะแนนตรงกับ save_assessment.php)

INSERT IGNORE INTO `feedback`
    (`id`, `assessment_id`, `level`, `min_score`, `max_score`, `title`, `message`, `status`)
VALUES
    (1, 1, 'ระดับต่ำ', 0, 3, 'อาการอยู่ในระดับต่ำ',
        'ควรดูแลสุขภาพจิตและติดตามอาการของตนเองอย่างต่อเนื่อง เช่น นอนหลับให้เพียงพอ ออกกำลังกายเบา ๆ และพูดคุยกับคนที่ไว้ใจ',
        'active'),
    (2, 1, 'ระดับปานกลาง', 4, 6, 'อาการอยู่ในระดับปานกลาง',
        'ควรติดตามอาการอย่างสม่ำเสมอ บันทึกอารมณ์ประจำวัน และพิจารณาปรึกษาผู้เชี่ยวชาญหากอาการไม่ดีขึ้น',
        'active'),
    (3, 1, 'ระดับสูง', 7, 9, 'อาการอยู่ในระดับสูง',
        'ควรติดต่อบุคลากรทางการแพทย์หรือผู้เชี่ยวชาญเพื่อประเมินเพิ่มเติม หากรู้สึกแย่มากหรือมีความคิดทำร้ายตนเอง โทรสายด่วนสุขภาพจิต 1323 (ตลอด 24 ชั่วโมง) ได้ทันที',
        'active');


-- แพทย์ตัวอย่าง (ผูกกับบัญชี doctor01)

INSERT IGNORE INTO `doctors`
    (`id`, `user_id`, `specialty`, `phone`, `email`, `line_id`, `working_days`, `working_time`)
SELECT
    1, `id`, 'จิตแพทย์', '0812345678', 'doctor01@example.com',
    '@doctor01', 'จันทร์ - ศุกร์', '09:00 - 16:00'
FROM `users`
WHERE `username` = 'doctor01';


-- วิดีโอ: ยังไม่ใส่ข้อมูลตัวอย่าง เพราะต้องใช้ลิงก์จริง
-- ตัวอย่างการเพิ่ม (เอาเครื่องหมาย -- ออกแล้วแทนลิงก์ด้วยลิงก์วิดีโอจริง):
--
-- INSERT INTO `videos` (`title`, `description`, `video_url`, `thumbnail`, `status`)
-- VALUES ('ฝึกหายใจคลายเครียด', 'วิดีโอสำหรับผ่อนคลาย',
--         'https://www.youtube.com/watch?v=ใส่รหัสวิดีโอ', NULL, 'active');

# 🌿 ระบบดูแลสุขภาพใจ (Mental Health Support Web Application)

เว็บแอปพลิเคชันสำหรับการคัดกรองและประเมินสภาวะสุขภาพจิต การบันทึกอาการและอารมณ์ประจำวัน สื่อวิดีโอบำบัดผ่อนคลายความเครียด และระบบติดต่อให้คำปรึกษากับผู้เชี่ยวชาญ พร้อมระบบบริหารจัดการข้อมูลสำหรับผู้ดูแลระบบ (Admin)

---

## ✨ คุณสมบัติเด่นของระบบ (Features)

### 👤 ฝั่งผู้ใช้งานทั่วไป (User Features)
- **ระบบเข้าสู่ระบบปลอดภัย (Secure Authentication):** ตรวจสอบสิทธิ์ผ่านฐานข้อมูล MySQL ด้วยการเข้ารหัสผ่านแบบ Bcrypt (`password_verify`)
- **แบบประเมินสุขภาพจิต (Mental Health Assessment):** รองรับแบบคัดกรอง 2Q และ 9Q คำนวณคะแนนและวิเคราะห์ระดับความเสี่ยง (ปกติ, เล็กน้อย, ปานกลาง, รุนแรง) พร้อมคำแนะนำเชิงการแพทย์
- **ประวัติการประเมิน (Assessment History):** บันทึกและเรียกดูประวัติผลการประเมินย้อนหลังของตนเอง
- **สมุดบันทึกอาการและอารมณ์ (Mood & Symptom Diary):** บันทึกระดับอารมณ์และอาการในแต่ละวัน
- **วิดีโอบำบัด (Video Therapy):** รับชมวิดีโอฝึกสมาธิ การฝึกหายใจ และดนตรีผ่อนคลายความเครียดผ่าน YouTube Embed Player ภายในเว็บ พร้อมระบบบันทึกประวัติการรับชม
- **ปรึกษาผู้เชี่ยวชาญ (Consultation Directory):** ค้นหารายชื่อจิตแพทย์และนักจิตวิทยาคลินิก พร้อมเวลาทำการและช่องทางติดต่อ
- **จัดการโปรไฟล์ส่วนตัว (User Profile):** แก้ไขข้อมูลชื่อ-นามสกุล เบอร์โทรศัพท์ อีเมล และเปลี่ยนรหัสผ่าน

### 🛡️ ฝั่งผู้ดูแลระบบ (Admin Features)
- **ภาพรวมระบบ (Admin Dashboard):** แสดงสถิติจำนวนผู้ใช้งาน สถิติผลการประเมิน และภาพรวมสุขภาพจิตของผู้ใช้
- **จัดการแบบประเมินและผู้ใช้งาน (User & Assessment Management):** ตรวจสอบและจัดการสถานะบัญชีผู้ใช้งาน
- **จัดการวิดีโอบำบัด (Video Management):** เพิ่ม ลบ แก้ไขคลิปวิดีโอ YouTube พร้อมระบบดึงภาพหน้าปก (Thumbnail) อัตโนมัติ

---

## 🛠️ เทคโนโลยีที่ใช้ในการพัฒนา (Tech Stack)

- **Frontend:** HTML5, Modern CSS3 (ธีมสี Emerald Teal `#0e5c54`, Responsive Design, SVG Icons 100%), Vanilla JavaScript (ES6+)
- **Backend:** PHP 8+ (RESTful API Architecture, Session Management, PDO Prepared Statements)
- **Database:** MySQL / MariaDB (utf8mb4 encoding)
- **Web Server:** Apache (รองรับการรันผ่าน XAMPP)

---

## 🚀 ขั้นตอนการติดตั้งและใช้งาน (Installation & Setup)

### 1. ความต้องการของระบบ (Prerequisites)
- [XAMPP](https://www.apachefriends.org/) (PHP 8.0 ขึ้นไป และ MySQL/MariaDB)
- เว็บบราวเซอร์ เช่น Google Chrome, Microsoft Edge หรือ Safari

### 2. ติดตั้งโค้ดใน XAMPP
1. Clone หรือคัดลอกโฟลเดอร์โปรเจกต์นี้ไปไว้ที่โฟลเดอร์ `htdocs` ของ XAMPP:
   ```bash
   C:\xampp\htdocs\mental-health
   ```
   *(หรือ `D:\xampp\htdocs\mental-health` ตามไดรฟ์ที่ติดตั้ง)*

### 3. นำเข้าฐานข้อมูล (Import Database)
1. เปิด **XAMPP Control Panel** แล้วกด **Start** ที่โมดูล **Apache** และ **MySQL**
2. เปิดเบราว์เซอร์แล้วไปที่ [http://localhost/phpmyadmin/](http://localhost/phpmyadmin/)
3. สร้างฐานข้อมูลใหม่ชื่อ: `mental_health` (Collation: `utf8mb4_unicode_ci`)
4. ไปที่แท็บ **Import (นำเข้า)** แล้วเลือกไฟล์:
   ```text
   database/mental_health.sql
   ```
5. กดปุ่ม **Import (ไป)** เพื่อนำเข้าตารางและข้อมูลเริ่มต้น

### 4. การตั้งค่าการเชื่อมต่อฐานข้อมูล
ไฟล์ตั้งค่าฐานข้อมูลอยู่ที่ [`config/database.php`](config/database.php):
```php
$db_host = '127.0.0.1';
$db_port = 3306;
$db_name = 'mental_health';
$db_user = 'root';
$db_pass = ''; // ค่าเริ่มต้นของ XAMPP รหัสผ่านจะว่าง
```

### 5. เปิดเข้าใช้งานระบบ
- **หน้าเข้าสู่ระบบ:** [http://localhost/mental-health/login.html](http://localhost/mental-health/login.html)
- **ตรวจสอบสถานะการเชื่อมต่อฐานข้อมูล:** [http://localhost/mental-health/api/db_status.php](http://localhost/mental-health/api/db_status.php)

---

## 🔑 บัญชีผู้ใช้เริ่มต้นสำหรับทดสอบระบบ (Default Credentials)

| บทบาท (Role) | Username | Password | สิทธิ์การเข้าถึง |
| :--- | :--- | :--- | :--- |
| **ผู้ดูแลระบบ (Admin)** | `admin` | `admin123` | เข้าถึงแผงควบคุม Admin Dashboard |
| **ผู้ใช้งานทั่วไป (User)** | `user01` | `123456` | ใช้งานแบบประเมิน บันทึกอารมณ์ และวิดีโอ |

---

## 📁 โครงสร้างโฟลเดอร์ของโปรเจกต์ (Project Structure)

```text
mental-health/
├── admin/                  # หน้าเว็บและแผงควบคุมสำหรับ Admin
│   ├── dashboard.html
│   └── videos.html
├── api/                    # Backend API (PHP)
│   ├── check_session.php
│   ├── db_status.php
│   ├── diary.php
│   ├── doctors.php
│   ├── get_history.php
│   ├── login.php
│   ├── logout.php
│   ├── profile.php
│   ├── save_assessment.php
│   └── videos.php
├── config/                 # ไฟล์คอนฟิกฐานข้อมูลและฟังก์ชันความปลอดภัย
│   ├── api_helpers.php
│   ├── auth.php
│   └── database.php
├── css/                    # สไตล์ชีตทั้งหมดของระบบ
├── database/               # ไฟล์สคริปต์ SQL ฐานข้อมูล
│   └── mental_health.sql
├── js/                     # สคริปต์ JavaScript สำหรับจัดการหน้าเว็บและ API
│   ├── admin.js
│   ├── auth-guard.js
│   ├── login.js
│   ├── user-common.js
│   └── user.js
├── user/                   # หน้าเว็บสำหรับผู้ใช้งานทั่วไป
│   ├── assessment.html
│   ├── consultation.html
│   ├── contact.html
│   ├── dashboard.html
│   ├── diary.html
│   ├── history.html
│   ├── profile.html
│   ├── result.html
│   └── videos.html
├── index.php               # จุดเริ่มต้นนำทางไปยัง login.html
├── login.html              # หน้าเข้าสู่ระบบ
├── .gitignore              # ไฟล์ยกเว้นการติดตามของ Git
└── README.md               # เอกสารคู่มือโครงการ
```

---

## 🔒 มาตรการความปลอดภัย (Security Measures)
- **Password Hashing:** เข้ารหัสผ่านด้วยฟังก์ชัน `password_hash()` แบบ `PASSWORD_BCRYPT`
- **SQL Injection Prevention:** ใช้ PDO Prepared Statements และ Parameter Binding ทุกจุดเชื่อมต่อข้อมูล
- **Session Security:** ใช้ `session_regenerate_id(true)` ป้องกัน Session Fixation
- **Role-Based Access Control:** ตรวจสอบสิทธิ์ของแต่ละหน้าและ API อย่างเข้มงวด

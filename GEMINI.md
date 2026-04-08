# 🎥 CCTV Monitoring System - Development State

## 📍 สถานะปัจจุบัน (Current Progress)
- [x] **Backend Foundation:** Express + Prisma + MariaDB เชื่อมต่อสำเร็จ
- [x] **Authentication:** ระบบ Login (JWT) และ Middleware (verifyToken) ทำงานได้จริง
- [x] **Camera Management:** API CRUD สำหรับจัดการข้อมูลกล้องเสร็จสมบูรณ์
- [x] **Group Management:** API CRUD สำหรับจัดกลุ่มพื้นที่ (Zones) และตั้งค่า Telegram
- [x] **Health Check Service:** ระบบเช็คสถานะกล้องอัตโนมัติ (node-cron) และแจ้งเตือนผ่าน Telegram
- [x] **Frontend Shell:** React + Vite + Tailwind CSS + MainLayout (Sidebar/Header)
- [x] **Interactive Map:** Leaflet พล็อตจุด Marker ตามพิกัดจริงและสลับสีตามสถานะ Online/Offline
- [x] **Streaming Integration:** ระบบ WebRTC Player (Frontend) และ Stream Info API (Backend) พร้อมเชื่อมต่อ go2rtc

## 🛠️ Tech Stack & Ports
- **Frontend:** http://localhost:3000 (Vite)
- **Backend:** http://localhost:5000 (Express)
- **Database:** MariaDB (Database name: `cctv_db` on IP 10.0.0.16)
- **Streaming Gateway:** go2rtc (Expected on port 1984)

## 🎯 เป้าหมายถัดไป (Next Tasks)
1. **Fine-tuning Streaming:** ทดสอบการแสดงผลวิดีโอจริงผ่าน go2rtc
2. **Settings Page:** สร้างหน้าตั้งค่าระบบ (Global Settings)
3. **Audit Logs UI:** สร้างหน้าแสดงประวัติการเข้าใช้งานและประวัติกล้องดับ
4. **AI Features:** พัฒนาส่วน AI Prompt ตามที่วางแผนไว้ใน Schema

## 📝 บันทึกถึง Gemini
- ระบบนี้เน้น **Generic Grouping** ไม่ระบุเจาะจงระดับตำบล/อำเภอ เพื่อให้ยืดหยุ่น
- การแสดงผล Groups ต้องเป็นแบบ **Table** (ไม่ใช่ Card)
- ทุกครั้งที่เริ่มงานใหม่ ให้รัน `codebase_investigator` เพื่อซิงค์ความเข้าใจโครงสร้างไฟล์ล่าสุด

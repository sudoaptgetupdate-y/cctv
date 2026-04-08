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
- [x] **Fine-tuning Streaming:** แก้ไขปัญหา Registration 400 Error, ลดอาการสะดุดด้วย Relay Mode (CPU 0%), และปรับปรุง WebRTC Stability สำเร็จ

## 🛠️ Tech Stack & Ports
... (unchanged)

## 🎯 เป้าหมายถัดไป (Next Tasks)
1.  **AI Features:** พัฒนาส่วน AI Prompt ตามที่วางแผนไว้ใน Schema (Next Focus)
2.  [ ] **System Dashboard:** เพิ่มกราฟสถิติจำนวนกล้องที่ Online/Offline

## 📝 บันทึกถึง Gemini
- ระบบนี้เน้น **Generic Grouping** ไม่ระบุเจาะจงระดับตำบล/อำเภอ เพื่อให้ยืดหยุ่น
- การแสดงผล Groups ต้องเป็นแบบ **Table** (ไม่ใช่ Card)
- **Streaming Note:** ปัจจุบันใช้ **Relay Mode (Direct RTSP)** เป็นหลักเพื่อประหยัด CPU 0% และประหยัด Bandwidth ขาเข้าเซิร์ฟเวอร์ (Multiplexing)
- **WebRTC Note:** ปรับปรุง `go2rtc.yaml` ให้รองรับ ICE ในวงแลน (STUN + Candidates) แล้ว
- ทุกครั้งที่เริ่มงานใหม่ ให้รัน `codebase_investigator` เพื่อซิงค์ความเข้าใจโครงสร้างไฟล์ล่าสุด

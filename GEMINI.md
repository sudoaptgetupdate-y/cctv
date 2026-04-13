# 🎥 CCTV Monitoring System - Development State

> [!IMPORTANT]
> **กฎเหล็กของการพัฒนา (Critical Rule):**
> ฉันพัฒนา 2 Server ควบคู่กันไปเสมอ:
> 1. **Local PC Dev:** ใช้ `nodemon` รัน Backend ตรงๆ และเชื่อมต่อ Database 10.0.0.16
> 2. **Virtual Production:** ใช้งานบน `Ubuntu + Docker` (Docker Compose)
> 
> **ห้ามทำการแก้ไขโค้ดที่ทำให้ฝั่ง Local Dev พัง (เช่น การเปลี่ยนโครงสร้าง URL หรือ Endpoint) โดยเด็ดขาด การแก้ไขใดๆ ต้องรองรับทั้ง 2 สภาพแวดล้อมเสมอ**

---

## ⚖️ มาตรฐานการพัฒนา (Development Standards)
- **UX/UI Standard:** ใช้หน้า **Camera Groups** เป็นต้นแบบในการพัฒนาหน้าอื่นๆ เสมอ (Mandatory)
- **กฎเหล็กสำหรับการสร้างหน้าใหม่ (New Page Requirements):**
    1. **Real-time Validation:** ต้องมีระบบตรวจสอบข้อมูลซ้ำ (Duplicate Check) ขณะพิมพ์ (Debounced 500ms) และแสดง Error Message ใต้ Input ทันที
    2. **i18n Support:** ข้อความ Label, Placeholder, Tooltip และ Message ทั้งหมดต้องผ่านระบบ `t()` (รองรับ TH/EN 100%)
    3. **Consistent Feedback:** 
        - ใช้ **SweetAlert2** สำหรับการยืนยัน (Confirmation) และการเตือนระดับรุนแรง (Warning/Error)
        - ใช้ **react-hot-toast** สำหรับแจ้งสถานะการทำงานทั่วไป (Success/Info)
    4. **Submit Protection:** ทุกฟอร์มต้องมี `isSubmitting` state เพื่อแสดง Loader ในปุ่มและ Disable ปุ่มขณะบันทึกข้อมูล
    5. **Empty & Loading States:** ทุกหน้าที่มีตาราง/รายการ ต้องมีการจัดการสถานะ Loading (Spinner) และ No Data (Empty Icon) ให้สวยงาม

## 📍 สถานะปัจจุบัน (Current Progress)
- [x] **Backend Foundation:** Express + Prisma + MariaDB เชื่อมต่อสำเร็จ
- [x] **Authentication:** ระบบ Login (JWT) และ Middleware (verifyToken) ทำงานได้จริง
- [x] **Camera Management:** API CRUD สำหรับจัดการข้อมูลกล้องเสร็จสมบูรณ์
- [x] **Group Management:** API CRUD สำหรับจัดกลุ่มพื้นที่ (Zones) และตั้งค่า Telegram
- [x] **Health Check Service:** ระบบเช็คสถานะกล้องอัตโนมัติ (node-cron) และแจ้งเตือนผ่าน Telegram
- [x] **Frontend Shell:** React + Vite + Tailwind CSS + MainLayout (Sidebar/Header)
- [x] **Streaming Strategy:** 
    - ใช้ **2-Step Registration** (Source Mapping) เพื่อแก้ปัญหา 15fps และ Resolution
    - ใช้ **Source `_src`** สำหรับ URL ดิบ และตัวหลักผ่าน **FFmpeg Transcode**
- [x] **Audio Excellence:** รองรับการเปิด-ปิดเสียง 100% พร้อมระบบ **OPUS Transcoding** เพื่อความเสถียรบน HTTPS (Production)
- [x] **Robust Heartbeat:** ใช้ Raw SQL `ON DUPLICATE KEY UPDATE` เพื่อความเสถียรสูงสุด (รองรับ Concurrency)
- [x] **Responsive Support:** ปรับจูน UI สำหรับมือถือ (Sidebar Backdrop, Video Preview)
- [x] **Deployment Ready:** คู่มือ Docker Setup และ Nginx Proxy สมบูรณ์แบบ รองรับ WebSocket และ SSL
- [x] **Enhance UX & Validation:** ระบบ Real-time Validation (ขณะพิมพ์), SweetAlert2, และ react-hot-toast สมบูรณ์แบบ
- [x] **Full i18n Support:** รองรับ 2 ภาษา (TH/EN) ครบถ้วนในหน้าจัดการกล้องและกลุ่ม
- [x] **Multi-group Camera Support:** 1 กล้องสามารถอยู่ได้หลายกลุ่ม (Many-to-Many)
- [x] **Advanced Map Interaction:** ระบบซูมเข้าหากล้องอัตโนมัติ (FlyTo) และจัดวาง Modal ตามพิกัดจริงบนจอ

## 🛠️ Tech Stack & Ports
- Frontend: Vite + React (Port 3000)
- Backend: Node.js + Express (Port 5000)
- Database: MariaDB (Local: 10.0.0.16 / Prod: Docker Container)
- Streaming: go2rtc (Windows exe / Docker Container)

---

## 🎯 เป้าหมายถัดไป (Next Tasks)
1. [ ] **Advanced Analytics:** ระบบสรุปสถิติผ่าน Dashboard (Chart.js)
2. [ ] **Interactive Telegram Bot:** พัฒนา Webhook ให้ Bot ตอบโต้ด้วย AI
3. [ ] **Snapshot Service:** บันทึกภาพนิ่งลง Server

---

## 🤖 Gemini Execution Commands
สำหรับการเรียกใช้งาน Gemini ในโปรเจ็คนี้ (ใช้ใน Terminal):
```bash
gemini "objective" --path D:\1.Development\dev-cctv\cctv
```

## 📝 บันทึกถึง Gemini
- **Routing Note:** ห้ามเปลี่ยนโครงสร้าง API Path โดยไม่ได้รับอนุญาต เพราะจะทำให้ Frontend ฝั่ง Dev พัง
- **Viewer Counting:** ใช้ตาราง `ViewingSession` ใน DB และ Heartbeat จาก Frontend ห้ามใช้เลขจาก go2rtc
- **Testing:** ทุกการแก้ไขต้องทดสอบบน Local Dev (Windows) ให้ผ่านก่อนเป็นอันดับแรก
---

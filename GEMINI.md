# 🎥 CCTV Monitoring System - Development State

##สำคัญ ฉันพัฒนา 2 server ควบคู่กันไปครับ 
- local pc dev ฉันใช้ nodemon run dev และเชื่อมต่อ db 10.0.0.16
- virtual production ใช้งาน ubuntu และ docker [text](DOCKER_SETUP.md)

## 📍 สถานะปัจจุบัน (Current Progress)
- [x] **Backend Foundation:** Express + Prisma + MariaDB เชื่อมต่อสำเร็จ
- [x] **Authentication:** ระบบ Login (JWT) และ Middleware (verifyToken) ทำงานได้จริง
- [x] **Camera Management:** API CRUD สำหรับจัดการข้อมูลกล้องเสร็จสมบูรณ์
- [x] **Group Management:** API CRUD สำหรับจัดกลุ่มพื้นที่ (Zones) และตั้งค่า Telegram
- [x] **Health Check Service:** ระบบเช็คสถานะกล้องอัตโนมัติ (node-cron) และแจ้งเตือนผ่าน Telegram
- [x] **Frontend Shell:** React + Vite + Tailwind CSS + MainLayout (Sidebar/Header)
- [x] **Interactive Map:** Leaflet พล็อตจุด Marker ตามพิกัดจริงและสลับสีตามสถานะ Online/Offline
- [x] **Streaming Integration:** ระบบ WebRTC Player (Frontend) และ Stream Info API (Backend) พร้อมเชื่อมต่อ go2rtc
- [x] **Hybrid Stream Strategy:** ระบบสลับโหมด Pass-through (Low CPU) และ Transcoding (High Quality) รายกล้อง พร้อมคำสั่ง Force Sync ล้าง Cache ทันทีที่เปลี่ยน URL
- [x] **Camera Settings Evolution:** รองรับการเลือก Main/Sub Stream, เปิด-ปิดเสียง และกำหนดค่า Resolution/FPS แบบ Manual ที่มีผลต่อการ Transcode จริง
- [x] **Dynamic Stream Switching:** เพิ่มปุ่มสลับ HD/SD ในหน้าต่าง Preview ทันที พร้อมระบบตรวจจับ Codec/Mode อัตโนมัติ
- [x] **Separate Transcoding Config:** เพิ่มฟิลด์ฐานข้อมูลและ UI สำหรับตั้งค่า Resolution/FPS แยกอิสระระหว่าง Main และ Sub Stream
- [x] **Robust Viewer Count (Production Grade):** 
    - ยกเลิกการใช้ตัวเลขจาก go2rtc (ที่ไม่นิ่ง) และเปลี่ยนมาใช้ระบบ **Heartbeat (Node.js + Database)**
    - ระบบนับจำนวนคนดูจริงแบบรายกล้อง (Per Camera) แม่นยำ 100% ไม่ว่าจะดู HD หรือ SD
    - มีระบบ Auto-Cleanup ล้าง Session ที่หมดอายุอัตโนมัติผ่าน Cron Job
- [x] **Advanced Streaming Stability:** 
    - ระบบ **MSE Quick Start & WebRTC Upgrade:** เริ่มภาพด้วย MSE ทันทีและสลับเป็น WebRTC อัตโนมัติเมื่อพร้อม
    - แก้ปัญหาจอดำตอนสลับกล้องด้วย **React Key Strategy** (Full Component Remount) และ **Explicit Cleanup**
    - ระบบ **Smart Sync:** Backend จะสั่ง Re-register สตรีมเฉพาะเมื่อจำเป็น (Offline หรือ Config เปลี่ยน) ป้องกันสตรีมกระตุก
- [x] **Local Library Hosting:** ย้าย Streaming Engine มา Host เองในโปรเจ็คเพื่อแก้ปัญหา MIME type และความเสถียร
- [x] **Public Dashboard UI:** ระบบซ่อนข้อมูลทางเทคนิค (Codec/FPS) ในหน้าสาธารณะเพื่อความสะอาดตา
- [x] **Responsive Support:** ปรับจูน UI สำหรับมือถือ (Sidebar Backdrop, Bottom-docked Video Preview, Auto-close menu)
- [x] **AI Telegram Integration:** เชื่อมต่อ Gemini AI เพื่อวิเคราะห์เหตุการณ์กล้อง Offline และให้คำแนะนำทางเทคนิคผ่าน Telegram Bot อัตโนมัติ
- [x] **User Management (Advanced):** พัฒนาระบบจัดการผู้ใช้เต็มรูปแบบตามต้นแบบ `dev-mkt` (CRUD, Role-based, Activity Log)

## 🛠️ Tech Stack & Ports
- Frontend: Vite + React (Port 3000)
- Backend: Node.js + Express (Port 5000)
- Database: MariaDB (Prisma ORM)
- Streaming: go2rtc (Port 1984, 8554, 8555)
- AI: Google Gemini AI (gemini-1.5-flash)
---

## 🎯 เป้าหมายถัดไป (Next Tasks)
1.  [ ] **Multi-group Camera Support:** พัฒนาให้ 1 กล้องสามารถอยู่ได้หลายกลุ่ม (Multi-select) เพื่อรองรับการแจ้งเตือนเข้ากลุ่ม "All Device" พร้อมกับกลุ่มทีมช่างเฉพาะทางได้ในเวลาเดียวกัน ตัวอย่างจากโปรเจ็ค D:\1.Devoleopment\dev-mkt\mikrotik-config
2.  [ ] **พัฒนา Camera Management ต่อ:** ตรวจสอบระบบ Camera History , Create update delete log , Offline online log , ackowledge problem ตัวอย่าง จากโปรเจ็ค D:\1.Devoleopment\dev-mkt\mikrotik-config
3.  [ ] **Advanced Analytics:** ระบบสรุปสถิติรายสัปดาห์/รายเดือนผ่านหน้า Dashboard (Chart.js) แนะนำฉันว่าควรมี report อะไรบ้าง เช่น view session per camera หรือ top problem หรืออื่นๆ
4.  [ ] **Interactive Telegram Bot:** พัฒนา Webhook ให้ Bot สามารถตอบโต้และสรุปสถานะระบบด้วย AI เมื่อผู้ใช้สอบถาม
5.  [ ] **Snapshot Service:** ระบบบันทึกภาพนิ่งจากกล้องลง Server เพื่อแสดงผลใน Activity Log และการแจ้งเตือน

## 🤖 Gemini Execution Commands
สำหรับการเรียกใช้งาน Gemini ในโปรเจ็คนี้ (ใช้ใน Terminal):

### 1. ทำงานเฉพาะโปรเจ็ค CCTV (Standard)
```bash
gemini "objective" --path D:\1.Development\dev-cctv\cctv
```

## 📝 บันทึกถึง Gemini
- **Refactoring Note:** โครงสร้างโฟลเดอร์ใน `src/pages` แบ่งตามฟีเจอร์ชัดเจน และ Shared Components อยู่ใน `src/components`
- **Viewer Counting:** ใช้ตาราง `ViewingSession` ใน DB และ Heartbeat ทุก 15s จาก Frontend ห้ามใช้เลข `consumers` จาก go2rtc สำหรับการทำ Report
- **Streaming Strategy:** ใช้ **Native Player** (video-stream) เชื่อมต่อผ่าน WebSocket/WebRTC โดยตรง และใช้กลยุทธ์ MSE-first เพื่อความเร็วในการโหลด
- ทุกครั้งที่เริ่มงานใหม่ ให้รัน `codebase_investigator` เพื่อซิงค์ความเข้าใจโครงสร้างไฟล์ล่าสุด

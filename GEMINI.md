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
- [x] **Codebase Refactoring:** จัดโครงสร้างไฟล์ใหม่เป็น `pages/PageName/components/` และเปลี่ยนชื่อเป็น `AdminDashboard` และ `CameraGroups`
- [x] **Public Dashboard:** พัฒนาหน้าแสดงผลสาธารณะ (Root Path) พร้อมระบบ Accordion Grouping, Horizontal Category Pills และระบบค้นหา
- [x] **Enhanced UI:** ปรับปรุงแผนที่แบบ Full-screen (Fixed 100% height issue), เพิ่ม Tooltip แสดงข้อมูลขณะ Hover และหน้าต่าง Preview แบบลอย (Draggable Floating Window) ที่รองรับการขยายเต็มจอ
- [x] **Responsive Support:** ปรับจูน UI สำหรับมือถือ (Sidebar Backdrop, Bottom-docked Video Preview, Auto-close menu)
- [x] **AI Telegram Integration:** เชื่อมต่อ Gemini AI เพื่อวิเคราะห์เหตุการณ์กล้อง Offline และให้คำแนะนำทางเทคนิคผ่าน Telegram Bot อัตโนมัติ (รองรับ Dynamic Prompt ตามกลุ่ม)

## 🛠️ Tech Stack & Ports
- Frontend: Vite + React (Port 3000)
- Backend: Node.js + Express (Port 5000)
- Database: MariaDB (Prisma ORM)
- Streaming: go2rtc (Port 1984, 8554, 8555)
- AI: Google Gemini AI (gemini-1.5-flash)

## 🎯 เป้าหมายถัดไป (Next Tasks)
1.  [ ] **MainLayout Redesign:** ปรับโฉมหน้า Admin ให้เหมือนกับโปรเจ็ค `dev-mkt` (กำลังจะทำใน Session ถัดไป)
2.  [ ] **Acknowledge System:** เพิ่มฟีเจอร์ "รับทราบเหตุการณ์" ใน Camera Event History เพื่อติดตามการแก้ไขปัญหา
3.  [ ] **Interactive Telegram Bot:** พัฒนา Webhook ให้ Bot สามารถตอบโต้และสรุปสถานะระบบด้วย AI เมื่อผู้ใช้สอบถาม

## 🤖 Gemini Execution Commands
สำหรับการเรียกใช้งาน Gemini ในโปรเจ็คนี้ (ใช้ใน Terminal):

### 1. ทำงานเฉพาะโปรเจ็ค CCTV (Standard)
```bash
gemini "objective" --path D:\1.Development\dev-cctv\cctv
```

### 2. ทำงานแบบดึงต้นแบบจากโปรเจ็ค MKT (Hybrid Context)
*ใช้สำหรับเมื่อต้องการให้ Gemini ดูโค้ดจาก dev-mkt เพื่อนำมาปรับปรุง dev-cctv*
```bash
gemini "objective" --path D:\1.Development\dev-cctv\cctv --path D:\1.Development\dev-mkt\mikrotik-config
```

## 📝 บันทึกถึง Gemini
- **Refactoring Note:** โครงสร้างโฟลเดอร์ใน `src/pages` แบ่งตามฟีเจอร์ชัดเจน และ Shared Components อยู่ใน `src/components`
- **Public Dashboard Strategy:** เน้นความง่ายสำหรับประชาชน (Mobile First) และความเร็วในการแสดงผล (WebRTC)
- **UI Logic:** หน้าต่าง Preview วิดีโอจะคำนวณตำแหน่งเริ่มต้นจากพิกัดที่คลิกบนแผนที่ทันที เพื่อไม่ให้เกิดอาการกระตุก (Top-left jump)
- ทุกครั้งที่เริ่มงานใหม่ ให้รัน `codebase_investigator` เพื่อซิงค์ความเข้าใจโครงสร้างไฟล์ล่าสุด

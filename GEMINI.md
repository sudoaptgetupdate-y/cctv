# 🎥 CCTV Monitoring System - Development State

> [!IMPORTANT]
> **กฎเหล็กของการพัฒนา (Critical Rule):**
> ฉันพัฒนา 2 Server ควบคู่กันไปเสมอ:
> 1. **Local PC Dev:** ใช้ `nodemon` รัน Backend ตรงๆ และเชื่อมต่อ Database 10.0.0.16
> 2. **Virtual Production:** ใช้งานบน `Ubuntu + Docker` (Docker Compose)
> 
> **ห้ามทำการแก้ไขโค้ดที่ทำให้ฝั่ง Local Dev พัง (เช่น การเปลี่ยนโครงสร้าง URL หรือ Endpoint) โดยเด็ดขาด การแก้ไขใดๆ ต้องรองรับทั้ง 2 สภาพแวดล้อมเสมอ**

---

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
- [x] **Robust Heartbeat:** ใช้ Raw SQL `ON DUPLICATE KEY UPDATE` เพื่อความเสถียรสูงสุด (รองรับ Concurrency)
- [x] **Responsive Support:** ปรับจูน UI สำหรับมือถือ (Sidebar Backdrop, Video Preview)

## 🛠️ Tech Stack & Ports
- Frontend: Vite + React (Port 3000)
- Backend: Node.js + Express (Port 5000)
- Database: MariaDB (Local: 10.0.0.16 / Prod: Docker Container)
- Streaming: go2rtc (Windows exe / Docker Container)

---

## 🎯 เป้าหมายถัดไป (Next Tasks)
1. [ ] **Multi-group Camera Support:** 1 กล้องสามารถอยู่ได้หลายกลุ่ม
2. [ ] **Advanced Analytics:** ระบบสรุปสถิติผ่าน Dashboard (Chart.js)
3. [ ] **Interactive Telegram Bot:** พัฒนา Webhook ให้ Bot ตอบโต้ด้วย AI
4. [ ] **Snapshot Service:** บันทึกภาพนิ่งลง Server

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

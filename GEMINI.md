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
- **UX/UI Standard:** ใช้หน้า **Camera Groups** เป็นต้นแบบในการพัฒนาหน้าอื่นๆ เสมอ (Card UI + Modal สองคอลัมน์)
- **กฎเหล็กสำหรับการสร้างหน้าใหม่ (New Page Requirements):**
    1. **Real-time Validation:** ต้องมีระบบตรวจสอบข้อมูลซ้ำ (Duplicate Check) ขณะพิมพ์ (Debounced 500ms)
    2. **i18n Support:** รองรับ TH/EN 100% ผ่านระบบ `t()`
    3. **Consistent Feedback:** ใช้ **SweetAlert2** สำหรับการยืนยัน และ **react-hot-toast** สำหรับแจ้งสถานะทั่วไป
    4. **Submit Protection:** มี `isSubmitting` state ทุกฟอร์ม
    5. **Sticky Pagination:** ใช้คอมโพเนนต์ Pagination สี Indigo แบบลอยตัวที่ท้ายตารางเสมอ

## 📍 สถานะปัจจุบัน (Current Progress)
- [x] **Backend Foundation:** Express + Prisma + MariaDB (Many-to-Many Relationships)
- [x] **Authentication:** ระบบ Login (JWT) และ Middleware ครบถ้วน
- [x] **Camera Management:** จัดการข้อมูลกล้อง พร้อมระบบจัดหมวดหมู่แบบหลายกลุ่ม
- [x] **Group Management:** UI รูปแบบ Card พร้อมระบบจัดการสมาชิกแบบ 2 คอลัมน์ (เหมือน MKT)
- [x] **Automatic Grouping:** ระบบเพิ่มกลุ่ม "All Camera" ให้กล้องใหม่โดยอัตโนมัติ
- [x] **Health Check & Notifications:** แจ้งเตือนผ่าน Telegram แยกตามกลุ่มที่สังกัด
- [x] **Advanced UX:** ระบบ Auto-zoom (FlyTo) ในหน้า Dashboard และ Streaming Modal ที่ปรับพิกัดตามหน้าจอจริง
- [x] **UI Overhaul:** ปรับปรุง Create/Edit Modal ให้เป็นสัดส่วน (Logical Sections) สวยงามและใช้งานง่าย
- [x] **Performance Optimization:** ปรับปรุง API สำหรับจัดการสมาชิกให้เป็นแบบ "Lean" (ส่งเฉพาะข้อมูลที่จำเป็น) ลด Latency เหลือ < 20ms ในระบบจริง
- [x] **Visitor Analytics:** ระบบเก็บสถิติผู้เข้าชมหน้า Public Dashboard และการคลิกดูสตรีมกล้องแยกตามรายตัว
- [x] **Advanced Reporting:** หน้าจอสรุปสถิติ (Reports) พร้อมกราฟวิเคราะห์แนวโน้ม (Chart.js) รองรับการเลือกช่วงเวลาแบบ Hybrid (Raw/Summary Data) เพื่อความรวดเร็ว

## 🛠️ Tech Stack & Ports
...
- Streaming: go2rtc (Windows exe / Docker Container)
- Analytics: Chart.js + React-Chartjs-2

---

## 🎯 เป้าหมายถัดไป (Next Tasks)
1. [ ] **Summary Report Export:** ระบบส่งออกรายงานเป็นไฟล์ PDF หรือ Excel
2. [ ] **Interactive Telegram Bot:** พัฒนา Webhook ให้ Bot ตอบโต้ด้วย AI
3. [ ] **Snapshot Service:** บันทึกภาพนิ่งลง Server

---

## 🤖 Gemini Execution Commands
สำหรับการเรียกใช้งาน Gemini ในโปรเจ็คนี้ (ใช้ใน Terminal):
```bash
gemini "objective" --path D:\1.Development\dev-cctv\cctv
```

## 📝 บันทึกถึง Gemini
- **Lean API Policy:** ห้ามดึงข้อมูล Full Object มาใช้ใน Modal ที่แสดงแค่รายชื่อ (เช่น Membership Modal) ให้ดึงเฉพาะ ID, Name, RTSP
- **Latency Note:** หากพบ Delay 4000ms+ บน Local PC ให้ตรวจสอบการเชื่อมต่อ DNS หรือ Antivirus เพราะบน Production ทำงานได้ < 20ms
- **Testing:** ทุกการแก้ไขต้องทดสอบบน Local Dev (Windows) และตรวจสอบผลลัพธ์บน Virtual Production (Linux) เสมอ
---

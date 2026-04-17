# 🎥 CCTV Monitoring System - Development State

> [!IMPORTANT]
> **กฎเหล็กของการพัฒนา (Critical Rule):**
> คุยหรืออธิบายภาษาไทย
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
    2. **Bilingual Standard (i18n):** รองรับ TH/EN 100%
        - ห้าม Hardcode ข้อความใน Component ให้ใช้ `t('key')` เท่านั้น
        - ทุก `useMemo`/`useEffect` ที่แสดงผลข้อความต้องมี `i18n.language` ใน Dependency array
        - จัดการรูปแบบวันที่ผ่าน `date-fns` ตาม Locale ปัจจุบันเสมอ
    3. **Consistent Feedback:** ใช้ **SweetAlert2** สำหรับการยืนยัน และ **react-hot-toast** สำหรับแจ้งสถานะทั่วไป
    4. **Submit Protection:** มี `isSubmitting` state ทุกฟอร์ม
    5. **Sticky Pagination:** ใช้คอมโพเนนต์ Pagination สี Indigo แบบลอยตัวที่ท้ายตารางเสมอ
    6. **Component Architecture:** สำหรับหน้าที่ซับซ้อน ให้แยก Sub-components ไว้ในโฟลเดอร์ `components/` ภายใต้นั้น (เช่น `src/pages/Reports/components/`)
        - **Logic & UI Separation:** หน้าหลัก (Main Page) จัดการเฉพาะ State, Data Fetching และ Business Logic ส่วน Sub-components รับข้อมูลผ่าน Props เพื่อแสดงผลเท่านั้น
        - **Independent i18n:** ทุก Sub-component ต้องรองรับ i18n 100% โดยใช้ `useTranslation` ภายในตัวคอมโพเนนต์เอง
    7. **Modal Architecture Standard:**
        - ใช้ **Headless UI (Dialog, Transition)** เท่านั้น เพื่อความเสถียรของ Animation
        - **Z-Index Standard:** กำหนดเป็น `z-[1060]` เพื่อให้ทับส่วนของ Sidebar และ Header หลักเสมอ
        - **Layout Structure:** แบ่งเป็น 3 ส่วนชัดเจน:
            - **Header:** มี Icon Gradient, Title และ Subtitle ภาษาอังกฤษ (Tracking-widest)
            - **Body:** เนื้อหาหลักต้องรองรับการ Scroll (`max-h-[70vh] overflow-y-auto`)
            - **Footer:** ปุ่มยกเลิกอยู่ซ้าย, ปุ่มบันทึกอยู่ขวา พร้อมเงา `shadow-xl` และ `active:scale-95`

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
- [x] **Advanced Reporting:** หน้าจอสรุปสถิติ (Reports) พร้อมกราฟวิเคราะห์แนวโน้ม (Chart.js) รองรับระบบวิเคราะห์เชิงลึก (Trends, Peak Time, Tech Stats)
- [x] **Universal Audio Control:** ระบบเปิด-ปิดเสียงที่เสถียร 100% ทั้งโหมดปกติและ Transcoding
- [x] **Enterprise Report Export:** ระบบส่งออก PDF/Excel รองรับ 2 ภาษา (Bilingual) พร้อมส่วนสรุปผู้บริหาร
- [x] **Log Retention Policy:** ระบบตั้งค่าระยะเวลาเก็บข้อมูล (Visitor Logs/Summary) ผ่านหน้า Settings
- [x] **Full Bilingual Support:** หน้า Dashboard และ Reports รองรับการสลับภาษาแบบ Reactive 100%

## 🛠️ Tech Stack & Ports
...
- Streaming: go2rtc (Windows exe / Docker Container)
- Analytics: Chart.js + React-Chartjs-2 + UA-Parser-JS
- Export: ExcelJS + PDFKit (THSarabunNew support)
- i18n: react-i18next + i18next-browser-languagedetector

---

## 🎯 เป้าหมายถัดไป (Next Tasks)
1. [ ] **Interactive Telegram Bot:** พัฒนา Webhook ให้ Bot ตอบโต้ด้วย AI และรายงานสถิติอัตโนมัติ
2. [ ] **Snapshot Service:** ระบบบันทึกภาพนิ่งลง Server เมื่อเกิดเหตุการณ์สำคัญ
3. [ ] **Advanced Filtering:** ระบบค้นหา Log กรองตามประเภทอุปกรณ์หรือเบราว์เซอร์

---

## 🤖 Gemini Execution Commands
สำหรับการเรียกใช้งาน Gemini ในโปรเจ็คนี้ (ใช้ใน Terminal):
```bash
gemini "objective" --path D:\1.Development\dev-cctv\cctv
```

## 📝 บันทึกถึง Gemini
- **Strict i18n Policy:** ห้ามใช้ Default Text ในฟังก์ชัน `t()` เพื่อบังคับให้ดึงจาก `config.js` เท่านั้น ป้องกันปัญหาภาษาไม่เปลี่ยน
- **Lean API Policy:** ห้ามดึงข้อมูล Full Object มาใช้ใน Modal ที่แสดงแค่รายชื่อ ให้ดึงเฉพาะ ID, Name, RTSP
- **Testing:** ทุกการแก้ไขต้องทดสอบบน Local Dev (Windows) และตรวจสอบผลลัพธ์บน Virtual Production (Linux) เสมอ
---

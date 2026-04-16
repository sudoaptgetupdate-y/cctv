# 🎥 CCTV Streaming Technical Knowledge Base

เอกสารฉบับนี้รวบรวมเกร็ดความรู้ คำอธิบายทางเทคนิค และคู่มือการทำงานของระบบ Video Streaming ในโปรเจคนี้ เพื่อใช้เป็นแนวทางในการพัฒนาและดูแลรักษา (Maintenance)

---

## 1. สถาปัตยกรรมระบบ (System Architecture)

ระบบ Streaming ของเราใช้โมเดล **Hybrid Gateway** โดยมีส่วนประกอบหลักดังนี้:
*   **Backend (Node.js/Express):** ทำหน้าที่เป็น Controller ควบคุมการสร้าง/ลบสตรีม และจัดการ Config
*   **Streaming Engine (go2rtc):** หัวใจหลักในการดึงสัญญาณ RTSP จากกล้องมาแปลงเป็น WebRTC/MSE
*   **Frontend (React):** ตัวเล่นวิดีโออัจฉริยะที่รองรับการสลับโหมดอัตโนมัติ

---

## 2. การนับจำนวนผู้เข้าชม (Application-Level Viewer Counting)

เพื่อให้ได้ตัวเลขที่แม่นยำระดับ Production เราใช้ระบบ **Heartbeat** ควบคู่กับฐานข้อมูล:

### **Heartbeat Workflow & Stability**
1.  **Unique Session:** เมื่อตัวเล่น `WebRTCPlayer` ถูกโหลด จะสร้าง `sessionId` แบบสุ่มขึ้นมา (ต่อ 1 Browser Tab)
2.  **Robust Persistence:** เพื่อป้องกันปัญหา **Race Condition** เมื่อมีผู้ชมเข้าพร้อมกันจำนวนมาก ระบบใช้ **Raw SQL `ON DUPLICATE KEY UPDATE`** เพื่อให้การบันทึกสถานะเป็นแบบ Atomic 100%
3.  **Active Threshold:** Backend จะนับจำนวนผู้ชมที่มีการส่ง Heartbeat ภายใน 60 วินล่าสุด
4.  **Auto-Cleanup:** มี Cron Job ทำงานทุก 1 นาที เพื่อล้าง Session ที่ค้างเกิน 2 นาที

---

## 3. การเพิ่มประสิทธิภาพ API (Performance Optimization)

เพื่อให้หน้าจอจัดการสมาชิก (Membership Management) ทำงานได้รวดเร็วที่สุด:

### **Lean API Response**
*   **ปัญหา:** การดึงข้อมูลกล้องแบบ Full Object (มีทั้งพิกัด, พาสเวิร์ด, สถานะลึกๆ) มาแสดงใน Modal ที่มีกล้องจำนวนมาก ทำให้ Payload มีขนาดใหญ่และ UI หน่วง
*   **แนวทาง:** ในส่วนการจัดการสมาชิก (เช่น `getGroupById` สำหรับ Manage Modal) Backend จะถูกบังคับให้ดึงข้อมูลเฉพาะฟิลด์ที่จำเป็นเท่านั้น คือ **ID, Name, RTSP URL** ผลลัพธ์ช่วยลดเวลาประมวลผล JSON ลงได้มหาศาล

---

## 4. การจัดการปัญหาความล่าช้า (Latency Debugging)

กรณีพบ API ตอบสนองช้าผิดปกติ (> 4000ms) ในสภาพแวดล้อม Local:

### **DNS & Network Issues**
*   **MariaDB Reverse DNS:** บ่อยครั้งที่ MariaDB พยายามตรวจสอบ IP ของ Client (เครื่อง Dev) ทำให้เกิด Delay 4 วินาที (DNS Timeout) 
*   **วิธีแก้:** ตั้งค่า `skip-name-resolve` ใน MariaDB Config เพื่อปิดการทำงานนี้
*   **Environment Comparison:** หากบน Production (Linux/Docker) ทำงานได้ < 20ms แต่บน Windows ช้า แสดงว่าเป็นปัญหาที่ Networking Stack ของ OS, Firewall หรือ Antivirus ไม่ใช่ปัญหาที่ Code

---

## 5. เทคนิคการจัดการ Many-to-Many (Group Management)

เพื่อให้ 1 กล้องสังกัดได้หลายกลุ่มอย่างเสถียร:

### **Prisma Membership Logic**
*   ใช้คำสั่ง `set` ในการอัปเดตสมาชิกกลุ่ม เพื่อให้ Prisma จัดการลบความสัมพันธ์เก่าและเพิ่มใหม่ใน Transaction เดียวกัน ลดความผิดพลาดของข้อมูล
*   **Auto-Assignment:** ระบบมีการบังคับเพิ่มกลุ่ม "All Camera" (Default Group) ให้กับกล้องใหม่ทุกตัวในระดับ Service เพื่อให้ข้อมูลในหน้า Dashboard ครบถ้วนเสมอ

---

## 6. กลยุทธ์การเล่นวิดีโอ (Streaming Strategy)

### **MSE Quick Start & WebRTC Upgrade**
*   **Global Pre-load:** โหลดไลบรารีที่ `index.html` เพื่อให้ Custom Element `<video-stream>` พร้อมทำงานทันที
*   **Source Mapping (_src):** ลงทะเบียน URL ดิบไว้ที่ชื่อ `camera_ID_src` เพื่อล้างพารามิเตอร์แปลกปลอม ก่อนส่งให้ FFmpeg Transcode วิธีนี้แก้ปัญหาการปรับ FPS และ Resolution ไม่ติดในบางกล้อง

---

## 7. การจัดการระบบเสียง (Audio Strategy for Web)

### **OPUS Transcoding (When Transcode is ON)**
*   บังคับแปลงเสียงเป็น **OPUS** (`#audio=opus`) เมื่อเปิด Transcode เพื่อให้ปุ่มเสียงใช้งานได้จริงบน HTTPS (Production) เนื่องจากเบราว์เซอร์ส่วนใหญ่ไม่รองรับ G.711/AAC ดั้งเดิมผ่าน WebRTC
*   หากสั่งปิดเสียง ระบบจะส่ง `#audio=no` ไปยัง FFmpeg เพื่อตัด Track เสียงออกตั้งแต่ขั้นตอนการ Encode

### **WebRTC Track Filtering (When Transcode is OFF)**
*   **ปัญหา:** การส่ง `#audio=no` ใน RTSP URL ตรงๆ มักถูกละเลยโดย Streaming Engine หรือทำให้การ Handshake ล้มเหลว (จอดำ)
*   **แนวทางแก้ไข:** ใช้การควบคุมที่ระดับ **Protocol Handshake (Frontend)** โดยการตั้งค่าพร็อพเพอร์ตี้ `.media = 'video'` ให้กับ Custom Element `<video-stream>`
*   **ผลลัพธ์:** เบราว์เซอร์จะไม่สร้าง Audio Transceiver ในขั้นตอน WebRTC Negotiation ทำให้ Server ไม่ส่งข้อมูลเสียงข้าม Network มาเลย ช่วยประหยัด Bandwidth และรับประกันความเงียบ 100% โดยไม่ต้องพึ่งพา FFmpeg

---

---

## 9. กลยุทธ์การทำ Visitor Analytics & Reporting

เพื่อให้ระบบรองรับการแสดงผลรายงาน (Report) ทั้งแบบช่วงสั้นและช่วงยาว (สูงสุด 1 ปี) โดยที่ยังคงรักษาประสิทธิภาพความเร็ว < 20ms:

### **Hybrid Data Architecture**
1.  **Raw Logs (`PublicVisitorLog`):** เก็บข้อมูลดิบทุกครั้งที่มีการเข้าชมหน้า Public Dashboard หรือการคลิกดูสตรีม ข้อมูลนี้จะถูกเก็บไว้เป็นเวลา 30-60 วัน เพื่อให้สามารถออกรายงานที่ละเอียดระดับรายชั่วโมง (Hourly) และตรวจสอบ IP รายบุคคลได้
2.  **Summary Table (`PublicVisitorSummary`):** ระบบจะมี Cron Job ทำงานทุกเที่ยงคืนเพื่อสรุปยอดผู้เข้าชมแยกตาม "มิติ" (Dimensions) ได้แก่ วันที่ (Date), ไอดีกล้อง (Camera ID), และประเภทการกระทำ (Action) ข้อมูลสรุปนี้จะถูกเก็บไว้ถาวรเพื่อใช้ในการออกรายงานย้อนหลัง 1-12 เดือนได้อย่างรวดเร็ว

### **Smart Query Logic**
*   **Time-based Switching:** เมื่อมีการเรียกดู Report Backend จะสลับตารางอัจฉริยะ:
    *   **ช่วง < 30 วัน:** ดึงข้อมูลจาก Raw Logs เพื่อความแม่นยำสูงสุด
    *   **ช่วง > 30 วัน:** ดึงข้อมูลจาก Summary Table เพื่อความเร็วในการประมวลผล (Aggregated Data)
*   **Dimensions Preservation:** แม้จะเป็นข้อมูลสรุปรายวัน แต่ยังคงเก็บ Camera ID ไว้ ทำให้ผู้ใช้ยังคงสามารถ Filter ดูรายงานแยกตามกล้องหรือกลุ่มกล้องย้อนหลังเป็นปีได้เหมือนเดิม


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
2.  **Robust Persistence:** เพื่อป้องกันปัญหา **Race Condition** เมื่อมีผู้ชมเข้าพร้อมกันจำนวนมาก ระบบเปลี่ยนจากการใช้ Prisma `upsert` มาใช้ **Raw SQL `ON DUPLICATE KEY UPDATE`** เพื่อให้การบันทึกสถานะเป็นแบบ Atomic 100%
3.  **Active Threshold:** Backend จะนับจำนวนผู้ชมที่มีการส่ง Heartbeat ภายใน 60 วินาทีล่าสุด
4.  **Auto-Cleanup:** มี Cron Job ทำงานทุก 1 นาที เพื่อล้าง Session ที่ค้างเกิน 2 นาที

---

## 3. กลยุทธ์การเล่นวิดีโอ (Streaming Strategy)

เราใช้กลยุทธ์ **"MSE Quick Start & WebRTC Upgrade"** เพื่อประสบการณ์ที่ดีที่สุด:

### **Protocols (วิธีส่งข้อมูล)**
1.  **MSE (Fast Start):** เริ่มดึงภาพผ่าน WebSocket (`/go2rtc-ws`) เพื่อความเร็วในการติดภาพ (1-2 วินาที)
2.  **WebRTC (Auto Upgrade):** ระบบทำ WebRTC Handshake ในพื้นหลังและสลับมาใช้อัตโนมัติเมื่อพร้อม
3.  **Production Proxy:** ในสภาพแวดล้อม Docker ต้องตั้งค่า Nginx ให้รองรับ WebSocket Upgrade อย่างถูกต้องเพื่อให้ท่อวิดีโอไม่ถูกตัด (Connection Refused)

---

## 4. เทคนิคการแก้ปัญหา 15fps และ Resolution (Transcoding Fixes)

เพื่อให้พารามิเตอร์การตั้งค่า (เช่น 10fps หรือ Resolution เฉพาะ) ทำงานได้จริงบนทุก OS:

### **Source Mapping Strategy (_src)**
*   **ปัญหา:** เครื่องหมาย `&` และ `?` ใน URL กล้อง มักทำให้พารามิเตอร์ `#` ของ go2rtc ผิดเพี้ยน
*   **วิธีแก้:** ระบบจะลงทะเบียน URL กล้องดิบไว้ที่ชื่อ **`camera_ID_src`** ก่อน แล้วจึงสร้างสตรีมหลักโดยดึงจาก `_src` อีกที วิธีนี้ช่วยล้าง URL ให้สะอาด ทำให้พารามิเตอร์ `#size` และ `#fps` ส่งถึง FFmpeg ได้อย่างแม่นยำ 100%
*   **Force Refresh:** ทุกครั้งที่มีการเปลี่ยน Config ระบบจะสั่งลบ (DELETE) สตรีมเดิมใน go2rtc ทิ้งก่อน เพื่อล้าง Cache เก่าที่อาจค้างอยู่ที่ 15fps

### **Real-time Status Detection**
*   **Fast Feedback:** ระบบดึงค่า Resolution และ FPS จาก **"FFmpeg Command Source"** โดยตรง แทนการรอการ Probe จาก Engine ทำให้ UI แสดงผลค่าที่ตั้งไว้ได้ทันที (Instant Feedback)

---

## 5. การตั้งค่าระบบบน Production (Nginx Proxy Configuration)

เพื่อให้ระบบทำงานได้เสถียรบน Docker + Linux:

1.  **WebSocket Support:** ต้องมีการตั้งค่า `Upgrade` และ `Connection` header สำหรับเส้นทาง `/go2rtc-ws`
2.  **API Routing:** เส้นทาง `/api/streams/` ทั้งหมดต้องถูกส่งไปยัง Backend (พอร์ต 5000) เพื่อจัดการสถานะคนดูและ Config
3.  **No Buffering:** ปิด `proxy_buffering` สำหรับทุกเส้นทางที่เกี่ยวกับวิดีโอ เพื่อลด Latency

---

## 6. การดูแลรักษาและแก้ไขปัญหา (Maintenance & Troubleshooting)

*   **ล้าง Cache กล้อง:** หากเปลี่ยนค่าแล้วภาพไม่เปลี่ยนตาม ให้สั่ง `docker compose restart go2rtc`
*   **ตรวจสอบสตรีมภายใน:** สามารถเข้าดูสถานะสดของ Engine ได้ที่ `https://cctv.ntnakhon.com/go2rtc-ui/`
*   **Log ตรวจสอบ:**
    *   `docker compose logs -f backend`: ดูการลงทะเบียนกล้องและสถานะ Heartbeat
    *   `docker compose logs -f go2rtc`: ดูสถานะการดึงสัญญาณจากกล้องจริง

---

## 7. Scalability & Performance

*   **One Producer, Many Consumers:** go2rtc ต่อท่อไปที่กล้องเพียง 1 ท่อต่อ 1 สตรีมเท่านั้น
*   **Shared Transcoding:** หากเปิด Transcode ระบบจะรัน FFmpeg เพียง 1 Process ต่อ 1 สตรีม และนำผลลัพธ์ไปแจกจ่ายให้ผู้ชมทุกคนร่วมกัน ช่วยประหยัด CPU มหาศาล
*   **Host CPU Mode:** บน Virtual Production (Proxmox) ต้องเปิด CPU Type เป็น `host` เพื่อให้ FFmpeg ใช้ความสามารถของ Hardware ได้เต็มที่

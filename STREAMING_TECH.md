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
3.  **Active Threshold:** Backend จะนับจำนวนผู้ชมที่มีการส่ง Heartbeat ภายใน 60 วินาทีล่าสุด
4.  **Auto-Cleanup:** มี Cron Job ทำงานทุก 1 นาที เพื่อล้าง Session ที่ค้างเกิน 2 นาที

---

## 3. กลยุทธ์การเล่นวิดีโอและการโหลดไลบรารี (Streaming Strategy)

เราใช้กลยุทธ์ **"MSE Quick Start & WebRTC Upgrade"** พร้อมระบบโหลดไลบรารีแบบ Global:

### **การโหลดสคริปต์ (Library Loading)**
*   **Global Pre-load:** ย้ายการโหลด `go2rtc-player.js` ไปไว้ที่ `index.html` เพื่อให้เบราว์เซอร์ลงทะเบียน Custom Element (`<video-stream>`) ทันทีที่แอปเปิด ลดปัญหา "จอดำค้าง" หรือ "Loading ไม่หาย" เมื่อเปิดกล้องครั้งแรกหลัง Refresh หน้าเว็บ
*   **Readiness Check:** ในตัวเล่น `WebRTCPlayer` มีการตรวจสอบความพร้อมของไลบรารีผ่าน `customElements.get('video-stream')` ก่อนเริ่มทำงาน หากไลบรารียังโหลดไม่เสร็จ ระบบจะหน่วงเวลาและลองใหม่โดยอัตโนมัติ

---

## 4. เทคนิคการแก้ปัญหา 15fps และ Resolution (Transcoding Fixes)

เพื่อให้พารามิเตอร์การตั้งค่า (เช่น 10fps หรือ Resolution เฉพาะ) ทำงานได้จริงบนทุก OS:

### **Source Mapping Strategy (_src)**
*   **ปัญหา:** เครื่องหมาย `&` และ `?` ใน URL กล้อง มักทำให้พารามิเตอร์ `#` ของ go2rtc ผิดเพี้ยน
*   **วิธีแก้:** ระบบจะลงทะเบียน URL กล้องดิบไว้ที่ชื่อ **`camera_ID_src`** ก่อน แล้วจึงสร้างสตรีมหลักโดยดึงจาก `_src` อีกที วิธีนี้ช่วยล้าง URL ให้สะอาด ทำให้พารามิเตอร์ `#size` และ `#fps` ส่งถึง FFmpeg ได้อย่างแม่นยำ 100%
*   **Force Refresh:** ทุกครั้งที่มีการเปลี่ยน Config ระบบจะสั่งลบ (DELETE) สตรีมเดิมใน go2rtc ทิ้งก่อน เพื่อล้าง Cache เก่า

---

## 5. การตั้งค่าระบบบน Production (Nginx Proxy Configuration)

เพื่อให้ระบบทำงานได้เสถียรบน Docker + Linux:

1.  **WebSocket Path:** เส้นทาง `/go2rtc-ws` ต้องชี้ไปที่ `http://go2rtc:1984/api/ws` พร้อมเปิดระบบ Upgrade
2.  **API Routing:** เส้นทาง `/api/streams/` ทั้งหมดต้องถูกส่งไปยัง Backend (พอร์ต 5000) เพื่อจัดการสถานะคนดูและ Config
3.  **No Buffering:** ปิด `proxy_buffering` สำหรับทุกเส้นทางที่เกี่ยวกับวิดีโอ เพื่อลด Latency

---

## 6. ปัญหาความไม่เสถียรของ HEVC (H.265) ในโหมด Pass-through

เมื่อใช้งานกล้องที่เป็น **H.265 (HEVC)** โดย **ไม่เปิด Transcoding** (โหมด MSE) อาจพบอาการ Loading ขึ้นเป็นระยะๆ แม้ CPU Server จะไม่สูง สาเหตุเกิดจาก:

### **สาเหตุทางเทคนิค**
*   **B-Frames Conflict:** H.265 มักใช้ B-Frames ในการบีบอัดสูง ซึ่งเบราว์เซอร์ส่วนใหญ่ไม่รองรับการประมวลผล B-Frames ผ่าน MSE ได้อย่างเสถียร ทำให้เกิดอาการ Timestamp คลาดเคลื่อนและหยุดชะงัก (Stall)
*   **GOP/I-Frame Interval:** หากกล้องตั้งค่า I-Frame ห่างกันเกินไป (เช่น 4-5 วินาที) เมื่อเกิด Network Jitter เล็กน้อย เบราว์เซอร์จะต้องรอ I-Frame ถัดไปนานเกินไปจนแสดงหน้าจอ Loading
*   **Client Decoding Load:** ภาระการถอดรหัสตกอยู่ที่ GPU ของผู้ใช้ หากเครื่องผู้ใช้ไม่แรงพอหรือเปิดหลาย Tab สตรีมจะกระตุกเป็นช่วงๆ

### **แนวทางแก้ไข**
1.  **Best Practice:** ปรับตั้งค่าที่ตัวกล้อง (Camera Web UI) ให้ส่งสัญญาณเป็น **H.264** แทนหากไม่จำเป็นต้องใช้ H.265
2.  **Stability Tuning:** หากต้องใช้ H.265 ให้ตั้งค่า **I-Frame Interval** ให้สั้นลง (เท่ากับหรือ 2 เท่าของ FPS) และ **ปิดการใช้ B-Frames**
3.  **Server-side Fix:** หากปรับที่กล้องไม่ได้ ให้เปิด **Enable Transcoding** ในระบบของเรา เพื่อแปลงเป็น H.264 Baseline Profile ซึ่งเบราว์เซอร์ถอดรหัสได้ลื่นไหลกว่ามาก

---

## 7. การดูแลรักษาและแก้ไขปัญหา (Maintenance & Troubleshooting)

*   **ล้าง Cache กล้อง:** หากเปลี่ยนค่าแล้วภาพไม่เปลี่ยนตาม ให้สั่ง `docker compose restart go2rtc`
*   **ตรวจสอบสตรีมภายใน:** สามารถเข้าดูสถานะสดของ Engine ได้ที่ `https://cctv.ntnakhon.com/go2rtc-ui/`
*   **Log ตรวจสอบ:**
    *   `docker compose logs -f backend`: ดูการลงทะเบียนกล้องและสถานะ Heartbeat
    *   `docker compose logs -f go2rtc`: ดูสถานะการดึงสัญญาณจากกล้องจริง

---

## 8. Scalability & Performance

*   **One Producer, Many Consumers:** go2rtc ต่อท่อไปที่กล้องเพียง 1 ท่อต่อ 1 สตรีมเท่านั้น
*   **Shared Transcoding:** หากเปิด Transcode ระบบจะรัน FFmpeg เพียง 1 Process ต่อ 1 สตรีม และนำผลลัพธ์ไปแจกจ่ายให้ผู้ชมทุกคนร่วมกัน ช่วยประหยัด CPU มหาศาล
*   **Host CPU Mode:** บน Virtual Production (Proxmox) ต้องเปิด CPU Type เป็น `host` เพื่อให้ FFmpeg ใช้ความสามารถของ Hardware ได้เต็มที่

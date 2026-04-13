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

## 5. การจัดการระบบเสียง (Audio Strategy for Web)

เพื่อให้เสียงทำงานได้เสถียรทั้งบน HTTP และ HTTPS (Production):

### **OPUS Transcoding (The Golden Standard)**
*   **ปัญหา:** ปุ่มเสียงบน Production (HTTPS) มักถูก Disable เนื่องจากเบราว์เซอร์ไม่รองรับ Codec เสียงดั้งเดิมจากกล้อง (เช่น G.711 หรือ AAC) ผ่าน WebRTC
*   **วิธีแก้:** เมื่อเปิด Transcode ระบบจะบังคับแปลงสัญญาณเสียงเป็น **OPUS** (ใช้พารามิเตอร์ `#audio=opus`) ซึ่งเป็นฟอร์แมตที่เบราว์เซอร์ทุกตัวรองรับ 100% และกิน CPU ต่ำมาก
*   **Audio Muted Policy:** ในฝั่ง Frontend ระบบมีการตั้งค่าให้วิดีโอเริ่มแบบ Muted ก่อนเพื่อตามกฎความปลอดภัยเบราว์เซอร์ แต่จะทำการ Unmute อัตโนมัติหาก Config ของกล้องระบุให้เปิดเสียงไว้

---

## 6. การตั้งค่าระบบบน Production (Nginx Proxy Configuration)

เพื่อให้ระบบทำงานได้เสถียรบน Docker + Linux:

1.  **WebSocket Path:** เส้นทาง `/go2rtc-ws` ต้องชี้ไปที่ `http://go2rtc:1984/api/ws` พร้อมเปิดระบบ Upgrade
2.  **API Routing:** เส้นทาง `/api/streams/` ทั้งหมดต้องถูกส่งไปยัง Backend (พอร์ต 5000) เพื่อจัดการสถานะคนดูและ Config
3.  **No Buffering:** ปิด `proxy_buffering` สำหรับทุกเส้นทางที่เกี่ยวกับวิดีโอและเสียง เพื่อลด Latency และป้องกันท่อเสียงหลุด

---

## 7. ปัญหาความไม่เสถียรของ HEVC (H.265) ในโหมด Pass-through

เมื่อใช้งานกล้องที่เป็น **H.265 (HEVC)** โดย **ไม่เปิด Transcoding** (โหมด MSE) อาจพบอาการ Loading ขึ้นเป็นระยะๆ สาเหตุเกิดจาก B-Frames และ GOP Interval ที่ไม่เข้ากับเบราว์เซอร์ แนวทางแก้ไขที่ดีที่สุดคือการปรับกล้องเป็น **H.264** หรือเปิด **Enable Transcoding** ในระบบ

---

## 8. Scalability & Performance

*   **One Producer, Many Consumers:** go2rtc ต่อท่อไปที่กล้องเพียง 1 ท่อต่อ 1 สตรีมเท่านั้น
*   **Shared Transcoding:** หากเปิด Transcode ระบบจะรัน FFmpeg เพียง 1 Process ต่อ 1 สตรีม และนำผลลัพธ์ไปแจกจ่ายให้ผู้ชมทุกคนร่วมกัน ช่วยประหยัด CPU มหาศาล
*   **Host CPU Mode:** บน Virtual Production (Proxmox) ต้องเปิด CPU Type เป็น `host` เพื่อให้ FFmpeg ใช้ความสามารถของ Hardware ได้เต็มที่

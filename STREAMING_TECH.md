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

เพื่อให้ได้ตัวเลขที่แม่นยำระดับ Production เราจะไม่ใช้ตัวเลข `consumers` จาก go2rtc (ซึ่งมักจะเพี้ยนจากการต่อท่อซ้ำซ้อน) แต่ใช้ระบบ **Heartbeat** ดังนี้:

### **กระบวนการนับ (Heartbeat Workflow)**
1.  **Unique Session:** เมื่อตัวเล่น `WebRTCPlayer` ถูกโหลด จะสร้าง `sessionId` แบบสุ่มขึ้นมา 1 ตัว (ต่อ 1 Browser Tab)
2.  **Heartbeat Pulse:** ทุกๆ 15 วินาที Frontend จะส่ง API `/api/streams/:streamId/heartbeat` เพื่อบอกว่า "ยังดูอยู่"
3.  **Active Threshold:** Backend จะนับจำนวน Session ที่มีการส่ง Heartbeat เข้ามาภายใน 60 วินาทีล่าสุด
4.  **Per-Camera Totals:** ระบบใช้เทคนิค **Prefix Search** (เช่น `camera_1_`) เพื่อรวมยอดผู้ชมจากทั้ง HD (Main) และ SD (Sub) ของกล้องตัวเดียวกันมาแสดงผล
5.  **Auto-Cleanup:** มี Cron Job ทำงานทุก 1 นาที เพื่อลบ Session ที่ค้างอยู่ในฐานข้อมูลเกิน 2 นาที

---

## 3. กลยุทธ์การเล่นวิดีโอ (Streaming Strategy)

เราใช้กลยุทธ์ **"MSE Quick Start & WebRTC Upgrade"** เพื่อประสบการณ์การใช้งานที่ดีที่สุด:

### **Protocols (วิธีส่งข้อมูล)**
1.  **MSE (Fast Start):** ตัวเล่นจะเริ่มดึงภาพผ่าน MSE (WebSocket) ก่อนเป็นอันดับแรก เพราะเชื่อมต่อได้ไวที่สุด (1-2 วินาทีภาพติด)
2.  **WebRTC (Background Upgrade):** ในขณะที่ภาพ MSE รันอยู่ ระบบจะทำ WebRTC Handshake ในพื้นหลัง
3.  **Auto Switch:** หาก WebRTC พร้อมใช้งาน ตัวเล่นจะสลับมาใช้ WebRTC อัตโนมัติ (และปิดท่อ MSE ทิ้งเพื่อประหยัดแบนด์วิดท์)

---

## 4. เทคนิคการแก้ปัญหาจอดำ (Stability Fixes)

เพื่อให้การสลับกล้อง (Switching) ลื่นไหลและไม่เกิดอาการจอดำค้าง:

*   **React Key Strategy:** ใส่ `key={streamConfig.streamId}` ให้กับ `WebRTCPlayer` เพื่อบังคับให้ React ทำลายตัวเก่าและสร้างตัวใหม่จากศูนย์ทุกครั้งที่เปลี่ยนกล้อง
*   **Explicit Cleanup:** ใน `go2rtc-player.js` มีการสั่ง `stop()` ทุก Media Track และล้าง `srcObject` อย่างชัดเจนก่อน Unmount เพื่อไม่ให้เกิด `DOMException`
*   **Cache Buster:** เติม `&t={timestamp}` ลงใน URL ของ WebSocket เพื่อให้เบราว์เซอร์มองเป็นการเชื่อมต่อใหม่เสมอ ไม่ใช้ข้อมูลจาก Cache เก่า
*   **Smart Sync (Backend):** Backend จะไม่สั่งลบ (DELETE) สตรีมใน go2rtc หาก Config ยังเหมือนเดิม แต่จะใช้ `PUT` เพื่ออัปเดตสตรีมเท่านั้น ทำให้ท่อผู้ชมไม่หลุด

---

## 5. การตั้งค่ากล้อง และ Transcoding

ระบบรองรับการตั้งค่าที่ยืดหยุ่นผ่าน **Camera Management**:

| ฟีเจอร์ | รายละเอียด |
| :--- | :--- |
| **Main Stream (HD)** | URL หลักความละเอียดสูง สำหรับดูรายละเอียดและบันทึก |
| **Sub Stream (SD)** | URL รองความละเอียดต่ำ สำหรับดูบนแผนที่หรือมือถือเพื่อประหยัดเน็ต |
| **Enable Transcoding** | **เปิด:** Server จะช่วยแปลงไฟล์ (ใช้ CPU) โดยใช้ `ffmpeg` **ปิด:** ส่งข้อมูลดิบ (Pass-through) |
| **Credential Injection** | ระบบจะฉีด `user:pass` เข้าไปใน RTSP URL ให้อัตโนมัติหากมีการตั้งค่าแยกฟิลด์ไว้ |

---

## 6. ความสามารถในการขยายระบบ (Scalability & Performance)

ระบบถูกออกแบบมาให้รองรับผู้เข้าชมจำนวนมากด้วยหลักการทรัพยากรที่มีประสิทธิภาพ:

### **One Producer, Many Consumers**
*   **การเชื่อมต่อกล้อง:** go2rtc จะต่อ RTSP ไปที่กล้องเพียง **1 ท่อเดียวเท่านั้น** ต่อ 1 ประเภทสตรีม (HD/SD) ไม่ว่าจะมีคนดู 1 คนหรือ 100 คน กล้องจะไม่รับภาระเพิ่ม
*   **Process Management:** หากเปิด Transcoding ระบบจะรัน `ffmpeg` เพียง **1 Process** ต่อ 1 สตรีม และนำผลลัพธ์ไปแจกจ่ายให้ผู้ชมทุกคนร่วมกัน (Shared Stream)
*   **Efficient Distribution:** go2rtc ใช้เทคนิค Memory Copy ในระดับภาษา Go เพื่อแจกจ่ายข้อมูลให้ Consumers ใน Process เดียวกัน ทำให้ประหยัดทรัพยากรสูง

### **ปัจจัยจำกัดความสามารถ (Performance Bottlenecks)**
1.  **Transcoding (CPU):** เป็นตัวจำกัดจำนวน "กล้อง" ที่จะเปิดดูพร้อมกันได้บน Server (แนะนำให้ใช้ Pass-through หากกล้องเป็น H.264 อยู่แล้ว)
2.  **Network Bandwidth (Upload):** เป็นตัวจำกัดจำนวน "ผู้เข้าชม" รวมทั้งหมด (สูตรคำนวณ: จำนวนคนดู x Bitrate ของกล้อง)
3.  **Client-side Specs:** เบราว์เซอร์ของผู้ใช้อาจจะค้างหากเปิดดูหลายกล้องพร้อมกันเนื่องจากต้องถอดรหัสวิดีโอจำนวนมาก

---

## 7. เคล็ดลับการปรับจูนประสิทธิภาพ (Tuning Tips)

1.  **ประหยัด CPU Server:** หากกล้องส่งมาเป็น H.264 อยู่แล้ว ควร **Disable Transcoding**
2.  **ปัญหาจอดำ:** หากกล้องเป็น H.265 และเบราว์เซอร์ไม่รองรับ ให้เปิด **Enable Transcoding** เพื่อแปลงเป็น H.264
3.  **Network WS:** หากภาพไม่ขึ้น ให้ตรวจสอบแถบ **Network -> WS** ใน DevTools เพื่อดูว่าท่อ WebSocket เชื่อมต่อสำเร็จหรือไม่

# 🐳 CCTV Monitoring System: Production Deployment Guide (Ubuntu + Docker)

คู่มือฉบับปรับปรุงล่าสุดสำหรับการ Deploy ระบบบน **Ubuntu 22.04/24.04** (Virtual Production / Proxmox) พร้อมการตั้งค่า Transcoding และระบบนับคนดูแบบ Real-time

---

## 1. การเตรียมความพร้อม (Server Preparation)

### 🛡️ ตั้งค่า Firewall (สำคัญมากสำหรับ WebRTC)
เพื่อให้วิดีโอโหลดเร็วและไม่กระตุก ต้องเปิด Port เหล่านี้บน Ubuntu:
```bash
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw allow 81/tcp     # Nginx Proxy Manager Admin
sudo ufw allow 1984/tcp   # go2rtc API
sudo ufw allow 8554/tcp   # RTSP Stream
sudo ufw allow 8555/tcp   # WebRTC TCP
sudo ufw allow 8555/udp   # WebRTC UDP (หัวใจหลักของความเร็ว)
sudo ufw enable
```

### 💻 สำหรับ Proxmox / KVM
เพื่อให้ FFmpeg และ Docker ทำงานได้เต็มประสิทธิภาพ:
1. ไปที่ **Hardware > CPU** -> เปลี่ยน **Type** เป็น **`host`** (สำคัญมากเพื่อให้ใช้ชุดคำสั่งพิเศษของ CPU จริง)
2. กำหนดอย่างน้อย **4 Cores** เพื่อรองรับการ Transcode หลายกล้องพร้อมกันโดยไม่หน่วง

---

## 2. ขั้นตอนการ Deploy (Fresh Start / Update)

ก๊อปปี้ชุดคำสั่งนี้ไปรันในโฟลเดอร์โปรเจ็คเพื่อทำการติดตั้งหรืออัปเดตระบบทั้งหมดในครั้งเดียว:

```bash
# 1. ดึงโค้ดล่าสุดจาก Repository
git pull

# 2. สร้าง/ตรวจสอบไฟล์ .env (ต้องมีค่า DATABASE_URL, JWT_SECRET, GO2RTC_URL)
# nano ./cctv-backend/.env

# 3. ล้างสถานะเก่าและ Build Image ใหม่ทั้งหมด (Clean Build)
docker compose down
docker compose up -d --build

# 4. ซิงค์ฐานข้อมูลและสร้างตารางใหม่ (เช่น ViewingSession)
sleep 10 # รอให้ MariaDB พร้อมทำงาน
docker compose exec backend npx prisma db push

# 5. ลงข้อมูลเริ่มต้น (Admin User / Sample Cameras)
docker compose exec backend npx prisma db seed

# 6. รีสตาร์ท Engine สตรีมมิ่งเพื่อเคลียร์ Cache 15fps เก่า
docker compose restart go2rtc
```

---

## 3. การตั้งค่า Reverse Proxy (Nginx Proxy Manager)

เพื่อให้เข้าใช้งานผ่านโดเมนและ SSL ได้อย่างสมบูรณ์ (เข้าหน้าจัดการที่พอร์ต 81):

1.  **Add Proxy Host:**
    *   **Domain:** `cctv.yourdomain.com`
    *   **Forward Hostname:** `frontend` | **Port:** `80`
    *   **Websockets Support:** ✅ **ON** (จำเป็นมากเพื่อให้ WebRTC/MSE ทำงานได้)
2.  **SSL Tab:**
    *   เลือก `Request a new SSL Certificate`
    *   เปิด `Force SSL` และ `HTTP/2 Support`
3.  **Advanced Tab (เพิ่มประสิทธิภาพสตรีมมิ่ง):**
    ใส่โค้ดนี้ในช่อง Custom Nginx Configuration เพื่อปิด Buffer วิดีโอ:
    ```nginx
    location /api/streams/webrtc {
        proxy_pass http://backend:5000;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    ```

---

## 4. กลยุทธ์การตรวจสอบ (Monitoring & Debug)

### 🎥 ตรวจสอบการ Transcoding
ในเวอร์ชั่นปัจจุบัน ระบบใช้เทคนิค **Source-Target Mapping** หากคุณเปิด Transcoding:
*   คุณจะเห็นสตรีมชื่อ `camera_ID_src` (สตรีมต้นทางดิบ)
*   คุณจะเห็นสตรีมชื่อ `camera_ID` (สตรีมที่ถูกแปลงเป็น FPS/Resolution ตามสั่ง)
*   **เช็ค Log:** `docker compose logs -f backend` (ต้องเห็นข้อความ `🔥 FORCING TRANSCODE`)

### 👥 ตรวจสอบจำนวนคนดู (Heartbeat)
ระบบจะนับคนดูจริงผ่านตาราง `ViewingSession` ใน DB แบบ Real-time:
*   **เช็ค Log:** `docker compose logs -f backend`
*   หากไม่มี Error `Unique constraint failed` (เพราะใช้ Raw SQL UPSERT แล้ว) แสดงว่าระบบทำงานปกติ

### 🧹 การดูแลรักษา
*   **ล้างข้อมูล Session เก่า:** ระบบมี Cron Job ล้างให้อัตโนมัติทุก 2 นาที (Cleanup Job)
*   **ดู CPU Usage:** ใช้คำสั่ง `docker stats`
    *   หากใช้ Pass-through (ปกติ): CPU ควรอยู่ใกล้ 0%
    *   หากเปิด Transcode: CPU จะสูงขึ้นตามจำนวนกล้อง (เฉลี่ย 5-10% ต่อกล้องบน CPU Host mode)

---

## 5. บันทึกทางเทคนิค (Technical Notes)
*   **15fps Fix:** ระบบแก้ปัญหาด้วยการบังคับลบสตรีมเก่าและใช้พารามิเตอร์ `#fps=...` ผ่าน Internal Source เพื่อเอาชนะปัญหา Cache บน go2rtc/Windows
*   **Resolution Fix:** ระบบดึงค่าจากคำสั่ง FFmpeg (Source) โดยตรง ทำให้ UI แสดงผลได้ทันทีโดยไม่ต้องรอการ Probe ข้อมูลจาก Engine นานเกินไป
*   **Heartbeat Stability:** เปลี่ยนจากการใช้ Prisma Upsert มาเป็น Raw SQL `ON DUPLICATE KEY UPDATE` เพื่อป้องกันปัญหา Concurrency บน MariaDB 100%

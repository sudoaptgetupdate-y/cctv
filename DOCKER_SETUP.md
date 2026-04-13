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

---

## 5. 🛠️ คู่มือการอัปเดตระบบ (Update Scenarios)

หลังจากที่คุณทำการ `git pull` โค้ดล่าสุดลงมาที่ Server แล้ว ให้เลือกใช้คำสั่งตามสถานการณ์ดังนี้:

### 🅰️ กรณีแก้ไข UI หรือ Nginx Config (Frontend)
หากมีการแก้ไฟล์ใน `cctv-frontend/src` หรือไฟล์ `cctv-frontend/nginx.conf`:
```bash
# Build เฉพาะ Frontend ใหม่ (ใช้เวลาไม่นานเพราะมี Cache)
docker compose up -d --build frontend
```

### 🅱️ กรณีแก้ไข Logic หรือ API (Backend)
หากมีการแก้ไฟล์ใน `cctv-backend/src`:
```bash
# Build เฉพาะ Backend ใหม่
docker compose up -d --build backend
```

### 🅾️ กรณีมีการเพิ่มตารางหรือเปลี่ยน Schema (Prisma)
หากคุณมีการแก้ไฟล์ `schema.prisma` (เช่น เพิ่มตาราง Multi-group):
```bash
# 1. Build Backend ใหม่ก่อนเพื่อให้มี Client ล่าสุด
docker compose up -d --build backend

# 2. Push โครงสร้างตารางใหม่ลงฐานข้อมูล (สำคัญ: ข้อมูลเดิมไม่หาย)
docker compose exec backend npx prisma db push
```

### 🅾️ กรณีอัปเดตชุดใหญ่ (Full Update)
หากมีการเปลี่ยนแปลงหลายส่วนพร้อมกัน:
```bash
docker compose down
docker compose up -d --build
docker compose exec backend npx prisma db push
```

---

## 6. 📋 คำสั่งตรวจสอบและจัดการอื่นๆ

### การดู Log (Troubleshooting)
```bash
# ดู Log ทั้งหมดแบบ Real-time
docker compose logs -f

# ดู Log เฉพาะ Backend (เช็ค Error API)
docker compose logs -f backend

# ดู Log เฉพาะ go2rtc (เช็คการเชื่อมต่อกล้อง)
docker compose logs -f go2rtc
```

### การจัดการฐานข้อมูล
```bash
# เข้าไปพิมพ์คำสั่ง SQL ใน MariaDB โดยตรง
docker compose exec db mariadb -u cctv_user -p cctv_db

# สั่งรัน Seed ข้อมูลใหม่ (กรณีเพิ่ม Sample Data ในไฟล์ seed.js)
docker compose exec backend npx prisma db seed
```

### การจัดการ Container
```bash
# ตรวจสอบสถานะการทำงาน (ต้องขึ้น Up ทั้งหมด)
docker compose ps

# รีสตาร์ทเฉพาะ go2rtc (เมื่อสตรีมค้างหรือแก้ go2rtc.yaml)
docker compose restart go2rtc
```

---

## 7. 💡 เข้าใจการทำงานของ Docker Build (Knowledge Base)

เพื่อให้คุณจัดการ Production ได้อย่างมืออาชีพ นี่คือสิ่งที่คุณควรรู้เกี่ยวกับคำสั่ง `--build`:

### 🛠️ ความแตกต่างของขอบเขตการ Build
*   **`docker compose up -d --build`**: Docker จะสร้าง Image ใหม่ให้กับ **ทุก Service** ที่มีการระบุคำสั่ง `build:` ในไฟล์คอมโพส และจะทำการ **Restart คอนเทนเนอร์ทั้งหมด** ในระบบ
*   **`docker compose up -d --build [service_name]`**: เช่น `--build frontend` จะเป็นการเจาะจงสร้าง Image ใหม่และ Restart **เฉพาะ Service นั้นๆ** โดยที่ Service อื่น (เช่น ฐานข้อมูล หรือ go2rtc) จะยังคงทำงานต่อเนื่อง ไม่หยุดชะงัก

### 🔄 กระบวนการที่เกิดขึ้น (Under the hood)
เมื่อคุณรันคำสั่งพร้อม `--build`:
1.  **Image Creation**: Docker จะสร้าง Image ตัวใหม่ล่าสุดขึ้นมา (มี ID ใหม่)
2.  **Container Replacement**: Docker จะหยุดคอนเทนเนอร์ตัวเก่า -> ลบทิ้ง -> และสร้างคอนเทนเนอร์ตัวใหม่ขึ้นมาทันทีโดยใช้ Image ที่เพิ่งสร้างเสร็จ
3.  **No Code Left Behind**: วิธีนี้ทำให้มั่นใจ 100% ว่าโค้ดใหม่ที่คุณ `git pull` มาจะถูกนำไปใช้งานจริง (การใช้แค่ `restart` โดยไม่มี `--build` จะเป็นการรัน Image ตัวเก่าซ้ำเฉยๆ)

### ⚡ ระบบ Caching (ความเร็วในการ Build)
Docker มีระบบ Cache อัจฉริยะที่จะช่วยประหยัดเวลา:
*   **Fast Path**: หากคุณแก้ไขเฉพาะไฟล์โค้ด (เช่น `.jsx`, `.js`) Docker จะข้ามขั้นตอนที่ใช้เวลานานอย่าง `npm install` ไปเลย และไปเริ่มที่ขั้นตอน Build โค้ดแทน
*   **Slow Path**: หากคุณมีการแก้ไขไฟล์ `package.json` Docker จะถือว่าสภาพแวดล้อมเปลี่ยนไป และจะทำการติดตั้ง Library ใหม่ทั้งหมดโดยอัตโนมัติ

---

## 8. บันทึกทางเทคนิค (Technical Notes)
*   **15fps Fix:** ระบบแก้ปัญหาด้วยการบังคับลบสตรีมเก่าและใช้พารามิเตอร์ `#fps=...` ผ่าน Internal Source เพื่อเอาชนะปัญหา Cache บน go2rtc/Windows
*   **Resolution Fix:** ระบบดึงค่าจากคำสั่ง FFmpeg (Source) โดยตรง ทำให้ UI แสดงผลได้ทันทีโดยไม่ต้องรอการ Probe ข้อมูลจาก Engine นานเกินไป
*   **Heartbeat Stability:** เปลี่ยนจากการใช้ Prisma Upsert มาเป็น Raw SQL `ON DUPLICATE KEY UPDATE` เพื่อป้องกันปัญหา Concurrency บน MariaDB 100%

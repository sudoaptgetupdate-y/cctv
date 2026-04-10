# 🐳 Docker Setup Guide for Ubuntu 22.04 / 24.04 (The Hybrid Way)

คู่มือนี้สำหรับใช้ในการ Deploy ระบบ **CCTV Monitoring System** บนเซิร์ฟเวอร์จริง โดยใช้ Docker ตามกลยุทธ์ "The Hybrid Way" (พัฒนาบน Local แต่รันแบบ Container บน Production)

---

## 1. เตรียมความพร้อมบน Ubuntu

```bash
# อัปเดตและติดตั้ง Docker
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# **ต้อง Log out และ Login ใหม่เพื่อให้มีผล**
```

---

## 2. การจัดการความลับของระบบ (.env)

สร้างไฟล์ `.env` ใน Root Directory (`~/projects/cctv`) เพื่อเก็บรหัสผ่าน (ไฟล์นี้จะไม่ถูกส่งขึ้น Git):

```bash
nano .env
```
**ตัวอย่างข้อมูล:**
```text
# Database Settings
DB_ROOT_PASSWORD=your_secure_root_password
DB_NAME=cctv_db
DB_USER=cctv_admin
DB_PASSWORD=your_secure_password

# Authentication
JWT_SECRET=your_jwt_secret_key
```

---

## 3. รายละเอียด Config ที่ผ่านการรีไฟน์แล้ว (Verified)

### 📄 `docker-compose.yml`
จุดสำคัญคือ `extra_hosts` ทั้งใน Backend และ Frontend เพื่อให้คุยกับ `go2rtc` ได้:
```yaml
services:
  # ... (proxy & db) ...

  go2rtc:
    image: alexxit/go2rtc
    restart: always
    network_mode: host # สำคัญมากสำหรับ WebRTC
    volumes:
      - ./cctv-backend/go2rtc.yaml:/config/go2rtc.yaml

  backend:
    # ...
    extra_hosts:
      - "host.docker.internal:host-gateway"
    networks:
      - cctv-network

  frontend:
    # ...
    extra_hosts:
      - "host.docker.internal:host-gateway" # เพื่อให้ Nginx Proxy ไปหา go2rtc ได้
    networks:
      - cctv-network
```

### 📄 `cctv-frontend/nginx.conf`
การตั้งค่า Proxy ที่ถูกต้องเพื่อให้ทั้งหน้าเว็บ, API และ Video Stream วิ่งผ่าน Domain เดียวกัน:
```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Proxy สำหรับ Video Streaming (go2rtc)
    location /api/streams/ {
        proxy_pass http://host.docker.internal:1984/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    # Proxy สำหรับ API Backend
    location /api/ {
        proxy_pass http://backend:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

---

## 4. ขั้นตอนการ Deploy & Update

### 🚀 กรณี Deploy ครั้งแรก
```bash
git clone <your-repo-url>
cd cctv
# สร้างไฟล์ .env (ตามข้อ 2)
docker compose up -d --build
docker compose exec backend npx prisma migrate deploy
docker compose exec backend node prisma/seed.js
```

### 🔄 กรณีอัปเดตระบบ (หลัง Push โค้ดใหม่)
```bash
git pull origin main
docker compose up -d --build
# หากมีการแก้ Database Schema
docker compose exec backend npx prisma migrate deploy
```

---

## 5. การตั้งค่า Nginx Proxy Manager (NPM)

1.  เข้า `http://your-server-ip:81` (Admin: `admin@example.com` / `changeme`)
2.  **Add Proxy Host:**
    *   **Domain:** `cctv.yourdomain.com`
    *   **Forward Hostname:** `frontend`
    *   **Forward Port:** `80`
    *   **Websockets Support:** ✅ **ON** (ต้องเปิดเพื่อรองรับวิดีโอ)
3.  **SSL:** เลือก `Request a new SSL Certificate` และเปิด `Force SSL`

---

## 6. การตรวจสอบและแก้ไขปัญหา

*   **วิดีโอไม่ขึ้น?**: ตรวจสอบว่าเปิด Port `1984, 8555 (TCP/UDP)` ที่ Firewall ของ Ubuntu แล้วหรือยัง
*   **Log Backend**: `docker compose logs -f backend`
*   **Log Frontend**: `docker compose logs -f frontend`

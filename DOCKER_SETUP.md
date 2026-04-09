# 🐳 Docker Setup Guide for Ubuntu 22.04 / 24.04 (The Hybrid Way)

คู่มือนี้สำหรับใช้ในการ Deploy ระบบ **CCTV Monitoring System** บนเซิร์ฟเวอร์จริง (Production) โดยใช้ Docker ตามกลยุทธ์ "The Hybrid Way" (พัฒนาบนเครื่อง Local แต่รันแบบ Container บน Server)

---

## 1. เตรียมความพร้อมบน Ubuntu

รันคำสั่งเหล่านี้บนเครื่อง Ubuntu เพื่อติดตั้ง Docker และ Docker Compose v2:

```bash
# อัปเดตระบบ
sudo apt update && sudo apt upgrade -y

# ติดตั้ง Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# ตั้งค่าให้รัน Docker ได้โดยไม่ต้องใช้ sudo (Optional)
sudo usermod -aG docker $USER
# **ต้อง Log out และ Login ใหม่เพื่อให้มีผล**

# ตรวจสอบการติดตั้ง
docker --version
docker compose version
```

---

## 2. โครงสร้างไฟล์สำหรับ Docker (File Structure)

เมื่อคุณ Clone โปรเจ็คลงมาแล้ว โครงสร้างไฟล์ที่สำคัญจะเป็นดังนี้:

```text
~/projects/cctv/               <-- Root Directory
├── docker-compose.yml         <-- ไฟล์ควบคุมการทำงานของทุก Container
├── cctv-backend/
│   ├── Dockerfile             <-- วิธีการ Build Node.js + FFmpeg
│   └── ...
├── cctv-frontend/
│   ├── Dockerfile             <-- วิธีการ Build React (Multi-stage build)
│   ├── nginx.conf             <-- Config สำหรับ Nginx ภายใน Container
│   └── ...
└── (Auto-generated Folders)
    ├── mysql_data/            <-- ข้อมูลจริงใน Database (MariaDB)
    ├── proxy_data/            <-- ข้อมูล Nginx Proxy Manager
    └── proxy_letsencrypt/     <-- ใบรับรอง SSL (HTTPS)
```

---

## 3. รายละเอียดไฟล์ Config หลัก

### 📄 `docker-compose.yml` (ในโฟลเดอร์หลัก)
```yaml
services:
  # 🌐 Reverse Proxy (Nginx Proxy Manager)
  proxy:
    image: 'jc21/nginx-proxy-manager:latest'
    restart: always
    ports:
      - '80:80'   # HTTP
      - '443:443' # HTTPS
      - '81:81'   # Admin UI
    volumes:
      - ./proxy_data:/data
      - ./proxy_letsencrypt:/etc/letsencrypt
    networks:
      - cctv-network

  # 🗄️ Database
  db:
    image: mariadb:10.11
    restart: always
    environment:
      MARIADB_ROOT_PASSWORD: your_root_password
      MARIADB_DATABASE: cctv_db
      MARIADB_USER: your_admin_user
      MARIADB_PASSWORD: your_admin_password
    volumes:
      - ./mysql_data:/var/lib/mysql
    networks:
      - cctv-network

  # 🎥 Streaming (go2rtc)
  go2rtc:
    image: alexxit/go2rtc
    restart: always
    network_mode: host # ต้องใช้ host mode สำหรับ WebRTC/UDP บน Linux
    volumes:
      - ./cctv-backend/go2rtc.yaml:/config/go2rtc.yaml

  # ⚙️ Backend API
  backend:
    build:
      context: ./cctv-backend
      dockerfile: Dockerfile
    restart: always
    environment:
      DATABASE_URL: "mysql://your_admin_user:your_admin_password@db:3306/cctv_db"
      JWT_SECRET: "your_jwt_secret"
      PORT: 5000
      GO2RTC_URL: "http://host.docker.internal:1984"
    depends_on:
      - db
    extra_hosts:
      - "host.docker.internal:host-gateway"
    networks:
      - cctv-network

  # 💻 Frontend (React + Nginx)
  frontend:
    build:
      context: ./cctv-frontend
      dockerfile: Dockerfile
    restart: always
    networks:
      - cctv-network

networks:
  cctv-network:
    driver: bridge
```

---

## 4. ขั้นตอนการ Deploy จริง (Verified Workflow)

### 1. เครื่อง Local (Local PC)
สั่ง Push โค้ดที่เสร็จแล้วขึ้น Git:
```bash
git add .
git commit -m "deploy: update docker configuration and file structure"
git push origin main
```

### 2. เครื่องเซิร์ฟเวอร์ (Ubuntu Server)
```bash
# SSH เข้าเซิร์ฟเวอร์
ssh user@your-server-ip

# สร้างโฟลเดอร์สำหรับเก็บโปรเจ็ค (ถ้ายังไม่มี)
mkdir -p ~/projects && cd ~/projects

# Clone หรือ Pull โค้ดล่าสุด
git clone <your-git-repo-url>
cd cctv
git pull origin main
```

### 3. สั่งรันระบบและตั้งค่าฐานข้อมูล (ครั้งแรก)
```bash
# 1. สั่ง Build และรัน Container ทั้งหมด
docker compose up -d --build

# 2. รัน Database Migration (สร้าง Table)
docker compose exec backend npx prisma migrate deploy

# 3. ใส่ข้อมูลเริ่มต้น (Seed Data - ถ้ามี)
docker compose exec backend node prisma/seed.js

# 4. Restart Backend เพื่อเริ่มต้นระบบใหม่ที่พร้อม 100%
docker compose restart backend
```

---

## 5. ตรวจสอบสถานะและตั้งค่า Proxy

### ดูสถานะของทุก Service:
```bash
docker compose ps
```

### ดู Log ล่าสุดของ Backend:
```bash
docker compose logs -f --tail 50 backend
```

### การตั้งค่า Reverse Proxy (Nginx Proxy Manager):
1. เข้าไปที่ `http://your-server-ip:81`
2. Login ด้วย `admin@example.com` / `changeme`
3. **Frontend:** สร้าง Proxy Host ใหม่ ชี้โดเมนของคุณไปที่ Hostname `frontend` Port `80`
4. **API:** สร้าง Proxy Host ใหม่ ชี้โดเมน (เช่น api.yourdomain.com) ไปที่ Hostname `backend` Port `5000`

---

## 💡 ทริคสำหรับการใช้งานบน Ubuntu
- **Prisma Migration:** หากมีการเปลี่ยน Schema ในอนาคต ให้รัน `migrate deploy` ทุกครั้ง
- **Log Management:** หากต้องการดู Log ของทุกตัวพร้อมกัน ใช้ `docker compose logs -f`
- **Database Backup:** ควรทำสำรองโฟลเดอร์ `mysql_data` ไว้สม่ำเสมอ
- **Host Networking:** go2rtc รันแบบ `host` mode เพื่อให้ WebRTC ทำงานได้ดีที่สุดบน Linux

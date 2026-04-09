# 🐳 Docker Setup Guide for Ubuntu 22.04 (The Hybrid Way)

คู่มือนี้สำหรับใช้ในการ Deploy ระบบ **CCTV Monitoring System** บนเซิร์ฟเวอร์จริง (Production) โดยใช้ Docker ตามกลยุทธ์ "The Hybrid Way" (พัฒนาบนเครื่อง Local แต่รันแบบ Container บน Server)

---

## 1. เตรียมความพร้อมบน Ubuntu 22.04

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

## 2. โครงสร้างไฟล์สำหรับ Docker

สร้างไฟล์เหล่านี้ไว้ใน Root ของโปรเจ็ค (ข้างๆ โฟลเดอร์ `cctv-backend` และ `cctv-frontend`):

### 📄 `Dockerfile.backend` (ในโฟลเดอร์ cctv-backend)
```dockerfile
FROM node:20-slim

# ติดตั้ง OpenSSL สำหรับ Prisma และ FFmpeg สำหรับ Snapshot
RUN apt-get update && apt-get install -y openssl ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]
```

### 📄 `Dockerfile.frontend` (ในโฟลเดอร์ cctv-frontend)
```dockerfile
# Stage 1: Build
FROM node:20-slim as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production (Nginx)
FROM nginx:stable-alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
# ก๊อปปี้ไฟล์ config ของ nginx เพื่อรองรับ React Router
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 📄 `docker-compose.yml` (ในโฟลเดอร์หลัก)
```yaml
services:
  db:
    image: mariadb:10.11
    restart: always
    environment:
      MARIADB_ROOT_PASSWORD: your_root_password
      MARIADB_DATABASE: cctv_db
      MARIADB_USER: cctv_user
      MARIADB_PASSWORD: cctv_password
    volumes:
      - ./mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  go2rtc:
    image: alexxit/go2rtc
    restart: always
    network_mode: host # สำคัญสำหรับการทำ WebRTC / UDP
    volumes:
      - ./cctv-backend/go2rtc.yaml:/config/go2rtc.yaml

  backend:
    build:
      context: ./cctv-backend
      dockerfile: Dockerfile
    restart: always
    environment:
      DATABASE_URL: "mysql://cctv_user:cctv_password@db:3306/cctv_db"
      JWT_SECRET: "your_secret_key"
      PORT: 5000
    depends_on:
      - db
    ports:
      - "5000:5000"

  frontend:
    build:
      context: ./cctv-frontend
      dockerfile: Dockerfile
    restart: always
    ports:
      - "3000:80"
    depends_on:
      - backend
```

---

## 3. ขั้นตอนการ Deploy จริง (The Hybrid Workflow)

ทำตามขั้นตอนนี้ทุกครั้งที่มีการอัปเดตโค้ด:

### 1. เครื่อง Local (Local PC)
สั่ง Push โค้ดที่เสร็จแล้วขึ้น Git:
```bash
git add .
git commit -m "feat: redesign layout and add i18n"
git push origin main
```

### 2. เครื่องเซิร์ฟเวอร์ (Ubuntu Server)

เราจะใช้โฟลเดอร์ `/home/$USER/projects/` เป็นที่เก็บโปรเจ็คเพื่อให้ง่ายต่อการจัดการ Permissions:

```bash
# SSH เข้าเซิร์ฟเวอร์
ssh user@your-server-ip

# สร้างโฟลเดอร์สำหรับเก็บโปรเจ็ค (ถ้ายังไม่มี)
mkdir -p ~/projects && cd ~/projects

# Clone โปรเจ็คลงมา
git clone https://github.com/sudoaptgetupdate-y/cctv.git
cd cctv

# (ถ้า Clone มาแล้ว) ดึงโค้ดล่าสุด
git pull origin main
```

### 3. สั่งรันด้วย Docker Compose
สั่ง Build และรัน Container ทั้งหมด:
```bash
docker compose up -d --build
```
*หมายเหตุ: `--build` จะช่วยให้ Docker ตรวจสอบว่าโค้ดมีการเปลี่ยนแปลงและสร้าง Image ใหม่เฉพาะส่วนที่เปลี่ยน*

---

## 4. ตรวจสอบสถานะ

```bash
# ดู Container ที่รันอยู่
docker compose ps

# ดู Log ของ Backend เพื่อเช็คการเชื่อมต่อ DB
docker compose logs -f backend
```

---

## 5. การตั้งค่า Reverse Proxy (Nginx Proxy Manager)

เมื่อคุณรัน `docker compose up -d` แล้ว ระบบจะเปิดหน้าจัดการ Proxy ไว้ที่ Port `81`:

1.  เข้าหน้าจัดการ: `http://your-server-ip:81`
2.  Default Login:
    *   Email: `admin@example.com`
    *   Password: `changeme`
3.  **สร้าง Proxy Host ใหม่:**
    *   **Domain Names:** ใส่โดเมนของคุณ (เช่น `cctv.local` หรือ `your-domain.com`)
    *   **Forward Scheme:** `http`
    *   **Forward Hostname:** `frontend` (ชื่อ service ใน docker-compose)
    *   **Forward Port:** `80`
4.  **สำหรับการทำ API Proxy:**
    *   สร้าง Proxy Host อีกตัว (เช่น `api.your-domain.com`)
    *   Forward ไปที่ Hostname: `backend` และ Port: `5000`

---

## 💡 ทริคสำหรับการใช้งานบน Ubuntu
- **Prisma Migration:** หากมีการเปลี่ยน Schema ใน Production ให้รัน:
  `docker compose exec backend npx prisma migrate deploy`
- **Database Backup:** ควรทำสำรองโฟลเดอร์ `mysql_data` ไว้เสมอ
- **Nginx Reverse Proxy:** แนะนำให้ใช้ **Nginx Proxy Manager** วางไว้ข้างหน้าเพื่อทำ HTTPS (SSL) ได้ง่ายๆ ครับ

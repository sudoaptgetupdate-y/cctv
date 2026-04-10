# 🐳 Docker Setup Guide for Ubuntu 22.04 / 24.04 (The Hybrid Way)

คู่มือนี้สำหรับใช้ในการ Deploy ระบบ **CCTV Monitoring System** บนเซิร์ฟเวอร์จริง โดยใช้ Docker ตามกลยุทธ์ "The Hybrid Way" ซึ่งเน้นความปลอดภัยด้วยการแยก Environment Variables ออกจากโค้ดหลัก

---

## 1. เตรียมความพร้อมบน Ubuntu

```bash
# อัปเดตและติดตั้ง Docker (รันครั้งเดียว)
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# **ต้อง Log out และ Login ใหม่เพื่อให้มีผล**
```

---

## 2. โครงสร้างไฟล์และความลับของระบบ (.env)

ระบบจะใช้ไฟล์ `.env` ใน Root Directory เพื่อเก็บรหัสผ่านทั้งหมด **ไฟล์นี้จะไม่ถูกส่งขึ้น Git (มีใน .gitignore)** เพื่อป้องกันรหัสผ่านรั่วไหล และป้องกันการโดนเขียนทับ (Overwrite) เมื่อสั่ง Pull

### 📄 สร้างไฟล์ `.env` บน Server (รันใน ~/projects/cctv)
```bash
nano .env
```
**คัดลอกและใส่ข้อมูลจริงของคุณลงไป:**
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

## 3. ขั้นตอนการ Deploy & Update (Safe Workflow)

### 🚀 กรณี Deploy ครั้งแรก (Initial Setup)
```bash
# 1. Clone โปรเจ็ค
git clone <your-repo-url>
cd cctv

# 2. สร้างไฟล์ .env (ตามขั้นตอนที่ 2)

# 3. รันระบบทั้งหมด
docker compose up -d --build

# 4. ตั้งค่า Database (เฉพาะครั้งแรก)
docker compose exec backend npx prisma migrate deploy
docker compose exec backend node prisma/seed.js
```

### 🔄 กรณีอัปเดตระบบ (Future Updates)
เมื่อคุณพัฒนาโค้ดบน Local เสร็จและ Push ขึ้น Git แล้ว ให้ทำดังนี้บน Server:
```bash
# 1. ดึงโค้ดล่าสุด (ไม่ต้องห่วงเรื่อง .env หรือข้อมูลหาย เพราะแยกกันอยู่)
git pull origin main

# 2. สั่ง Re-build และ Re-start เพื่อเปลี่ยนเวอร์ชัน
docker compose up -d --build

# 3. หากมีการแก้ Database Schema (ถ้ามี)
docker compose exec backend npx prisma migrate deploy
```

---

## 4. รายละเอียด Config ที่สำคัญ

### 🌐 Docker Compose (docker-compose.yml)
ไฟล์นี้ถูกตั้งค่าให้ดึงค่าจาก `.env` โดยอัตโนมัติ (เช่น `${DB_USER}`) ทำให้คุณไม่ต้องแก้โค้ดนี้บ่อยๆ

### 🎥 go2rtc (cctv-backend/go2rtc.yaml)
ตรวจสอบว่าพาธ FFmpeg เป็นของ Linux:
```yaml
ffmpeg:
  bin: "ffmpeg"
```

### 🗄️ Prisma (prisma/schema.prisma)
ต้องมี binaryTargets เพื่อให้รันใน Container ได้:
```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-3.0.x"]
}
```

---

## 5. การตรวจสอบและบำรุงรักษา

*   **ดูสถานะ:** `docker compose ps`
*   **ดู Log:** `docker compose logs -f --tail 50 backend`
*   **Backup ข้อมูล:** สำรองโฟลเดอร์ `mysql_data/` และไฟล์ `.env` ไว้สม่ำเสมอ
*   **Firewall:** ต้องเปิด Port 80, 443 (Web), 81 (Proxy Manager), และ 1984, 8554, 8555 (Streaming) ในระบบ Firewall ของคุณ

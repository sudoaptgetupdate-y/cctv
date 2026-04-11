# 🐳 Docker Setup Guide for Ubuntu 22.04 / 24.04 (The Hybrid Way)

คู่มือนี้สำหรับใช้ในการ Deploy ระบบ **CCTV Monitoring System** บนเซิร์ฟเวอร์จริง โดยใช้ Docker ตามกลยุทธ์ "The Hybrid Way" ที่ผ่านการ Optimized เพื่อประสิทธิภาพสูงสุด

---

## 1. เตรียมความพร้อมบน Ubuntu

```bash
# อัปเดตและติดตั้ง Docker
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# **ต้อง Log out และ Login ใหม่เพื่อให้มีผล**

### 🛡️ ตั้งค่า Firewall (สำคัญมากสำหรับ WebRTC)
เพื่อให้วิดีโอแสดงผลได้รวดเร็ว (WebRTC) ต้องเปิด Port เหล่านี้บน Ubuntu:
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 1984/tcp
sudo ufw allow 8554/tcp
sudo ufw allow 8555/tcp
sudo ufw allow 8555/udp
sudo ufw enable
```

```

---

## 2. โครงสร้างไฟล์และความลับ (.env)

สร้างไฟล์ `.env` ใน Root Directory เพื่อเก็บรหัสผ่าน (ไฟล์นี้จะไม่ถูกส่งขึ้น Git):

```bash
nano .env
```
**ตัวอย่างข้อมูล:**
```text
DB_ROOT_PASSWORD=your_secure_password
DB_NAME=cctv_db
DB_USER=cctv_admin
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key
```

---

## 3. การปรับแต่งเพื่อประสิทธิภาพสูงสุด (Best Practices)

### 🎥 กลยุทธ์การจัดการกล้อง (Zero CPU Usage)
เพื่อให้ระบบรองรับกล้องได้จำนวนมากโดยไม่กิน CPU (นิ่งที่ ~3-5%):
1.  **ตั้งค่ากล้องต้นทาง**: ควรตั้งค่ากล้อง (Dahua/Hikvision) ให้ส่งสัญญาณแบบ **H.264** เท่านั้น (หลีกเลี่ยง H.265 หากไม่จำเป็น)
2.  **ใช้ Sub-stream**: แนะนำให้ใช้ URL ที่เป็น Sub-stream (เช่น `subtype=1`) สำหรับการดูหน้า Dashboard เพื่อความลื่นไหล
3.  **Dynamic Registration**: ห้ามระบุชื่อกล้องใน `go2rtc.yaml` ตายตัว ระบบจะใช้ Backend API ในการลงทะเบียนกล้องให้เองแบบอัตโนมัติ

### 💻 สำหรับการรันบน Proxmox (Virtual Production)
เพื่อให้ FFmpeg และ Docker ทำงานได้เต็มประสิทธิภาพ:
1.  ไปที่ **Hardware > CPU**
2.  เปลี่ยน **Type** เป็น **`host`** (สำคัญมาก เพื่อใช้ชุดคำสั่งพิเศษของ CPU จริง)
3.  กำหนด Cores อย่างน้อย 4 Cores เพื่อรองรับการทำงานแบบ Multi-tasking

---

## 4. รายละเอียด Nginx Proxy (No Buffering)

ไฟล์ `nginx.conf` ถูกปรับแต่งให้ปิด Buffering เพื่อให้วิดีโอแสดงผลทันทีแบบ Zero Latency:
```nginx
location /go2rtc-ui/ {
    proxy_pass http://host.docker.internal:1984/;
    proxy_buffering off; # ปิดการสะสมข้อมูลวิดีโอ
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
}
```

---

## 5. การตั้งค่า Reverse Proxy (Nginx Proxy Manager)

1.  เข้า `http://your-server-ip:81` (Admin: `admin@example.com` / `changeme`)
2.  **Add Proxy Host:**
    *   **Domain:** `cctv.yourdomain.com`
    *   **Forward Hostname:** `frontend`
    *   **Forward Port:** `80`
    *   **Websockets Support:** ✅ **ON** (ต้องเปิดเพื่อรองรับวิดีโอ)
3.  **SSL:** เลือก `Request a new SSL Certificate` และเปิด `Force SSL`

---

## 6. การดูแลรักษาและแก้ไขปัญหา

*   **ล้าง Cache กล้อง**: หากเปลี่ยนค่าใน DB แล้ววิดีโอไม่เปลี่ยนตาม ให้สั่ง:
    `docker compose restart go2rtc`
*   **ดูสถานะ CPU**: ใช้คำสั่ง `docker stats` เพื่อตรวจสอบว่ามีการ Transcode แอบแฝงหรือไม่ (ถ้าใช้ H.264 ควรต่ำกว่า 10%)
*   **Log ตรวจสอบ**: 
    *   `docker compose logs -f backend` (ดูการลงทะเบียนกล้อง)
    *   `docker compose logs -f go2rtc` (ดูการดึงสัญญาณภาพ)

### 🧩 การแก้ไขปัญหา WebRTC (ICE failed)
หากพบ Error ใน Console ว่า `WebRTC: ICE failed`:
1.  **สาเหตุ:** เบราว์เซอร์ไม่สามารถสร้างช่องทางเชื่อมต่อตรง (P2P) กับ Server ได้ มักเกิดจากการปิดกั้นของ Firewall หรือ NAT
2.  **ผลกระทบ:** ระบบจะสลับไปใช้โหมด **MSE (Media Source Extensions)** แทนอัตโนมัติ ซึ่งวิดีโอจะยังดูได้ปกติ แต่อาจมีความหน่วง (Latency) เพิ่มขึ้นประมาณ 0.5-1.5 วินาที
3.  **วิธีแก้ไขบน Production:**
    *   ตรวจสอบว่าเปิด Port **8555/UDP** และ **8555/tcp** ที่ Firewall ของ Ubuntu แล้ว
    *   ตรวจสอบว่าใน `go2rtc.yaml` มีการระบุโดเมนจริงในส่วนของ `candidates` (เช่น `- cctv.yourdomain.com:8555`)
    *   หากใช้งานผ่าน HTTPS ระบบ WebRTC จะทำงานได้เสถียรขึ้นมาก


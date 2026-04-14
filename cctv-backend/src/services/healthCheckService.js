const net = require('net');
const prisma = require('../config/prisma');
const notificationService = require('./notificationService');

const healthCheckService = {
  // ฟังก์ชันตรวจสอบกล้อง 1 ตัว (ผ่าน TCP Port ของ RTSP - ปกติคือ 554)
  async checkCamera(camera) {
    return new Promise((resolve) => {
      const url = new URL(camera.rtspUrl.replace('rtsp://', 'http://')); // แปลงชั่วคราวเพื่อดึง host/port
      const host = url.hostname;
      const port = url.port || 554;

      const socket = new net.Socket();
      socket.setTimeout(5000); // รอ 5 วินาที

      socket.on('connect', async () => {
        socket.destroy();
        resolve({ id: camera.id, status: 'ACTIVE' });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({ id: camera.id, status: 'INACTIVE' });
      });

      socket.on('error', () => {
        socket.destroy();
        resolve({ id: camera.id, status: 'INACTIVE' });
      });

      socket.connect(port, host);
    });
  },

  // ฟังก์ชันตรวจสอบกล้องทั้งหมดในระบบ
  async checkAllCameras() {
    console.log('🔍 [Health Check] Starting periodic camera check...');
    const cameras = await prisma.camera.findMany({
      include: { groups: true }
    });

    for (const camera of cameras) {
      const result = await this.checkCamera(camera);
      
      // ถ้าสถานะเปลี่ยนไปจากเดิม ให้บันทึก Log และส่งแจ้งเตือน
      if (camera.status !== result.status) {
        await prisma.camera.update({
          where: { id: camera.id },
          data: { 
            status: result.status,
            lastSeen: result.status === 'ACTIVE' ? new Date() : camera.lastSeen
          }
        });

        // บันทึกประวัติสถานะ (Event Log)
        await prisma.cameraEventLog.create({
          data: {
            cameraId: camera.id,
            eventType: result.status === 'ACTIVE' ? 'ONLINE' : 'OFFLINE',
            details: result.status === 'ACTIVE' ? 'Camera is back online' : 'Camera connection lost'
          }
        });

        // ส่งแจ้งเตือน Telegram
        await notificationService.sendCameraAlert(camera, result.status);
      }
    }
    console.log('✅ [Health Check] Finished check for', cameras.length, 'cameras');
  }
};

module.exports = healthCheckService;

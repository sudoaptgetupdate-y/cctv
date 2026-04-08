const prisma = require('../config/prisma');

const streamService = {
  /**
   * ดึงข้อมูลการตั้งค่าสำหรับสตรีมมิ่งของกล้อง
   * @param {number} cameraId 
   */
  async getStreamConfig(cameraId) {
    const camera = await prisma.camera.findUnique({
      where: { id: parseInt(cameraId) }
    });

    if (!camera) {
      throw new Error('Camera not found');
    }

    // สร้าง Stream ID สำหรับ go2rtc (ใช้ ID กล้องเพื่อให้ไม่ซ้ำกัน)
    const streamId = `camera_${camera.id}`;
    
    // URL ของ go2rtc server (ดึงจาก .env)
    const go2rtcUrl = process.env.GO2RTC_URL || 'http://localhost:1984';

    return {
      streamId,
      go2rtcUrl,
      cameraName: camera.name,
      rtspUrl: camera.rtspUrl, // ส่งกลับไปเผื่อต้องใช้ debug
      subStream: camera.subStream
    };
  }
};

module.exports = streamService;

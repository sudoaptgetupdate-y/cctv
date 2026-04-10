const prisma = require('../config/prisma');
const axios = require('axios');

const streamService = {
  async getStreamConfig(cameraId) {
    const camera = await prisma.camera.findUnique({
      where: { id: parseInt(cameraId) }
    });

    if (!camera) throw new Error('Camera not found');

    const streamId = `camera_${camera.id}`;
    // ใช้ Host IP จาก Docker
    const go2rtcUrl = process.env.GO2RTC_URL || 'http://host.docker.internal:1984';

    console.log(`[Streaming] Registering ${streamId} in go2rtc...`);

    try {
      // 🚀 ใช้รูปแบบ JSON เพื่อความแม่นยำสูงสุด
      await axios.put(`${go2rtcUrl}/api/streams`, {
        name: streamId,
        src: camera.rtspUrl
      }, {
        timeout: 5000
      });
      console.log(`[Streaming] ✅ ${streamId} registered successfully`);
    } catch (error) {
      console.error(`[Streaming] ❌ Failed to register ${streamId}: ${error.message}`);
      
      // Fallback: หากแบบแรกพลาด ให้ลองแบบ Query String (วิธีสำรอง)
      try {
        await axios.put(`${go2rtcUrl}/api/streams?name=${streamId}&src=${encodeURIComponent(camera.rtspUrl)}`);
        console.log(`[Streaming] 🔄 ${streamId} registered via Query Fallback`);
      } catch (fError) {
        console.error(`[Streaming] 🚨 All methods failed: ${fError.message}`);
      }
    }

    return { streamId, go2rtcUrl, cameraName: camera.name };
  }
};

module.exports = streamService;

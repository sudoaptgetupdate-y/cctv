const prisma = require('../config/prisma');
const axios = require('axios');

const streamService = {
  async getStreamConfig(cameraId) {
    const camera = await prisma.camera.findUnique({
      where: { id: parseInt(cameraId) }
    });

    if (!camera) throw new Error('Camera not found');

    const streamId = `camera_${camera.id}`;
    const go2rtcUrl = process.env.GO2RTC_URL || 'http://host.docker.internal:1984';

    console.log(`[Streaming] Registering ${streamId} in go2rtc...`);

    try {
      // 🚀 ใช้ Query String (วิธีที่แน่นอนที่สุดสำหรับ go2rtc ทุกเวอร์ชัน)
      // ส่งทั้ง name และ src ผ่าน URL เพื่อความชัวร์
      const encodedSrc = encodeURIComponent(camera.rtspUrl);
      const registerUrl = `${go2rtcUrl}/api/streams?name=${streamId}&src=${encodedSrc}`;
      
      await axios.put(registerUrl, null, { timeout: 5000 });
      
      console.log(`[Streaming] ✅ ${streamId} registered successfully`);
    } catch (error) {
      console.error(`[Streaming] ❌ Failed to register ${streamId}: ${error.message}`);
      
      // Fallback: ลองใช้ FFmpeg (หากแบบแรกมีปัญหา)
      try {
        const ffmpegSrc = encodeURIComponent(`ffmpeg:${camera.rtspUrl}#video=h264#audio=aac`);
        await axios.put(`${go2rtcUrl}/api/streams?name=${streamId}&src=${ffmpegSrc}`);
        console.log(`[Streaming] 🔄 ${streamId} registered via FFmpeg Fallback`);
      } catch (fError) {
        console.error(`[Streaming] 🚨 All registration methods failed: ${fError.message}`);
      }
    }

    return { streamId, go2rtcUrl, cameraName: camera.name };
  }
};

module.exports = streamService;

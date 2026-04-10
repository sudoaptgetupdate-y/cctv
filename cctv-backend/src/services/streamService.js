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

    console.log(`[Streaming] 🛡️ RE-REGISTERING ${streamId} WITH SIMPLE FFMPEG TRANSCODE...`);

    try {
      // 1. ลบสตรีมเก่าออกก่อน
      try { await axios.delete(`${go2rtcUrl}/api/streams?name=${streamId}`); } catch (e) {}
      
      // 2. รอเล็กน้อย
      await new Promise(resolve => setTimeout(resolve, 200));

      // 3. ใช้รูปแบบ ffmpeg: มาตรฐาน (ตัดพารามิเตอร์ที่ซับซ้อนออกเพื่อให้ go2rtc จัดการเอง)
      const transcodeSrc = `ffmpeg:${camera.rtspUrl}#video=h264#audio=aac`;
      
      const encodedSrc = encodeURIComponent(transcodeSrc);
      const registerUrl = `${go2rtcUrl}/api/streams?name=${streamId}&src=${encodedSrc}`;
      
      await axios.put(registerUrl, null, { timeout: 5000 });
      console.log(`[Streaming] ✅ ${streamId} registered successfully (Simple FFmpeg Mode)`);
    } catch (error) {
      console.error(`[Streaming] ❌ Failed: ${error.message}`);
    }

    return { streamId, go2rtcUrl, cameraName: camera.name };
  }
};

module.exports = streamService;

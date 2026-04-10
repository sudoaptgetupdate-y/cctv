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

    console.log(`[Streaming] Registering ${streamId} with Ultra-Low Latency Transcoding...`);

    try {
      // 🚀 บังคับใช้ FFmpeg พร้อม Flag สำหรับความเร็วสูงสุด (Zero Latency)
      // -probesize 32 & -analyzeduration 0: ลดเวลาเริ่มทำงาน (Cold Start)
      // -fflags nobuffer & -flags low_delay: ปิด Buffer เพื่อความสดของภาพ
      // -tune zerolatency: ปรับปรุงเพื่อการส่งภาพสดโดยเฉพาะ
      const transcodeSrc = `ffmpeg:${camera.rtspUrl}#video=h264#audio=aac#raw=-probesize 32 -analyzeduration 0 -fflags nobuffer -flags low_delay -preset ultrafast -tune zerolatency`;
      
      const encodedSrc = encodeURIComponent(transcodeSrc);
      const registerUrl = `${go2rtcUrl}/api/streams?name=${streamId}&src=${encodedSrc}`;
      
      await axios.put(registerUrl, null, { timeout: 5000 });
      
      console.log(`[Streaming] ✅ ${streamId} registered successfully (Ultra-Low Latency Mode)`);
    } catch (error) {
      console.error(`[Streaming] ❌ Failed to register ${streamId}: ${error.message}`);
      
      try {
        const directSrc = encodeURIComponent(camera.rtspUrl);
        await axios.put(`${go2rtcUrl}/api/streams?name=${streamId}&src=${directSrc}`);
        console.log(`[Streaming] 🔄 ${streamId} registered via Direct Fallback`);
      } catch (fError) {
        console.error(`[Streaming] 🚨 All registration methods failed: ${fError.message}`);
      }
    }

    return { streamId, go2rtcUrl, cameraName: camera.name };
  }
};

module.exports = streamService;

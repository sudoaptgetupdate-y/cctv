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

    console.log(`[Streaming] Registering ${streamId} with H.264 Transcoding...`);

    try {
      // 🚀 บังคับใช้ FFmpeg เพื่อแปลง H.265 เป็น H.264 เพื่อให้ดูได้บนทุก Browser
      // #video=h264: แปลงภาพเป็น H.264
      // #audio=aac: แปลงเสียงเป็น AAC (ถ้ามี)
      const transcodeSrc = `ffmpeg:${camera.rtspUrl}#video=h264#audio=aac`;
      const encodedSrc = encodeURIComponent(transcodeSrc);
      const registerUrl = `${go2rtcUrl}/api/streams?name=${streamId}&src=${encodedSrc}`;
      
      await axios.put(registerUrl, null, { timeout: 5000 });
      
      console.log(`[Streaming] ✅ ${streamId} registered successfully with Transcoding`);
    } catch (error) {
      console.error(`[Streaming] ❌ Failed to register ${streamId}: ${error.message}`);
      
      // Fallback: ลองแบบ Direct (เผื่อในกรณีที่กล้องเป็น H.264 อยู่แล้วและ ffmpeg มีปัญหา)
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

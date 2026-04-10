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

    console.log(`[Streaming] FORCING H.264 Transcoding for ${streamId}...`);

    try {
      // 🚀 บังคับใช้ ffmpeg: นำหน้าเพื่อแปลง H.265 เป็น H.264
      // ปรับปรุงคำสั่ง ffmpeg ให้กระชับและรองรับกล้อง H.265 ได้ชัวร์ที่สุด
      const ffmpegSrc = `ffmpeg:${camera.rtspUrl}#video=h264#audio=aac#raw=-probesize 32 -analyzeduration 0 -fflags nobuffer -flags low_delay -preset ultrafast -tune zerolatency`;
      
      const encodedSrc = encodeURIComponent(ffmpegSrc);
      const registerUrl = `${go2rtcUrl}/api/streams?name=${streamId}&src=${encodedSrc}`;
      
      // ลบสตรีมเก่าออกก่อนเพื่อให้ go2rtc รับค่าใหม่ (Force Refresh)
      try { await axios.delete(`${go2rtcUrl}/api/streams?name=${streamId}`); } catch (e) {}

      await axios.put(registerUrl, null, { timeout: 5000 });
      console.log(`[Streaming] ✅ ${streamId} re-registered with FFmpeg Transcoding`);
    } catch (error) {
      console.error(`[Streaming] ❌ Error: ${error.message}`);
    }

    return { streamId, go2rtcUrl, cameraName: camera.name };
  }
};

module.exports = streamService;

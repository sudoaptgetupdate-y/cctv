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

    console.log(`[Streaming] 🛡️ RE-REGISTERING ${streamId} FOR ZERO-LATENCY...`);

    try {
      try { await axios.delete(`${go2rtcUrl}/api/streams?name=${streamId}`); } catch (e) {}
      await new Promise(resolve => setTimeout(resolve, 500));

      // 🚀 บังคับใช้ OPUS สำหรับเสียง และ H264 พร้อม Low-Latency Flags
      // -rtsp_transport tcp: บังคับใช้ TCP (เพื่อป้องกัน i/o timeout)
      // -c:a libopus: เปลี่ยนเป็น OPUS (แก้ปัญหาวงกลมหมุน)
      // -g 15: ส่ง Keyframe ทุกๆ 1 วินาที เพื่อให้ภาพมาทันใจ
      const optimizedSrc = `exec:ffmpeg -hide_banner -v error -rtsp_transport tcp -i "${camera.rtspUrl}" -c:v libx264 -preset ultrafast -tune zerolatency -g 15 -pix_fmt yuv420p -c:a libopus -ar 48000 -ac 2 -f rtsp {output}`;
      
      const encodedSrc = encodeURIComponent(optimizedSrc);
      const registerUrl = `${go2rtcUrl}/api/streams?name=${streamId}&src=${encodedSrc}`;
      
      await axios.put(registerUrl, null, { timeout: 10000 });
      console.log(`[Streaming] ✅ ${streamId} optimized successfully`);
    } catch (error) {
      console.error(`[Streaming] ❌ Error: ${error.message}`);
    }

    return { streamId, go2rtcUrl, cameraName: camera.name };
  }
};

module.exports = streamService;

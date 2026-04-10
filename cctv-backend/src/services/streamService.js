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

    console.log(`[Streaming] 🛡️ OPTIMIZING ${streamId} FOR INSTANT WEBRTC...`);

    try {
      try { await axios.delete(`${go2rtcUrl}/api/streams?name=${streamId}`); } catch (e) {}
      await new Promise(resolve => setTimeout(resolve, 200));

      // 🚀 บังคับใช้ OPUS สำหรับเสียง และ H264 สำหรับภาพ (WebRTC Native)
      // -c:v libx264 -g 15: ส่ง Keyframe ทุกๆ 15 เฟรม (ภาพจะมาไวมาก)
      // -c:a libopus -ar 48000 -ac 2: แปลงเสียงเป็น OPUS มาตรฐาน WebRTC (แก้ปัญหาหมุนโหลด)
      const optimizedSrc = `exec:ffmpeg -hide_banner -v error -i "${camera.rtspUrl}" -c:v libx264 -preset ultrafast -tune zerolatency -g 15 -pix_fmt yuv420p -c:a libopus -ar 48000 -ac 2 -f rtsp {output}`;
      
      const encodedSrc = encodeURIComponent(optimizedSrc);
      const registerUrl = `${go2rtcUrl}/api/streams?name=${streamId}&src=${encodedSrc}`;
      
      await axios.put(registerUrl, null, { timeout: 5000 });
      console.log(`[Streaming] ✅ ${streamId} optimized for instant WebRTC playback`);
    } catch (error) {
      console.error(`[Streaming] ❌ Optimization Error: ${error.message}`);
    }

    return { streamId, go2rtcUrl, cameraName: camera.name };
  }
};

module.exports = streamService;

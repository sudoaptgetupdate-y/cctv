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

    // 🚀 กลยุทธ์ประหยัด CPU: ถ้ามี subStream (ซึ่งมักเป็น H.264) ให้ใช้ตัวนั้นก่อน
    const rtspUrl = camera.subStream || camera.rtspUrl;

    console.log(`[Streaming] 🛡️ EMERGENCY SAVING MODE FOR ${streamId}...`);

    try {
      try { await axios.delete(`${go2rtcUrl}/api/streams?name=${streamId}`); } catch (e) {}
      await new Promise(resolve => setTimeout(resolve, 500));

      // 🏎️ ปรับจูน FFmpeg ขั้นสุดยอด:
      // -threads 1: จำกัดการใช้ CPU เพียง 1 Core ต่อกล้อง (ป้องกัน CPU พุ่งทะลุ 200%)
      // -c:v libx264 -preset ultrafast: เน้นประหยัดเวลาคำนวณที่สุด
      // -crf 28: ยอมเสียความคมชัดเพื่อประหยัด CPU
      const survivalSrc = `exec:ffmpeg -hide_banner -v error -rtsp_transport tcp -i "${rtspUrl}" -c:v libx264 -preset ultrafast -tune zerolatency -threads 1 -s 640x360 -b:v 400k -r 15 -g 30 -crf 28 -pix_fmt yuv420p -c:a copy -f rtsp {output}`;
      
      const encodedSrc = encodeURIComponent(survivalSrc);
      const registerUrl = `${go2rtcUrl}/api/streams?name=${streamId}&src=${encodedSrc}`;
      
      await axios.put(registerUrl, null, { timeout: 10000 });
      console.log(`[Streaming] ✅ ${streamId} registered in SURVIVAL Mode (Low CPU)`);
    } catch (error) {
      console.error(`[Streaming] ❌ Error: ${error.message}`);
    }

    return { streamId, go2rtcUrl, cameraName: camera.name };
  }
};

module.exports = streamService;

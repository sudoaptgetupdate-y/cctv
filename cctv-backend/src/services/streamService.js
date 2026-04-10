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

    console.log(`[Streaming] 🛡️ EMERGENCY CPU SAVING MODE (480p) FOR ${streamId}...`);

    try {
      try { await axios.delete(`${go2rtcUrl}/api/streams?name=${streamId}`); } catch (e) {}
      await new Promise(resolve => setTimeout(resolve, 500));

      // 🚀 โหมดประหยัดทรัพยากรสูงสุด (Ultra-Lightweight):
      // -s 854x480: ลดความละเอียดเป็น 480p
      // -b:v 800k: ลด Bitrate ให้ต่ำลงแต่ยังพอดูได้ชัด
      // -r 15: จำกัด Frame Rate ไว้ที่ 15 fps (ช่วยลด CPU ได้มาก)
      // -threads 1: จำกัดการใช้ Thread เพื่อไม่ให้กวน Service อื่น (เลือกเปิด/ปิดได้)
      const ultraLightSrc = `exec:ffmpeg -hide_banner -v error -rtsp_transport tcp -i "${camera.rtspUrl}" -c:v libx264 -preset ultrafast -tune zerolatency -s 854x480 -b:v 800k -r 15 -g 30 -pix_fmt yuv420p -c:a libopus -ar 48000 -ac 2 -f rtsp {output}`;
      
      const encodedSrc = encodeURIComponent(ultraLightSrc);
      const registerUrl = `${go2rtcUrl}/api/streams?name=${streamId}&src=${encodedSrc}`;
      
      await axios.put(registerUrl, null, { timeout: 10000 });
      console.log(`[Streaming] ✅ ${streamId} registered in ULTRA-LIGHT Mode (480p/15fps)`);
    } catch (error) {
      console.error(`[Streaming] ❌ Error: ${error.message}`);
    }

    return { streamId, go2rtcUrl, cameraName: camera.name };
  }
};

module.exports = streamService;

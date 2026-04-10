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

    console.log(`[Streaming] 🛡️ OPTIMIZING CPU FOR ${streamId}...`);

    try {
      try { await axios.delete(`${go2rtcUrl}/api/streams?name=${streamId}`); } catch (e) {}
      await new Promise(resolve => setTimeout(resolve, 500));

      // 🚀 ปรับจูนให้ CPU ทำงานน้อยลง:
      // -s 1280x720: ลดความละเอียดเหลือ 720p (ช่วยลด CPU ได้มหาศาล)
      // -b:v 1500k: จำกัด Bitrate ไม่ให้สูงเกินไป
      // -g 30: เพิ่มระยะ Keyframe เล็กน้อยเพื่อลดภาระ CPU
      const lightSrc = `exec:ffmpeg -hide_banner -v error -rtsp_transport tcp -i "${camera.rtspUrl}" -c:v libx264 -preset ultrafast -tune zerolatency -s 1280x720 -b:v 1500k -g 30 -pix_fmt yuv420p -c:a libopus -ar 48000 -ac 2 -f rtsp {output}`;
      
      const encodedSrc = encodeURIComponent(lightSrc);
      const registerUrl = `${go2rtcUrl}/api/streams?name=${streamId}&src=${encodedSrc}`;
      
      await axios.put(registerUrl, null, { timeout: 10000 });
      console.log(`[Streaming] ✅ ${streamId} registered in LIGHTWEIGHT Mode`);
    } catch (error) {
      console.error(`[Streaming] ❌ Error: ${error.message}`);
    }

    return { streamId, go2rtcUrl, cameraName: camera.name };
  }
};

module.exports = streamService;

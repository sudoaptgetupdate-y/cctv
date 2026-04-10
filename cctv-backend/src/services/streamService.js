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

    console.log(`[Streaming] 🛡️ RE-REGISTERING ${streamId} WITH TCP & H264...`);

    try {
      // 1. ลบสตรีมเก่าออกก่อนเพื่อให้แน่ใจว่าจะใช้ Config ใหม่
      try { await axios.delete(`${go2rtcUrl}/api/streams?name=${streamId}`); } catch (e) {}
      
      // 2. หน่วงเวลาเล็กน้อยให้ go2rtc เคลียร์สถานะ
      await new Promise(resolve => setTimeout(resolve, 500));

      // 3. ใช้ FFmpeg พร้อมบังคับ TCP และเพิ่ม Timeout (แก้ปัญหา i/o timeout)
      // -rtsp_transport tcp: บังคับใช้ TCP
      // -stimeout 5000000: รอข้อมูลได้นานถึง 5 วินาที
      const transcodeSrc = `ffmpeg:${camera.rtspUrl}#video=h264#audio=aac#input=-rtsp_transport tcp -stimeout 5000000`;
      
      const encodedSrc = encodeURIComponent(transcodeSrc);
      const registerUrl = `${go2rtcUrl}/api/streams?name=${streamId}&src=${encodedSrc}`;
      
      await axios.put(registerUrl, null, { timeout: 10000 });
      console.log(`[Streaming] ✅ ${streamId} registered successfully with TCP Transcoding`);
    } catch (error) {
      console.error(`[Streaming] ❌ Registration Error: ${error.message}`);
    }

    return { streamId, go2rtcUrl, cameraName: camera.name };
  }
};

module.exports = streamService;

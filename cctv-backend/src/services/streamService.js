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

    console.log(`[Streaming] 🛡️ FORCING H264 TRANSCODE FOR ${streamId}...`);

    try {
      // 1. ลบสตรีมเก่าออกก่อน
      try { await axios.delete(`${go2rtcUrl}/api/streams?name=${streamId}`); } catch (e) {}
      
      // 2. รอเสี้ยววินาที
      await new Promise(resolve => setTimeout(resolve, 200));

      // 3. สร้างคำสั่ง FFmpeg ที่สมบูรณ์
      // -rtsp_transport tcp: เพื่อความเสถียรข้ามวง LAN
      // #video=h264: บังคับแปลงเป็น H.264
      // #audio=aac#audio=opus: เพิ่มทางเลือกเสียงสำหรับ WebRTC
      const transcodeSrc = `ffmpeg:${camera.rtspUrl}#video=h264#audio=aac#audio=opus#input=-rtsp_transport tcp`;
      
      // 🚀 ส่งข้อมูลผ่าน BODY (Plain Text) แทน URL เพื่อป้องกันอักขระพิเศษ (&, #) เพี้ยน
      await axios.put(`${go2rtcUrl}/api/streams?name=${streamId}`, transcodeSrc, {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 5000
      });

      console.log(`[Streaming] ✅ ${streamId} registered with FORCE TRANSCODE (Body Mode)`);
    } catch (error) {
      console.error(`[Streaming] ❌ Error: ${error.message}`);
    }

    return { streamId, go2rtcUrl, cameraName: camera.name };
  }
};

module.exports = streamService;

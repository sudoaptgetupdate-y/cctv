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

    // 🚀 บังคับใช้ค่าที่คุณเพิ่งแก้ในหน้า Manage (rtspUrl)
    const currentRtspUrl = camera.rtspUrl;

    console.log(`[Streaming] 🛡️ RE-REGISTERING ${streamId}`);
    console.log(`[Streaming] 🔗 Target URL: ${currentRtspUrl}`);

    try {
      // 1. ลบสตรีมเก่าออกแบบถอนรากถอนโคน (Force Delete)
      try { 
        await axios.delete(`${go2rtcUrl}/api/streams?name=${streamId}`);
        console.log(`[Streaming] 🗑️ Old stream deleted`);
      } catch (e) {}
      
      // 2. หน่วงเวลาให้ go2rtc เคลียร์ Consumer เก่าที่ค้างอยู่ใน Browser
      await new Promise(resolve => setTimeout(resolve, 500));

      // 3. ลงทะเบียนใหม่ด้วยค่าล่าสุด (Relay Mode เพื่อ 0% CPU)
      await axios.put(`${go2rtcUrl}/api/streams?name=${streamId}`, currentRtspUrl, {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 5000
      });

      console.log(`[Streaming] ✅ ${streamId} registered successfully with latest URL`);
    } catch (error) {
      console.error(`[Streaming] ❌ Error: ${error.message}`);
    }

    return { streamId, go2rtcUrl, cameraName: camera.name };
  }
};

module.exports = streamService;

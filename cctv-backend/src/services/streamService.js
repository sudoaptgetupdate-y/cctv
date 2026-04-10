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

    // 🚀 เพิ่ม Timestamp เพื่อป้องกัน Cache และดึงค่าล่าสุดจาก DB จริงๆ
    const currentRtspUrl = camera.rtspUrl;

    console.log(`[Streaming] 🛡️ FORCE UPDATING ${streamId}...`);
    console.log(`[Streaming] 🔗 New URL: ${currentRtspUrl}`);

    try {
      // 1. ลบสตรีมเก่าออกแบบเจาะจง
      await axios.delete(`${go2rtcUrl}/api/streams?name=${streamId}`).catch(() => {});
      
      // 2. หน่วงเวลานานขึ้นนิดหน่อย (ให้กัวใจ go2rtc ว่างเปล่าจริงๆ)
      await new Promise(resolve => setTimeout(resolve, 500));

      // 3. ลงทะเบียนใหม่โดยส่ง src ผ่าน Query String (วิธีที่แน่นอนที่สุด)
      // และใช้ PUT เพื่อบังคับสร้าง/แก้ไข
      const registerUrl = `${go2rtcUrl}/api/streams?name=${streamId}&src=${encodeURIComponent(currentRtspUrl)}`;
      
      const response = await axios.put(registerUrl, null, { timeout: 5000 });
      
      console.log(`[Streaming] ✅ go2rtc response: ${response.status} ${response.statusText}`);
      console.log(`[Streaming] ✅ ${streamId} sync completed with latest DB value`);
      
      // 4. ตรวจสอบทันทีว่า go2rtc รับค่าไปหรือยัง (Debug Only)
      const check = await axios.get(`${go2rtcUrl}/api/streams`).catch(() => ({data: {}}));
      console.log(`[Streaming] 🔍 Current go2rtc state for ${streamId}:`, check.data[streamId] ? 'Registered' : 'NOT FOUND');

    } catch (error) {
      console.error(`[Streaming] ❌ Sync Error: ${error.message}`);
    }

    return { streamId, go2rtcUrl, cameraName: camera.name };
  }
};

module.exports = streamService;

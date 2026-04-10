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

    console.log(`[Streaming] 🛡️ VM OPTIMIZED MODE (480p/Low CPU) FOR ${streamId}...`);

    try {
      try { await axios.delete(`${go2rtcUrl}/api/streams?name=${streamId}`); } catch (e) {}
      await new Promise(resolve => setTimeout(resolve, 500));

      // 🚀 ปรับจูนสำหรับ VM Environment:
      // -preset ultrafast: บังคับให้ FFmpeg คิดน้อยที่สุด (แลกกับขนาดไฟล์ใหญ่ขึ้นเล็กน้อย)
      // -threads 2: กำหนดจำนวนคอร์ให้เหมาะสม (ลองปรับ 2-4 ตามคอร์ของ VM)
      // -flags -global_header: ช่วยลด Overhead ของข้อมูลวิดีโอ
      const vmOptimizedSrc = `exec:ffmpeg -hide_banner -v error -rtsp_transport tcp -i "${camera.rtspUrl}" -c:v libx264 -preset ultrafast -tune zerolatency -s 854x480 -b:v 600k -r 15 -g 30 -threads 2 -pix_fmt yuv420p -c:a copy -f rtsp {output}`;
      
      const encodedSrc = encodeURIComponent(vmOptimizedSrc);
      const registerUrl = `${go2rtcUrl}/api/streams?name=${streamId}&src=${encodedSrc}`;
      
      await axios.put(registerUrl, null, { timeout: 10000 });
      console.log(`[Streaming] ✅ ${streamId} registered in VM-OPTIMIZED Mode`);
    } catch (error) {
      console.error(`[Streaming] ❌ Error: ${error.message}`);
    }

    return { streamId, go2rtcUrl, cameraName: camera.name };
  }
};

module.exports = streamService;

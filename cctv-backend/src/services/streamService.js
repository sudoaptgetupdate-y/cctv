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

    console.log(`[Streaming] 🛡️ RE-REGISTERING ${streamId} WITH FORCE H264...`);

    try {
      // 1. ลบสตรีมเก่าออกก่อน (ถ้ามี)
      try { await axios.delete(`${go2rtcUrl}/api/streams?name=${streamId}`); } catch (e) {}
      
      // 2. รอเสี้ยววินาทีเพื่อให้ go2rtc ล้างหน่วยความจำ
      await new Promise(resolve => setTimeout(resolve, 300));

      // 3. ใช้รูปแบบ "exec" source ซึ่งเป็นวิธีที่เด็ดขาดที่สุดในการสั่ง FFmpeg ใน go2rtc
      // วิธีนี้จะบังคับให้ FFmpeg รันคำสั่งแปลงรหัสโดยตรง
      const forceTranscodeSrc = `exec:ffmpeg -hide_banner -probesize 32 -analyzeduration 0 -i "${camera.rtspUrl}" -c:v libx264 -preset ultrafast -tune zerolatency -c:a aac -f rtsp {output}`;
      
      const encodedSrc = encodeURIComponent(forceTranscodeSrc);
      const registerUrl = `${go2rtcUrl}/api/streams?name=${streamId}&src=${encodedSrc}`;
      
      await axios.put(registerUrl, null, { timeout: 5000 });
      console.log(`[Streaming] ✅ ${streamId} is now FORCED to H.264 via FFmpeg exec`);
    } catch (error) {
      console.error(`[Streaming] ❌ Force Transcode Failed: ${error.message}`);
      
      // Fallback: ใช้รูปแบบปกติที่รองลงมา
      try {
        const simpleFfmpeg = encodeURIComponent(`ffmpeg:${camera.rtspUrl}#video=h264#audio=aac`);
        await axios.put(`${go2rtcUrl}/api/streams?name=${streamId}&src=${simpleFfmpeg}`);
        console.log(`[Streaming] 🔄 ${streamId} registered via simple ffmpeg fallback`);
      } catch (fError) {
        console.error(`[Streaming] 🚨 Critical Failure: ${fError.message}`);
      }
    }

    return { streamId, go2rtcUrl, cameraName: camera.name };
  }
};

module.exports = streamService;

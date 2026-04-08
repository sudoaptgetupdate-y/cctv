const prisma = require('../config/prisma');
const axios = require('axios');

const streamService = {
  async getStreamConfig(cameraId) {
    const camera = await prisma.camera.findUnique({
      where: { id: parseInt(cameraId) }
    });

    if (!camera) throw new Error('Camera not found');

    const streamId = `camera_${camera.id}`;
    const go2rtcUrl = process.env.GO2RTC_URL || 'http://127.0.0.1:1984';

    try {
      // 🚀 ประหยัด Bandwidth และ CPU สูงสุด (Relay Mode)
      // ใช้ RTSP จากกล้องตรงๆ โดยไม่ผ่าน FFmpeg (CPU 0%)
      // วิธีนี้จะลื่นที่สุดหากกล้องเป็น H.264 อยู่แล้ว (มาตรฐานกล้องส่วนใหญ่)
      const relaySrc = camera.rtspUrl;
      
      console.log(`[Streaming] Registering ${streamId} via Relay Mode (Direct RTSP)...`);
      
      await axios.put(`${go2rtcUrl}/api/streams?name=${streamId}`, relaySrc, {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 5000
      });

      console.log(`[Streaming] ${streamId} registered successfully (Relay Mode - Best Performance)`);
    } catch (error) {
      console.warn(`[Streaming] Relay Mode failed for ${streamId}, falling back to Transcode...`);
      
      // 🔄 Fallback: หากแบบ Direct มีปัญหา ค่อยใช้ FFmpeg เพื่อช่วยทำ Segment (กิน CPU มากกว่า)
      try {
        const transcodeSrc = `ffmpeg:${camera.rtspUrl}#video=h264#audio=aac#raw=-fflags nobuffer -flags low_delay -preset ultrafast -tune zerolatency -g 15 -bf 0 -rtsp_transport tcp`;
        await axios.put(`${go2rtcUrl}/api/streams?name=${streamId}`, transcodeSrc, {
          headers: { 'Content-Type': 'text/plain' }
        });
        console.log(`[Streaming] ${streamId} registered via Transcode Mode`);
      } catch (fallbackError) {
        console.error(`[Streaming] All registration methods failed: ${fallbackError.message}`);
      }
    }

    return { streamId, go2rtcUrl, cameraName: camera.name };
  }
};

module.exports = streamService;

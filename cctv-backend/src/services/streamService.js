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

    console.log(`[Streaming] 🚀 SMART RELAY MODE FOR ${streamId}...`);

    try {
      // 1. ลบสตรีมเก่าออก
      try { await axios.delete(`${go2rtcUrl}/api/streams?name=${streamId}`); } catch (e) {}
      await new Promise(resolve => setTimeout(resolve, 200));

      // 2. ⚡️ HIGH PERFORMANCE RELAY (0% CPU)
      // เมื่อคุณเปลี่ยนกล้องเป็น H.264 แล้ว วิธีนี้จะลื่นที่สุดและไม่กิน CPU เลย
      const relaySrc = camera.rtspUrl;
      
      await axios.put(`${go2rtcUrl}/api/streams?name=${streamId}`, relaySrc, {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 5000
      });

      console.log(`[Streaming] ✅ ${streamId} registered in RELAY Mode (Zero CPU)`);
    } catch (error) {
      console.warn(`[Streaming] ⚠️ Relay failed, falling back to Transcode...`);
      
      // Fallback: ถ้ายังเป็น H.265 อยู่ ให้ใช้ FFmpeg ช่วยแปลง (โหมดประหยัด CPU)
      try {
        const fallbackSrc = `ffmpeg:${camera.rtspUrl}#video=h264#audio=aac#input=-rtsp_transport tcp`;
        const encodedSrc = encodeURIComponent(fallbackSrc);
        await axios.put(`${go2rtcUrl}/api/streams?name=${streamId}&src=${encodedSrc}`);
      } catch (fError) {
        console.error(`[Streaming] 🚨 Critical Error: ${fError.message}`);
      }
    }

    return { streamId, go2rtcUrl, cameraName: camera.name };
  }
};

module.exports = streamService;

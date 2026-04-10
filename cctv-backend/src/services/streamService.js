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

    console.log(`[Streaming] ⚡️ PROMOTING RELAY MODE FOR ${streamId}...`);

    try {
      try { await axios.delete(`${go2rtcUrl}/api/streams?name=${streamId}`); } catch (e) {}
      await new Promise(resolve => setTimeout(resolve, 300));

      // 🚀 บังคับใช้ RELAY MODE (ส่ง URL ตรงๆ ให้ go2rtc)
      // หากกล้องเป็น H.264 วิธีนี้จะใช้ CPU 0% อย่างแท้จริง
      const relaySrc = camera.rtspUrl;
      
      await axios.put(`${go2rtcUrl}/api/streams?name=${streamId}`, relaySrc, {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 5000
      });

      console.log(`[Streaming] ✅ ${streamId} registered in PURE RELAY Mode (0% CPU)`);
    } catch (error) {
      console.warn(`[Streaming] ⚠️ Pure Relay failed, falling back to FFmpeg-Copy...`);
      
      // Fallback: หากแบบแรกมีปัญหา ให้ใช้ FFmpeg แต่สั่งแค่ COPY (ไม่ Re-encode)
      try {
        const copySrc = `ffmpeg:${camera.rtspUrl}#video=copy#audio=aac#input=-rtsp_transport tcp`;
        const encodedSrc = encodeURIComponent(copySrc);
        await axios.put(`${go2rtcUrl}/api/streams?name=${streamId}&src=${encodedSrc}`);
        console.log(`[Streaming] 🔄 ${streamId} registered in COPY Mode (Low CPU)`);
      } catch (fError) {
        console.error(`[Streaming] 🚨 All methods failed: ${fError.message}`);
      }
    }

    return { streamId, go2rtcUrl, cameraName: camera.name };
  }
};

module.exports = streamService;

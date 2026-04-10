const prisma = require('../config/prisma');
const axios = require('axios');

const streamService = {
  async getStreamConfig(cameraId) {
    const camera = await prisma.camera.findUnique({
      where: { id: parseInt(cameraId) }
    });

    if (!camera) throw new Error('Camera not found');

    const streamId = `camera_${camera.id}`;
    // ใช้ Host IP จาก Docker
    const go2rtcUrl = process.env.GO2RTC_URL || 'http://host.docker.internal:1984';

    console.log(`[Streaming] Attempting to register ${streamId} in go2rtc at ${go2rtcUrl}...`);

    try {
      // 🚀 Relay Mode: Direct RTSP (CPU 0%)
      const relaySrc = camera.rtspUrl;
      await axios.put(`${go2rtcUrl}/api/streams?name=${streamId}`, relaySrc, {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 5000
      });
      console.log(`[Streaming] ✅ ${streamId} registered successfully (Relay Mode)`);
    } catch (error) {
      console.error(`[Streaming] ❌ Failed to register ${streamId} in go2rtc: ${error.message}`);
      // Fallback
      try {
        const transcodeSrc = `ffmpeg:${camera.rtspUrl}#video=h264#audio=aac`;
        await axios.put(`${go2rtcUrl}/api/streams?name=${streamId}`, transcodeSrc, {
          headers: { 'Content-Type': 'text/plain' }
        });
        console.log(`[Streaming] 🔄 ${streamId} registered via Transcode Mode`);
      } catch (fError) {
        console.error(`[Streaming] 🚨 All methods failed: ${fError.message}`);
      }
    }

    return { streamId, go2rtcUrl, cameraName: camera.name };
  }
};

module.exports = streamService;

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

    // 🚀 เลือกสตรีมตามที่ผู้ใช้ตั้งค่าไว้ (MAIN หรือ SUB)
    let currentRtspUrl = camera.rtspUrl;
    if (camera.streamType === 'SUB' && camera.subStream) {
      currentRtspUrl = camera.subStream;
    }

    try {
      // 🚀 ส่งข้อมูลแบบ Object เพื่อให้ go2rtc จัดการได้ง่ายที่สุด (ลดปัญหา YAML Error)
      await axios.put(`${go2rtcUrl}/api/streams`, {
        name: streamId,
        src: currentRtspUrl
      }, { timeout: 5000 });
      
      console.log(`[Streaming] ✅ ${streamId} sync completed (${camera.streamType})`);
    } catch (error) {
      // ถ้า Error 400 หรือ YAML Error ให้ลองแบบ Fallback URL
      try {
        const fallbackUrl = `${go2rtcUrl}/api/streams?name=${streamId}&src=${encodeURIComponent(currentRtspUrl)}`;
        await axios.put(fallbackUrl, null, { timeout: 5000 });
        console.log(`[Streaming] ♻️ ${streamId} recovered via URL sync`);
      } catch (retryError) {
        const errorDetail = retryError.response ? JSON.stringify(retryError.response.data) : retryError.message;
        console.error(`[Streaming] ❌ Sync Fatal Error for ${camera.name}: ${errorDetail}`);
      }
    }

    return { 
      streamId, 
      go2rtcUrl, 
      cameraName: camera.name,
      isAudioEnabled: camera.isAudioEnabled,
      streamType: camera.streamType
    };
  },

  async getAllStreamStatuses() {
    const go2rtcUrl = process.env.GO2RTC_URL || 'http://127.0.0.1:1984';
    try {
      // 🚀 ตั้ง Timeout ไว้สั้นๆ เพื่อไม่ให้ API ค้างถ้า go2rtc ไม่ตอบสนอง
      const response = await axios.get(`${go2rtcUrl}/api/streams`, { timeout: 2000 });
      const streams = response.data;
      const result = {};

      if (!streams) return {};

      for (const [id, info] of Object.entries(streams)) {
        if (info && info.producers && info.producers.length > 0) {
          // ค้นหาข้อมูล Video จาก Producers
          const producer = info.producers[0];
          const videoMedia = producer.medias?.find(m => m && m.toLowerCase().includes('video'));
          
          if (videoMedia) {
            // 1. พยายามดึงจาก medias string (มาตรฐาน go2rtc)
            const parts = videoMedia.split(', ');
            let resolution = parts.find(p => p && p.includes('x')) || 'Unknown';
            let fpsPart = parts.find(p => p && p.includes('fps='));
            let fps = fpsPart ? Math.round(parseFloat(fpsPart.split('=')[1])) : null;

            // 2. 🚀 Fallback 1: ดึง FPS จาก SDP
            if (fps === null && producer.sdp) {
              const fpsMatch = producer.sdp.match(/a=framerate:(\d+(\.\d+)?)/);
              if (fpsMatch) fps = Math.round(parseFloat(fpsMatch[1]));
            }

            // 3. 🚀 Fallback 2: ดึง Resolution จาก Receivers หรือ Senders
            if (resolution === 'Unknown') {
              // เช็คใน receivers (วิดีโอขาเข้า)
              const videoReceiver = producer.receivers?.find(r => r.codec && r.codec.codec_type === 'video' && r.codec.width);
              if (videoReceiver) {
                resolution = `${videoReceiver.codec.width}x${videoReceiver.codec.height}`;
              } 
              // เช็คใน consumers/senders (วิดีโอขาออกที่มีคนดูอยู่)
              else if (info.consumers) {
                for (const consumer of info.consumers) {
                  const videoSender = consumer.senders?.find(s => s.codec && s.codec.width);
                  if (videoSender) {
                    resolution = `${videoSender.codec.width}x${videoSender.codec.height}`;
                    break;
                  }
                }
              }
            }

            // 4. 🚀 Fallback 3: พยายามหาจาก SDP sprop-parameter-sets (H264)
            if (resolution === 'Unknown' && producer.sdp) {
              const spsMatch = producer.sdp.match(/sprop-parameter-sets=([A-Za-z0-9+/=]+)/);
              if (spsMatch) {
                // เราจะไม่เขียน SPS Parser เต็มรูปแบบ แต่จะลองมองหา Profile level id 
                // หรือส่งไปให้ Frontend ช่วยแสดงผลถ้าจำเป็น
              }
            }
            
            result[id] = { 
              resolution, 
              fps: fps || '??',
              active: info.consumers?.length > 0
            };

            // 5. 🚀 บันทึกลงฐานข้อมูล (เฉพาะค่าที่แน่นอน)
            const cameraIdMatch = id.match(/^camera_(\d+)$/);
            if (cameraIdMatch) {
              const cameraId = parseInt(cameraIdMatch[1]);
              const updateData = {};
              if (resolution !== 'Unknown') updateData.resolution = resolution;
              if (fps !== null) updateData.fps = fps;

              if (Object.keys(updateData).length > 0) {
                prisma.camera.update({
                  where: { id: cameraId },
                  data: updateData
                }).catch(() => {});
              }
            }
          }
        }
      }
      return result;
    } catch (error) {
      // 🔇 เงียบไว้เมื่อติดต่อไม่ได้ เพื่อไม่ให้หน้าจัดการกล้อง Error
      console.warn(`[Streaming] Could not reach go2rtc at ${go2rtcUrl}: ${error.message}`);
      return {};
    }
  }
};

module.exports = streamService;

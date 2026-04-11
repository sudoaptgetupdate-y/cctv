const prisma = require('../config/prisma');
const axios = require('axios');

const streamService = {
  async getStreamConfig(cameraId, requestedType = null) {
    const camera = await prisma.camera.findUnique({
      where: { id: parseInt(cameraId) }
    });

    if (!camera) throw new Error('Camera not found');

    // ✅ ใช้ประเภทที่ขอมา หรือถ้าไม่มีให้ใช้ตามที่ตั้งค่าไว้ใน DB
    const effectiveType = (requestedType && ['MAIN', 'SUB'].includes(requestedType.toUpperCase())) 
      ? requestedType.toUpperCase() 
      : camera.streamType;

    const streamId = `camera_${camera.id}_${effectiveType.toLowerCase()}`;
    const go2rtcUrl = process.env.GO2RTC_URL || 'http://127.0.0.1:1984';

    // 1. เลือก URL ต้นทางตามประเภทสตรีมที่คำนวณได้
    let currentRtspUrl = camera.rtspUrl;
    if (effectiveType === 'SUB' && camera.subStream) {
      currentRtspUrl = camera.subStream;
    }

    // 🛡️ Validation: ถ้าไม่มี URL เลยให้หยุดทำงาน
    if (!currentRtspUrl || currentRtspUrl.trim() === "") {
      await axios.delete(`${go2rtcUrl}/api/streams`, { params: { name: streamId } }).catch(() => {});
      throw new Error('BAD_REQUEST: No RTSP URL provided for this camera stream type');
    }

    // 2. จัดเตรียม Source สำหรับ go2rtc (Hybrid Mode)
    let finalSrc = currentRtspUrl;
    if (camera.isTranscodeEnabled) {
      const resolution = camera.resolution || '1280x720';
      const fps = camera.fps || 15;
      finalSrc = `ffmpeg:${currentRtspUrl}#video=h264#size=${resolution}#fps=${fps}`;
    }

    console.log(`[Streaming] 🔄 Syncing ${streamId}:`);
    console.log(`            - Requested Type: ${requestedType || 'DEFAULT'}`);
    console.log(`            - Effective Type: ${effectiveType}`);
    console.log(`            - Mode: ${camera.isTranscodeEnabled ? 'TRANSCODE' : 'PASS-THROUGH'}`);
    console.log(`            - Source: ${finalSrc}`);

    try {
      // 3. 🔥 บังคับลบและสร้างใหม่ (Force Sync)
      // ลบสตรีมเดิมออกให้หมดจดก่อน
      await axios.delete(`${go2rtcUrl}/api/streams?name=${streamId}`).catch(() => {});
      await axios.delete(`${go2rtcUrl}/api/streams`, { params: { name: streamId } }).catch(() => {});
      
      // หน่วงเวลาให้ go2rtc เคลียร์ Socket เก่า (สำคัญมากสำหรับ RTSP)
      await new Promise(resolve => setTimeout(resolve, 500));

      // 4. บันทึกเข้า go2rtc โดยใช้รูปแบบ URL Parameters (เสถียรที่สุด)
      const registerUrl = `${go2rtcUrl}/api/streams?name=${streamId}&src=${encodeURIComponent(finalSrc)}`;
      await axios.put(registerUrl, null, { timeout: 5000 });
      
      console.log(`[Streaming] ✅ ${streamId} sync success (${effectiveType})`);
    } catch (error) {
      // Fallback: ถ้าวิธีปกติพลาด ให้ลองส่งแบบ Body อีกครั้งเป็นทางเลือกสุดท้าย
      try {
        await new Promise(resolve => setTimeout(resolve, 200));
        await axios.put(`${go2rtcUrl}/api/streams`, {
          name: streamId,
          src: finalSrc
        }, { timeout: 5000 });
        console.log(`[Streaming] ♻️ ${streamId} synced via body fallback`);
      } catch (retryError) {
        console.error(`[Streaming] ❌ Fatal Error: ${retryError.message}`);
      }
    }

    return { 
      streamId, 
      go2rtcUrl, 
      cameraName: camera.name,
      isAudioEnabled: camera.isAudioEnabled,
      streamType: effectiveType,
      hasSubStream: !!camera.subStream,
      isTranscoded: camera.isTranscodeEnabled
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
            const videoReceiver = producer.receivers?.find(r => r.codec && r.codec.codec_type === 'video');
            
            if (resolution === 'Unknown') {
              // เช็คใน receivers (วิดีโอขาเข้า)
              if (videoReceiver && videoReceiver.codec.width) {
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
              // ... (Logic เดิม)
            }
            
            // 🆕 เพิ่มการตรวจจับ Codec และ Mode
            const codec = videoReceiver?.codec?.codec_name?.toUpperCase() || 
                         producer.medias?.find(m => m.includes('video'))?.split(', ').pop()?.toUpperCase() || 
                         'H264';
            
            const mode = info.consumers?.find(c => c.format_name)?.format_name?.split('/')[0]?.toUpperCase() || 'MSE';
            const isTranscoded = (producer.source && producer.source.includes('ffmpeg')) || false;

            result[id] = { 
              resolution, 
              fps: fps || '??',
              active: info.consumers?.length > 0,
              viewerCount: info.consumers?.length || 0,
              codec,
              mode,
              isTranscoded
            };

            // 5. 🚀 บันทึกลงฐานข้อมูล (เฉพาะค่าที่แน่นอน)
            const cameraIdMatch = id.match(/^camera_(\d+)(?:_(?:main|sub))?$/);
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

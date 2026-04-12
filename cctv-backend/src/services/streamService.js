const prisma = require('../config/prisma');
const axios = require('axios');

const streamService = {
  async getStreamConfig(cameraId, requestedType = null) {
    const camera = await prisma.camera.findUnique({
      where: { id: parseInt(cameraId) }
    });

    if (!camera) throw new Error('Camera not found');

    const effectiveType = (requestedType && ['MAIN', 'SUB'].includes(requestedType.toUpperCase())) 
      ? requestedType.toUpperCase() 
      : camera.streamType;

    const streamId = `camera_${camera.id}_${effectiveType.toLowerCase()}`;
    const go2rtcUrl = process.env.GO2RTC_URL || 'http://127.0.0.1:1984';

    let currentRtspUrl = camera.rtspUrl;
    if (effectiveType === 'SUB' && camera.subStream) {
      currentRtspUrl = camera.subStream;
    }

    // 🔐 ฉีด Username/Password เฉพาะเมื่อ URL เดิมไม่มี @ และมีข้อมูลครบ
    if (camera.username && camera.password && currentRtspUrl && !currentRtspUrl.includes('@')) {
      try {
        const cleanUrl = currentRtspUrl.replace('rtsp://', '');
        currentRtspUrl = `rtsp://${camera.username}:${camera.password}@${cleanUrl}`;
      } catch (e) {
        console.warn('[Streaming] Credential injection failed');
      }
    }

    if (!currentRtspUrl || currentRtspUrl.trim() === "") {
      throw new Error('BAD_REQUEST: No RTSP URL provided');
    }

    let finalSrc = currentRtspUrl;
    if (camera.isTranscodeEnabled) {
      const resolution = (effectiveType === 'SUB' ? camera.subResolution : camera.resolution) || (effectiveType === 'SUB' ? '640x360' : '1280x720');
      const fps = (effectiveType === 'SUB' ? camera.subFps : camera.fps) || (effectiveType === 'SUB' ? 10 : 15);
      finalSrc = `ffmpeg:${currentRtspUrl}#video=h264#size=${resolution}#fps=${fps}`;
    }

    console.log(`[Streaming] 🔍 StreamID: ${streamId}`);
    console.log(`[Streaming] 🔗 Final Source: ${finalSrc.replace(camera.password || '---', '****')}`); // ซ่อน pass ใน log

    try {
      // 🚀 1. เช็คสตรีมใน go2rtc
      const existing = await axios.get(`${go2rtcUrl}/api/streams?name=${streamId}`).catch(() => ({ data: {} }));
      const currentConfig = existing.data[streamId];
      
      // เช็คว่ามี Config นี้อยู่แล้วและ URL ตรงกันหรือไม่
      const isAlreadyDefined = currentConfig && 
                               currentConfig.producers && 
                               currentConfig.producers.some(p => p.url === currentRtspUrl || p.source === finalSrc);

      if (!isAlreadyDefined) {
        // 🚀 2. ลงทะเบียนหรืออัปเดตใหม่ (PUT ของ go2rtc จะเขียนทับให้อัตโนมัติโดยไม่ต้อง DELETE)
        console.log(`[Streaming] 🔄 Registering/Updating ${streamId}`);
        const registerUrl = `${go2rtcUrl}/api/streams?name=${streamId}&src=${encodeURIComponent(finalSrc)}`;
        await axios.put(registerUrl, null, { timeout: 5000 });
      } else {
        console.log(`[Streaming] ⚡ ${streamId} is already defined. Skipping.`);
      }
    } catch (error) {
      console.error(`[Streaming] Sync error: ${error.message}`);
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

  async getStreamStatus(streamId) {
    const go2rtcUrl = process.env.GO2RTC_URL || 'http://127.0.0.1:1984';
    try {
      const response = await axios.get(`${go2rtcUrl}/api/streams?name=${streamId}`, { timeout: 2000 });
      const info = response.data && response.data[streamId];

      // 👥 ดึง Viewer Count จริงจาก DB (Session Heartbeat)
      const viewerCount = await this.getViewerCount(streamId);

      // ✅ แก้ไข: ห้ามส่ง null กลับไปเด็ดขาด ให้ส่งสถานะพื้นฐานเพื่อให้ Frontend ดึงต่อได้
      const status = {
        active: false,
        viewerCount,
        resolution: 'Unknown',
        fps: '??',
        codec: 'WAIT',
        mode: '---',
        isTranscoded: false
      };

      if (!info) {
        return status; // ยังไม่เจอใน go2rtc แต่ส่ง WAIT กลับไปก่อน
      }

      status.active = info.consumers?.length > 0;
      // status.viewerCount = info.consumers?.length || 0; // ❌ ลบออกเพื่อให้ใช้ค่าจาก DB Heartbeat

      if (info.producers && info.producers.length > 0) {
        const producer = info.producers[0];
        status.isTranscoded = (producer.source && producer.source.includes('ffmpeg')) || false;

        const videoMedia = producer.medias?.find(m => m && m.toLowerCase().includes('video'));
        const videoReceiver = producer.receivers?.find(r => r.codec && r.codec.codec_type === 'video');

        if (videoMedia) {
          const parts = videoMedia.split(', ');
          const resPart = parts.find(p => p && p.includes('x') && !p.includes('video'));
          const fpsPart = parts.find(p => p && p.includes('fps='));
          
          if (resPart) status.resolution = resPart;
          if (fpsPart) status.fps = Math.round(parseFloat(fpsPart.split('=')[1]));
          
          status.codec = videoReceiver?.codec?.codec_name?.toUpperCase() || 
                         videoMedia.split(', ').pop()?.toUpperCase() || 'H264';
        }

        if (status.resolution === 'Unknown' && videoReceiver?.codec?.width) {
          status.resolution = `${videoReceiver.codec.width}x${videoReceiver.codec.height}`;
        }

        if ((status.fps === '??' || !status.fps) && producer.sdp) {
          const fpsMatch = producer.sdp.match(/a=framerate:(\d+(\.\d+)?)/);
          if (fpsMatch) status.fps = Math.round(parseFloat(fpsMatch[1]));
        }
      }

      if (info.consumers && info.consumers.length > 0) {
        const activeConsumer = info.consumers.find(c => c.format_name);
        if (activeConsumer) {
          status.mode = activeConsumer.format_name.split('/')[0].toUpperCase();
        }
      }

      return status;
    } catch (error) {
      return { active: false, viewerCount: 0, resolution: 'Unknown', fps: '??', codec: 'OFFLINE', mode: '---', isTranscoded: false };
    }
  },
  async getAllStreamStatuses() {
    const go2rtcUrl = process.env.GO2RTC_URL || 'http://127.0.0.1:1984';
    try {
      const response = await axios.get(`${go2rtcUrl}/api/streams`, { timeout: 2000 });
      const liveStreams = response.data || {};
      const result = {};

      // 🔍 DEBUG: พิมพ์รายชื่อสตรีมทั้งหมดที่ go2rtc เห็นในตอนนี้
      console.log(`[Debug] go2rtc streams found: ${Object.keys(liveStreams).join(', ') || 'NONE'}`);

      for (const [id, info] of Object.entries(liveStreams)) {
        if (!id.startsWith('camera_')) continue;

        const dbViewerCount = await this.getViewerCount(id);

        // สร้าง Object สถานะตั้งต้น (สถานะกำลังเชื่อมต่อ)
        const status = {
          active: info.consumers?.length > 0,
          viewerCount: dbViewerCount,
          resolution: 'Unknown',
          fps: '??',
          codec: 'WAIT', // 🚀 บ่งบอกว่าเจอสตรีมแล้ว แต่กำลังรอข้อมูลวิดีโอ
          mode: '---',
          isTranscoded: false
        };

        // 3. ถ้า go2rtc เริ่มรับสัญญาณจากกล้องได้แล้ว (มี Producers) ให้ดึงข้อมูลจริงมาใส่
        if (info.producers && info.producers.length > 0) {
          const producer = info.producers[0];
          status.isTranscoded = producer.source?.includes('ffmpeg') || false;

          const videoMedia = producer.medias?.find(m => m && m.toLowerCase().includes('video'));
          if (videoMedia) {
            const parts = videoMedia.split(', ');
            const res = parts.find(p => p && p.includes('x'));
            const fpsPart = parts.find(p => p && p.includes('fps='));
            
            if (res) status.resolution = res;
            if (fpsPart) status.fps = Math.round(parseFloat(fpsPart.split('=')[1]));

            // ตรวจจับ Codec จริง
            const videoReceiver = producer.receivers?.find(r => r.codec && r.codec.codec_type === 'video');
            status.codec = videoReceiver?.codec?.codec_name?.toUpperCase() || 
                         videoMedia.split(', ').pop()?.toUpperCase() || 'H264';
            
            // ตรวจจับโหมดการส่งข้อมูล (WebRTC/MSE) จาก Consumer แรก
            if (info.consumers && info.consumers.length > 0) {
              status.mode = info.consumers[0].format_name?.split('/')[0]?.toUpperCase() || '---';
            }
          }
        }

        result[id] = status;
      }

      return result;
    } catch (error) {
      console.warn(`[Streaming] Cannot reach go2rtc: ${error.message}`);
      return {};
    }
  },

  // 👥 Viewing Session Management
  async heartbeat(streamId, sessionId, userId = null) {
    const now = new Date();
    return await prisma.viewingSession.upsert({
      where: {
        streamId_sessionId: { streamId, sessionId }
      },
      update: {
        lastSeen: now,
        userId: userId ? parseInt(userId) : null
      },
      create: {
        streamId,
        sessionId,
        lastSeen: now, // 🚀 ใช้เวลาเดียวกันกับ update เพื่อป้องกัน Clock Drift กับ DB
        userId: userId ? parseInt(userId) : null
      }
    });
  },

  async getViewerCount(streamId) {
    // 🚀 สกัดเอา Prefix รายกล้อง (เช่น camera_1_main -> camera_1_)
    const cameraPrefix = streamId.split('_').slice(0, 2).join('_') + '_';
    
    const threshold = new Date(Date.now() - 60000); // 🚀 ขยายเป็น 60 วินาที เพื่อความนิ่ง
    return await prisma.viewingSession.count({
      where: {
        streamId: { startsWith: cameraPrefix },
        lastSeen: { gte: threshold }
      }
    });
  },

  async cleanupSessions() {
    const threshold = new Date(Date.now() - 120000); // 🚀 ล้างที่เก่ากว่า 2 นาที
    const deleted = await prisma.viewingSession.deleteMany({
      where: {
        lastSeen: { lt: threshold }
      }
    });
    if (deleted.count > 0) {
      console.log(`🧹 [Stream] Cleaned up ${deleted.count} expired viewing sessions.`);
    }
  }
};

module.exports = streamService;

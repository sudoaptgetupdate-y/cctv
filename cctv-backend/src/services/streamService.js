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

    if (camera.username && camera.password && currentRtspUrl && !currentRtspUrl.includes('@')) {
      try {
        const cleanUrl = currentRtspUrl.replace('rtsp://', '');
        currentRtspUrl = `rtsp://${camera.username}:${camera.password}@${cleanUrl}`;
      } catch (e) { }
    }

    try {
      await axios.delete(`${go2rtcUrl}/api/streams`, { params: { name: streamId } }).catch(() => {});
      
      console.log(`[StreamService] Config for ${streamId}: Audio=${camera.isAudioEnabled}, Transcode=${camera.isTranscodeEnabled}`);

      if (camera.isTranscodeEnabled) {
        const sourceId = `${streamId}_src`;
        await axios.delete(`${go2rtcUrl}/api/streams`, { params: { name: sourceId } }).catch(() => {});
        await axios.put(`${go2rtcUrl}/api/streams`, null, { params: { name: sourceId, src: currentRtspUrl } });

        const res = (effectiveType === 'SUB' ? camera.subResolution : camera.resolution) || (effectiveType === 'SUB' ? '640x360' : '1280x720');
        const fps = (effectiveType === 'SUB' ? camera.subFps : camera.fps) || (effectiveType === 'SUB' ? 10 : 15);

        const audioParam = camera.isAudioEnabled ? '#audio=opus' : '#audio=no';
        const finalSrc = `ffmpeg:${sourceId}#video=h264#size=${res}#fps=${fps}#vprofile=main${audioParam}`;
        
        console.log(`[StreamService] Transcode PUT: ${finalSrc}`);
        await axios.put(`${go2rtcUrl}/api/streams`, null, { params: { name: streamId, src: finalSrc } });
      } else {
        // 🚀 ปรับปรุง: แยก Logic ตามยี่ห้อกล้องเพื่อประสิทธิภาพสูงสุด
        const isUniview = camera.name.toLowerCase().includes('uniview') || 
                          (camera.rtspUrl && camera.rtspUrl.toLowerCase().includes('/unicast/'));

        let finalSrc = currentRtspUrl;

        // ถ้าเป็น Uniview และเปิดเสียง 
        // ใช้ go2rtc internal transcode (#video=h264#audio=opus) เพื่อความเสถียร
        // วิธีนี้จะช่วยแก้ปัญหาจอดำ/Loading screen โดยที่ยังประหยัด CPU กว่าการเรียก ffmpeg ตรงๆ
        if (isUniview && camera.isAudioEnabled) {
          finalSrc = `${currentRtspUrl}#video=h264#audio=opus`;
          console.log(`[StreamService] Uniview detected, using Internal Sync Fix: ${finalSrc}`);
        } else {
          // กล้องทั่วไป (Tiandy) หรือ Uniview ที่ปิดเสียง ให้ใช้ Direct Pass 100% (ประหยัด CPU ที่สุด)
          console.log(`[StreamService] Standard Direct Pass (CPU 0%): ${finalSrc}`);
        }
        
        await axios.put(`${go2rtcUrl}/api/streams`, null, { params: { name: streamId, src: finalSrc } });
      }
    } catch (error) {
      console.error(`[StreamService] Error:`, error.message);
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
      const response = await axios.get(`${go2rtcUrl}/api/streams`, { params: { name: streamId }, timeout: 2000 });
      const info = response.data && response.data[streamId];
      const viewerCount = await this.getViewerCount(streamId);

      const status = {
        active: false,
        viewerCount,
        resolution: 'Unknown',
        fps: '??',
        codec: 'WAIT',
        mode: '---',
        isTranscoded: false
      };

      if (!info) return status;
      status.active = (info.consumers && info.consumers.length > 0);

      if (info.producers && info.producers.length > 0) {
        const producer = info.producers[0];
        status.isTranscoded = (producer.source && producer.source.includes('ffmpeg'));

        if (producer.source) {
          const resMatch = producer.source.match(/size=(\d+x\d+)/) || producer.source.match(/-s\s+(\d+x\d+)/);
          if (resMatch) status.resolution = resMatch[1];
          const fpsMatch = producer.source.match(/fps=(\d+)/) || producer.source.match(/-r\s+(\d+)/);
          if (fpsMatch) status.fps = parseInt(fpsMatch[1]);
        }

        if (producer.receivers) {
          const vR = producer.receivers.find(r => r.codec && r.codec.codec_type === 'video');
          if (vR && vR.codec) {
            if (vR.codec.width && vR.codec.height && status.resolution === 'Unknown') {
              status.resolution = `${vR.codec.width}x${vR.codec.height}`;
            }
            if (vR.codec.codec_name) status.codec = vR.codec.codec_name.toUpperCase();
          }
        }
      }

      if (info.consumers?.length > 0) {
        const consumer = info.consumers.find(c => c.format_name);
        if (consumer) status.mode = consumer.format_name.split('/')[0].toUpperCase();
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
      const result = {};
      for (const id of Object.keys(response.data || {})) {
        if (id.startsWith('camera_') && !id.endsWith('_src')) {
          result[id] = await this.getStreamStatus(id);
        }
      }
      return result;
    } catch (error) { return {}; }
  },

  async heartbeat(streamId, sessionId, userId = null) {
    const now = new Date();
    const userIdInt = userId ? parseInt(userId) : null;
    try {
      await prisma.$executeRaw`
        INSERT INTO ViewingSession (streamId, sessionId, lastSeen, userId, createdAt)
        VALUES (${streamId}, ${sessionId}, ${now}, ${userIdInt}, ${now})
        ON DUPLICATE KEY UPDATE lastSeen = ${now}, userId = ${userIdInt}
      `;
      return { success: true };
    } catch (e) {
      return { success: false };
    }
  },

  async getViewerCount(streamId) {
    const cameraPrefix = streamId.split('_').slice(0, 2).join('_') + '_';
    const threshold = new Date(Date.now() - 60000);
    try {
      return await prisma.viewingSession.count({
        where: { streamId: { startsWith: cameraPrefix }, lastSeen: { gte: threshold } }
      });
    } catch (e) { return 0; }
  },

  async cleanupSessions() {
    const threshold = new Date(Date.now() - 120000);
    try {
      await prisma.viewingSession.deleteMany({ where: { lastSeen: { lt: threshold } } });
    } catch (e) { }
  }
};

module.exports = streamService;

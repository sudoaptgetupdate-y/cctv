const express = require('express');
const router = express.Router();
const streamController = require('../controllers/streamController');
const { verifyToken } = require('../middlewares/authMiddleware');

// 🔍 Debug Route (เรียกผ่านเบราว์เซอร์ตรงๆ: https://your-domain.com/api/streams/ping)
router.get('/ping', (req, res) => res.json({ message: 'pong', timestamp: new Date() }));

// ดึงสถานะรวม (ย้ายมาไว้บนสุดเพื่อความแน่นอน)
router.get('/statuses', verifyToken, streamController.getStatuses);

// Route สำหรับทดสอบ (ไม่ต้องใช้ Token)
router.get('/test/direct', async (req, res) => {
  const axios = require('axios');
  
  const testId = 'test_camera';
  // ใช้ HTTP MP4 แทน RTSP เพื่อเลี่ยงการโดนบล็อกพอร์ต 554
  const testSrc = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'; 
  const go2rtcUrl = process.env.GO2RTC_URL || 'http://localhost:1984';

  try {
    await axios.put(`${go2rtcUrl}/api/streams`, null, {
      params: { name: testId, src: testSrc },
      timeout: 10000 
    });
    
    res.json({
      success: true,
      data: {
        streamId: testId,
        go2rtcUrl: go2rtcUrl,
        cameraName: '🔴 Big Buck Bunny (HTTP Source)'
      }
    });
  } catch (error) {
    res.json({
      success: true,
      data: {
        streamId: testId,
        go2rtcUrl: go2rtcUrl,
        cameraName: 'Test Camera (Fallback Mode)',
        error: error.message
      }
    });
  }
});

// Proxy สำหรับ WebRTC (แก้ปัญหา CORS)
router.post('/webrtc/:streamId', express.text({ type: 'text/plain', limit: '1mb' }), async (req, res) => {
  const axios = require('axios');
  const { streamId } = req.params;
  const go2rtcUrl = process.env.GO2RTC_URL || 'http://localhost:1984';

  try {
    console.log(`[WebRTC Proxy] Received Offer for ${streamId}`);
    
    if (!req.body || req.body.length < 100) {
      console.error('[WebRTC Proxy] Empty or invalid SDP body received');
      return res.status(400).send('Invalid SDP Body');
    }

    const response = await axios.post(`${go2rtcUrl}/api/webrtc?src=${streamId}`, req.body, {
      headers: { 'Content-Type': 'text/plain' },
      timeout: 15000 
    });
    
    console.log(`[WebRTC Proxy] Answer received from go2rtc`);
    res.send(response.data);
  } catch (error) {
    const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error('[WebRTC Proxy] Error:', errorMsg);
    res.status(502).json({ error: 'Streaming gateway error', detail: errorMsg });
  }
});

// ดึงข้อมูลสตรีม (เช็ค Public อัตโนมัติข้างใน Controller หรือปลดล็อคให้เข้าได้)
router.get('/statuses', verifyToken, streamController.getStatuses);
router.get('/:cameraId', streamController.getStreamInfo);

module.exports = router;

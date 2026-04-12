const express = require('express');
const router = express.Router();
const streamController = require('../controllers/streamController');
const { verifyToken, tryVerifyToken } = require('../middlewares/authMiddleware');

// 🔍 Debug Route
router.get('/ping', (req, res) => {
  res.json({ success: true, message: 'pong', timestamp: new Date() });
});

// 1. ดึงสถานะรวม (statuses) - ต้องอยู่บนตัวแปร :streamId
router.get('/statuses', verifyToken, streamController.getStatuses);

// 2. ดึงสถานะเจาะจงเฉพาะสตรีม (/:streamId/status)
// นี่คือสิ่งที่ Frontend เรียก: /api/streams/camera_8_main/status
router.get('/:streamId/status', streamController.getSingleStatus);

// 3. Heartbeat
router.post('/:streamId/heartbeat', tryVerifyToken, streamController.heartbeat);

// 4. Proxy สำหรับ WebRTC
router.post('/webrtc/:streamId', express.text({ type: 'text/plain', limit: '1mb' }), async (req, res) => {
  const axios = require('axios');
  const { streamId } = req.params;
  const go2rtcUrl = process.env.GO2RTC_URL || 'http://127.0.0.1:1984';
  try {
    const response = await axios.post(`${go2rtcUrl}/api/webrtc?src=${streamId}`, req.body, {
      headers: { 'Content-Type': 'text/plain' },
      timeout: 15000 
    });
    res.send(response.data);
  } catch (error) {
    res.status(502).json({ error: 'Gateway error' });
  }
});

// 5. ดึงคอนฟิกสตรีมมิ่ง (/:cameraId) - ต้องอยู่ล่างสุด
router.get('/:cameraId', streamController.getStreamInfo);

module.exports = router;

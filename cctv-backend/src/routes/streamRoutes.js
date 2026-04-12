const express = require('express');
const router = express.Router();
const streamController = require('../controllers/streamController');
const { verifyToken, tryVerifyToken } = require('../middlewares/authMiddleware');

// 🔍 Debug Route
router.get('/ping', (req, res) => {
  res.json({ success: true, message: 'pong', timestamp: new Date() });
});

// 1. ดึงสถานะรวม (พจนานุกรมความละเอียด/FPS ของทุกกล้อง)
router.get('/statuses', verifyToken, streamController.getStatuses);

// 2. ดึงสถานะเจาะจงเฉพาะสตรีม (Real-time Full Info)
// ต้องวางไว้ก่อน /:cameraId เพราะมี 2 segments (/status)
router.get('/:streamId/status', streamController.getSingleStatus);

// 3. Heartbeat (Post)
router.post('/:streamId/heartbeat', tryVerifyToken, streamController.heartbeat);

// 4. Proxy สำหรับ WebRTC (แก้ปัญหา CORS)
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

// 5. ดึงคอนฟิกสตรีมมิ่งของกล้อง (ID อย่างเดียว)
// ต้องวางไว้ล่างสุด เพราะ Express จะมองว่าทุกอย่างที่ต่อจาก / คือ :cameraId
router.get('/:cameraId', streamController.getStreamInfo);

module.exports = router;

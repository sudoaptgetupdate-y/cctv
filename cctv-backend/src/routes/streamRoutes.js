const express = require('express');
const router = express.Router();
const streamController = require('../controllers/streamController');
const { verifyToken } = require('../middlewares/authMiddleware');

// 🔍 Debug Route (https://cctv.ntnakhon.com/api/streams/ping)
router.get('/ping', (req, res) => {
  res.json({ 
    success: true, 
    message: 'pong', 
    timestamp: new Date(),
    go2rtc_url: process.env.GO2RTC_URL 
  });
});

// ดึงสถานะรวมของทุกสตรีม
router.get('/statuses', verifyToken, streamController.getStatuses);

// Proxy สำหรับ WebRTC (แก้ปัญหา CORS)
router.post('/webrtc/:streamId', express.text({ type: 'text/plain', limit: '1mb' }), async (req, res) => {
  const axios = require('axios');
  const { streamId } = req.params;
  const go2rtcUrl = process.env.GO2RTC_URL || 'http://127.0.0.1:1984';

  try {
    if (!req.body || req.body.length < 100) {
      return res.status(400).send('Invalid SDP Body');
    }

    const response = await axios.post(`${go2rtcUrl}/api/webrtc?src=${streamId}`, req.body, {
      headers: { 'Content-Type': 'text/plain' },
      timeout: 15000 
    });
    
    res.send(response.data);
  } catch (error) {
    const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
    res.status(502).json({ error: 'Streaming gateway error', detail: errorMsg });
  }
});

// ดึงคอนฟิกสตรีมเฉพาะตัว
router.get('/:cameraId', streamController.getStreamInfo);

module.exports = router;

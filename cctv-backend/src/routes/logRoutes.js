const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { verifyToken } = require('../middlewares/authMiddleware');

// ดึงประวัติสถานะกล้อง
router.get('/cameras', verifyToken, logController.getCameraLogs);

// ดึงประวัติการทำงานของผู้ใช้งาน
router.get('/activities', verifyToken, logController.getActivityLogs);

module.exports = router;

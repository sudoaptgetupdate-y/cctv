const express = require('express');
const router = express.Router();
const streamController = require('../controllers/streamController');
const { verifyToken } = require('../middlewares/authMiddleware');

// ต้อง Login ก่อนถึงจะดึงข้อมูลสตรีมได้
router.get('/:cameraId', verifyToken, streamController.getStreamInfo);

module.exports = router;

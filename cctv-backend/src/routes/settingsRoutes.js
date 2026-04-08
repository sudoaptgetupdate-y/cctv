const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { verifyToken } = require('../middlewares/authMiddleware');

// เฉพาะ Admin เท่านั้นที่จัดการการตั้งค่าระบบได้
router.get('/', verifyToken, settingsController.getSettings);
router.put('/', verifyToken, settingsController.updateSettings);

module.exports = router;

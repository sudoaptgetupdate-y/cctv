const express = require('express');
const router = express.Router();
const cameraController = require('../controllers/cameraController');
const { verifyToken } = require('../middlewares/authMiddleware');

// ทุก Route ในนี้ต้องผ่านการตรวจสอบ Token (Login ก่อน)
router.use(verifyToken);

router.get('/', cameraController.getAll);
router.get('/:id', cameraController.getById);
router.post('/', cameraController.create);
router.put('/:id', cameraController.update);
router.delete('/:id', cameraController.delete);

module.exports = router;

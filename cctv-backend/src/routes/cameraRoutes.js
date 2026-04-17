const express = require('express');
const router = express.Router();
const cameraController = require('../controllers/cameraController');
const { verifyToken } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { cameraSchema, bulkCameraSchema } = require('../validations/schemas');

// Route สาธารณะ (ไม่ต้อง Login)
router.get('/public', cameraController.getAllPublic);

// ทุก Route หลังจากนี้ต้องผ่านการตรวจสอบ Token (Login ก่อน)
router.use(verifyToken);

router.get('/', cameraController.getAll);
router.get('/:id', cameraController.getById);
router.post('/validate', cameraController.validate);
router.post('/bulk', validate(bulkCameraSchema), cameraController.bulkCreate);
router.post('/', validate(cameraSchema), cameraController.create);
router.put('/:id', validate(cameraSchema), cameraController.update);
router.delete('/:id', cameraController.delete);

// ✅ Acknowledge & Events
router.post('/:id/acknowledge', cameraController.acknowledge);
router.get('/:id/events', cameraController.getEvents);

module.exports = router;

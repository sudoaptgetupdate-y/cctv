const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { groupSchema } = require('../validations/schemas');

// Route สาธารณะ
router.get('/public', groupController.getAllPublic);

// ทุกการจัดการกลุ่มต้อง Login ก่อน
router.use(verifyToken);

router.get('/', groupController.getAll);
router.get('/:id', groupController.getById);
router.post('/validate', groupController.validate); // 🚀 เพิ่มเส้นทางตรวจสอบข้อมูล

// เฉพาะ Admin หรือ Super Admin เท่านั้นที่จัดการกลุ่มได้ (เพิ่ม/แก้ไข/ลบ)
router.post('/', requireRole(['ADMIN', 'SUPER_ADMIN']), validate(groupSchema), groupController.create);
router.put('/:id', requireRole(['ADMIN', 'SUPER_ADMIN']), validate(groupSchema), groupController.update);
router.delete('/:id', requireRole(['ADMIN', 'SUPER_ADMIN']), groupController.delete);

// จัดการสมาชิกในกลุ่ม
router.post('/:id/cameras', requireRole(['ADMIN', 'SUPER_ADMIN']), groupController.updateCameras);

module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

// Validation
const validate = require('../middlewares/validateMiddleware');
const { createUserSchema, updateUserSchema } = require('../validations/schemas');

// บังคับล็อคอินสำหรับทุกเส้นทางในนี้
router.use(verifyToken);

// =========================================================
// 🟢 โซนทั่วไป: ทุกคนสามารถดูและอัปเดตโปรไฟล์ตัวเองได้
// =========================================================
router.get('/:id', userController.getUserById);   
router.put('/:id', validate(updateUserSchema), userController.updateUser);    

// =========================================================
// 🔴 โซนผู้ดูแล: เฉพาะ Admin และ Super Admin ที่สามารถจัดการระบบ User ได้
// =========================================================
const adminAccess = requireRole(['SUPER_ADMIN', 'ADMIN']);

router.get('/', adminAccess, userController.getUsers);      

// 🛡️ ตรวจสอบข้อมูลก่อนสร้าง User ใหม่
router.post('/', adminAccess, validate(createUserSchema), userController.createUser);   

router.delete('/:id', adminAccess, userController.deleteUser); 

module.exports = router;

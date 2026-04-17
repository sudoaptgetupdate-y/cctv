const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { verifyToken } = require('../middlewares/authMiddleware');

// ดึงประวัติสถานะกล้อง
router.get('/cameras', verifyToken, logController.getCameraLogs);

// ดึงประวัติการทำงานของผู้ใช้งาน
router.get('/activities', verifyToken, logController.getActivityLogs);

// ดึงรายงานผู้เข้าชมหน้า Public (Admin)
router.get('/visitor-report', verifyToken, logController.getVisitorReport);

// ดึงรายงานแบบเจาะลึก
router.get('/visitor-report-enhanced', verifyToken, logController.getEnhancedVisitorReport);

// ส่งออกรายงาน Excel
router.get('/export/excel', verifyToken, logController.exportVisitorReportExcel);

// ส่งออกรายงาน PDF
router.get('/export/pdf', verifyToken, logController.exportVisitorReportPdf);

// บันทึกการเข้าชม (Public - ไม่ต้องมี Token)
router.post('/public/visit', logController.createPublicVisitLog);

// --- Clear Data (Testing only) ---
router.delete('/clear-visitor-data', verifyToken, logController.clearAllVisitorData);

module.exports = router;

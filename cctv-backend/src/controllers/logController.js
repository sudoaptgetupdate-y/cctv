const prisma = require('../config/prisma');
const logService = require('../services/logService');

const logController = {
  /**
   * บันทึกประวัติการเข้าชมหน้า Public Dashboard (ไม่มี Token)
   */
  async createPublicVisitLog(req, res, next) {
    try {
      const { cameraId, action } = req.body;
      const ipAddress = req.ip || req.headers['x-forwarded-for'];
      const userAgent = req.headers['user-agent'];

      await logService.createPublicVisitorLog({
        cameraId,
        action,
        ipAddress,
        userAgent
      });

      res.status(201).json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  /**
   * ดึงรายงานผู้เข้าชมหน้า Public (ต้องมี Token Admin)
   */
  async getVisitorReport(req, res, next) {
    try {
      const { startDate, endDate, cameraId } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ 
          success: false, 
          message: 'startDate and endDate are required' 
        });
      }

      const reportData = await logService.getVisitorReport(startDate, endDate, cameraId);

      res.json({
        success: true,
        data: reportData
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * ดึงประวัติสถานะกล้อง (ONLINE/OFFLINE/ERROR)
   */
  async getCameraLogs(req, res, next) {
    try {
      const { cameraId, limit = 50, page = 1 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where = cameraId ? { cameraId: parseInt(cameraId) } : {};

      const [logs, total] = await Promise.all([
        prisma.cameraEventLog.findMany({
          where,
          include: {
            camera: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit),
          skip
        }),
        prisma.cameraEventLog.count({ where })
      ]);

      res.json({
        success: true,
        data: logs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * ดึงประวัติการทำงานของผู้ใช้งาน
   */
  async getActivityLogs(req, res, next) {
    try {
      const { limit = 50, page = 1 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [logs, total] = await Promise.all([
        prisma.activityLog.findMany({
          include: {
            user: {
              select: { firstName: true, lastName: true, username: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit),
          skip
        }),
        prisma.activityLog.count()
      ]);

      res.json({
        success: true,
        data: logs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = logController;

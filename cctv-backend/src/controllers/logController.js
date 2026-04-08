const prisma = require('../config/prisma');

const logController = {
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

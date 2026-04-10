const prisma = require('../config/prisma');

/**
 * บันทึกประวัติการทำงานของระบบ (Activity Log)
 */
const logService = {
  async createActivityLog({ userId, action, details, ipAddress }) {
    try {
      const log = await prisma.activityLog.create({
        data: {
          userId,
          action,
          details: typeof details === 'object' ? JSON.stringify(details) : details,
          ipAddress
        }
      });
      return log;
    } catch (error) {
      console.error('Failed to create activity log:', error);
    }
  },

  /**
   * ดึงรายการ Activity Logs พร้อมระบบแบ่งหน้า
   */
  async getActivityLogs(page = 1, limit = 50, search = '') {
    const skip = (page - 1) * limit;
    let whereClause = {};

    if (search) {
      whereClause.OR = [
        { details: { contains: search } },
        { user: { username: { contains: search } } },
        { action: { contains: search } }
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: whereClause,
        include: { 
          user: { 
            select: { firstName: true, lastName: true, username: true, role: true } 
          } 
        },
        orderBy: { createdAt: 'desc' },
        skip: skip,
        take: limit
      }),
      prisma.activityLog.count({ where: whereClause })
    ]);

    return {
      data: logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
};

module.exports = logService;

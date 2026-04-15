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
  },

  /**
   * บันทึกประวัติการเข้าชมหน้า Public Dashboard หรือการคลิกดูสตรีม
   */
  async createPublicVisitorLog({ cameraId, action, ipAddress, userAgent }) {
    try {
      const parsedCameraId = (cameraId && !isNaN(parseInt(cameraId))) ? parseInt(cameraId) : null;
      
      const log = await prisma.publicVisitorLog.create({
        data: {
          cameraId: parsedCameraId,
          action, // "VIEW_PAGE", "WATCH_STREAM"
          ipAddress,
          userAgent
        }
      });
      return log;
    } catch (error) {
      console.error('Failed to create public visitor log:', error);
    }
  },

  /**
   * ดึงรายงานผู้เข้าชมแบบ Hybrid (Raw + Summary)
   */
  async getVisitorReport(startDate, endDate, cameraId = null) {
    try {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // ถ้าเลือกช่วง < 30 วัน ดึงจาก Raw Logs
      if (diffDays <= 30) {
        let where = {
          createdAt: {
            gte: start,
            lte: end
          }
        };
        
        // กรองตามกล้องถ้ามีการระบุ
        if (cameraId && cameraId !== 'all') {
          where.cameraId = parseInt(cameraId);
        }

        const logs = await prisma.publicVisitorLog.findMany({
          where,
          orderBy: { createdAt: 'asc' }
        });

        if (logs.length === 0) return [];

        // จัดกลุ่มข้อมูลตามวัน
        const summary = logs.reduce((acc, log) => {
          // ใช้ Local Date เพื่อให้ตรงกับที่ผู้ใช้เห็น
          const date = log.createdAt.toISOString().split('T')[0];
          const key = `${date}_${log.action}_${log.cameraId || 'null'}`;
          
          if (!acc[key]) {
            acc[key] = {
              date,
              action: log.action,
              cameraId: log.cameraId,
              totalViews: 0,
              uniqueIPs: new Set()
            };
          }
          acc[key].totalViews += 1;
          const ip = log.ipAddress || 'anonymous';
          acc[key].uniqueIPs.add(ip);
          return acc;
        }, {});

        return Object.values(summary).map(s => ({
          ...s,
          uniqueIPs: s.uniqueIPs.size
        }));
      } else {
        // ถ้าเลือกช่วง > 30 วัน ดึงจาก Summary Table
        let where = {
          date: {
            gte: start,
            lte: end
          }
        };
        if (cameraId) where.cameraId = parseInt(cameraId);

        const summaryData = await prisma.publicVisitorSummary.findMany({
          where,
          orderBy: { date: 'asc' }
        });

        return summaryData;
      }
    } catch (error) {
      console.error('Failed to get visitor report:', error);
      throw error;
    }
  },

  /**
   * สรุปยอดผู้เข้าชมรายวันจาก Raw Logs ลง Summary Table
   * รันทุกเที่ยงคืนสำหรับข้อมูลของเมื่อวาน
   */
  async summarizeDailyVisitors(targetDate = null) {
    try {
      // ถ้าไม่ระบุวันที่ ให้สรุปของเมื่อวาน
      const date = targetDate ? new Date(targetDate) : new Date();
      if (!targetDate) date.setDate(date.getDate() - 1);
      
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      // 1. ดึงข้อมูลดิบของวันนั้น
      const logs = await prisma.publicVisitorLog.findMany({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });

      if (logs.length === 0) return;

      // 2. จัดกลุ่มข้อมูล (Dimensions: Date, CameraId, Action)
      const groups = logs.reduce((acc, log) => {
        const key = `${log.cameraId || 'null'}_${log.action}`;
        if (!acc[key]) {
          acc[key] = {
            cameraId: log.cameraId,
            action: log.action,
            totalViews: 0,
            ips: new Set()
          };
        }
        acc[key].totalViews += 1;
        if (log.ipAddress) acc[key].ips.add(log.ipAddress);
        return acc;
      }, {});

      // 3. บันทึกลง Summary Table (ใช้ Transaction)
      const summaryEntries = Object.values(groups).map(g => {
        return prisma.publicVisitorSummary.upsert({
          where: {
            date_cameraId_action: {
              date: startOfDay,
              cameraId: g.cameraId,
              action: g.action
            }
          },
          update: {
            totalViews: g.totalViews,
            uniqueIPs: g.ips.size
          },
          create: {
            date: startOfDay,
            cameraId: g.cameraId,
            action: g.action,
            totalViews: g.totalViews,
            uniqueIPs: g.ips.size
          }
        });
      });

      await prisma.$transaction(summaryEntries);
      console.log(`โœ… [Summary] Daily visitor summary completed for ${startOfDay.toISOString().split('T')[0]}`);
      
      // 4. ลบ Raw Logs เก่าที่เกิน 60 วัน (Maintenance)
      const deleteThreshold = new Date();
      deleteThreshold.setDate(deleteThreshold.getDate() - 60);
      await prisma.publicVisitorLog.deleteMany({
        where: {
          createdAt: {
            lt: deleteThreshold
          }
        }
      });

    } catch (error) {
      console.error('Failed to summarize daily visitors:', error);
    }
  }
};

module.exports = logService;

const prisma = require('../config/prisma');
const { parseUA } = require('../utils/uaParser');

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
        
        if (cameraId && cameraId !== 'all') {
          where.cameraId = parseInt(cameraId);
        }

        const logs = await prisma.publicVisitorLog.findMany({
          where,
          orderBy: { createdAt: 'asc' }
        });

        if (logs.length === 0) return [];

        const summary = logs.reduce((acc, log) => {
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
        let where = {
          date: {
            gte: start,
            lte: end
          }
        };
        if (cameraId && cameraId !== 'all') where.cameraId = parseInt(cameraId);

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
   * ดึงรายงานผู้เข้าชมแบบเจาะลึก (Enhanced Analytics)
   */
  async getEnhancedVisitorReport(startDate, endDate, cameraId = null) {
    try {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      // เรียกใช้ getVisitorReport ใน object เดียวกัน
      const basicReport = await this.getVisitorReport(startDate, endDate, cameraId);
      
      let where = {
        createdAt: { gte: start, lte: end }
      };
      if (cameraId && cameraId !== 'all') where.cameraId = parseInt(cameraId);

      const rawLogs = await prisma.publicVisitorLog.findMany({
        where,
        select: { createdAt: true, userAgent: true, action: true }
      });

      const hourlyTraffic = Array(24).fill(0).map((_, i) => ({ hour: i, count: 0 }));
      const techStats = {
        devices: {},
        browsers: {},
        os: {}
      };

      rawLogs.forEach(log => {
        const hour = new Date(log.createdAt).getHours();
        hourlyTraffic[hour].count += 1;

        if (log.userAgent) {
          const ua = parseUA(log.userAgent);
          techStats.devices[ua.deviceType] = (techStats.devices[ua.deviceType] || 0) + 1;
          techStats.browsers[ua.browser] = (techStats.browsers[ua.browser] || 0) + 1;
          techStats.os[ua.os] = (techStats.os[ua.os] || 0) + 1;
        }
      });

      const diffTime = end - start;
      const prevStart = new Date(start.getTime() - diffTime - 1);
      const prevEnd = new Date(start.getTime() - 1);
      
      const prevReport = await this.getVisitorReport(
        prevStart.toISOString().split('T')[0],
        prevEnd.toISOString().split('T')[0],
        cameraId
      );

      const currentTotal = basicReport.reduce((sum, i) => sum + i.totalViews, 0);
      const prevTotal = prevReport.reduce((sum, i) => sum + i.totalViews, 0);
      
      const currentVisitors = basicReport.reduce((sum, i) => sum + i.uniqueIPs, 0);
      const prevVisitors = prevReport.reduce((sum, i) => sum + i.uniqueIPs, 0);

      const calculateGrowth = (curr, prev) => {
        if (prev === 0) return curr > 0 ? 100 : 0;
        return parseFloat((((curr - prev) / prev) * 100).toFixed(1));
      };

      const uptimeData = await this.getSystemAvailability(start, end, cameraId);

      // ดึงข้อมูล Top 10 Visitors โดยการ Group ตาม IP
      const topVisitorsRaw = await prisma.publicVisitorLog.groupBy({
        by: ['ipAddress'],
        where: where,
        _count: {
          id: true
        },
        _max: {
          createdAt: true,
          userAgent: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      });

      const topVisitors = topVisitorsRaw.map(v => ({
        ip: v.ipAddress || 'Unknown',
        count: v._count.id,
        lastSeen: v._max.createdAt,
        userAgent: v._max.userAgent
      }));

      return {
        dailyStats: basicReport,
        hourlyTraffic,
        techStats,
        availability: uptimeData,
        topVisitors,
        trends: {
          views: {
            current: currentTotal,
            previous: prevTotal,
            growth: calculateGrowth(currentTotal, prevTotal)
          },
          visitors: {
            current: currentVisitors,
            previous: prevVisitors,
            growth: calculateGrowth(currentVisitors, prevVisitors)
          }
        }
      };
    } catch (error) {
      console.error('Failed to get enhanced visitor report:', error);
      throw error;
    }
  },

  /**
   * คำนวณความเสถียรของระบบ (Availability Score)
   */
  async getSystemAvailability(start, end, cameraId = null) {
    try {
      const where = {
        createdAt: { gte: start, lte: end }
      };
      if (cameraId && cameraId !== 'all') where.cameraId = parseInt(cameraId);

      const logs = await prisma.cameraEventLog.findMany({
        where,
        orderBy: { createdAt: 'asc' }
      });

      if (logs.length === 0) return { score: 100, onlineCount: 0, offlineCount: 0 };

      const onlineCount = logs.filter(l => l.eventType === 'ONLINE').length;
      const offlineCount = logs.filter(l => l.eventType === 'OFFLINE').length;
      const totalEvents = onlineCount + offlineCount;

      const score = totalEvents > 0 
        ? parseFloat(((onlineCount / totalEvents) * 100).toFixed(2)) 
        : 100;

      return {
        score,
        onlineCount,
        offlineCount,
        totalEvents
      };
    } catch (error) {
      console.error('Failed to calculate system availability:', error);
      return { score: 0, onlineCount: 0, offlineCount: 0 };
    }
  },

  /**
   * สรุปยอดผู้เข้าชมรายวันจาก Raw Logs ลง Summary Table
   */
  async summarizeDailyVisitors(targetDate = null) {
    try {
      const date = targetDate ? new Date(targetDate) : new Date();
      if (!targetDate) date.setDate(date.getDate() - 1);
      
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const logs = await prisma.publicVisitorLog.findMany({
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay }
        }
      });

      if (logs.length === 0) return;

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
      
      // ดึงการตั้งค่าการลบข้อมูล (Retention Policy)
      const settings = await prisma.systemSetting.findMany({
        where: {
          key: { in: ['VISITOR_LOG_RETENTION_DAYS', 'VISITOR_SUMMARY_RETENTION_MONTHS'] }
        }
      });

      const logRetentionDays = parseInt(settings.find(s => s.key === 'VISITOR_LOG_RETENTION_DAYS')?.value || '60');
      const summaryRetentionMonths = parseInt(settings.find(s => s.key === 'VISITOR_SUMMARY_RETENTION_MONTHS')?.value || '36');

      // 1. ลบ Raw Logs (ข้อมูลดิบ)
      const logDeleteThreshold = new Date();
      logDeleteThreshold.setDate(logDeleteThreshold.getDate() - logRetentionDays);
      await prisma.publicVisitorLog.deleteMany({
        where: { createdAt: { lt: logDeleteThreshold } }
      });

      // 2. ลบ Summary Data (ข้อมูลสรุป - ถ้ามีการตั้งค่าไว้)
      if (summaryRetentionMonths > 0) {
        const summaryDeleteThreshold = new Date();
        summaryDeleteThreshold.setMonth(summaryDeleteThreshold.getMonth() - summaryRetentionMonths);
        await prisma.publicVisitorSummary.deleteMany({
          where: { date: { lt: summaryDeleteThreshold } }
        });
      }
    } catch (error) {
      console.error('Failed to summarize daily visitors:', error);
    }
  }
};

module.exports = logService;

const prisma = require('../config/prisma');
const logService = require('../services/logService');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit-table');
const path = require('path');
const fs = require('fs');

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
   * ดึงรายงานผู้เข้าชมแบบเจาะลึก (Trend, Hourly, Technical)
   */
  async getEnhancedVisitorReport(req, res, next) {
    try {
      const { startDate, endDate, cameraId } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ 
          success: false, 
          message: 'startDate and endDate are required' 
        });
      }

      const reportData = await logService.getEnhancedVisitorReport(startDate, endDate, cameraId);

      res.json({
        success: true,
        data: reportData
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * ส่งออกรายงานผู้เข้าชมเป็น PDF
   */
  async exportVisitorReportPdf(req, res, next) {
    try {
      const { startDate, endDate, cameraId } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'startDate and endDate are required' });
      }

      const reportData = await logService.getEnhancedVisitorReport(startDate, endDate, cameraId);
      const cameras = await prisma.camera.findMany({
        select: { id: true, name: true }
      });
      const cameraMap = cameras.reduce((acc, cam) => {
        acc[cam.id] = cam.name;
        return acc;
      }, {});

      const fontPath = path.join(__dirname, '..', 'assets', 'fonts', 'THSarabunNew.ttf');
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Visitor_Insight_Report_${startDate}_to_${endDate}.pdf`);
      doc.pipe(res);

      if (fs.existsSync(fontPath)) {
        doc.registerFont('ThaiFont', fontPath);
        doc.font('ThaiFont');
      }

      // --- Header ---
      doc.fontSize(24).fillColor('#4F46E5').text('CCTV Monitoring System', { align: 'center' });
      doc.fontSize(18).fillColor('#334155').text('รายงานวิเคราะห์สถิติผู้เข้าชมเชิงลึก', { align: 'center' });
      doc.fontSize(12).fillColor('#64748b').text(`ช่วงเวลา: ${startDate} ถึง ${endDate}`, { align: 'right' });
      doc.moveDown();

      // --- Executive Summary Section ---
      doc.rect(30, doc.y, 535, 100).fill('#F8FAFC');
      doc.fillColor('#1E293B').fontSize(16).text('สรุปผลภาพรวม (Executive Summary)', 40, doc.y + 10);
      
      doc.fontSize(12).fillColor('#334155');
      doc.text(`โ€ข จำนวนการเข้าชมทั้งหมด: ${reportData.trends.views.current.toLocaleString()} ครั้ง (${reportData.trends.views.growth >= 0 ? '+' : ''}${reportData.trends.views.growth}%)`, 50, doc.y + 5);
      doc.text(`โ€ข ผู้เข้าชมที่ไม่ซ้ำ: ${reportData.trends.visitors.current.toLocaleString()} ราย (${reportData.trends.visitors.growth >= 0 ? '+' : ''}${reportData.trends.visitors.growth}%)`, 50, doc.y + 2);
      doc.text(`โ€ข ความเสถียรของระบบ (Availability Score): ${reportData.availability.score}%`, 50, doc.y + 2);
      
      const peakHour = reportData.hourlyTraffic.reduce((max, h) => h.count > max.count ? h : max, reportData.hourlyTraffic[0]);
      doc.text(`โ€ข ช่วงเวลาที่มีการใช้งานสูงสุด: ${peakHour.hour}:00 น. (${peakHour.count} views)`, 50, doc.y + 2);
      
      doc.moveDown(3);

      // --- Device Distribution ---
      doc.fontSize(14).fillColor('#1E293B').text('สัดส่วนอุปกรณ์ที่ใช้งาน (Device Distribution)', 30, doc.y);
      Object.entries(reportData.techStats.devices).forEach(([type, count]) => {
        const percent = ((count / reportData.trends.views.current) * 100).toFixed(1);
        doc.fontSize(11).text(`- ${type}: ${count} ครั้ง (${percent}%)`, 45);
      });
      doc.moveDown();

      // --- Data Table ---
      const table = {
        title: "รายละเอียดสถิติรายวัน",
        headers: ["วันที่", "กิจกรรม", "ชื่อกล้อง", "การเข้าชม", "ผู้เข้าชม"],
        rows: reportData.dailyStats.map(item => [
          item.date || item.createdAt.toISOString().split('T')[0],
          item.action === 'VIEW_PAGE' ? 'เข้าชมหน้าเว็บ' : 'ดูสตรีมสด',
          item.cameraId ? (cameraMap[item.cameraId] || `กล้อง ${item.cameraId}`) : 'N/A',
          item.totalViews.toString(),
          item.uniqueIPs.toString()
        ])
      };

      await doc.table(table, {
        prepareHeader: () => doc.font('ThaiFont').fontSize(12).fillColor('#FFFFFF'),
        prepareRow: () => doc.font('ThaiFont').fontSize(11).fillColor('#1E293B'),
        width: 535,
        columnsSize: [80, 100, 215, 70, 70],
        headerColor: '#4F46E5',
      });

      doc.end();
    } catch (error) {
      next(error);
    }
  },

  /**
   * ส่งออกรายงานผู้เข้าชมเป็น Excel
   */
  async exportVisitorReportExcel(req, res, next) {
    try {
      const { startDate, endDate, cameraId } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'startDate and endDate are required' });
      }

      const reportData = await logService.getEnhancedVisitorReport(startDate, endDate, cameraId);
      const cameras = await prisma.camera.findMany({
        select: { id: true, name: true }
      });
      const cameraMap = cameras.reduce((acc, cam) => {
        acc[cam.id] = cam.name;
        return acc;
      }, {});

      const workbook = new ExcelJS.Workbook();
      
      // Sheet 1: Daily Statistics
      const sheet = workbook.addWorksheet('Daily Stats');
      const headerStyle = {
        font: { bold: true, color: { argb: 'FFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '4F46E5' } },
        alignment: { horizontal: 'center' }
      };

      sheet.columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Action', key: 'action', width: 20 },
        { header: 'Camera Name', key: 'cameraName', width: 30 },
        { header: 'Total Views', key: 'totalViews', width: 15 },
        { header: 'Unique Visitors', key: 'uniqueIPs', width: 15 }
      ];

      sheet.getRow(1).eachCell((cell) => cell.style = headerStyle);

      reportData.dailyStats.forEach(item => {
        sheet.addRow({
          date: item.date || item.createdAt,
          action: item.action === 'VIEW_PAGE' ? 'View Dashboard' : 'Watch Stream',
          cameraName: item.cameraId ? (cameraMap[item.cameraId] || `Camera ${item.cameraId}`) : 'N/A',
          totalViews: item.totalViews,
          uniqueIPs: item.uniqueIPs
        });
      });

      // Sheet 2: Insights (Peak Time & Devices)
      const insightSheet = workbook.addWorksheet('Usage Insights');
      
      // Hourly Traffic Table
      insightSheet.addRow(['Hourly Peak Time Analysis']).font = { bold: true, size: 14 };
      insightSheet.addRow(['Hour', 'Views Count']).font = { bold: true };
      reportData.hourlyTraffic.forEach(h => {
        insightSheet.addRow([`${h.hour}:00`, h.count]);
      });

      insightSheet.addRow([]); // Spacer
      
      // Device Stats Table
      insightSheet.addRow(['Device Distribution']).font = { bold: true, size: 14 };
      insightSheet.addRow(['Device Type', 'Total Usage']).font = { bold: true };
      Object.entries(reportData.techStats.devices).forEach(([type, count]) => {
        insightSheet.addRow([type, count]);
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=Visitor_Insight_Report_${startDate}_to_${endDate}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();
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

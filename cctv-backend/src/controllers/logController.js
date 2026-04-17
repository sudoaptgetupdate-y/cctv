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
      const { startDate, endDate, cameraId, lang = 'th' } = req.query;

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

      // --- PDF Translations ---
      const i18n = {
        th: {
          title: 'รายงานวิเคราะห์สถิติผู้เข้าชมเชิงลึก',
          period: 'ช่วงเวลา',
          summaryTitle: 'สรุปผลภาพรวม (Executive Summary)',
          totalViews: 'จำนวนการเข้าชมทั้งหมด',
          uniqueVisitors: 'ผู้เข้าชมที่ไม่ซ้ำ',
          availability: 'ความเสถียรของระบบ (Availability Score)',
          peakTime: 'ช่วงเวลาที่มีการใช้งานสูงสุด',
          techTitle: 'วิเคราะห์ข้อมูลทางเทคนิค (Technical Insights)',
          category: 'หมวดหมู่',
          details: 'รายละเอียดการใช้งาน (Top 5)',
          device: 'อุปกรณ์ (Devices)',
          browser: 'เบราว์เซอร์ (Browsers)',
          os: 'ระบบปฏิบัติการ (OS)',
          dailyTitle: 'รายละเอียดสถิติรายวัน (Detailed Daily Statistics)',
          date: 'วันที่',
          action: 'กิจกรรม',
          cameraName: 'ชื่อกล้อง',
          views: 'เข้าชม (ครั้ง)',
          visitors: 'ผู้ใช้ (ราย)',
          viewPage: 'เข้าชมหน้าเว็บ',
          watchStream: 'ดูสตรีมสด'
        },
        en: {
          title: 'Advanced Visitor Analytics Report',
          period: 'Period',
          summaryTitle: 'Executive Summary',
          totalViews: 'Total Page Views',
          uniqueVisitors: 'Unique Visitors',
          availability: 'System Availability Score',
          peakTime: 'Peak Usage Hour',
          techTitle: 'Technical Distribution Analysis',
          category: 'Category',
          details: 'Usage Details (Top 5)',
          device: 'Device Types',
          browser: 'Browsers',
          os: 'Operating Systems',
          dailyTitle: 'Detailed Daily Statistics',
          date: 'Date',
          action: 'Action',
          cameraName: 'Camera Name',
          views: 'Views',
          visitors: 'Visitors',
          viewPage: 'View Dashboard',
          watchStream: 'Watch Stream'
        }
      };

      const t = i18n[lang] || i18n.th;

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
      doc.fontSize(18).fillColor('#334155').text(t.title, { align: 'center' });
      doc.fontSize(12).fillColor('#64748b').text(`${t.period}: ${startDate} to ${endDate}`, { align: 'right' });
      doc.moveDown();

      // --- Executive Summary Section ---
      const summaryStartY = doc.y;
      doc.rect(30, summaryStartY, 535, 115).fill('#F8FAFC');
      doc.rect(30, summaryStartY, 535, 115).lineWidth(0.5).stroke('#E2E8F0');
      
      doc.fillColor('#1E293B').fontSize(16).text(t.summaryTitle, 45, summaryStartY + 15);
      
      doc.fontSize(11).fillColor('#475569');
      doc.text(`- ${t.totalViews}: ${reportData.trends.views.current.toLocaleString()} (${reportData.trends.views.growth >= 0 ? '+' : ''}${reportData.trends.views.growth}%)`, 55, summaryStartY + 45);
      doc.text(`- ${t.uniqueVisitors}: ${reportData.trends.visitors.current.toLocaleString()} (${reportData.trends.visitors.growth >= 0 ? '+' : ''}${reportData.trends.visitors.growth}%)`, 55, summaryStartY + 62);
      doc.text(`- ${t.availability}: ${reportData.availability.score}%`, 55, summaryStartY + 79);
      
      const peakHour = reportData.hourlyTraffic.reduce((max, h) => h.count > max.count ? h : max, reportData.hourlyTraffic[0]);
      doc.text(`- ${t.peakTime}: ${peakHour.hour}:00 (${peakHour.count} views)`, 55, summaryStartY + 96);
      
      doc.y = summaryStartY + 140;

      // --- Technical Distribution Analysis ---
      doc.fontSize(14).fillColor('#1E293B').text(t.techTitle, 30, doc.y);
      doc.moveDown(0.5);

      const techTable = {
        headers: [
          { label: t.category, property: 'category', width: 150, headerColor: '#1E293B', headerOpacity: 1 },
          { label: t.details, property: 'details', width: 385, headerColor: '#1E293B', headerOpacity: 1 }
        ],
        rows: [
          [
            t.device, 
            Object.entries(reportData.techStats.devices)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([k, v]) => `- ${k}: ${v} (${((v / (reportData.trends.views.current || 1)) * 100).toFixed(1)}%)`)
              .join('\n')
          ],
          [
            t.browser, 
            Object.entries(reportData.techStats.browsers)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([k, v]) => `- ${k}: ${v} (${((v / (reportData.trends.views.current || 1)) * 100).toFixed(1)}%)`)
              .join('\n')
          ],
          [
            t.os, 
            Object.entries(reportData.techStats.os)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([k, v]) => `- ${k}: ${v} (${((v / (reportData.trends.views.current || 1)) * 100).toFixed(1)}%)`)
              .join('\n')
          ]
        ]
      };

      await doc.table(techTable, {
        prepareHeader: () => doc.font('ThaiFont').fontSize(11).fillColor('#FFFFFF'),
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => doc.font('ThaiFont').fontSize(10).fillColor('#334155'),
        width: 535,
        x: 30,
        padding: 5,
        headerColor: '#1E293B',
        headerOpacity: 1,
        divider: {
          header: { disabled: false, width: 0.5, opacity: 0.5 },
          horizontal: { disabled: false, width: 0.1, opacity: 0.2 }
        }
      });

      doc.moveDown(1.5);

      // --- Data Table ---
      const table = {
        title: t.dailyTitle,
        headers: [
          { label: t.date, width: 80, headerColor: '#4F46E5', headerOpacity: 1 },
          { label: t.action, width: 100, headerColor: '#4F46E5', headerOpacity: 1 },
          { label: t.cameraName, width: 215, headerColor: '#4F46E5', headerOpacity: 1 },
          { label: t.views, width: 70, align: 'center', headerColor: '#4F46E5', headerOpacity: 1 },
          { label: t.visitors, width: 70, align: 'center', headerColor: '#4F46E5', headerOpacity: 1 }
        ],
        rows: reportData.dailyStats.map(item => [
          item.date || item.createdAt.toISOString().split('T')[0],
          item.action === 'VIEW_PAGE' ? t.viewPage : t.watchStream,
          item.cameraId ? (cameraMap[item.cameraId] || `Cam ${item.cameraId}`) : 'N/A',
          item.totalViews.toString(),
          item.uniqueIPs.toString()
        ])
      };

      await doc.table(table, {
        prepareHeader: () => doc.font('ThaiFont').fontSize(11).fillColor('#FFFFFF'),
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => doc.font('ThaiFont').fontSize(10).fillColor('#334155'),
        width: 535,
        x: 30,
        padding: 5, // เพิ่ม Padding ให้ข้อความไม่ชิดขอบ
        headerColor: '#4F46E5',
        headerOpacity: 1,
        border: { size: 0.1, color: '#E2E8F0' }
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

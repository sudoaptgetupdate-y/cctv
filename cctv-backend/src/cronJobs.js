const cron = require('node-cron');
const healthCheckService = require('./services/healthCheckService');
const streamService = require('./services/streamService');
const logService = require('./services/logService');

const initCronJobs = () => {
  // ตรวจสอบสถานะกล้องทุก 5 นาที
  cron.schedule('*/5 * * * *', async () => {
    try {
      await healthCheckService.checkAllCameras();
    } catch (error) {
      console.error('❌ [Cron Job] Health Check failed:', error.message);
    }
  });

  // ล้าง Session การดูที่หมดอายุทุก 1 นาที
  cron.schedule('*/1 * * * *', async () => {
    try {
      await streamService.cleanupSessions();
    } catch (error) {
      console.error('❌ [Cron Job] Cleanup Sessions failed:', error.message);
    }
  });

  // สรุปยอดผู้เข้าชมรายวัน ทุกเที่ยงคืน (00:01)
  cron.schedule('1 0 * * *', async () => {
    try {
      await logService.summarizeDailyVisitors();
    } catch (error) {
      console.error('❌ [Cron Job] Daily Summary failed:', error.message);
    }
  });

  console.log('⏰ [Cron] Background jobs initialized (Health/Cleanup/Summary)');
};

module.exports = initCronJobs;

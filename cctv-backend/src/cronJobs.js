const cron = require('node-cron');
const healthCheckService = require('./services/healthCheckService');
const streamService = require('./services/streamService');

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

  console.log('⏰ [Cron] Background jobs initialized (Health/Cleanup)');
};

module.exports = initCronJobs;

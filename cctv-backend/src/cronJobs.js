const cron = require('node-cron');
const healthCheckService = require('./services/healthCheckService');

const initCronJobs = () => {
  // ตรวจสอบสถานะกล้องทุก 5 นาที
  // สามารถปรับเป็น '*/1 * * * *' เพื่อเช็คทุกนาทีได้
  cron.schedule('*/5 * * * *', async () => {
    try {
      await healthCheckService.checkAllCameras();
    } catch (error) {
      console.error('❌ [Cron Job] Health Check failed:', error.message);
    }
  });

  console.log('⏰ [Cron] Background jobs initialized (Health Check: every 5 mins)');
};

module.exports = initCronJobs;

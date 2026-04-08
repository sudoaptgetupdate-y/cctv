const telegramService = require('./telegramService');

const notificationService = {
  // ส่งแจ้งเตือนกล้องดับ/ติด ไปยังทุกกลุ่มที่กล้องสังกัดอยู่
  async sendCameraAlert(camera, status) {
    if (!camera.groups || camera.groups.length === 0) return;

    const emoji = status === 'ACTIVE' ? '✅' : '🔴';
    const statusText = status === 'ACTIVE' ? 'ONLINE (กลับมาใช้งานได้)' : 'OFFLINE (ขาดการติดต่อ)';
    const message = `${emoji} *CCTV ALERT*\n\n` +
                    `📌 กล้อง: ${camera.name}\n` +
                    `📡 สถานะ: ${statusText}\n` +
                    `⏰ เวลา: ${new Date().toLocaleString('th-TH')}\n` +
                    `📍 พิกัด: ${camera.latitude}, ${camera.longitude}`;

    for (const group of camera.groups) {
      if (group.isNotifyEnabled && group.telegramBotToken && group.telegramChatId) {
        try {
          await telegramService.sendMessage(
            group.telegramBotToken,
            group.telegramChatId,
            message
          );
        } catch (error) {
          console.error(`❌ [Telegram] Failed to send alert to group ${group.name}:`, error.message);
        }
      }
    }
  }
};

module.exports = notificationService;

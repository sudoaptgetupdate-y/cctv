const telegramService = require('./telegramService');
const aiService = require('./aiService');

const notificationService = {
  // ส่งแจ้งเตือนกล้องดับ/ติด ไปยังทุกกลุ่มที่กล้องสังกัดอยู่
  async sendCameraAlert(camera, status) {
    if (!camera.groups || camera.groups.length === 0) return;

    const emoji = status === 'ACTIVE' ? '✅' : '🔴';
    const statusText = status === 'ACTIVE' ? 'ONLINE (กลับมาใช้งานได้)' : 'OFFLINE (ขาดการติดต่อ)';
    
    for (const group of camera.groups) {
      if (group.isNotifyEnabled && group.telegramBotToken && group.telegramChatId) {
        let aiSummary = '';
        
        // ถ้าเปิดใช้งาน AI ให้ไปขอสรุปจาก AI มาแปะท้ายข้อความ
        if (group.aiEnabled) {
          aiSummary = await aiService.analyzeCameraEvent(camera, status, group.aiSystemPrompt);
        }

        const message = `${emoji} *CCTV ALERT*\n\n` +
                        `📌 กล้อง: ${camera.name}\n` +
                        `📡 สถานะ: ${statusText}\n` +
                        `⏰ เวลา: ${new Date().toLocaleString('th-TH')}\n` +
                        `📍 พิกัด: ${camera.latitude}, ${camera.longitude}\n` +
                        (aiSummary ? `\n🤖 *AI Insight:* \n_${aiSummary}_` : '');

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

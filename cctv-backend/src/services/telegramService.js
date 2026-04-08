const axios = require('axios');

const telegramService = {
  /**
   * ส่งข้อความไปยัง Telegram
   * @param {string} botToken - Token ของ Telegram Bot
   * @param {string} chatId - ID ของกลุ่มหรือแชทที่ต้องการส่งไป
   * @param {string} message - ข้อความที่ต้องการส่ง (รองรับ HTML)
   */
  async sendMessage(botToken, chatId, message) {
    if (!botToken || !chatId) {
      console.warn('⚠️ [Telegram] Missing Bot Token or Chat ID');
      return;
    }

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
      await axios.post(url, {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });
      console.log(`✅ [Telegram] Message sent to ${chatId}`);
    } catch (error) {
      const errorMsg = error.response ? error.response.data.description : error.message;
      console.error(`❌ [Telegram] Failed to send message: ${errorMsg}`);
      throw new Error(errorMsg);
    }
  }
};

module.exports = telegramService;

const { GoogleGenerativeAI } = require('@google/generative-ai');

// ตรวจสอบ API Key
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const aiService = {
  /**
   * วิเคราะห์ Event ของกล้องและสรุปข้อมูล
   * @param {Object} camera - ข้อมูลกล้อง
   * @param {string} status - สถานะใหม่
   * @param {string} systemPrompt - Prompt เฉพาะกลุ่ม
   */
  async analyzeCameraEvent(camera, status, systemPrompt) {
    if (!genAI) return null;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const defaultPrompt = "คุณคือผู้เชี่ยวชาญด้านระบบกล้องวงจรปิด (CCTV Expert) หน้าที่ของคุณคือวิเคราะห์เหตุการณ์ที่เกิดขึ้นและให้คำแนะนำสั้นๆ";
      const finalPrompt = systemPrompt || defaultPrompt;

      const context = `
        สถานะปัจจุบัน: ${status}
        ชื่อกล้อง: ${camera.name}
        พิกัด: ${camera.latitude}, ${camera.longitude}
        URL สตรีม: ${camera.rtspUrl}
        
        กรุณาสรุปเหตุการณ์นี้เป็นภาษาไทยแบบสั้นๆ กระชับ และให้คำแนะนำทางเทคนิค 1-2 ข้อ (เช่น ตรวจสอบสายแลน, ตรวจสอบไฟเลี้ยง)
      `;

      const result = await model.generateContent([finalPrompt, context]);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('❌ [AI Service] Analysis failed:', error.message);
      return null;
    }
  },

  /**
   * สรุปสถานะรวมของระบบ (ใช้สำหรับคำสั่งถามตอบใน Telegram)
   * @param {Array} cameras - รายการกล้องทั้งหมด
   */
  async summarizeSystemStatus(cameras) {
    if (!genAI) return "ระบบ AI ไม่พร้อมใช้งาน (Missing API Key)";

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const onlineCount = cameras.filter(c => c.status === 'ACTIVE').length;
      const offlineCount = cameras.length - onlineCount;
      const offlineNames = cameras.filter(c => c.status !== 'ACTIVE').map(c => c.name).join(', ');

      const context = `
        สรุปสถานะระบบ CCTV ปัจจุบัน:
        - กล้องทั้งหมด: ${cameras.length} ตัว
        - ออนไลน์: ${onlineCount} ตัว
        - ออฟไลน์: ${offlineCount} ตัว
        ${offlineCount > 0 ? `- รายชื่อกล้องที่ดับ: ${offlineNames}` : '- ทุกตัวทำงานปกติ'}
        
        กรุณาสรุปสถานะนี้ให้น่าสนใจ และให้กำลังใจทีมงานเทคนิคด้วยภาษาที่เป็นกันเอง
      `;

      const result = await model.generateContent(context);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('❌ [AI Service] Summarization failed:', error.message);
      return "ไม่สามารถสรุปข้อมูลได้ในขณะนี้";
    }
  }
};

module.exports = aiService;

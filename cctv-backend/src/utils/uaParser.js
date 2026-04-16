const UAParser = require('ua-parser-js');

/**
 * วิเคราะห์ข้อมูล User-Agent เพื่อแยกแยะอุปกรณ์และเบราว์เซอร์
 * @param {string} uaString - ค่า User-Agent จาก HTTP Header
 * @returns {object} - ข้อมูลอุปกรณ์และเบราว์เซอร์ที่อ่านง่าย
 */
const parseUA = (uaString) => {
  const parser = new UAParser(uaString);
  const result = parser.getResult();

  return {
    browser: result.browser.name || 'Unknown',
    os: result.os.name || 'Unknown',
    // แยกประเภทอุปกรณ์: Mobile, Tablet, Desktop (Desktop มักจะไม่มีค่า result.device.type)
    deviceType: result.device.type === 'mobile' ? 'Mobile' : 
                result.device.type === 'tablet' ? 'Tablet' : 'Desktop',
    deviceVendor: result.device.vendor || ''
  };
};

module.exports = { parseUA };

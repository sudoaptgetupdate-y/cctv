# 📊 Report Enhancements & Actionable Insights Plan

เอกสารฉบับนี้ระบุรายละเอียดแผนการพัฒนาเทคโนโลยีการวิเคราะห์ข้อมูล (Analytics) สำหรับหน้า Reports เพื่อยกระดับจากสรุปสถิติทั่วไปสู่ระบบวิเคราะห์ข้อมูลอัจฉริยะ (Business Intelligence)

---

## 🏗️ แผนการดำเนินงาน 3 ระยะ (3-Phase Roadmap)

### Phase 1: Backend Data Refactoring (รากฐานข้อมูล)
*เป้าหมาย: เพิ่มขีดความสามารถในการประมวลผลข้อมูลดิบให้มีความละเอียดสูง*

1.  **Device & Browser Identification:**
    *   ติดตั้งไลบรารี `ua-parser-js`
    *   สร้าง Utility สำหรับ Parse `userAgent` เพื่อแยกมิติ (Dimensions): อุปกรณ์ (Mobile/Tablet/Desktop), เบราว์เซอร์ (Chrome/Safari/ฯลฯ) และระบบปฏิบัติการ
2.  **Hourly Traffic Aggregation:**
    *   อัปเดต `logService.getVisitorReport` ให้รองรับการ Group ข้อมูลรายชั่วโมง (0-23)
    *   สร้าง Cache หรือตาราง Summary รายชั่วโมงสำหรับข้อมูลที่มีอายุ > 7 วัน
3.  **Trend Calculation Logic:**
    *   พัฒนา Logic การดึงข้อมูลเปรียบเทียบ (Period-over-Period) 
    *   คำนวณสูตร: `((ปัจจุบัน - ก่อนหน้า) / ก่อนหน้า) * 100`
4.  **System Availability Correlation:**
    *   ดึงข้อมูลจาก `CameraEventLog` มาคำนวณหา % Uptime ของกล้องแต่ละตัวในแต่ละวัน
    *   สูตรคำนวณ: `(เวลาที่ Online / เวลาทั้งหมดในรอบรายงาน) * 100`

### Phase 2: UI/UX Visualization (การแสดงผลระดับ Enterprise)
*เป้าหมาย: สร้างหน้า Dashboard ที่ช่วยในการตัดสินใจได้ทันที*

1.  **Peak Time Heatmap/Bar Chart:**
    *   แสดงกราฟแท่ง 24 แท่ง (00:00 - 23:00) เพื่อหา Peak Load ของระบบ
2.  **Trend Indicators on Stat Cards:**
    *   เพิ่มสัญลักษณ์ลูกศร (↑/↓) และตัวเลขเปอร์เซ็นต์ข้างหลังสถิติหลัก
    *   ใช้สี Semantic: เขียว (ดีขึ้น), แดง (ลดลง), เทา (คงที่)
3.  **Technical Distribution Charts:**
    *   เพิ่ม Pie Chart แสดงสัดส่วนอุปกรณ์ (ช่วยตัดสินใจเรื่อง Mobile Optimization)
    *   เพิ่ม Pie Chart แสดงสัดส่วนเบราว์เซอร์
4.  **Integrated Health Score:**
    *   แสดง "Availability Score" เป็น Gauge Chart หรือแถบ Progress สีตามสถานะ (เขียว > 99%)

### Phase 3: Intelligent Export (รายงานสรุปผู้บริหาร)
*เป้าหมาย: ส่งออกรายงานที่วิเคราะห์สรุปผลให้เสร็จสรรพ*

1.  **Executive Summary Page (PDF):**
    *   หน้าแรกของ PDF จะสรุป Insight สำคัญ: "สัปดาห์นี้คนดูเพิ่มขึ้น 10% ช่วงเวลาที่ดูมากที่สุดคือ 19:00 น. และระบบมีความเสถียร 99.8%"
2.  **Detailed Insight Sheet (Excel):**
    *   เพิ่ม Tab "Hourly_Analysis" และ "Technical_Stats" ในไฟล์ Excel

---

## 📈 ประโยชน์ที่คาดว่าจะได้รับ (Expected Value)
1.  **System Health Monitoring:** รู้ทันทีว่าคนดูน้อยลงเพราะระบบไม่เสถียร หรือเพราะพฤติกรรมผู้ใช้เปลี่ยนไป
2.  **Resource Planning:** รู้ช่วงเวลา Peak เพื่อเตรียม Bandwidth หรือวางแผนซ่อมบำรุง
3.  **UX Improvement:** รู้ว่าผู้ใช้ส่วนใหญ่เข้าผ่านอุปกรณ์อะไร เพื่อปรับ UI ให้เหมาะสมที่สุด

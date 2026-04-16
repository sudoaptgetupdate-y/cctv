import apiClient from '../utils/apiClient';

const logService = {
  /**
   * บันทึกการเข้าชมหน้า Public Dashboard หรือการคลิกดูสตรีม
   */
  async recordVisit({ cameraId, action }) {
    try {
      await apiClient.post('/logs/public/visit', { cameraId, action });
    } catch (error) {
      console.error('Failed to record visit:', error);
    }
  },

  /**
   * ดึงรายงานผู้เข้าชมหน้า Public (Admin)
   */
  async getVisitorReport(startDate, endDate, cameraId = null) {
    try {
      const response = await apiClient.get('/logs/visitor-report', {
        params: { startDate, endDate, cameraId }
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch visitor report:', error);
      throw error;
    }
  },

  /**
   * ดึงรายงานผู้เข้าชมแบบเจาะลึก (Enhanced Analytics)
   */
  async getEnhancedVisitorReport(startDate, endDate, cameraId = null) {
    try {
      const response = await apiClient.get('/logs/visitor-report-enhanced', {
        params: { startDate, endDate, cameraId }
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch enhanced visitor report:', error);
      throw error;
    }
  },

  /**
   * ส่งออกรายงานผู้เข้าชม (Excel/PDF)
   */
  async exportVisitorReport(startDate, endDate, cameraId = null, format = 'excel') {
    try {
      const response = await apiClient.get(`/logs/export/${format}`, {
        params: { startDate, endDate, cameraId },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to export visitor report as ${format}:`, error);
      throw error;
    }
  }
};

export default logService;

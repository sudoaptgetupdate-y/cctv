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
  }
};

export default logService;

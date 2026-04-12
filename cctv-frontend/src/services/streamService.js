import apiClient from '../utils/apiClient';

const streamService = {
  // ดึงคอนฟิกสตรีมมิ่งของกล้อง
  async getStreamInfo(cameraId, type = null) {
    const params = type ? { type } : {};
    const res = await apiClient.get(`/streams/${cameraId}`, { params });
    return res.data.data;
  },

  // ดึงสถานะความละเอียดและ FPS ของทุกสตรีม
  async getStreamStatuses() {
    const res = await apiClient.get(`/streams/statuses?t=${Date.now()}`);
    return res.data.data;
  },

  // ดึงสถานะเชิงลึกเฉพาะสตรีม (Real-time Full Info)
  async getSingleStreamStatus(streamId) {
    const res = await apiClient.get(`/streams/${streamId}/status?t=${Date.now()}`);
    return res.data.data;
  },

  // ส่ง Heartbeat เพื่อยืนยันว่ายังดูอยู่
  async sendHeartbeat(streamId, sessionId) {
    return await apiClient.post(`/streams/${streamId}/heartbeat`, { sessionId });
  }
};

export default streamService;

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
    const res = await apiClient.get('/streams/statuses');
    return res.data.data;
  }
};

export default streamService;

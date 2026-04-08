import apiClient from '../utils/apiClient';

const streamService = {
  // ดึงคอนฟิกสตรีมมิ่งของกล้อง
  async getStreamInfo(cameraId) {
    const res = await apiClient.get(`/streams/${cameraId}`);
    return res.data.data;
  }
};

export default streamService;

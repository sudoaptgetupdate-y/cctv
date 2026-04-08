import apiClient from '../utils/apiClient';

const cameraService = {
  async getAll() {
    const res = await apiClient.get('/cameras');
    return res.data.data;
  },
  async getById(id) {
    const res = await apiClient.get(`/cameras/${id}`);
    return res.data.data;
  },
  async create(data) {
    const res = await apiClient.post('/cameras', data);
    return res.data.data;
  },
  async update(id, data) {
    const res = await apiClient.put(`/cameras/${id}`, data);
    return res.data.data;
  },
  async delete(id) {
    const res = await apiClient.delete(`/cameras/${id}`);
    return res.data.data;
  }
};

export default cameraService;

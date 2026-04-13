import apiClient from '../utils/apiClient';
const cameraService = {
  async getAll() {
    const response = await apiClient.get('/cameras');
    return response.data.data;
  },

  async getPublic() {
    const response = await apiClient.get('/cameras/public');
    return response.data.data;
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
  },

  async acknowledge(id, data) {
    const res = await apiClient.post(`/cameras/${id}/acknowledge`, data);
    return res.data.data;
  },

  async getEvents(id) {
    const res = await apiClient.get(`/cameras/${id}/events`);
    return res.data.data;
  },

  async validate(data, id = null) {
    const url = id ? `/cameras/validate?id=${id}` : '/cameras/validate';
    const res = await apiClient.post(url, data);
    return res.data.data;
  }
};

export default cameraService;

import apiClient from '../utils/apiClient';

const groupService = {
  async getAll() {
    const res = await apiClient.get('/groups');
    return res.data.data;
  },
  async getById(id) {
    const res = await apiClient.get(`/groups/${id}`);
    return res.data.data;
  },
  async create(data) {
    const res = await apiClient.post('/groups', data);
    return res.data.data;
  },
  async update(id, data) {
    const res = await apiClient.put(`/groups/${id}`, data);
    return res.data.data;
  },
  async delete(id) {
    const res = await apiClient.delete(`/groups/${id}`);
    return res.data.data;
  }
};

export default groupService;

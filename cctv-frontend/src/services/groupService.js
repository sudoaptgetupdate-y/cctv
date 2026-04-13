import apiClient from '../utils/apiClient';
const groupService = {
  async getAll() {
    const response = await apiClient.get('/groups');
    return response.data.data;
  },

  async getPublic() {
    const response = await apiClient.get('/groups/public');
    return response.data.data;
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
  },
  async validate(data, id = null) {
    const res = await apiClient.post(`/groups/validate${id ? `?id=${id}` : ''}`, data);
    return res.data.data;
  },
  async updateGroupCameras(id, cameraIds) {
    const res = await apiClient.post(`/groups/${id}/cameras`, { cameraIds });
    return res.data.data;
  }
};

export default groupService;

import apiClient from '../utils/apiClient';

export const userService = {
  getUsers: async () => {
    const response = await apiClient.get('/users');
    return response.data.data; // Backend response has { success: true, data: [...] }
  },

  getUserById: async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data.data;
  },

  createUser: async (userData) => {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },

  updateUser: async (id, updateData) => {
    const response = await apiClient.put(`/users/${id}`, updateData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  }
};

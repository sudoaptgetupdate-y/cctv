import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api', // ใช้ proxy จาก vite.config.js
  headers: {
    'Content-Type': 'application/json',
  },
});

// ใส่ Token ใน Header ทุกครั้งก่อนส่ง Request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('cctv_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// จัดการเมื่อ Token หมดอายุ (401)
apiClient.interceptors.response.use((response) => response, (error) => {
  if (error.response && error.response.status === 401) {
    const isPublicPage = window.location.pathname === '/' || window.location.pathname === '/public';
    
    localStorage.removeItem('cctv_token');
    
    // ถ้าไม่ใช่หน้า Public ค่อยเด้งไป Login
    if (!isPublicPage) {
      window.location.href = '/login';
    }
  }
  return Promise.reject(error);
});

export default apiClient;

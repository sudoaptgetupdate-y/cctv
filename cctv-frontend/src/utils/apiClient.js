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
    // ลบ Token ออกถ้าไม่ถูกต้อง
    localStorage.removeItem('cctv_token');
    
    // ไม่ใช้ window.location.href เพราะจะทำให้ App กระตุก/เด้งรัวๆ 
    // เราจะปล่อยให้ ProtectedRoute หรือ AuthContext จัดการสถานะ User เป็น null แทน
  }
  return Promise.reject(error);
});

export default apiClient;

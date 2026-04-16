import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../utils/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('cctv_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await apiClient.get('/auth/me');
      setUser(res.data.data);
    } catch (error) {
      console.error('Auth check failed:', error);
      // เฉพาะกรณี Unauthorized (401) หรือ Forbidden (403) เท่านั้นถึงจะลบ Token
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem('cctv_token');
        setUser(null);
      }
      // ถ้าเป็น Error อื่นๆ (เช่น 500 หรือ Network Error) เราจะยังไม่ลบ Token 
      // เพื่อให้โอกาสผู้ใช้ในการ Refresh หรือลองใหม่โดยไม่ต้อง Login
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const res = await apiClient.post('/auth/login', { username, password });
      const { user, token } = res.data.data;
      localStorage.setItem('cctv_token', token);
      setUser(user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || 'เข้าสู่ระบบไม่สำเร็จ' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('cctv_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

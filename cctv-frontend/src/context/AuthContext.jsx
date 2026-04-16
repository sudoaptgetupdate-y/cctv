import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import apiClient from '../utils/apiClient';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isChecking = useRef(false);

  useEffect(() => {
    if (!isChecking.current) {
      checkAuth();
    }
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('cctv_token');
    if (!token) {
      setLoading(false);
      return;
    }

    // ป้องกันการยิง Request ซ้อนกัน
    if (isChecking.current) return;
    isChecking.current = true;

    try {
      const res = await apiClient.get('/auth/me');
      setUser(res.data.data);
      setLoading(false);
    } catch (error) {
      // ถ้าเป็นการยกเลิก Request (เช่น Refresh หน้าจอ) ไม่ต้องทำอะไร
      if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
        return;
      }

      console.error('Auth check failed:', error);
      
      // เฉพาะกรณี Unauthorized (401) หรือ Forbidden (403) เท่านั้นถึงจะลบ Token
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem('cctv_token');
        setUser(null);
        setLoading(false);
      } else {
        // กรณี Network Error หรือ Server 500
        // เรายังคง Loading ต่อไป หรือลองใหม่อีกครั้งเพื่อไม่ให้เด้งไปหน้า Login ทันที
        console.warn('Network or Server error, retrying in 2s...');
        setTimeout(() => {
          isChecking.current = false;
          checkAuth();
        }, 2000);
      }
    } finally {
      // ไม่ใช้ finally เพื่อ set loading false เพราะเราต้องการควบคุมลำดับเหตุการณ์เองข้างบน
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

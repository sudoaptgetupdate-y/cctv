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
    if (token) {
      try {
        const res = await apiClient.get('/auth/me');
        setUser(res.data.data);
      } catch (error) {
        localStorage.removeItem('cctv_token');
      }
    }
    setLoading(false);
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

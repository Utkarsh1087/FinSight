import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('finsight_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('finsight_token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && !user) {
      fetchCurrentUser();
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me/');
      setUser(res.data);
      localStorage.setItem('finsight_user', JSON.stringify(res.data));
    } catch (err) {
      console.error('Failed to fetch user', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login/', { email, password });
      const { user: userData, token: userToken } = res.data;
      setToken(userToken);
      setUser(userData);
      localStorage.setItem('finsight_token', userToken);
      localStorage.setItem('finsight_user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.non_field_errors?.[0] || 'Login failed.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register/', formData);
      const { user: userData, token: userToken } = res.data;
      setToken(userToken);
      setUser(userData);
      localStorage.setItem('finsight_token', userToken);
      localStorage.setItem('finsight_user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.email?.[0] || err.response?.data?.error || 'Registration failed.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout/');
      }
    } catch (e) {
      // ignore
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('finsight_token');
      localStorage.removeItem('finsight_user');
    }
  };

  // Quick Demo Login Helper
  const quickDemoLogin = async (role = 'ADMIN') => {
    const creds = {
      ADMIN: { email: 'admin@finsight.com', password: 'Admin@123' },
      FINANCE_USER: { email: 'finance@finsight.com', password: 'Finance@123' },
      VIEWER: { email: 'viewer@finsight.com', password: 'Viewer@123' },
    };
    const c = creds[role] || creds.ADMIN;
    return await login(c.email, c.password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        quickDemoLogin,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'ADMIN',
        isFinanceUser: user?.role === 'FINANCE_USER' || user?.role === 'ADMIN',
        isViewer: user?.role === 'VIEWER',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('fraudShieldToken') || localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/profile');
          setUser(res.data.user);
        } catch (error) {
          console.error('Error loading user profile:', error.message);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      const { token: userToken, user: userData } = res.data;
      
      localStorage.setItem('fraudShieldToken', userToken);
      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(userData);
      setLoading(false);
      return res.data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (name, email, password, phone) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/register', { name, email, password, phone });
      const { token: userToken, user: userData } = res.data;
      if (userToken) {
        localStorage.setItem('fraudShieldToken', userToken);
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
      }
      setLoading(false);
      return res.data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('fraudShieldToken');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthProvider;

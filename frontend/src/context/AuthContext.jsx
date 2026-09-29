import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import axiosInstance from '../api/axiosInstance';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedAccess = localStorage.getItem('gg_access_token');
    const storedRefresh = localStorage.getItem('gg_refresh_token');
    const storedUser = localStorage.getItem('gg_user');

    if (storedAccess && storedUser) {
      setToken(storedAccess);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authApi.login(email, password);
      const { access, refresh, user: userData } = response.data;
      
      localStorage.setItem('gg_access_token', access);
      localStorage.setItem('gg_refresh_token', refresh);
      localStorage.setItem('gg_user', JSON.stringify(userData));
      
      setToken(access);
      setUser(userData);
      
      return true;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('gg_refresh_token');
      if (refresh) {
        await authApi.logout(refresh);
      }
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      localStorage.removeItem('gg_access_token');
      localStorage.removeItem('gg_refresh_token');
      localStorage.removeItem('gg_user');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('farm2door_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('farm2door_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
          localStorage.setItem('farm2door_user', JSON.stringify(profile));
        } catch (err) {
          console.error('Session expired or invalid token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (email, password) => {
    const authData = await authService.login({ email, password });
    localStorage.setItem('farm2door_token', authData.token);
    setToken(authData.token);

    const userObj = {
      id: authData.id,
      email: authData.email,
      fullName: authData.fullName,
      phone: authData.phone,
      role: authData.role,
      profileId: authData.profileId,
      farmName: authData.farmName,
    };
    setUser(userObj);
    localStorage.setItem('farm2door_user', JSON.stringify(userObj));
    return userObj;
  };

  const register = async (userData) => {
    const authData = await authService.register(userData);
    localStorage.setItem('farm2door_token', authData.token);
    setToken(authData.token);

    const userObj = {
      id: authData.id,
      email: authData.email,
      fullName: authData.fullName,
      phone: authData.phone,
      role: authData.role,
      profileId: authData.profileId,
      farmName: authData.farmName,
    };
    setUser(userObj);
    localStorage.setItem('farm2door_user', JSON.stringify(userObj));
    return userObj;
  };

  const logout = () => {
    localStorage.removeItem('farm2door_token');
    localStorage.removeItem('farm2door_user');
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    if (token) {
      try {
        const profile = await authService.getProfile();
        setUser(profile);
        localStorage.setItem('farm2door_user', JSON.stringify(profile));
      } catch (err) {
        console.error('Failed to refresh profile', err);
      }
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isFarmer: user?.role === 'ROLE_FARMER',
    isConsumer: user?.role === 'ROLE_CONSUMER',
    isAdmin: user?.role === 'ROLE_ADMIN',
    login,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

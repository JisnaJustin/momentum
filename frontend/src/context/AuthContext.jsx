import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser as apiLogin, registerUser as apiRegister, getCurrentUser } from '../api/auth';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('momentum_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('momentum_access_token'));
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const logout = useCallback(() => {
    localStorage.removeItem('momentum_access_token');
    localStorage.removeItem('momentum_refresh_token');
    localStorage.removeItem('momentum_user');
    setUser(null);
    setToken(null);
  }, []);

  // Fetch current user details if token exists
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('momentum_access_token');
      if (storedToken) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
          localStorage.setItem('momentum_user', JSON.stringify(userData));
        } catch (error) {
          console.error('Failed to validate user token:', error);
          // Interceptor will handle refresh or token cleanup
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // Listen to auto-logout event from Axios interceptor
    const handleAutoLogout = () => {
      logout();
      toast.error('Session expired. Please log in again.');
    };

    window.addEventListener('momentum_auth_logout', handleAutoLogout);
    return () => window.removeEventListener('momentum_auth_logout', handleAutoLogout);
  }, [logout, toast]);

  const login = async (username, password) => {
    const data = await apiLogin({ username, password });
    localStorage.setItem('momentum_access_token', data.access);
    localStorage.setItem('momentum_refresh_token', data.refresh);
    setToken(data.access);

    // Fetch user profile details
    const userData = await getCurrentUser();
    setUser(userData);
    localStorage.setItem('momentum_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (userData) => {
    const data = await apiRegister(userData);
    if (data.tokens) {
      localStorage.setItem('momentum_access_token', data.tokens.access);
      localStorage.setItem('momentum_refresh_token', data.tokens.refresh);
      setToken(data.tokens.access);
      setUser(data.user);
      localStorage.setItem('momentum_user', JSON.stringify(data.user));
    }
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

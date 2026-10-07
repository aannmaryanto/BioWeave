import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('bioweave_token') || null);
  const [loading, setLoading] = useState(true);

  // Check current user status on initial application load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('bioweave_token');
      if (storedToken) {
        try {
          const data = await authService.getCurrentUser();
          setUser(data.user);
          setToken(storedToken);
        } catch (error) {
          console.warn('Session restoration failed:', error?.response?.data?.message || error.message);
          // Token is invalid or expired - clear local storage
          localStorage.removeItem('bioweave_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Login handler
   */
  const login = async (email, password) => {
    const data = await authService.login(email, password);
    if (data && data.token) {
      localStorage.setItem('bioweave_token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  /**
   * Register handler
   */
  const register = async (name, email, password) => {
    const data = await authService.register(name, email, password);
    if (data && data.token) {
      localStorage.setItem('bioweave_token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  /**
   * Logout handler
   */
  const logout = () => {
    localStorage.removeItem('bioweave_token');
    setToken(null);
    setUser(null);
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
        isAuthenticated: !!user && !!token,
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

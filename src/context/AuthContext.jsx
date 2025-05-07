import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, checkAuth } from '../services/auth';
import { useAlerts } from './AlertContext';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showAlert } = useAlerts();

  // Check if user is authenticated on app load
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const userData = await checkAuth();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const userData = await apiLogin(credentials);
      setUser(userData);
      setIsAuthenticated(true);
      showAlert('Login successful', 'success');
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      showAlert(error.message || 'Login failed. Please check your credentials.', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiLogout();
      setUser(null);
      setIsAuthenticated(false);
      showAlert('You have been logged out successfully', 'success');
    } catch (error) {
      console.error('Logout failed:', error);
      showAlert('Logout failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  const contextValue = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
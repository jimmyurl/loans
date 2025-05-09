// src/context/AlertContext.jsx
import React, { createContext, useState, useCallback } from 'react';

// Create the Alert Context
export const AlertContext = createContext();

// Create the Alert Provider component
export const AlertProvider = ({ children }) => {
  // Default alert state
  const [alert, setAlert] = useState({
    visible: false,
    message: '',
    type: 'info' // 'success', 'error', 'warning', or 'info'
  });

  // Show alert function
  const showAlert = useCallback((message, type = 'info') => {
    setAlert({
      visible: true,
      message,
      type
    });
  }, []);

  // Hide alert function
  const hideAlert = useCallback(() => {
    setAlert(prev => ({
      ...prev,
      visible: false
    }));
  }, []);

  // Context value
  const value = {
    alert,
    showAlert,
    hideAlert
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};

export default AlertProvider;
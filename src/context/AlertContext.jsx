import React, { createContext, useContext, useState, useCallback } from 'react';

const AlertContext = createContext();

export const useAlerts = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const showAlert = useCallback((message, type = 'info', timeout = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    setAlerts(prevAlerts => [...prevAlerts, { id, message, type }]);

    if (timeout) {
      setTimeout(() => {
        removeAlert(id);
      }, timeout);
    }

    return id;
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));
  }, []);

  return (
    <AlertContext.Provider value={{ alerts, showAlert, removeAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export default AlertContext;
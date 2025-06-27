import React, { createContext, useState, useEffect, useContext } from 'react';

// Crear el contexto
const ConnectionContext = createContext({
  isOnline: true,
  lastOnlineCheck: null,
  checkConnection: () => {}
});

// Hook personalizado para usar el contexto
export const useConnection = () => useContext(ConnectionContext);

// Proveedor del contexto
export const ConnectionProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastOnlineCheck, setLastOnlineCheck] = useState(new Date());

  // Función para verificar la conexión manualmente
  const checkConnection = async () => {
    setIsOnline(navigator.onLine)
  };

  // Escuchar eventos de conexión del navegador
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastOnlineCheck(new Date());
    };

    const handleOffline = () => {
      setIsOnline(false);
      setLastOnlineCheck(new Date());
    };

    // Verificar la conexión al inicio
    checkConnection();

    // Agregar event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar la conexión periódicamente (cada 30 segundos)
    const intervalId = setInterval(checkConnection, 30000);

    // Limpiar event listeners y el intervalo
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  // Valor del contexto
  const contextValue = {
    isOnline,
    lastOnlineCheck,
    checkConnection
  };

  return (
    <ConnectionContext.Provider value={contextValue}>
      {children}
    </ConnectionContext.Provider>
  );
};
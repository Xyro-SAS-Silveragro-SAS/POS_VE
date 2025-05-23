import React from 'react';
import { useConnection } from '../../context/ConnectionContext';

const ConnectionAlert = () => {
  const { isOnline } = useConnection();

  if (isOnline) return null;

  return (
    <div className="bg-red-600 text-white p-2 text-center z-50 text-[10px]">
      No hay conexión a internet. No se podrá sincronizar.
    </div>
  );
};

export default ConnectionAlert;
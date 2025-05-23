import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/db';
import Funciones from '../helpers/Funciones';
import CryptoJS from 'crypto-js';

// Crear el contexto
const AuthContext = createContext({
  currentUser: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  checkAuth: () => {}
});

// Hook personalizado para usar el contexto
export const useAuth = () => useContext(AuthContext);

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Verificar si hay un usuario en localStorage al cargar
  useEffect(() => {
    checkAuth();
  }, []);

  // Función para verificar si hay un usuario autenticado
  const checkAuth = () => {
    setIsLoading(true);
    try {
      const storedUser = localStorage.getItem('usuario');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      setCurrentUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para iniciar sesión
  const login = async (dataLogin) => {
    setIsLoading(true);
    try {
      // Validar campos
      if (!dataLogin.usuario) {
        Funciones.alerta("Atención", "El campo usuario es obligatorio", "info", () => {});
        setIsLoading(false);
      }
      else if (dataLogin.usuario && Funciones.validaEmail(dataLogin.usuario) === false) {
        Funciones.alerta("Atención", "El correo electrónico ingresado no es válido", "info", () => {});
        setIsLoading(false);
      }
      else if (!dataLogin.clave) {
        Funciones.alerta("Atención", "El campo contraseña es obligatorio", "info", () => {});
        setIsLoading(false);
      }
      else{
            // Consultar si el usuario existe en la base de datos local
            const usuarios = await db.usuarios.where('tx_usuario').equals(dataLogin.usuario).toArray();
                
            if (usuarios.length > 0) {
                const claveUsuario = CryptoJS.MD5(dataLogin.clave).toString();
                // Si existe, consultar si la clave es correcta
                if (usuarios[0].tx_clave === claveUsuario) {
                    // Si es correcta, guardar el usuario en el localStorage y en el estado
                    const user = { ...usuarios[0]};
                    localStorage.setItem('usuario', JSON.stringify(user));
                    setCurrentUser(user);
                    setIsAuthenticated(true);
                    setIsLoading(false);
                    return { success: true, user };
                } else {
                    Funciones.alerta("Atención", "La contraseña ingresada no es correcta", "error", () => {});
                    setIsLoading(false);
                    return { success: false, message: "La contraseña ingresada no es correcta" };
                }
            } else {
            Funciones.alerta("Atención", "El usuario no existe en el sistema", "error", () => {});
            setIsLoading(false);
            return { success: false, message: "El usuario no existe en el sistema" };
            }
      }

      
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      Funciones.alerta("Error", "Ocurrió un error al intentar iniciar sesión", "error", () => {});
      setIsLoading(false);
      return { success: false, message: "Ocurrió un error al intentar iniciar sesión" };
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('usuario');
    setCurrentUser(null);
    setIsAuthenticated(false);
    return true;
  };

  // Valor del contexto
  const contextValue = {
    currentUser,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
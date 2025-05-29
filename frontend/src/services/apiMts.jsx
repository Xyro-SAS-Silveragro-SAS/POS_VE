import axios from 'axios';
import {TOKEN, API_MTS_OLD} from '../config/config.jsx';

// Crear una instancia de axios con la configuración base
const ApiMTS = axios.create({
  baseURL: API_MTS_OLD,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para añadir el token a las peticiones
ApiMTS.interceptors.request.use(
  (config) => {
    // Obtenemos el token del localStorage o de donde lo tengas almacenado
    const token = TOKEN;
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Estado global para mostrar mensajes de error
let showErrorMessage = null;

// Función para establecer el manejador de mensajes de error
export const setErrorMessageHandler = (handler) => {
  showErrorMessage = handler;
};

// Métodos para realizar peticiones HTTP
const api = {
  // GET
  get: async (endpoint, params = {}, errorHandler = null) => {
    try {
      const response = await ApiMTS.get(`${endpoint}`, { params });
      return response.data;
    } catch (error) {
      // Manejo personalizado del error
      if (errorHandler) {
        return errorHandler(error);
      }
      
      // Manejo global del error
      if (showErrorMessage) {
        showErrorMessage('Error de conexión', 'No se pudo conectar con el servidor. Verifique su conexión a internet.');
      } else {
        console.error('Error en petición GET:', error);
      }
      
      // Devolver un valor por defecto (similar a of() en Angular)
      return [];
    }
  },
  
  // POST
  post: async (endpoint, data = {}, errorHandler = null) => {
    try {
      const response = await ApiMTS.post(`${endpoint}`, data);
      return response.data;
    } catch (error) {
      // Manejo personalizado del error
      if (errorHandler) {
        return errorHandler(error);
      }
      
      // Manejo global del error
      if (showErrorMessage) {
        showErrorMessage('Error de conexión', 'No se pudo conectar con el servidor. Verifique su conexión a internet.');
      } else {
        console.error('Error en petición POST:', error);
      }
      
      // Devolver un valor por defecto
      return {};
    }
  },
  
  // PUT
  put: async (endpoint, data = {}, errorHandler = null) => {
    try {
      const response = await ApiMTS.put(`${endpoint}`, data);
      return response.data;
    } catch (error) {
      // Manejo personalizado del error
      if (errorHandler) {
        return errorHandler(error);
      }
      
      // Manejo global del error
      if (showErrorMessage) {
        showErrorMessage('Error de conexión', 'No se pudo conectar con el servidor. Verifique su conexión a internet.');
      } else {
        console.error('Error en petición PUT:', error);
      }
      
      // Devolver un valor por defecto
      return {};
    }
  },
  
  // DELETE
  delete: async (endpoint, errorHandler = null) => {
    try {
      const response = await ApiMTS.delete(`${endpoint}`);
      return response.data;
    } catch (error) {
      // Manejo personalizado del error
      if (errorHandler) {
        return errorHandler(error);
      }
      
      // Manejo global del error
      if (showErrorMessage) {
        showErrorMessage('Error de conexión', 'No se pudo conectar con el servidor. Verifique su conexión a internet.');
      } else {
        console.error('Error en petición DELETE:', error);
      }
      
      // Devolver un valor por defecto
      return {};
    }
  }
};

export default ApiMTS;
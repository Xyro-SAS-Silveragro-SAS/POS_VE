import axios from 'axios';
import {TOKEN, API_SL, USER_TOKEN} from '../config/config.jsx';

// Crear una instancia de axios con la configuración base
const ApiSL = axios.create({
  baseURL: API_SL,
  headers: {
    'Content-Type': 'application/json',
  }
});

const getAuthToken = async () => {
  // Verificar si ya tenemos un token en sessionStorage
  const storedToken = sessionStorage.getItem('auth_token');
  
  if (storedToken) {
    return storedToken;
  }
  
  try {
    // Si no hay token, lo solicitamos al servidor
    const response = await axios.post(API_SL+'auth/getToken', {
      user: USER_TOKEN,
      token: TOKEN
    });
    // Guardamos el token en sessionStorage
    if (response.data && response.data.token) {
      sessionStorage.setItem('auth_token', response.data.token);
      return response.data.token;
    }
    
    // Si no hay token en la respuesta, usamos el token por defecto
    return TOKEN;

  } catch (error) {
    console.error('Error al obtener el token:', error);
    // En caso de error, usamos el token por defecto
    return TOKEN;
  }
};

// Interceptor para añadir el token a las peticiones
ApiSL.interceptors.request.use(
  async (config) => {
    // Obtenemos el token de sessionStorage o lo solicitamos
    const token = await getAuthToken();
    
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
      const response = await ApiSL.get(`${endpoint}`, { params });
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
      const response = await ApiSL.post(`${endpoint}`, data);
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
      const response = await ApiSL.put(`${endpoint}`, data);
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
      const response = await ApiSL.delete(`${endpoint}`);
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

export default ApiSL;
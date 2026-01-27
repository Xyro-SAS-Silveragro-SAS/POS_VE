// Exportamos las variables de entorno para usarlas en toda la aplicación
//export const API_URL = 'http://localhost:3008/api';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3008/api';
export const VERSION = import.meta.env.VITE_VERSION || '1.0.0';
export const API_MTS = (import.meta.env.VITE_ENV === 'demo') ? import.meta.env.VITE_API_MTS_DEMO : import.meta.env.VITE_API_MTS;
export const API_SL = import.meta.env.VITE_API_SL || '';
export const USER_TOKEN = import.meta.env.VITE_USER_TOKEN || '';
export const TOKEN = import.meta.env.VITE_TOKEN || '';
export const API_MTS_OLD = import.meta.env.VITE_API_MTS_OLD || '';
export const APIKEY_GEMINI = import.meta.env.VITE_APIKEY_GEMINI || '';
export const API_VECTOR = import.meta.env.VITE_API_VECTOR || '';
export const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || '';
export const MODEL_NAME = import.meta.env.VITE_MODEL_NAME || '';
export const URL_SITE = import.meta.env.VITE_URL_SITE || '';
export const API_REPORTE = import.meta.env.VITE_API_MTS_REPORTE || '';
export const SL_BASE_URL = import.meta.env.VITE_SL_BASE_URL || '/api/sl';
export const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://n8n.srv1097949.hstgr.cloud/webhook/obtenerDestinosPosVe';


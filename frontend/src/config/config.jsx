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
export const N8N_CLIENTES_URL = import.meta.env.VITE_N8N_CLIENTES_URL || 'https://n8n.srv1097949.hstgr.cloud/webhook/clientesPosVe';
export const N8N_CARGA_MASIVA_URL = import.meta.env.VITE_N8N_CARGA_MASIVA_URL || 'https://n8n.srv1097949.hstgr.cloud/webhook/cargaMasiva';
export const N8N_GET_FACTURAS_URL = import.meta.env.VITE_N8N_GET_FACTURAS_URL || 'https://n8n.srv1097949.hstgr.cloud/webhook/getFacturas';
export const N8N_ITEMS_URL = import.meta.env.VITE_N8N_ITEMS_URL || 'https://n8n.srv1097949.hstgr.cloud/webhook/222f2c15-71ec-4de3-b390-824d7e0783fc/itemsBodega';
export const N8N_CUENTAS_EFECTIVO_URL = import.meta.env.VITE_N8N_CUENTAS_EFECTIVO_URL || 'https://n8n.srv1097949.hstgr.cloud/webhook/4fe4c38f-e27b-435a-8fb7-f7817e35fa9e/listas/cuentasefectivo';
export const N8N_CUENTAS_BANCOS_URL = import.meta.env.VITE_N8N_CUENTAS_BANCOS_URL || 'https://n8n.srv1097949.hstgr.cloud/webhook/4fe4c38f-e27b-435a-8fb7-f7817e35fa9e/listas/cuentasbancos';
export const N8N_TARJETAS_URL = import.meta.env.VITE_N8N_TARJETAS_URL || 'https://n8n.srv1097949.hstgr.cloud/webhook/4fe4c38f-e27b-435a-8fb7-f7817e35fa9e/listas/tarjetas';
export const N8N_BANCOS_URL = import.meta.env.VITE_N8N_BANCOS_URL || 'https://n8n.srv1097949.hstgr.cloud/webhook/4fe4c38f-e27b-435a-8fb7-f7817e35fa9e/listas/bancos';


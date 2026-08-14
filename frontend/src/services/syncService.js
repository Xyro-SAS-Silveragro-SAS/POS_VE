import api from './apiService.jsx';
import { db } from '../db/db';
import { N8N_CLIENTES_URL, N8N_ITEMS_URL } from '../config/config';

/**
 * Service for synchronizing data from API to IndexedDB
 */
class SyncService {
  
  /**
   * Synchronize clients for a specific user
   * @param {string} cdSap - User's SAP code
   * @param {function} setLoading - Function to set loading state
   * @returns {Promise<boolean>} - Success status
   */
  async syncClientes(cdSap, setLoading = null) {
    try {
      if (setLoading) setLoading(true);
      
      // Get clients from N8N
      // const clientes = await api.get(`api/clientes/vexterna/codigo/${cdSap}`);
      const response = await fetch(N8N_CLIENTES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: Number(cdSap) })
      });
      const text = await response.text();
      const clientes = text ? JSON.parse(text) : null;
      
      if (clientes && clientes.datos && clientes.datos.length > 0) {
        // Clear existing clients and add new ones
        await db.table('clientes').clear();
        await db.clientes.bulkAdd(clientes.datos);
        console.log(`Sincronizados ${clientes.datos.length} clientes`);
      } else {
        console.warn("No se encontraron clientes para sincronizar");
      }
      
      if (setLoading) setLoading(false);
      return true;
    } catch (error) {
      console.error("Error al sincronizar clientes:", error);
      if (setLoading) setLoading(false);
      
      // Check if it's a network error or API error
      if (error.name === 'NetworkError' || !navigator.onLine) {
        throw new Error("Error de conexión a internet");
      } else if (error.response && error.response.status === 404) {
        throw new Error("Usuario no encontrado en el sistema");
      } else if (error.response && error.response.status >= 500) {
        throw new Error("Error del servidor, intente más tarde");
      } else {
        throw new Error("Error al sincronizar clientes");
      }
    }
  }

  /**
   * Synchronize items/products for a specific warehouse
   * @param {string} bodega - Warehouse code
   * @param {function} setLoading - Function to set loading state
   * @returns {Promise<boolean>} - Success status
   */
  async syncItems(bodega, setLoading = null) {
    try {
      if (setLoading) setLoading(true);

      // Get items from N8N (nuevo endpoint, reemplaza temporalmente al endpoint original que presenta problemas)
      let datos = null;
      try {
        const response = await fetch(`${N8N_ITEMS_URL}/${bodega}`);
        const text = await response.text();
        const n8nResult = text ? JSON.parse(text) : null;
        datos = Array.isArray(n8nResult) ? n8nResult : (n8nResult && n8nResult.datos) || null;
      } catch (n8nError) {
        console.warn("Error al sincronizar productos desde N8N, se intentará con el endpoint original:", n8nError);
      }

      // Fallback al endpoint original si el de N8N falla o no retorna datos
      if (!datos || datos.length === 0) {
        const items = await api.get(`api/inventario/bodega/${bodega}`);
        datos = items && items.datos ? items.datos : null;
      }

      if (datos && datos.length > 0) {
        // Clear existing items and add new ones
        await db.table('items').clear();
        await db.items.bulkAdd(datos);
        console.log(`Sincronizados ${datos.length} productos`);
      } else {
        console.warn("No se encontraron productos para sincronizar");
      }

      if (setLoading) setLoading(false);
      return true;
    } catch (error) {
      console.error("Error al sincronizar productos:", error);
      if (setLoading) setLoading(false);
      
      // Check if it's a network error or API error
      if (error.name === 'NetworkError' || !navigator.onLine) {
        throw new Error("Error de conexión a internet");
      } else if (error.response && error.response.status === 404) {
        throw new Error("Bodega no encontrada en el sistema");
      } else if (error.response && error.response.status >= 500) {
        throw new Error("Error del servidor, intente más tarde");
      } else {
        throw new Error("Error al sincronizar productos");
      }
    }
  }

  /**
   * Get user's SAP code from localStorage
   * @returns {string|null} - User's SAP code or null if not found
   */
  getUserSapCode() {
    try {
      const user = localStorage.getItem('usuario');
      if (user) {
        const userData = JSON.parse(user);
        return userData.cd_sap;
      }
      return null;
    } catch (error) {
      console.error("Error al obtener código SAP del usuario:", error);
      return null;
    }
  }

  /**
   * Get warehouse code from localStorage
   * @returns {string|null} - Warehouse code or null if not found
   */
  getWarehouseCode() {
    try {
      return localStorage.getItem('bodega');
    } catch (error) {
      console.error("Error al obtener código de bodega:", error);
      return null;
    }
  }
}

export default new SyncService();
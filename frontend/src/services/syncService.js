import api from './apiService.jsx';
import { db } from '../db/db';

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
      
      // Get clients from API
      const clientes = await api.get(`api/clientes/vexterna/codigo/${cdSap}`);
      
      if (clientes.datos && clientes.datos.length > 0) {
        // Clear existing clients and add new ones
        await db.table('clientes').clear();
        await db.clientes.bulkAdd(clientes.datos);
      }
      
      if (setLoading) setLoading(false);
      return true;
    } catch (error) {
      console.error("Error al sincronizar clientes:", error);
      if (setLoading) setLoading(false);
      return false;
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
      
      // Get items from API
      const items = await api.get(`api/inventario/bodega/${bodega}`);
      
      if (items.datos && items.datos.length > 0) {
        // Clear existing items and add new ones
        await db.table('items').clear();
        await db.items.bulkAdd(items.datos);
      }
      
      if (setLoading) setLoading(false);
      return true;
    } catch (error) {
      console.error("Error al sincronizar productos:", error);
      if (setLoading) setLoading(false);
      return false;
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
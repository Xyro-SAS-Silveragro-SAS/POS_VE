// Servicio para consultar destinos desde N8N webhook
import { N8N_WEBHOOK_URL } from '../config/config.jsx';

const getDestinosFromSL = async (cardCode) => {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ codSn: cardCode })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch destinations: ${response.status}`);
    }

    const data = await response.json();
    // Extraer BPAddresses si existe, o usar data si es el array
    const addresses = data.BPAddresses || data;
    // Filtrar direcciones donde AddressType === 'bo_ShipTo'
    const filteredDestinos = Array.isArray(addresses) ? addresses.filter(addr => addr.AddressType === 'bo_ShipTo') : [];
    return filteredDestinos;
  } catch (error) {
    console.error('Error fetching destinations from N8N:', error);
    throw error;
  }
};

export { getDestinosFromSL };
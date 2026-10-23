import api from "../services/apiService";
import { db } from "../db/db";

// Estados de pedido que aún pueden cambiar en la nube (1 = sincronizado a SAP es final, 0 = borrador nunca enviado)
const ESTADOS_ACTUALIZABLES = [2, 3, 4, 5, 6];

// Indica si vale la pena consultar en la nube el estado del pedido
export const pedidoActualizable = (pedido) => {
    if (!pedido || pedido.in_tipo !== 'pedidos' || pedido.en_edicion === 1) return false;
    if (pedido.in_estado === undefined || pedido.in_estado === null) return true;
    return ESTADOS_ACTUALIZABLES.includes(Number(pedido.in_estado));
};

// Consulta el estado del pedido en la nube. Retorna null si la respuesta no es válida o hubo error
export const consultarEstadoPedido = async (id_consec) => {
    // errorHandler propio para no disparar la alerta global de conexión en cada petición
    const pedido = await api.get('api/pedidos/uuid/' + id_consec, {}, () => null);

    if (
        pedido &&
        typeof pedido === 'object' &&
        pedido.mensaje &&
        pedido.DocEntry !== undefined &&
        pedido.DocNum !== undefined &&
        pedido.in_estado !== undefined
    ) {
        return pedido;
    }
    return null;
};

// Guarda localmente el estado traído de la nube
export const guardarEstadoPedido = async (idCabeza, pedido) => {
    await db.cabeza.update(parseInt(idCabeza), {
        sync: 1,
        DocEntry: pedido.DocEntry,
        DocNum: pedido.DocNum,
        in_estado: pedido.in_estado,
        tx_comentarios: pedido.tx_comentarios
    });
};

const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Verifica el estado de varios pedidos por paquetes para no saturar el API.
// onProgreso(procesados, total) se llama al terminar cada paquete
export const verificarEstadosPedidos = async (pedidos, { tamanoPaquete = 5, pausaMs = 400, onProgreso = () => {} } = {}) => {
    const resumen = { total: pedidos.length, cambiaron: 0, sinCambio: 0, fallidos: 0 };

    for (let i = 0; i < pedidos.length; i += tamanoPaquete) {
        const paquete = pedidos.slice(i, i + tamanoPaquete);

        const resultados = await Promise.allSettled(paquete.map(async (local) => {
            const remoto = await consultarEstadoPedido(local.id_consec);
            if (!remoto) throw new Error('Respuesta inválida');
            await guardarEstadoPedido(local.id, remoto);
            return Number(remoto.in_estado) !== Number(local.in_estado);
        }));

        resultados.forEach((resultado) => {
            if (resultado.status === 'rejected') resumen.fallidos++;
            else if (resultado.value) resumen.cambiaron++;
            else resumen.sinCambio++;
        });

        onProgreso(Math.min(i + tamanoPaquete, pedidos.length), pedidos.length);

        if (i + tamanoPaquete < pedidos.length) await esperar(pausaMs);
    }

    return resumen;
};

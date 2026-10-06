import Swal from 'sweetalert2';
import { db } from "../db/db";

// Endpoint (PUT) que recibe la cotización editada (mismo JSON que capturarPedido)
export const endpointEditarCotizacion = (identificador) => `api/cotizaciones/actualizarCotizacion/${identificador}`;

// Pone una cotización sincronizada en modo edición guardando una copia para poder descartar los cambios
export const iniciarEdicionCotizacion = async (idCabeza) => {
    await db.transaction('rw', db.cabeza, db.lineas, async () => {
        const cabeza = await db.cabeza.get(parseInt(idCabeza));
        if (!cabeza) throw new Error('No se encontró la cotización');

        const lineas = await db.lineas.where('in_id_cabeza').equals(cabeza.id).toArray();
        // eslint-disable-next-line no-unused-vars
        const { snapshot_edicion, ...cabezaOriginal } = cabeza;

        await db.cabeza.update(cabeza.id, {
            sync: 0,
            en_edicion: 1,
            snapshot_edicion: { cabeza: cabezaOriginal, lineas },
        });
    });
};

// Restaura la cotización tal como estaba antes de entrar en modo edición
export const descartarEdicionCotizacion = async (idCabeza) => {
    await db.transaction('rw', db.cabeza, db.lineas, async () => {
        const cabeza = await db.cabeza.get(parseInt(idCabeza));
        if (!cabeza?.snapshot_edicion) throw new Error('No hay copia de la cotización para restaurar');

        const { cabeza: cabezaOriginal, lineas } = cabeza.snapshot_edicion;
        await db.lineas.where('in_id_cabeza').equals(cabeza.id).delete();
        await db.lineas.bulkAdd(lineas);
        await db.cabeza.put(cabezaOriginal);
    });
};

// Si la bodega de la sesión es distinta a la de la cotización, pregunta con cuál enviar la edición.
// Retorna la bodega elegida, o null si el usuario cierra el mensaje (no se envía nada)
export const elegirBodegaEdicion = async (bodegaCotizacion, bodegaSesion) => {
    if (!bodegaSesion || bodegaSesion === '0' || bodegaSesion === bodegaCotizacion) {
        return bodegaCotizacion;
    }

    const resultado = await Swal.fire({
        title: 'Atención!',
        html: `Se detectó que inició sesión en la bodega <b>${bodegaSesion}</b>, pero esta cotización está en la bodega <b>${bodegaCotizacion || 'Sin Bodega'}</b>.<br/><br/>¿A qué bodega desea enviar la edición de la cotización?`,
        icon: 'question',
        showDenyButton: true,
        showCloseButton: true,
        confirmButtonText: `USAR ${bodegaSesion} (SESIÓN)`,
        denyButtonText: `MANTENER ${bodegaCotizacion || 'ACTUAL'}`,
        denyButtonColor: '#6b7280',
        backdrop: 'rgba(0,0,0,0.5)',
    });

    if (resultado.isConfirmed) return bodegaSesion;
    if (resultado.isDenied) return bodegaCotizacion;
    return null;
};

// Deja la cabecera y todas las líneas de la cotización con la bodega indicada
export const aplicarBodegaCotizacion = async (idCabeza, bodega) => {
    await db.transaction('rw', db.cabeza, db.lineas, async () => {
        await db.cabeza.update(parseInt(idCabeza), { tx_cod_alm_pos: bodega });
        await db.lineas.where('in_id_cabeza').equals(parseInt(idCabeza)).modify({ CodAlmacen: bodega });
    });
};

// Quita los datos internos de edición antes de enviar la cabecera al servidor
export const limpiarCabeceraEdicion = (cabeza) => {
    // eslint-disable-next-line no-unused-vars
    const { snapshot_edicion, ...cabecera } = cabeza;
    return cabecera;
};

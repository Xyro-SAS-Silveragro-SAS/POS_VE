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

// Quita los datos internos de edición antes de enviar la cabecera al servidor
export const limpiarCabeceraEdicion = (cabeza) => {
    // eslint-disable-next-line no-unused-vars
    const { snapshot_edicion, ...cabecera } = cabeza;
    return cabecera;
};

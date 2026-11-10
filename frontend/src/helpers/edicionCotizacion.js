import Swal from 'sweetalert2';
import { db } from "../db/db";

// Endpoint (PUT) que recibe la cotización editada (mismo JSON que capturarPedido)
export const endpointEditarCotizacion = (identificador) => `api/cotizaciones/actualizarCotizacion/${identificador}`;

// Pone una cotización sincronizada en modo edición guardando una copia para poder descartar los cambios.
// Si se indica una bodega, la cotización (cabecera y líneas) pasa a esa bodega después de tomar la copia
export const iniciarEdicionCotizacion = async (idCabeza, bodega = null) => {
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
            ...(bodega !== null && { tx_cod_alm_pos: bodega }),
        });

        if (bodega !== null) {
            await db.lineas.where('in_id_cabeza').equals(cabeza.id).modify({ CodAlmacen: bodega });
        }
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

// "COD - NOMBRE" de la bodega según la tabla local de almacenes
const nombreSucursal = async (codigo) => {
    if (!codigo) return 'Sin Bodega';
    const almacen = await db.almacenes.where('tx_codigo').equals(codigo).first();
    return almacen ? `${codigo} - ${almacen.tx_nombre}` : codigo;
};

// Al editar: si la sucursal de la sesión es distinta a la de la cotización, pregunta si se cambia.
// Retorna la bodega con la que se edita, o null si el usuario cierra el mensaje (no se edita)
export const elegirBodegaEdicion = async (bodegaCotizacion, bodegaSesion) => {
    if (!bodegaSesion || bodegaSesion === '0' || bodegaSesion === bodegaCotizacion) {
        return bodegaCotizacion;
    }

    const [sucursalCotizacion, sucursalSesion] = await Promise.all([
        nombreSucursal(bodegaCotizacion),
        nombreSucursal(bodegaSesion),
    ]);

    const resultado = await Swal.fire({
        title: 'Atención!',
        html: `La sucursal de la cotización <b>${sucursalCotizacion}</b> es diferente a la de su sesión.<br/><br/>¿Desea modificar la cotización a la sucursal de la sesión, la cual es <b>${sucursalSesion}</b>?`,
        icon: 'question',
        showDenyButton: true,
        showCloseButton: true,
        confirmButtonText: `CAMBIAR A ${bodegaSesion}`,
        denyButtonText: `MANTENER ${bodegaCotizacion || 'ACTUAL'}`,
        denyButtonColor: '#6b7280',
        backdrop: 'rgba(0,0,0,0.5)',
    });

    if (resultado.isConfirmed) return bodegaSesion;
    if (resultado.isDenied) return bodegaCotizacion;
    return null;
};

// Deja todas las líneas con la bodega de la cabecera (incluye productos agregados durante la edición)
export const alinearBodegaLineas = async (idCabeza) => {
    await db.transaction('rw', db.cabeza, db.lineas, async () => {
        const cabeza = await db.cabeza.get(parseInt(idCabeza));
        if (!cabeza) return;
        await db.lineas.where('in_id_cabeza').equals(cabeza.id).modify({ CodAlmacen: cabeza.tx_cod_alm_pos });
    });
};

// Quita los datos internos de edición antes de enviar la cabecera al servidor
export const limpiarCabeceraEdicion = (cabeza) => {
    // eslint-disable-next-line no-unused-vars
    const { snapshot_edicion, ...cabecera } = cabeza;
    return cabecera;
};

import Dexie from 'dexie';
export const db = new Dexie('POSVE');

db.version(1).stores({
    usuarios: '++id, id_usuario,tx_usuario,tx_nombre,cd_sap,tx_empleado_sap,tx_clave,in_perfil,tx_almacen,in_cargo,in_estado,tx_cencos,in_modprdto,in_lstaprecios,in_solic_firma_usua,tx_firma_usua,tx_clave_firma,tx_nrocelular_usua,in_tpo_sel_sn,tx_correo,in_serie_oc,primera_vez,updated_at,created_at', // tabla usuarios lara el login,
    almacenes: '++id, id_almacen,tx_codigo,tx_nombre,tx_serie_entrada,tx_serie_orden,tx_ubicacion,updated_at,created_at',
    clientes:'id_cliente,Llave,Codigo,Nombre,NIT,Telefono,Saldo,SaldoVencido,Entregas,Pedidos,CodigoEmpl,EmpleadoVentas,CorreoFE,CondicionPago,LimiteCred,FechaCreacion,Sector,Direccion,Ciudad,Mail,CondicionPagoCodigo,Grupo,ListaPrecio,created_at,updated_at',
    items:'++id,id_articulo,LlaveArt,ItemCode,Articulo,Cantidad,Comprometido,Solicitado,CodAlmacen,Almacen,Costo,Precio,Marca,Referencia,Impuesto,PorcImpto,DtoMax,Estado,Clasificacion,ListaPrecio,PrecioVenta,CantSolicitada,CantBonificada,CodigoBarras,ManLote,updated_at,created_at',
    destinos:'id_destinos,SN,Address,Street,Ciudad,updated_at,created_at'

});
import Dexie from 'dexie';
export const db = new Dexie('POSVE');

db.version(1).stores({
    usuarios: '++id, id_usuario,tx_usuario,tx_nombre,cd_sap,tx_empleado_sap,tx_clave,in_perfil,tx_almacen,in_cargo,in_estado,tx_cencos,in_modprdto,in_lstaprecios,in_solic_firma_usua,tx_firma_usua,tx_clave_firma,tx_nrocelular_usua,in_tpo_sel_sn,tx_correo,in_serie_oc,primera_vez,updated_at,created_at', // tabla usuarios lara el login,
    almacenes: '++id, id_almacen,tx_codigo,tx_nombre,tx_serie_entrada,tx_serie_orden,tx_ubicacion,updated_at,created_at',
    clientes:'++id,CondicionPago,id_cliente,Llave,Codigo,Nombre,NIT,Telefono,Saldo,SaldoVencido,Entregas,Pedidos,CodigoEmpl,EmpleadoVentas,CorreoFE,CondicionPago,LimiteCred,FechaCreacion,Sector,Direccion,Ciudad,Mail,CondicionPagoCodigo,Grupo,ListaPrecio,created_at,updated_at',
    items:'++id,id_articulo,LlaveArt,ItemCode,Articulo,ListaPrecio,Comprometido,Cantidad,Comprometido,Solicitado,CodAlmacen,Almacen,Costo,Precio,Marca,Referencia,Impuesto,PorcImpto,DtoMax,Estado,Clasificacion,ListaPrecio,PrecioVenta,CantSolicitada,CantBonificada,CodigoBarras,ManLote,updated_at,created_at',
    destinos:'++id,id_destinos,SN,Address,Street,Ciudad,updated_at,created_at',
    cabeza: '++id,id_consec,DocNum,DocEntry,in_tipo,num_doc,num_fac,tx_cod_sn,tx_nom_sn_nombre,tx_dir_cli_pos,tx_dir_code_cli_pos,tx_dir_add_cli_pos,fechaEntrega,tipoEnvio,observaciones,tx_tel_cli_pos,tx_cod_alm_pos,in_subtot_pos,in_vlr_total_imp,in_vlr_total,in_estado,dt_fecha_reg,tx_usua,tx_comentarios,tx_nom_emp,in_cod_emp,resp_api,in_lst_precio,tx_usuario_logueado,es_cotizacion,sync',
    lineas:'++id,in_id_cabeza,ItemCode,Articulo,Precio,CantSolicitada,CantBonificada,Cantidad,CodigoBarras,in_dto_pos,Impuesto,PorcImpto,in_estado_lin_pos,dt_fecha_reg,tx_usua_reg,CodAlmacen,sync'
});
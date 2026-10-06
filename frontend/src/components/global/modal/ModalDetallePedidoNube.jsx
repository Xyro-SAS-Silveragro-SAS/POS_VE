import { X } from "lucide-react";

const formatearValor = (valor) => {
    const numero = Number(valor);
    if (Number.isNaN(numero)) return "N/A";
    return `$${numero.toLocaleString("es-CO")}`;
};

const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    const date = new Date(fecha);
    return Number.isNaN(date.getTime()) ? fecha : date.toLocaleString("es-CO");
};

const Dato = ({ etiqueta, valor }) => (
    <div>
        <span className="block text-xs font-semibold text-gray-500 uppercase">{etiqueta}</span>
        <span className="text-sm text-gray-800">{valor || valor === 0 ? valor : "N/A"}</span>
    </div>
);

const ModalDetallePedidoNube = ({ pedido, onClose }) => {
    if (!pedido) return null;

    const lineas = Array.isArray(pedido.lineas) ? pedido.lineas : [];
    const historial = Array.isArray(pedido.historial) ? pedido.historial : [];

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b shrink-0">
                    <h2 className="text-xl font-bold text-gray-700">
                        Pedido {pedido.DocNum || pedido.DocEntry || ""}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100">
                        <X size={22} />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto space-y-6">
                    {/* Datos generales */}
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-2">Datos generales</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-gray-50 p-3 rounded-lg">
                            <Dato etiqueta="DocEntry" valor={pedido.DocEntry} />
                            <Dato etiqueta="DocNum" valor={pedido.DocNum} />
                            <Dato etiqueta="Identificador" valor={pedido.identificador} />
                            <Dato etiqueta="Cliente" valor={pedido.tx_nom_sn_nombre} />
                            <Dato etiqueta="Código cliente" valor={pedido.tx_cod_sn} />
                            <Dato etiqueta="Dirección" valor={pedido.tx_dir_cli_pos} />
                            <Dato etiqueta="Teléfono" valor={pedido.tx_tel_cli_pos} />
                            <Dato etiqueta="Bodega" valor={pedido.tx_cod_bodega} />
                            <Dato etiqueta="Zona / Empleado" valor={pedido.tx_nom_emp} />
                            <Dato etiqueta="Condición de pago" valor={pedido.CondicionPago} />
                            <Dato etiqueta="Orden de compra" valor={pedido.ordenCompra} />
                            <Dato etiqueta="Usuario registro" valor={pedido.tx_usua} />
                            <Dato etiqueta="Usuario logueado" valor={pedido.tx_usuario_logueado} />
                            <Dato etiqueta="Fecha registro" valor={formatearFecha(pedido.dt_fecha_reg)} />
                            <Dato etiqueta="Fecha entrega" valor={pedido.fechaEntrega} />
                            <Dato etiqueta="Tipo de envío" valor={pedido.tipoEnvio} />
                            <Dato etiqueta="Límite de crédito" valor={formatearValor(pedido.LimiteCred)} />
                            <Dato etiqueta="Saldo vencido" valor={formatearValor(pedido.SaldoVencido)} />
                            <Dato etiqueta="Subtotal" valor={formatearValor(pedido.in_subtot_pos)} />
                            <Dato etiqueta="Total impuestos" valor={formatearValor(pedido.in_vlr_total_imp)} />
                            <Dato etiqueta="Valor total" valor={formatearValor(pedido.in_vlr_total)} />
                            <Dato etiqueta="Autorizado por" valor={pedido.nombre_usuario_autoriza} />
                            <Dato etiqueta="Fecha autorización" valor={formatearFecha(pedido.tx_fecha_autoriza)} />
                            <Dato etiqueta="Comentario" valor={pedido.tx_comentario} />
                            <Dato etiqueta="Observaciones" valor={pedido.observaciones} />
                            {pedido.tx_usuario_anula && (
                                <>
                                    <Dato etiqueta="Anulado por" valor={pedido.nombre_usuario_anula} />
                                    <Dato etiqueta="Fecha anulación" valor={formatearFecha(pedido.tx_fecha_anula)} />
                                    <Dato etiqueta="Comentario anulación" valor={pedido.tx_comentario_anula} />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Items / lineas */}
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-2">
                            Items del pedido ({lineas.length})
                        </h3>
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-800 text-white">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Código</th>
                                        <th className="px-3 py-2 text-left">Artículo</th>
                                        <th className="px-3 py-2 text-left">Cód. barras</th>
                                        <th className="px-3 py-2 text-right">Cant. solicitada</th>
                                        <th className="px-3 py-2 text-right">Cant. bonificada</th>
                                        <th className="px-3 py-2 text-right">Cantidad</th>
                                        <th className="px-3 py-2 text-right">Precio</th>
                                        <th className="px-3 py-2 text-left">Impuesto</th>
                                        <th className="px-3 py-2 text-left">Lista precio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lineas.length > 0 ? lineas.map((linea, index) => {
                                        const lotes = Array.isArray(linea.Lotes) ? linea.Lotes : (Array.isArray(linea.lotes) ? linea.lotes : []);
                                        return (
                                            <tr key={linea.id_lineas ?? index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                                <td className="px-3 py-2 align-top">{linea.ItemCode}</td>
                                                <td className="px-3 py-2 align-top">
                                                    {linea.Articulo}
                                                    {lotes.length > 0 && (
                                                        <div className="mt-1 text-[11px] text-gray-500">
                                                            {lotes.map((lote, i) => (
                                                                <div key={i}>
                                                                    Lote {lote.NumeroLote || lote.numeroLote || lote.lote || "N/A"}
                                                                    {" · "}Cant: {lote.Cantidad ?? lote.cantidad ?? "N/A"}
                                                                    {(lote.FechaVencimiento || lote.fechaVencimiento) && (
                                                                        <> · Vence: {lote.FechaVencimiento || lote.fechaVencimiento}</>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 align-top">{linea.CodigoBarras}</td>
                                                <td className="px-3 py-2 text-right align-top">{linea.CantSolicitada}</td>
                                                <td className="px-3 py-2 text-right align-top">{linea.CantBonificada}</td>
                                                <td className="px-3 py-2 text-right align-top">{linea.Cantidad}</td>
                                                <td className="px-3 py-2 text-right align-top">{formatearValor(linea.Precio)}</td>
                                                <td className="px-3 py-2 align-top">{linea.Impuesto}</td>
                                                <td className="px-3 py-2 align-top">{linea.ListaPrecio}</td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan={9} className="px-3 py-4 text-center text-gray-500">
                                                Este pedido no tiene items.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Historial */}
                    {historial.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">Historial</h3>
                            <div className="relative">
                                {historial.map((evento, index) => (
                                    <div key={evento.id_historial ?? index} className="flex items-start mb-4">
                                        <div className="flex flex-col items-center mr-3">
                                            <div className={`w-3 h-3 rounded-full border-2 border-white shadow ${Number(evento.estado) === 1 ? "bg-green-500" : "bg-red-500"}`}></div>
                                            {index < historial.length - 1 && <div className="w-0.5 h-full min-h-[24px] bg-gray-300 mt-1"></div>}
                                        </div>
                                        <div className="flex-1 bg-gray-50 p-3 rounded-lg">
                                            <p className="text-sm text-gray-800">{evento.descripcion}</p>
                                            <span className="text-xs text-gray-500">{formatearFecha(evento.created_at)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModalDetallePedidoNube;

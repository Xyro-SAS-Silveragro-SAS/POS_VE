import { useState } from "react";
import TopBar from "../../components/global/TopBar";
import { useConnection } from "../../context/ConnectionContext";
import { useAuth } from "../../context/AuthContext";
import { format } from "date-fns";
import api from "../../services/apiService";
import Funciones from "../../helpers/Funciones";
import ModalDetallePedidoNube from "../../components/global/modal/ModalDetallePedidoNube";
import { Search, ChevronLeft, ChevronRight, Cloud } from "lucide-react";

const ITEMS_POR_PAGINA = 10;

const ESTADOS = {
  1: "Por autorizar",
  2: "Autorizado",
  3: "Rechazado",
  4: "En bodega",
};

const ESTADOS_COLOR = {
  1: "bg-yellow-100 text-yellow-800",
  2: "bg-green-100 text-green-800",
  3: "bg-red-100 text-red-800",
  4: "bg-blue-100 text-blue-800",
};

const hoy = format(new Date(), "yyyy-MM-dd");

const PedidosNube = () => {
  const { isOnline } = useConnection();
  const { currentUser } = useAuth();
  const [fechaInicial, setFechaInicial] = useState(hoy);
  const [fechaFinal, setFechaFinal] = useState(hoy);
  const [estado, setEstado] = useState("2");
  const [loading, setLoading] = useState(false);
  const [consultado, setConsultado] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  const filtrosValidos = !!fechaInicial && !!fechaFinal && !!estado;

  const buscarPedidos = async () => {
    if (!filtrosValidos) {
      Funciones.alerta("Atención", "La fecha inicial, la fecha final y el estado son obligatorios.", "info");
      return;
    }
    if (!isOnline) {
      Funciones.alerta("Sin conexión", "No se pudo conectar con el servidor. Verifique su conexión a internet.", "error");
      return;
    }

    setLoading(true);
    setConsultado(true);
    setPaginaActual(1);
    try {
      const respuesta = await api.get(`api/informePedidos/${fechaInicial}/${fechaFinal}/${estado}`);
      const datos = Array.isArray(respuesta?.datos) ? respuesta.datos : [];
      const misPedidos = datos.filter((pedido) => pedido.tx_nom_emp === currentUser?.tx_empleado_sap);
      setPedidos(misPedidos);
    } catch (error) {
      console.error("Error al consultar pedidos en la nube:", error);
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  const pedidosBuscados = (() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return pedidos;
    return pedidos.filter((pedido) => {
      const cliente = String(pedido.tx_nom_sn_nombre || "").toLowerCase();
      const docEntry = String(pedido.DocEntry || "");
      const docNum = String(pedido.DocNum || "").toLowerCase();
      return cliente.includes(termino) || docEntry.includes(termino) || docNum.includes(termino);
    });
  })();

  const totalPaginas = Math.max(1, Math.ceil(pedidosBuscados.length / ITEMS_POR_PAGINA));
  const pedidosPaginados = pedidosBuscados.slice((paginaActual - 1) * ITEMS_POR_PAGINA, paginaActual * ITEMS_POR_PAGINA);

  const formatearValor = (valor) => {
    const numero = Number(valor);
    if (Number.isNaN(numero)) return "N/A";
    return `$${numero.toLocaleString("es-CO")}`;
  };

  return (
    <>
      <TopBar showSimple={true} />
      <div className="w-full md:p-10 m-auto lg:w-[54%] mb-[10%] mt-[20%] lg:mt-[5%] md:mt-[13%] flex flex-wrap text-gray-700 relative">
        <div className="w-full px-[5%] lg:px-[3%] mb-4">
          <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Cloud size={24} /> Pedidos en la nube
          </h1>

          {/* Filtros */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Fecha inicial *</label>
                <input
                  type="date"
                  value={fechaInicial}
                  max={fechaFinal || undefined}
                  onChange={(e) => setFechaInicial(e.target.value)}
                  className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Fecha final *</label>
                <input
                  type="date"
                  value={fechaFinal}
                  min={fechaInicial || undefined}
                  onChange={(e) => setFechaFinal(e.target.value)}
                  className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Estado *</label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                >
                  {Object.entries(ESTADOS).map(([valor, nombre]) => (
                    <option key={valor} value={valor}>
                      {nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-center md:justify-end">
              <button
                onClick={buscarPedidos}
                disabled={loading || !isOnline || !filtrosValidos}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Consultando..." : !isOnline ? "Sin conexión" : "Consultar pedidos"}
              </button>
            </div>
          </div>

          {/* Resultados */}
          {pedidos.length > 0 && (
            <>
              <div className="mb-4 bg-white rounded-lg shadow-md p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar por cliente, DocEntry o DocNum..."
                    value={busqueda}
                    onChange={(e) => {
                      setBusqueda(e.target.value);
                      setPaginaActual(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap w-full bg-white rounded-lg shadow-md overflow-hidden">
                {pedidosPaginados.map((pedido) => (
                  <div
                    key={pedido.DocEntry ?? pedido.id_pedido}
                    role="button"
                    tabIndex={0}
                    onClick={() => setPedidoSeleccionado(pedido)}
                    className="grid grid-cols-12 px-5 py-4 border-b border-gray-200 w-full cursor-pointer hover:bg-gray-50"
                  >
                    <div className="col-span-12">
                      <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-[2px] rounded-full mb-1 ${ESTADOS_COLOR[pedido.in_estado] || "bg-gray-100 text-gray-600"}`}>
                        {ESTADOS[pedido.in_estado] || `Estado ${pedido.in_estado}`}
                      </span>
                      <br />
                      <strong>DocEntry: </strong> {pedido.DocEntry ?? "N/A"}<br />
                      <strong>DocNum: </strong> {pedido.DocNum || "N/A"}<br />
                      <strong>Cliente: </strong> {pedido.tx_nom_sn_nombre || "Sin cliente"}<br />
                      <strong>Fecha: </strong> {pedido.dt_fecha_reg ? new Date(pedido.dt_fecha_reg).toLocaleString("es-CO") : "N/A"}<br />
                      <strong>Valor total: </strong> {formatearValor(pedido.in_vlr_total)}
                    </div>
                  </div>
                ))}
              </div>

              {pedidosBuscados.length > ITEMS_POR_PAGINA && (
                <div className="flex justify-between items-center mt-4 px-4 w-full">
                  <span className="text-sm text-gray-700">
                    Página {paginaActual} de {totalPaginas} · Total {pedidosBuscados.length}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                      disabled={paginaActual === 1}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 flex items-center gap-1"
                    >
                      <ChevronLeft size={18} className="md:hidden" />
                      <span className="hidden md:inline">Anterior</span>
                    </button>
                    <button
                      onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                      disabled={paginaActual === totalPaginas}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 flex items-center gap-1"
                    >
                      <span className="hidden md:inline">Siguiente</span>
                      <ChevronRight size={18} className="md:hidden" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {!loading && consultado && pedidos.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              <p>No se encontraron pedidos para el rango de fechas y estado seleccionados.</p>
            </div>
          )}

          {!consultado && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              <p>Seleccione los filtros y presione "Consultar pedidos".</p>
            </div>
          )}
        </div>
      </div>

      <ModalDetallePedidoNube pedido={pedidoSeleccionado} onClose={() => setPedidoSeleccionado(null)} />
    </>
  );
};

export default PedidosNube;

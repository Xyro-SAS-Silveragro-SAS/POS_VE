import { useState } from "react";
import TopBar from "../../components/global/TopBar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import ApiMTS from "../../services/apiMts";
import { Eye, ChevronUp } from "lucide-react";

const ESTADOS = {
  ALL: "--Todos los Estados--",
  EN_ALISTAMIENTO: "En Alistamiento",
  ALISTADO: "Alistado",
  TRANSITO: "Transito",
  DEVUELTO: "Devuelto",
  MALDIR: "Direccion errada",
  EMBALMAL: "Embalaje errado",
  ENTREPAGO: "Entregado con pago",
  ENTREGADO: "Entregado sin pago",
  FLOTA: "Enviado por flota",
  OTROS: "Otros",
  ERRADO: "Pedido con error",
  REAGENDAR: "Reagendar",
  PARCIAL: "Recibe cliente parcial",
  REMESADO: "Remesado",
};

const ReporteEstados = () => {
  const [fechaInicial, setFechaInicial] = useState(new Date());
  const [fechaFinal, setFechaFinal] = useState(new Date());
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("ALL");
  const [datos, setDatos] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [loading, setLoading] = useState(false);

  const handleConsultar = async () => {
    setLoading(true);
    try {
      const fechini = format(fechaInicial, "yyyy-MM-dd");
      const fechfin = format(fechaFinal, "yyyy-MM-dd");
      
      const response = await ApiMTS.get("reportePosVe.php", {
        estado: estadoSeleccionado,
        fechini: fechini,
        fechfin: fechfin,
      });

      setDatos(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error al consultar el reporte:", error);
      setDatos([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <>
      <TopBar />
      <div className="w-full md:p-10 m-auto lg:w-[54%] mb-[10%] mt-[20%] lg:mt-[5%] md:mt-[13%] flex flex-wrap text-gray-700 relative">
        <div className="w-full px-[5%] lg:px-[3%] mb-4">
          <h1 className="text-2xl font-bold mb-4">Reporte de Estados de Pedidos</h1>

          {/* Filtros */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Fecha Inicial */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Fecha Inicial
                </label>
                <DatePicker
                  selected={fechaInicial}
                  onChange={(date) => setFechaInicial(date)}
                  dateFormat="dd/MM/yyyy"
                  className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                />
              </div>

              {/* Fecha Final */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Fecha Final
                </label>
                <DatePicker
                  selected={fechaFinal}
                  onChange={(date) => setFechaFinal(date)}
                  dateFormat="dd/MM/yyyy"
                  className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                />
              </div>

              {/* Selector de Estado */}
              <div>
                <label className="block text-sm font-semibold mb-2">Estado</label>
                <select
                  value={estadoSeleccionado}
                  onChange={(e) => setEstadoSeleccionado(e.target.value)}
                  className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                >
                  {Object.entries(ESTADOS).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botón Consultar */}
            <div className="mt-4 flex justify-center md:justify-end">
              <button
                onClick={handleConsultar}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Consultando..." : "Consultar Documentos"}
              </button>
            </div>
          </div>

          {/* Tabla de Resultados */}
          {datos.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Tipo Doc</th>
                      <th className="px-4 py-3 text-left">Nro Doc</th>
                      <th className="px-4 py-3 text-left hidden md:table-cell">Cliente</th>
                      <th className="px-4 py-3 text-left hidden md:table-cell">TransId</th>
                      <th className="px-4 py-3 text-left">Estado</th>
                      <th className="px-4 py-3 text-left hidden lg:table-cell">Fecha Inicio</th>
                      <th className="px-4 py-3 text-left hidden lg:table-cell">Fecha Fin</th>
                      <th className="px-4 py-3 text-center">Ver</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datos.map((item, index) => (
                      <>
                        {/* Fila Principal */}
                        <tr
                          key={`parent-${index}`}
                          className={`border-b ${
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          } hover:bg-gray-100`}
                        >
                          <td className="px-4 py-3">{item.TipoDoc}</td>
                          <td className="px-4 py-3 font-semibold">{item.NroDoc}</td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {item.Cliente}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {item.TransId}
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                              {item.Estado}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            {item.FechaHora}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            {item.FechaFin}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => toggleRow(index)}
                              className="text-green-600 hover:text-green-800 focus:outline-none"
                              aria-label="Ver detalles"
                            >
                              {expandedRows[index] ? (
                                <ChevronUp size={20} />
                              ) : (
                                <Eye size={20} />
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* Fila Expandida - Estados del Pedido (Hijos) */}
                        {expandedRows[index] && item.hijos && item.hijos.length > 0 && (
                          <tr key={`child-${index}`}>
                            <td colSpan="8" className="bg-gray-100 p-4">
                              <div className="overflow-x-auto">
                                <h3 className="font-bold mb-2 text-gray-700">
                                  Historial de Estados
                                </h3>
                                <table className="w-full text-sm border border-gray-300">
                                  <thead className="bg-gray-700 text-white">
                                    <tr>
                                      <th className="px-3 py-2 text-left">#</th>
                                      <th className="px-3 py-2 text-left">Usuario</th>
                                      <th className="px-3 py-2 text-left">Estado</th>
                                      <th className="px-3 py-2 text-left">Observaciones</th>
                                      <th className="px-3 py-2 text-left">Fecha y Hora</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {item.hijos.map((hijo, hijoIndex) => (
                                      <tr
                                        key={`hijo-${index}-${hijoIndex}`}
                                        className={`border-b ${
                                          hijoIndex % 2 === 0
                                            ? "bg-white"
                                            : "bg-gray-50"
                                        }`}
                                      >
                                        <td className="px-3 py-2">{hijo.Codigo}</td>
                                        <td className="px-3 py-2">{hijo.Usuario}</td>
                                        <td className="px-3 py-2">
                                          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                                            {hijo.Estado}
                                          </span>
                                        </td>
                                        <td className="px-3 py-2 max-w-xs truncate">
                                          {hijo.Observaciones || "N/A"}
                                        </td>
                                        <td className="px-3 py-2">{hijo.FechaHora}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mensaje cuando no hay datos */}
          {!loading && datos.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              <p>No hay datos para mostrar. Seleccione los filtros y presione "Consultar Documentos".</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ReporteEstados;

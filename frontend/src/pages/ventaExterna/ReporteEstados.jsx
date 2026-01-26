import { useState, useEffect } from "react";
import TopBar from "../../components/global/TopBar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import ApiMTS from "../../services/apiMts";
import { Eye, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { API_REPORTE } from "../../config/config";

const ESTADOS = {
  ALL: "--Todos los Estados--",
  "EN ALISTAMIENTO": "En Alistamiento",
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
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHijos, setSelectedHijos] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showAlert, setShowAlert] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleConsultar = async () => {
    if (!navigator.onLine) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
      return;
    }

    setLoading(true);
    try {
      const fechini = format(fechaInicial, "yyyy-MM-dd");
      const fechfin = format(fechaFinal, "yyyy-MM-dd");
      
      const baseUrl = API_REPORTE;
      const url = `${baseUrl}?reporte=1&estado=${estadoSeleccionado}&fechini=${fechini}&fechfin=${fechfin}`;
      const response = await fetch(url);
      const data = await response.json();

      // Ordenar por TransId descendente (más reciente primero)
      const sortedData = Array.isArray(data) 
        ? data.sort((a, b) => b.TransId - a.TransId)
        : [];
      
      setDatos(sortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error al consultar el reporte:", error);
      setDatos([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = async (item) => {
    setIsModalOpen(true);
    setModalLoading(true);
    try {
      const baseUrl = API_REPORTE;
      const url = `${baseUrl}?reporte=2&TransId=${item.TransId}`;
      const response = await fetch(url);
      const data = await response.json();
      setSelectedHijos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar el historial:", error);
      setSelectedHijos([]);
    } finally {
      setModalLoading(false);
    }
  };

  // Filtrar datos según el término de búsqueda
  const filteredDatos = datos.filter(item => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      item.Cliente?.toLowerCase().includes(searchLower) ||
      item.TipoDoc?.toLowerCase().includes(searchLower) ||
      item.NroDoc?.toLowerCase().includes(searchLower) ||
      item.Estado?.toLowerCase().includes(searchLower) ||
      item.TransId?.toString().includes(searchLower) ||
      item.codigoPedido?.toLowerCase().includes(searchLower) ||
      item.direccion?.toLowerCase().includes(searchLower) ||
      item.sede?.toLowerCase().includes(searchLower)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDatos.slice(indexOfFirstItem, indexOfLastItem);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedHijos([]);
  };

  return (
    <>
      <TopBar showSimple={true} />
      <div className="w-full md:p-10 m-auto lg:w-[54%] mb-[10%] mt-[20%] lg:mt-[5%] md:mt-[13%] flex flex-wrap text-gray-700 relative">
        <div className="w-full px-[5%] lg:px-[3%] mb-4">
          <h1 className="text-2xl font-bold mb-4">Estados de Pedidos</h1>
          {/* Alerta de sin conexión */}
          {showAlert && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Sin conexión a internet. Por favor, verifica tu conexión e intenta nuevamente.</span>
              </div>
              <button onClick={() => setShowAlert(false)} className="text-red-700 hover:text-red-900">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
          {/* Filtros */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-4">
                {/* Fecha Inicial */}
                <div className="flex-1">
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
                <div className="flex-1">
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
                disabled={loading || !isOnline}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Consultando..." : !isOnline ? "Sin conexión" : "Consultar Documentos"}
              </button>
            </div>
          </div>

          {/* Tabla de Resultados */}
          {datos.length > 0 && (
            <>
              {/* Buscador */}
              <div className="mb-4 bg-white rounded-lg shadow-md p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar en los resultados..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-800 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left">Cliente / Documento / Estado</th>
                        <th className="px-4 py-3 text-left hidden md:table-cell">TransId</th>
                        <th className="px-4 py-3 text-left hidden lg:table-cell">Fecha Fin</th>
                        <th className="px-4 py-3 text-center">Ver</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((item, index) => (
                        <tr
                          key={item.TransId}
                          className={`border-b ${
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          } hover:bg-gray-100`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-800">{item.Cliente}</span>
                                <span className="text-xs text-gray-400 ml-2">📅 {item.FechaHora}</span>
                              </div>
                              <span className="text-xs text-gray-600">
                                {item.TipoDoc} - Pedido: {item.codigoPedido}
                              </span>
                              <span className="text-xs mt-1">
                                <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">
                                  {item.Estado}
                                </span>
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {item.TransId}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            {item.FechaFin}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => openModal(item)}
                              className="text-green-600 hover:text-green-800 focus:outline-none"
                              aria-label="Ver detalles"
                            >
                              <Eye size={20} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Paginación */}
              {filteredDatos.length > itemsPerPage && (
                <div className="flex justify-between items-center mt-4 px-4">
                  <span className="text-sm text-gray-700">
                    Página {currentPage} de {Math.ceil(filteredDatos.length / itemsPerPage)} Total {filteredDatos.length}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 flex items-center gap-1"
                    >
                      <ChevronLeft size={18} className="md:hidden" />
                      <span className="hidden md:inline">Anterior</span>
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === Math.ceil(filteredDatos.length / itemsPerPage)}
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

          {/* Mensaje cuando no hay datos */}
          {!loading && datos.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              <p>No hay datos para mostrar. Seleccione los filtros y presione "Consultar Documentos".</p>
            </div>
          )}
        </div>

        <div>
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-xl font-bold text-gray-700">Historial de Estados</h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-4 overflow-y-auto max-h-[60vh]">
                  {modalLoading ? (
                    <p className="text-gray-500">Cargando historial...</p>
                  ) : selectedHijos && selectedHijos.length > 0 ? (
                    <div className="relative">
                      {selectedHijos.map((hijo, index) => (
                        <div key={index} className="flex items-start mb-6">
                          {/* Timeline dot and line */}
                          <div className="flex flex-col items-center mr-4">
                            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow"></div>
                            {index < selectedHijos.length - 1 && (
                              <div className="w-0.5 h-16 bg-gray-300 mt-2"></div>
                            )}
                          </div>
                          {/* Content */}
                          <div className="flex-1 bg-gray-50 p-4 rounded-lg shadow-sm">
                            <div className="mb-2">
                              <h3 className="font-semibold text-gray-800">{hijo.Estado}</h3>
                              <span className="text-sm text-gray-500">{hijo.FechaHora}</span>
                            </div>
                            <div className="mb-1">
                              <span className="text-sm text-gray-600">
                                <strong>Usuario:</strong> {hijo.Usuario}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              <strong>Observaciones:</strong> {hijo.Observaciones || "N/A"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No hay historial disponible.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ReporteEstados;

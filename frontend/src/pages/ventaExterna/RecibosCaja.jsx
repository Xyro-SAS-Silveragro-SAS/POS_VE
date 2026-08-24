import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import TopBar from "../../components/global/TopBar";
import NuevoReciboModal from "../../components/recibosCaja/NuevoReciboModal";
import VerReciboModal from "../../components/recibosCaja/VerReciboModal";
import { currency } from "../../components/recibosCaja/utilsRecibos";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/apiService";
import { Plus, Search, Receipt, Banknote, ArrowLeftRight, CreditCard, Landmark, ChevronLeft, ChevronRight, Eye } from "lucide-react";

const MEDIOS_ICONOS = {
  db_totefe: { label: "Efectivo", icon: Banknote },
  db_totcon: { label: "Consignación", icon: ArrowLeftRight },
  db_tottc: { label: "Tarjeta", icon: CreditCard },
  db_totche: { label: "Cheque", icon: Landmark },
};

const RECIBOS_POR_PAGINA = 10;

const formatFecha = (valor) => {
  if (!valor) return "";
  const [anio, mes, dia] = String(valor).slice(0, 10).split("-");
  return `${dia}/${mes}/${anio}`;
};

const ESTADOS_RECIBO = {
  1: { label: "Creado", clase: "bg-blue-100 text-blue-700" },
  2: { label: "Sincronizado", clase: "bg-green-100 text-green-700" },
  3: { label: "Anulado", clase: "bg-red-100 text-red-600" },
  4: { label: "Por Autorizar", clase: "bg-amber-100 text-amber-700" },
  5: { label: "En Error", clase: "bg-rose-100 text-rose-700" },
};

const estadoRecibo = (r) =>
  ESTADOS_RECIBO[Number(r.in_estado)] || { label: "Sin estado", clase: "bg-gray-100 text-gray-600" };

const hoyISO = () => new Date().toISOString().slice(0, 10);
const inicioMesISO = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
};

const RecibosCaja = () => {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [recibos, setRecibos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [reciboVerId, setReciboVerId] = useState(null);
  const [reciboVersion, setReciboVersion] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);
  const [feInicio, setFeInicio] = useState(inicioMesISO());
  const [feFin, setFeFin] = useState(hoyISO());

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const cargarRecibos = useCallback(async () => {
    if (!currentUser?.tx_usuario || !feInicio || !feFin) return;
    setCargando(true);
    try {
      const data = await api.get("api/cartera/recibos-caja/consulta", {
        tx_usuario: currentUser.tx_usuario,
        fe_inicio: feInicio,
        fe_fin: feFin,
      });
      const lista = Array.isArray(data) ? data : (data?.data || data?.datos || data?.recibos || []);
      setRecibos(Array.isArray(lista) ? lista : []);
    } catch (err) {
      console.error("Error al consultar los recibos de caja:", err);
      setRecibos([]);
    } finally {
      setCargando(false);
    }
  }, [currentUser, feInicio, feFin]);

  useEffect(() => {
    cargarRecibos();
  }, [cargarRecibos, reciboVersion]);

  const recibosFiltrados = recibos.filter((r) => {
    if (!busqueda.trim()) return true;
    const q = busqueda.trim().toLowerCase();
    return (
      (r.tx_nomsn || "").toLowerCase().includes(q) ||
      String(r.tx_codsn || "").toLowerCase().includes(q) ||
      (r.tx_coment || "").toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, recibos]);

  const totalPaginas = Math.max(1, Math.ceil(recibosFiltrados.length / RECIBOS_POR_PAGINA));
  const recibosPagina = recibosFiltrados.slice(
    (paginaActual - 1) * RECIBOS_POR_PAGINA,
    paginaActual * RECIBOS_POR_PAGINA
  );

  const badgesMedios = (recibo) =>
    Object.entries(MEDIOS_ICONOS)
      .filter(([campo]) => Number(recibo[campo]) > 0)
      .map(([campo, { label, icon: Icon }]) => (
        <span key={campo} className="flex items-center gap-1 rounded-full bg-[#546C4C]/10 px-2 py-0.5 text-[10px] font-semibold text-[#546C4C]">
          <Icon size={11} /> {label}
        </span>
      ));

  return (
    <>
      <TopBar showSimple={true} />
      <div className="w-full md:p-10 m-auto lg:w-[54%] mb-[10%] mt-[20%] lg:mt-[5%] md:mt-[13%] flex flex-wrap text-gray-700 relative">
        <div className="w-full px-[5%] lg:px-[3%] mb-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h1 className="text-2xl font-bold mb-1">Recibos de caja</h1>
              <p className="text-gray-500">
                Consulta los recibos de caja que has registrado y crea uno nuevo para aplicar pagos de tus clientes a sus facturas.
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="hidden sm:flex shrink-0 items-center gap-2 bg-[#546C4C] hover:bg-[#455a3e] text-white font-bold py-2.5 px-5 rounded-lg transition-colors duration-200"
            >
              <Plus size={18} />
              Nuevo recibo
            </button>
          </div>

          {/* Buscador y filtros de fecha */}
          <div className="mb-4 bg-white rounded-lg shadow-md p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por cliente, código u observaciones..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#546C4C]"
              />
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-xs font-semibold text-gray-500">
                Fecha inicial
                <input
                  type="date"
                  value={feInicio}
                  max={feFin || undefined}
                  onChange={(e) => setFeInicio(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-[#546C4C]"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-gray-500">
                Fecha final
                <input
                  type="date"
                  value={feFin}
                  min={feInicio || undefined}
                  onChange={(e) => setFeFin(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-[#546C4C]"
                />
              </label>
            </div>
          </div>

          {cargando ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">Cargando recibos de caja...</div>
          ) : recibosFiltrados.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-10 text-center text-gray-500">
              <Receipt className="w-14 h-14 text-gray-300 mx-auto mb-3" />
              <p>{recibos.length === 0 ? "Aún no has creado ningún recibo de caja." : "No hay recibos que coincidan con tu búsqueda."}</p>
            </div>
          ) : (
            <>
              {/* Escritorio: tabla */}
              <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-800 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left">Cliente</th>
                        <th className="px-4 py-3 text-left">Fecha</th>
                        <th className="px-4 py-3 text-center">Estado</th>
                        <th className="px-4 py-3 text-left">Medios de pago</th>
                        <th className="px-4 py-3 text-right">Total</th>
                        <th className="px-4 py-3 text-center">Ver</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recibosPagina.map((r, index) => (
                        <tr key={r.id_nrorc ?? index} className={`border-b ${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}>
                          <td className="px-4 py-3">
                            <span className="block font-semibold text-gray-800">{r.tx_nomsn}</span>
                            <span className="block text-xs text-gray-400">{r.tx_codsn}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="block">{formatFecha(r.fe_fecha)}</span>
                            <span className="block text-xs text-gray-400">{r.fe_hora}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${estadoRecibo(r).clase}`}
                              title={r.tx_motivo_anula || ""}
                            >
                              {estadoRecibo(r).label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">{badgesMedios(r)}</div>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-gray-800">{currency(r.db_total)}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => setReciboVerId(r.id_nrorc)}
                              title="Ver recibo"
                              className="inline-flex items-center justify-center rounded-lg p-1.5 text-[#546C4C] hover:bg-[#546C4C]/10"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Móvil: cards */}
              <div className="md:hidden space-y-3">
                {recibosPagina.map((r, index) => (
                  <div key={r.id_nrorc ?? index} className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">{r.tx_nomsn}</p>
                        <p className="text-xs text-gray-400">{r.tx_codsn}</p>
                      </div>
                      <p className="text-lg font-bold text-[#546C4C]">{currency(r.db_total)}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>{formatFecha(r.fe_fecha)} · {r.fe_hora}</span>
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${estadoRecibo(r).clase}`}
                        title={r.tx_motivo_anula || ""}
                      >
                        {estadoRecibo(r).label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1">{badgesMedios(r)}</div>
                      <button
                        type="button"
                        onClick={() => setReciboVerId(r.id_nrorc)}
                        className="flex shrink-0 items-center gap-1 rounded-lg bg-[#546C4C]/10 px-2.5 py-1 text-xs font-semibold text-[#546C4C] hover:bg-[#546C4C]/20"
                      >
                        <Eye size={13} /> Ver
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {totalPaginas > 1 && (
                <div className="mt-4 flex items-center justify-between bg-white rounded-lg shadow-md px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                    disabled={paginaActual === 1}
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={16} /> Anterior
                  </button>
                  <span className="text-xs font-medium text-gray-500">
                    Página {paginaActual} de {totalPaginas} · {recibosFiltrados.length} recibo{recibosFiltrados.length !== 1 ? "s" : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                    disabled={paginaActual === totalPaginas}
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Siguiente <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Botón flotante en móvil */}
      <button
        onClick={() => setModalOpen(true)}
        className="sm:hidden fixed bottom-6 right-5 z-40 flex items-center gap-2 bg-[#546C4C] hover:bg-[#455a3e] text-white font-bold py-3 px-5 rounded-full shadow-lg transition-colors duration-200"
      >
        <Plus size={20} />
        Nuevo recibo
      </button>

      <NuevoReciboModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onReciboCreado={() => setReciboVersion((v) => v + 1)}
        usuario={currentUser}
      />

      <VerReciboModal
        open={reciboVerId != null}
        onClose={() => setReciboVerId(null)}
        idNrorc={reciboVerId}
      />
    </>
  );
};

export default RecibosCaja;

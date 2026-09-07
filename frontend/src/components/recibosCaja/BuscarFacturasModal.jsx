import { useState, useEffect, useMemo } from "react";
import { X, Search, CheckSquare, Square } from "lucide-react";
import { currency } from "./utilsRecibos";
import { N8N_GET_FACTURAS_URL } from "../../config/config.jsx";

const BuscarFacturasModal = ({ open, onClose, cliente, usuario, onAgregar }) => {
  const [facturas, setFacturas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    if (!open || !cliente) return;

    const buscarFacturas = async () => {
      setSeleccionadas([]);
      setBusqueda("");
      setError(null);
      setCargando(true);
      try {
        const res = await fetch(N8N_GET_FACTURAS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codigoSN: String(cliente.Codigo), emailUsuario: usuario?.tx_usuario }),
        });
        const data = await res.json();
        const item = Array.isArray(data) ? data[0] : data;
        const datos = item?.json?.datos ?? item?.datos ?? [];
        setFacturas(datos.filter((f) => f.tipoDoc === "Factura"));
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las facturas del cliente.");
      } finally {
        setCargando(false);
      }
    };

    buscarFacturas();
  }, [open, cliente, usuario?.tx_usuario]);

  const facturasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return facturas;
    return facturas.filter((f) => String(f.nroDoc).toLowerCase().includes(q));
  }, [facturas, busqueda]);

  if (!open) return null;

  const toggleFactura = (nroDoc) =>
    setSeleccionadas((prev) =>
      prev.includes(nroDoc) ? prev.filter((n) => n !== nroDoc) : [...prev, nroDoc]
    );

  const confirmar = () => {
    const elegidas = facturas.filter((f) => seleccionadas.includes(f.nroDoc));
    onAgregar(elegidas);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-lg sm:rounded-3xl">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-stone-100 bg-[#546C4C] px-5 py-4 sm:rounded-t-3xl">
          <div>
            <h2 className="text-base font-bold text-white">Facturas del cliente</h2>
            <p className="text-xs text-white/70">{cliente?.Nombre}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!cargando && !error && facturas.length > 0 && (
            <div className="relative mb-3">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por número de factura..."
                className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-9 pr-3 text-sm text-stone-800 outline-none transition focus:border-[#546C4C] focus:ring-2 focus:ring-[#546C4C]/20"
              />
            </div>
          )}

          {seleccionadas.length > 0 && (
            <p className="mb-2 text-xs font-medium text-[#546C4C]">
              {seleccionadas.length} factura{seleccionadas.length !== 1 ? "s" : ""} seleccionada{seleccionadas.length !== 1 ? "s" : ""}
            </p>
          )}

          {cargando ? (
            <p className="py-10 text-center text-sm text-stone-400">Cargando facturas...</p>
          ) : error ? (
            <p className="py-10 text-center text-sm text-red-400">{error}</p>
          ) : facturas.length === 0 ? (
            <p className="py-10 text-center text-sm text-stone-400">Este cliente no tiene facturas pendientes.</p>
          ) : facturasFiltradas.length === 0 ? (
            <p className="py-10 text-center text-sm text-stone-400">No se encontraron facturas con ese número.</p>
          ) : (
            <div className="space-y-2">
              {facturasFiltradas.map((f) => {
                const marcada = seleccionadas.includes(f.nroDoc);
                return (
                  <button
                    key={f.nroDoc}
                    type="button"
                    onClick={() => toggleFactura(f.nroDoc)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition ${
                      marcada ? "border-[#546C4C] bg-[#546C4C]/5" : "border-stone-200 bg-white hover:bg-stone-50"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      {marcada ? (
                        <CheckSquare size={18} className="shrink-0 text-[#546C4C]" />
                      ) : (
                        <Square size={18} className="shrink-0 text-stone-300" />
                      )}
                      <span>
                        <span className="block text-sm font-medium text-stone-800">Factura {f.nroDoc}</span>
                        <span className="block text-xs text-stone-400">Saldo: {currency(f.saldo)}</span>
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-stone-700">{currency(f.total)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="flex gap-3 border-t border-stone-100 bg-white px-5 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-stone-200 py-3 text-sm font-semibold text-stone-600 transition hover:bg-stone-50">
            Cancelar
          </button>
          <button
            onClick={confirmar}
            disabled={seleccionadas.length === 0}
            className="flex-1 rounded-xl bg-[#D98C2B] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c07d24] disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
          >
            {seleccionadas.length > 0 ? `Agregar (${seleccionadas.length})` : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuscarFacturasModal;

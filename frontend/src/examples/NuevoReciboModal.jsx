import { useState, useMemo, useEffect } from "react";
// eslint-disable-next-line no-unused-vars -- Plus se usa en el botón "Agregar factura" comentado más abajo
import { X, User, ChevronRight, Plus, Search, Banknote, ArrowLeftRight, CreditCard, MoreHorizontal } from "lucide-react";
import FilaFactura from "./FilaFactura";
import MedioPagoInput from "./MedioPagoInput";
import BuscarFacturasModal from "./BuscarFacturasModal";
import { currency, calcNeto, filaVacia } from "../utils/Utils";

const NuevoReciboModal = ({ open, onClose, onReciboCreado, usuario }) => {
  const [clienteQuery, setClienteQuery] = useState("");
  const [clienteSel, setClienteSel]     = useState(null);
  const [showClienteOpts, setShowClienteOpts] = useState(false);

  const [filas, setFilas] = useState([]);
  const [mostrarBuscarFacturas, setMostrarBuscarFacturas] = useState(false);

  const [pagos, setPagos] = useState({ efectivo: 0, transferencia: 0, tarjeta: 0, otros: 0 });
  const [observaciones, setObservaciones] = useState("");
  const [clientes, setClientes] = useState([]);
  const [cargandoClientes, setCargandoClientes] = useState(true);

  const API_CLIENTES = import.meta.env.VITE_API_CLIENTES || 'https://n8n.srv1097949.hstgr.cloud/webhook/clientesPosVe';
  const API_LOCAL = import.meta.env.VITE_API_URL || 'https://localhost:3020/api/';

  const CLIENTES = clientes;

  const clientesFiltrados = useMemo(() => {
    if (clienteQuery.length < 3) return [];
    const q = clienteQuery.toLowerCase();
    return CLIENTES
      .filter((c) => c.nombre.toLowerCase().includes(q) || String(c.cedula ?? "").toLowerCase().includes(q))
      .slice(0, 5);
  }, [clienteQuery, CLIENTES]);

  const totalNetoFacturas = useMemo(
    () => filas.reduce((sum, f) => sum + calcNeto(f), 0),
    [filas]
  );

  const totalPagado = useMemo(
    () => Object.values(pagos).reduce((a, b) => a + b, 0),
    [pagos]
  );

  const puedeCrear =
    clienteSel &&
    filas.some((f) => f.valor > 0) &&
    totalPagado > 0;

  // eslint-disable-next-line no-unused-vars -- se usa en el botón "Agregar factura" comentado más abajo
  const agregarFila = () => setFilas((prev) => [...prev, filaVacia()]);

  const actualizarFila = (idx, data) =>
    setFilas((prev) => prev.map((f, i) => (i === idx ? { ...f, ...data } : f)));

  const eliminarFila = (idx) =>
    setFilas((prev) => prev.filter((_, i) => i !== idx));

  const handleFocusMedioPago = (key) => {
    if (pagos[key] !== 0) return;
    const restante = Math.round(totalNetoFacturas - totalPagado);
    if (restante > 0) {
      setPagos((p) => ({ ...p, [key]: restante }));
    }
  };

  const agregarFacturasSeleccionadas = (facturasSeleccionadas) => {
    const nuevasFilas = facturasSeleccionadas.map((f) => ({
      ...filaVacia(),
      facturaId: f.nroDoc,
      valor: f.total || 0,
      subtotal: f.subtotal || 0,
    }));
    setFilas((prev) => [...prev, ...nuevasFilas]);
  };

  const handleGuardar = async () => {
    if (!usuario?.cd_sap) {
      console.error("No hay un usuario logueado válido");
      return;
    }

    if (!clienteSel) {
      console.error("Debe seleccionar un cliente");
      return;
    }

    const lineasValidas = filas.filter((f) => f.valor > 0);
    if (lineasValidas.length === 0) {
      console.error("Debe registrar al menos una factura con valor");
      return;
    }

    if (totalPagado <= 0) {
      console.error("Debe registrar al menos un medio de pago");
      return;
    }

    const cabecera = {
      clienteId:      clienteSel.id,
      cliente:        clienteSel.nombre,
      cedula:         clienteSel.cedula,
      ciudad:         clienteSel.ciudad,
      clienteEmail:   clienteSel.email,
      vendedor:       clienteSel.vendedor,
      codigoVendedor: clienteSel.codigoVendedor,
      codigo_usuario_realiza: usuario.cd_sap,
      usuarioRealiza:  usuario.tx_usuario,
      nombre_usuario_realiza:  usuario.tx_nombre,
      fecha:          new Date().toISOString().slice(0, 10),
      totalNetoFacturas,
      totalPagado,
      observaciones,
    };

    const lineas = lineasValidas.map((f) => ({
      facturaId:     f.facturaId,
      valor:         f.valor,
      iva:           f.iva,
      descuento:     f.descuento,
      retencion:     f.retencion,
      otroDescuento: f.otroDescuento,
      valorNeto:     calcNeto(f),
    }));

    const mediosPago = { ...pagos };

    const recibo = { cabecera, lineas, mediosPago };

    try {
      const res = await fetch(API_LOCAL+"recibos", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recibo),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error al guardar el recibo");
        return;
      }

      alert(`Recibo N.° ${data.consecutivo} insertado correctamente`);
      onReciboCreado?.();
      resetAndClose();
    } catch (err) {
      console.error(err);
      alert("Error al guardar el recibo");
    }
  };

  const resetAndClose = () => {
    setClienteQuery("");
    setClienteSel(null);
    setShowClienteOpts(false);
    setFilas([]);
    setPagos({ efectivo: 0, transferencia: 0, tarjeta: 0, otros: 0 });
    setObservaciones("");
    onClose();
  };


  const parseoClientes = (clientes) => {
    return clientes.map(c => ({
      id: c.Codigo,
      nombre: c.Nombre,
      cedula: c.NIT,
      ciudad: c.Ciudad+" - "+c.Direccion,
      vendedor: c.EmpleadoVentas,
      codigoVendedor: c.CodigoEmpl,
      email: c.Mail || "",
    }));
  }


 useEffect(() => {
  const buscarClientes = async () => {
    try {
      const res = await fetch(API_CLIENTES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'codigo':''}),
      });
      const data = await res.json();
      setClientes(parseoClientes(data.datos));
    } catch (err) {
      console.error(err);
    } finally {
      setCargandoClientes(false);
    }
  };

  buscarClientes();
}, []); // 👈 array fijo, solo depende de "nombre"




  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div
        className="flex max-h-[96vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-3xl sm:rounded-3xl"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-stone-100 bg-[#546C4C] px-5 py-4 sm:rounded-t-3xl">
          <div>
            <h2 className="text-base font-bold text-white">Nuevo recibo de caja</h2>
            <p className="text-xs text-white/70">Recibo N.° 1</p>
          </div>
          <button
            onClick={resetAndClose}
            className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* ── Cliente ── */}
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
              Datos del cliente
            </h3>
            <div className="relative">
              <User size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={clienteSel ? clienteSel.nombre : clienteQuery}
                onChange={(e) => {
                  setClienteSel(null);
                  setClienteQuery(e.target.value);
                  setShowClienteOpts(true);
                }}
                onFocus={() => setShowClienteOpts(true)}
                disabled={cargandoClientes}
                placeholder={cargandoClientes ? "Cargando clientes.... Espere...." : "Buscar por nombre o cédula"}
                className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-9 pr-3 text-sm text-stone-800 outline-none transition focus:border-[#546C4C] focus:ring-2 focus:ring-[#546C4C]/20 disabled:bg-stone-50 disabled:text-stone-400"
              />
              {!cargandoClientes && showClienteOpts && !clienteSel && clienteQuery.length >= 3 && (
                <div className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg">
                  {clientesFiltrados.length === 0 ? (
                    <p className="px-3 py-2.5 text-sm text-stone-400">Sin resultados</p>
                  ) : (
                    clientesFiltrados.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setClienteSel(c); setShowClienteOpts(false); }}
                        className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-stone-50"
                      >
                        <span>
                          <span className="block font-medium text-stone-800">{c.nombre}</span>
                          <span className="block text-xs text-stone-400">C.C. {c.cedula} · {c.ciudad}</span>
                        </span>
                        <ChevronRight size={14} className="text-stone-300" />
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {clienteSel && (
              <div className="mt-2 flex flex-wrap gap-4 rounded-xl bg-stone-50 px-4 py-2.5 text-xs text-stone-600">
                <span><span className="font-semibold">C.C./NIT:</span> {clienteSel.cedula}</span>
                <span><span className="font-semibold">Ciudad:</span> {clienteSel.ciudad}</span>
                <span><span className="font-semibold">Vendedor:</span> {clienteSel.vendedor}</span>
              </div>
            )}
          </section>

          {/* ── Facturas ── */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Facturas
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMostrarBuscarFacturas(true)}
                  disabled={!clienteSel}
                  title={!clienteSel ? "Selecciona primero un cliente" : undefined}
                  className="flex items-center gap-1 rounded-lg bg-[#546C4C]/10 px-2.5 py-1 text-xs font-semibold text-[#546C4C] transition hover:bg-[#546C4C]/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Search size={13} strokeWidth={2.5} />
                  Buscar facturas del cliente
                </button>
                {/* Oculto por ahora, se deja el botón manual por si se necesita más adelante
                <button
                  type="button"
                  onClick={agregarFila}
                  className="flex items-center gap-1 rounded-lg bg-[#546C4C]/10 px-2.5 py-1 text-xs font-semibold text-[#546C4C] transition hover:bg-[#546C4C]/20"
                >
                  <Plus size={13} strokeWidth={2.5} />
                  Agregar factura
                </button>
                */}
              </div>
            </div>

            {filas.length === 0 ? (
              <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 px-4 py-6 text-center text-xs text-stone-400">
                Aún no has agregado facturas. Búscalas por cliente o agrégalas manualmente.
              </div>
            ) : (
              <>
                {/* Encabezados de columna — solo escritorio */}
                <div className="mb-1 hidden md:grid md:grid-cols-[1fr_minmax(0,110px)_minmax(0,64px)_minmax(0,90px)_minmax(0,110px)_minmax(0,120px)_32px] gap-1.5 px-0.5">
                  {["No. Factura", "Subtotal", "Parcial", "Desc. %", "Total", "Valor a pagar"].map((h) => (
                    <span key={h} className="text-center text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                      {h}
                    </span>
                  ))}
                  <span />
                </div>

                <div className="space-y-2">
                  {filas.map((fila, idx) => (
                    <FilaFactura
                      key={fila._key}
                      fila={fila}
                      onUpdate={(data) => actualizarFila(idx, data)}
                      onRemove={() => eliminarFila(idx)}
                      canRemove={filas.length > 1}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Subtotal facturas */}
            <div className="mt-2 flex justify-end rounded-xl bg-stone-100 px-4 py-2">
              <span className="text-xs font-medium text-stone-500 mr-3">Total neto facturas</span>
              <span className="text-sm font-bold text-stone-700">{currency(totalNetoFacturas)}</span>
            </div>
          </section>

          {/* ── Medios de pago ── */}
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
              Medios de pago
            </h3>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <MedioPagoInput icon={Banknote}        label="Efectivo"      value={pagos.efectivo}      onChange={(v) => setPagos((p) => ({ ...p, efectivo: v }))}      onFocus={() => handleFocusMedioPago("efectivo")} />
              <MedioPagoInput icon={ArrowLeftRight}  label="Transferencia" value={pagos.transferencia} onChange={(v) => setPagos((p) => ({ ...p, transferencia: v }))} onFocus={() => handleFocusMedioPago("transferencia")} />
              <MedioPagoInput icon={CreditCard}      label="Tarjeta"       value={pagos.tarjeta}       onChange={(v) => setPagos((p) => ({ ...p, tarjeta: v }))}       onFocus={() => handleFocusMedioPago("tarjeta")} />
              <MedioPagoInput icon={MoreHorizontal}  label="Otros"         value={pagos.otros}         onChange={(v) => setPagos((p) => ({ ...p, otros: v }))}         onFocus={() => handleFocusMedioPago("otros")} />
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-[#546C4C]/5 px-4 py-3">
              <span className="text-sm font-medium text-stone-600">Total recibido</span>
              <span className="text-lg font-bold text-[#546C4C]">{currency(totalPagado)}</span>
            </div>
          </section>

          {/* ── Observaciones ── */}
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
              Observaciones
            </h3>
            <textarea
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Notas adicionales sobre el recibo..."
              className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 outline-none transition focus:border-[#546C4C] focus:ring-2 focus:ring-[#546C4C]/20 placeholder:text-stone-300"
            />
          </section>
        </div>

        {/* Pie */}
        <div className="flex gap-3 border-t border-stone-100 bg-white px-5 py-4">
          <button
            onClick={resetAndClose}
            className="flex-1 rounded-xl border border-stone-200 py-3 text-sm font-semibold text-stone-600 transition hover:bg-stone-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={!puedeCrear}
            className="flex-1 rounded-xl bg-[#D98C2B] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c07d24] disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
          >
            Guardar recibo de caja
          </button>
        </div>
      </div>

      <BuscarFacturasModal
        open={mostrarBuscarFacturas}
        onClose={() => setMostrarBuscarFacturas(false)}
        cliente={clienteSel}
        usuario={usuario}
        onAgregar={agregarFacturasSeleccionadas}
      />
    </div>
  );
}

export default NuevoReciboModal;
import { useState, useMemo, useEffect } from "react";
import { X, User, ChevronRight, RefreshCw, Search, Banknote, ArrowLeftRight, CreditCard, Landmark, Receipt, Camera, Upload, ImagePlus, Trash2 } from "lucide-react";
import FilaFactura from "./FilaFactura";
import FilaPago from "./FilaPago";
import BuscarFacturasModal from "./BuscarFacturasModal";
import {
  currency,
  calcularValorAPagar,
  calcularDescuentoFactura,
  facturaVacia,
  pagoVacio,
} from "./utilsRecibos";
import { db } from "../../db/db";
import syncService from "../../services/syncService.js";
import Funciones from "../../helpers/Funciones";
import { API_MTS, TOKEN, N8N_CUENTAS_EFECTIVO_URL, N8N_CUENTAS_BANCOS_URL, N8N_TARJETAS_URL, N8N_BANCOS_URL } from "../../config/config.jsx";

const NuevoReciboModal = ({ open, onClose, onReciboCreado, usuario }) => {
  const [clienteQuery, setClienteQuery] = useState("");
  const [clienteSel, setClienteSel] = useState(null);
  const [showClienteOpts, setShowClienteOpts] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [sincronizandoClientes, setSincronizandoClientes] = useState(false);

  const [mostrarBuscarFacturas, setMostrarBuscarFacturas] = useState(false);
  const [filas, setFilas] = useState([]);

  const [pagos, setPagos] = useState([]);
  const [observaciones, setObservaciones] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [cuentasEfectivo, setCuentasEfectivo] = useState([]);
  const [cuentasBancos, setCuentasBancos] = useState([]);
  const [tarjetas, setTarjetas] = useState([]);
  const [bancos, setBancos] = useState([]);
  const [comprobanteFile, setComprobanteFile] = useState(null);
  const [comprobantePreview, setComprobantePreview] = useState(null);

  useEffect(() => {
    if (!open) return;
    db.clientes.toArray().then(setClientes);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    fetch(N8N_CUENTAS_EFECTIVO_URL)
      .then((res) => res.json())
      .then((data) => setCuentasEfectivo((data?.Mensaje?.dListado ?? []).filter((c) => String(c.Codigo) === "11051014")))
      .catch((err) => console.error("Error al cargar cuentas de efectivo:", err));
    fetch(N8N_CUENTAS_BANCOS_URL)
      .then((res) => res.json())
      .then((data) => setCuentasBancos(data?.Mensaje?.dListado ?? []))
      .catch((err) => console.error("Error al cargar cuentas de bancos:", err));
    fetch(N8N_TARJETAS_URL)
      .then((res) => res.json())
      .then((data) => setTarjetas(data?.Mensaje?.dListado ?? []))
      .catch((err) => console.error("Error al cargar tarjetas:", err));
    fetch(N8N_BANCOS_URL)
      .then((res) => res.json())
      .then((data) => setBancos(data?.Mensaje?.dListado ?? []))
      .catch((err) => console.error("Error al cargar bancos:", err));
  }, [open]);

  const clientesFiltrados = useMemo(() => {
    if (clienteQuery.length < 3) return [];
    const q = clienteQuery.toLowerCase();
    return clientes
      .filter((c) => (c.Nombre || "").toLowerCase().includes(q) || String(c.Codigo ?? "").toLowerCase().includes(q) || String(c.NIT ?? "").toLowerCase().includes(q))
      .slice(0, 8);
  }, [clienteQuery, clientes]);

  const handleSeleccionarCliente = (cliente) => {
    setClienteSel(cliente);
    setShowClienteOpts(false);
    setFilas([]);
  };

  const handleActualizarClientes = async () => {
    if (!usuario?.cd_sap) return;
    try {
      await syncService.syncClientes(usuario.cd_sap, setSincronizandoClientes);
      const data = await db.clientes.toArray();
      setClientes(data);
      Funciones.alerta("Éxito", "Clientes sincronizados correctamente", "success");
    } catch (err) {
      Funciones.alerta("Error", err.message || "No se pudieron sincronizar los clientes", "error");
    }
  };

  const agregarFacturasSeleccionadas = (facturasSeleccionadas) => {
    setFilas((prev) => [...prev, ...facturasSeleccionadas.map(facturaVacia)]);
  };

  const actualizarFila = (idx, data) =>
    setFilas((prev) => prev.map((f, i) => (i === idx ? { ...f, ...data } : f)));

  const eliminarFila = (idx) =>
    setFilas((prev) => prev.filter((_, i) => i !== idx));

  const totalAplicadoFacturas = useMemo(
    () => filas.reduce((sum, f) => sum + calcularValorAPagar(f), 0),
    [filas]
  );

  const totalPagos = useMemo(
    () => pagos.reduce((sum, p) => sum + Number(p.db_vlrpag || 0), 0),
    [pagos]
  );

  const vlrPagoACuenta = Math.max(0, Math.round(totalPagos - totalAplicadoFacturas));

  const hoyISO = new Date().toISOString().slice(0, 10);

  const pagoValido = (p) => {
    if (p.tx_formpg === "EF") return !!p.tx_banco?.trim();
    if (p.tx_formpg === "CO") return !!(p.tx_banco?.trim() && p.fe_venc && p.tx_referen?.trim());
    if (p.tx_formpg === "TC") return !!(p.tx_banco?.trim() && p.tx_ctanro?.trim() && p.fe_venc && p.fe_venc >= hoyISO && p.tx_referen?.trim());
    if (p.tx_formpg === "CH")
      return !!(
        p.tx_ctaefec?.trim() &&
        p.tx_banco?.trim() &&
        p.tx_referen?.trim() &&
        p.tx_ctanro?.trim() &&
        p.tx_aprobado?.trim() &&
        p.tx_centralriesgo?.trim() &&
        p.tx_manejo &&
        p.fe_venc &&
        p.fe_venc >= hoyISO
      );
    return true;
  };

  const puedeGuardar =
    clienteSel &&
    filas.length > 0 &&
    filas.every((f) => calcularValorAPagar(f) > 0) &&
    totalAplicadoFacturas > 0 &&
    totalPagos > 0 &&
    totalAplicadoFacturas <= totalPagos &&
    pagos.length > 0 &&
    pagos.every(pagoValido);

  const tieneEfectivo = pagos.some((p) => p.tx_formpg === "EF");

  const agregarPago = (tipo) => {
    if (tipo === "EF" && tieneEfectivo) return;
    const restante = Math.max(0, Math.round(totalAplicadoFacturas - totalPagos));
    setPagos((prev) => [...prev, { ...pagoVacio(tipo), db_vlrpag: restante }]);
  };

  const actualizarPago = (idx, data) =>
    setPagos((prev) => prev.map((p, i) => (i === idx ? { ...p, ...data } : p)));

  const eliminarPago = (idx) =>
    setPagos((prev) => prev.filter((_, i) => i !== idx));

  const handleSeleccionarComprobante = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (comprobantePreview) URL.revokeObjectURL(comprobantePreview);
    setComprobanteFile(file);
    setComprobantePreview(URL.createObjectURL(file));
  };

  const handleQuitarComprobante = () => {
    if (comprobantePreview) URL.revokeObjectURL(comprobantePreview);
    setComprobanteFile(null);
    setComprobantePreview(null);
  };

  const resetAndClose = () => {
    setClienteQuery("");
    setClienteSel(null);
    setShowClienteOpts(false);
    setClientes([]);
    setMostrarBuscarFacturas(false);
    setFilas([]);
    setPagos([]);
    setObservaciones("");
    setCuentasEfectivo([]);
    setCuentasBancos([]);
    setTarjetas([]);
    setBancos([]);
    if (comprobantePreview) URL.revokeObjectURL(comprobantePreview);
    setComprobanteFile(null);
    setComprobantePreview(null);
    onClose();
  };

  const construirRecibo = () => {
    const ahora = new Date();
    const fecha = ahora.toISOString().slice(0, 10);
    const hora = ahora.toLocaleTimeString("en-GB");
    const sumaPorTipo = (tipo) => pagos.filter((p) => p.tx_formpg === tipo).reduce((s, p) => s + Number(p.db_vlrpag || 0), 0);

    return {
      tx_codsn: String(clienteSel.Codigo),
      tx_nomsn: clienteSel.Nombre,
      fe_fecha: fecha,
      fe_hora: hora,
      db_total: totalPagos,
      db_totefe: sumaPorTipo("EF"),
      db_totcon: sumaPorTipo("CO"),
      db_tottc: sumaPorTipo("TC"),
      db_totche: sumaPorTipo("CH"),
      db_vlrpgcta: vlrPagoACuenta,
      tx_coment: observaciones,
      in_estado: 4,
      in_nrosap: 0,
      in_clavesap: 0,
      tx_usuario: usuario.tx_usuario,
      in_serie: usuario.in_serie_oc,
      dt_fecha_reg_pag: fecha,
      facturas: filas.map((f, idx) => ({
        id_linea: idx + 1,
        tx_tipodoc: f.tx_tipodoc,
        in_clavesap: f.in_clavesap,
        in_nrosap: f.in_nrosap,
        fe_fechadoc: f.fe_fechadoc,
        fe_fechaven: f.fe_fechaven,
        db_saldofra: f.db_saldofra,
        db_vlrpag: calcularValorAPagar(f),
        db_vlrdto: f.esParcial ? 0 : calcularDescuentoFactura(f),
        db_prcdto: f.esParcial ? 0 : f.db_prcdto,
        tx_usuario: usuario.tx_usuario,
      })),
      pagos: pagos.map((p, idx) => ({
        id_linea: idx + 1,
        tx_formpg: p.tx_formpg,
        tx_banco: p.tx_banco.trim(),
        tx_nombco: p.tx_nombco.trim(),
        tx_ctanro: p.tx_formpg === "EF" || p.tx_formpg === "CO" ? "0" : p.tx_ctanro.trim(),
        tx_ctaefec: p.tx_ctaefec?.trim() || null,
        tx_nomctaefec: p.tx_nomctaefec?.trim() || null,
        fe_venc: p.fe_venc,
        db_vlrpag: Number(p.db_vlrpag || 0),
        tx_referen: p.tx_formpg === "EF" ? "EFECTIVO" : p.tx_referen.trim(),
        tx_aprobado: p.tx_aprobado?.trim() || null,
        tx_centralriesgo: p.tx_centralriesgo?.trim() || null,
        tx_manejo: p.tx_manejo || null,
        tx_usuario: usuario.tx_usuario,
      })),
    };
  };

  // TEMPORAL: solo para depuración, quitar este botón y handler cuando ya no se necesite.
  const handleVerPayload = () => {
    if (!clienteSel) {
      Funciones.alerta("Atención", "Selecciona un cliente para poder armar el payload", "info");
      return;
    }
    console.log("Payload recibo de caja:", construirRecibo());
  };

  const handleGuardar = async () => {
    if (!usuario?.tx_usuario) {
      Funciones.alerta("Atención", "No hay un usuario logueado válido", "error");
      return;
    }
    if (!puedeGuardar) {
      Funciones.alerta("Atención", "Verifica que haya un cliente, al menos una factura con valor a pagar mayor a cero, que el valor recibido cubra el valor aplicado a las facturas, que los pagos en efectivo tengan una cuenta seleccionada, que los pagos por consignación tengan banco, fecha y referencia, que los pagos con tarjeta tengan tarjeta, número, una fecha de vencimiento válida (no vencida) y voucher, y que los pagos con cheque tengan cuenta, banco, número de cheque, cuenta cheque, aprobado, central de riesgo, manejo y una fecha de vencimiento válida (no vencida).", "info");
      return;
    }

    const recibo = construirRecibo();

    setGuardando(true);
    try {
      const response = await fetch(`${API_MTS}api/cartera/recibos-caja`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
        body: JSON.stringify(recibo),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        Funciones.alerta("Error", data?.message || data?.error || "No se pudo guardar el recibo de caja.", "error");
        return;
      }

      Funciones.alerta("Recibo creado", "El recibo de caja se registró correctamente.", "success", () => {
        onReciboCreado?.();
        resetAndClose();
      });
    } catch (err) {
      console.error("Error al guardar el recibo de caja:", err);
      Funciones.alerta("Error", "No se pudo guardar el recibo de caja. Verifica tu conexión e intenta nuevamente.", "error");
    } finally {
      setGuardando(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:h-[85vh] sm:max-w-3xl sm:rounded-3xl">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-stone-100 bg-[#546C4C] px-5 py-4 sm:rounded-t-3xl">
          <div>
            <h2 className="text-base font-bold text-white">Nuevo recibo de caja</h2>
            <p className="text-xs text-white/70">{clienteSel ? clienteSel.Nombre : "Selecciona un cliente para comenzar"}</p>
          </div>
          <button onClick={resetAndClose} className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Cliente */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Datos del cliente</h3>
              <button
                type="button"
                onClick={handleActualizarClientes}
                disabled={sincronizandoClientes}
                className="flex items-center gap-1 text-xs font-semibold text-[#546C4C] hover:text-[#3f5239] disabled:opacity-50"
              >
                <RefreshCw size={12} className={sincronizandoClientes ? "animate-spin" : ""} />
                Actualizar clientes
              </button>
            </div>
            <div className="relative">
              <User size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={clienteSel ? clienteSel.Nombre : clienteQuery}
                onChange={(e) => {
                  setClienteSel(null);
                  setClienteQuery(e.target.value);
                  setShowClienteOpts(true);
                }}
                onFocus={() => setShowClienteOpts(true)}
                placeholder="Buscar por nombre, código o NIT"
                className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-9 pr-3 text-sm text-stone-800 outline-none transition focus:border-[#546C4C] focus:ring-2 focus:ring-[#546C4C]/20"
              />
              {showClienteOpts && !clienteSel && clienteQuery.length >= 3 && (
                <div className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg">
                  {clientesFiltrados.length === 0 ? (
                    <p className="px-3 py-2.5 text-sm text-stone-400">Sin resultados. Si el cliente es nuevo, usa "Actualizar clientes".</p>
                  ) : (
                    clientesFiltrados.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSeleccionarCliente(c)}
                        className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-stone-50"
                      >
                        <span>
                          <span className="block font-medium text-stone-800">{c.Nombre}</span>
                          <span className="block text-xs text-stone-400">Cod. {c.Codigo} · NIT {c.NIT}</span>
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
                <span><span className="font-semibold">Código:</span> {clienteSel.Codigo}</span>
                <span><span className="font-semibold">Saldo:</span> {currency(clienteSel.Saldo)}</span>
                <span><span className="font-semibold">Saldo vencido:</span> {currency(clienteSel.SaldoVencido)}</span>
                <span><span className="font-semibold">Saldo a favor:</span> {currency(clienteSel.SaldoFavor)}</span>
                <span><span className="font-semibold">Condición pago:</span> {clienteSel.CondicionPago}</span>
                <span><span className="font-semibold">Asesor:</span> {clienteSel.EmpleadoVentas}</span>
              </div>
            )}
          </section>

          {!clienteSel && (
            <div className="flex min-h-[45vh] flex-col items-center justify-center px-6 text-center">
              <Receipt className="mb-3 h-14 w-14 text-stone-200" />
              <p className="text-sm font-medium text-stone-500">Busca y selecciona un cliente para comenzar</p>
              <p className="mt-1 text-xs text-stone-400">Una vez elijas el cliente podrás buscar sus facturas y registrar los medios de pago.</p>
            </div>
          )}

          {/* Facturas */}
          {clienteSel && (
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Facturas</h3>
                <button
                  type="button"
                  onClick={() => setMostrarBuscarFacturas(true)}
                  className="flex items-center gap-1 rounded-lg bg-[#546C4C]/10 px-2.5 py-1 text-xs font-semibold text-[#546C4C] transition hover:bg-[#546C4C]/20"
                >
                  <Search size={13} strokeWidth={2.5} />
                  Buscar facturas del cliente
                </button>
              </div>

              {filas.length === 0 ? (
                <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 px-4 py-6 text-center text-xs text-stone-400">
                  Aún no has agregado facturas. Búscalas y selecciónalas del cliente.
                </div>
              ) : (
                <>
                  <div className="mb-1 hidden md:grid md:grid-cols-[1.4fr_minmax(0,110px)_minmax(0,64px)_minmax(0,90px)_minmax(0,120px)_32px] gap-1.5 px-0.5">
                    {["Factura", "Subtotal", "Parcial", "Desc. %", "Valor a pagar"].map((h) => (
                      <span key={h} className="text-center text-[10px] font-semibold uppercase tracking-wide text-stone-400">{h}</span>
                    ))}
                    <span />
                  </div>
                  <div className="space-y-2">
                    {filas.map((fila, idx) => (
                      <FilaFactura key={fila._key} fila={fila} onUpdate={(data) => actualizarFila(idx, data)} onRemove={() => eliminarFila(idx)} />
                    ))}
                  </div>
                </>
              )}

              <div className="mt-2 flex justify-end rounded-xl bg-stone-100 px-4 py-2">
                <span className="text-xs font-medium text-stone-500 mr-3">Total aplicado a facturas</span>
                <span className="text-sm font-bold text-stone-700">{currency(totalAplicadoFacturas)}</span>
              </div>
            </section>
          )}

          {/* Medios de pago */}
          {clienteSel && (
            <section>
              <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Medios de pago</h3>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => agregarPago("EF")}
                    disabled={tieneEfectivo}
                    title={tieneEfectivo ? "Ya agregaste un pago en efectivo" : undefined}
                    className="flex items-center gap-1.5 rounded-lg bg-[#546C4C]/10 px-2.5 py-1.5 text-xs font-semibold text-[#546C4C] hover:bg-[#546C4C]/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#546C4C]/10"
                  >
                    <Banknote size={14} /> Efectivo
                  </button>
                  <button type="button" onClick={() => agregarPago("CO")} className="flex items-center gap-1.5 rounded-lg bg-[#546C4C]/10 px-2.5 py-1.5 text-xs font-semibold text-[#546C4C] hover:bg-[#546C4C]/20"><ArrowLeftRight size={14} /> Consignación</button>
                  <button type="button" onClick={() => agregarPago("TC")} className="flex items-center gap-1.5 rounded-lg bg-[#546C4C]/10 px-2.5 py-1.5 text-xs font-semibold text-[#546C4C] hover:bg-[#546C4C]/20"><CreditCard size={14} /> Tarjeta</button>
                  <button type="button" onClick={() => agregarPago("CH")} className="flex items-center gap-1.5 rounded-lg bg-[#546C4C]/10 px-2.5 py-1.5 text-xs font-semibold text-[#546C4C] hover:bg-[#546C4C]/20"><Landmark size={14} /> Cheque</button>
                </div>
              </div>

              {pagos.length === 0 ? (
                <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 px-4 py-6 text-center text-xs text-stone-400">
                  Aún no has registrado ningún pago. Usa los botones de arriba para agregar efectivo, transferencia, tarjeta o cheque.
                </div>
              ) : (
                <div className="space-y-2">
                  {pagos.map((pago, idx) => (
                    <FilaPago key={pago._key} pago={pago} onUpdate={(data) => actualizarPago(idx, data)} onRemove={() => eliminarPago(idx)} canRemove={pagos.length > 0} cuentasEfectivo={cuentasEfectivo} cuentasBancos={cuentasBancos} tarjetas={tarjetas} bancos={bancos} />
                  ))}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between rounded-xl bg-[#546C4C]/5 px-4 py-3">
                <span className="text-sm font-medium text-stone-600">Total recibido</span>
                <span className="text-lg font-bold text-[#546C4C]">{currency(totalPagos)}</span>
              </div>
              {vlrPagoACuenta > 0 && (
                <p className="mt-1.5 text-right text-xs text-stone-500">
                  Excedente a favor del cliente (pago a cuenta): <span className="font-semibold">{currency(vlrPagoACuenta)}</span>
                </p>
              )}
            </section>
          )}

          {/* Observaciones */}
          {clienteSel && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Observaciones</h3>
              <textarea
                rows={2}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas adicionales sobre el recibo..."
                className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 outline-none transition focus:border-[#546C4C] focus:ring-2 focus:ring-[#546C4C]/20 placeholder:text-stone-300"
              />
            </section>
          )}

          {/* Comprobante de pago (foto) — solo maqueta, no se envía en el payload aún */}
          {clienteSel && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Comprobante de pago</h3>
              <div className="rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 p-4">
                {comprobantePreview ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={comprobantePreview}
                      alt="Comprobante de pago"
                      className="h-20 w-20 shrink-0 rounded-lg border border-stone-200 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-stone-700">{comprobanteFile?.name}</p>
                      <p className="text-xs text-stone-400">{((comprobanteFile?.size || 0) / 1024).toFixed(0)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleQuitarComprobante}
                      title="Quitar imagen"
                      className="flex items-center justify-center rounded-lg p-2 text-stone-300 transition hover:bg-red-50 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-2 text-center">
                    <ImagePlus size={26} className="text-stone-300" />
                    <p className="text-xs text-stone-400">Adjunta una foto del comprobante de pago (opcional)</p>
                    <div className="mt-1 flex flex-wrap justify-center gap-2">
                      <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#546C4C]/10 px-3 py-1.5 text-xs font-semibold text-[#546C4C] transition hover:bg-[#546C4C]/20">
                        <Camera size={14} strokeWidth={2.5} />
                        Tomar foto
                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleSeleccionarComprobante} />
                      </label>
                      <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-stone-200/60 px-3 py-1.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-200">
                        <Upload size={14} strokeWidth={2.5} />
                        Subir del dispositivo
                        <input type="file" accept="image/*" className="hidden" onChange={handleSeleccionarComprobante} />
                      </label>
                    </div>
                  </div>
                )}
              </div>
              <p className="mt-1 text-[11px] text-stone-400">* Por ahora esta imagen no se envía junto con el recibo.</p>
            </section>
          )}
        </div>

        {/* Pie */}
        <div className="flex gap-3 border-t border-stone-100 bg-white px-5 py-4">
          {/* TEMPORAL: quitar este botón cuando ya no se necesite ver el payload en consola */}
          <button
            type="button"
            onClick={handleVerPayload}
            className="rounded-xl border border-dashed border-stone-300 px-3 py-3 text-sm font-semibold text-stone-500 transition hover:bg-stone-50"
          >
            Ver payload
          </button>
          <button onClick={resetAndClose} className="flex-1 rounded-xl border border-stone-200 py-3 text-sm font-semibold text-stone-600 transition hover:bg-stone-50">
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={!puedeGuardar || guardando}
            className="flex-1 rounded-xl bg-[#D98C2B] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c07d24] disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
          >
            {guardando ? "Guardando..." : "Guardar recibo de caja"}
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
};

export default NuevoReciboModal;

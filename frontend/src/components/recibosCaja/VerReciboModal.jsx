import { useEffect, useState, useCallback } from "react";
import { X, FileText, Image as ImageIcon, Receipt, ExternalLink, ArrowLeftRight } from "lucide-react";
import { currency, MEDIOS_PAGO, MANEJOS_CHEQUE } from "./utilsRecibos";
import { ARCHIVOS_BASE_URL, CARPETA_ARCHIVO, N8N_CUENTAS_BANCOS_URL } from "../../config/config.jsx";
import api from "../../services/apiService";
import ConvertirPagoEfectivoModal from "./ConvertirPagoEfectivoModal";

const ESTADOS_RECIBO = {
  1: { label: "Creado", clase: "bg-blue-100 text-blue-700" },
  2: { label: "Sincronizado", clase: "bg-green-100 text-green-700" },
  3: { label: "Anulado", clase: "bg-red-100 text-red-600" },
  4: { label: "Por Autorizar", clase: "bg-amber-100 text-amber-700" },
  5: { label: "En Error", clase: "bg-rose-100 text-rose-700" },
  6: { label: "Por consignar", clase: "bg-blue-100 text-blue-700" },
};

const MANEJO_LABEL = (codigo) => MANEJOS_CHEQUE.find((m) => m.codigo === codigo)?.label || codigo;
const FORMPG_LABEL = (codigo) => MEDIOS_PAGO.find((m) => m.codigo === codigo)?.label || codigo;

const formatFecha = (valor) => {
  if (!valor) return "";
  const [anio, mes, dia] = String(valor).slice(0, 10).split("-");
  return `${dia}/${mes}/${anio}`;
};

const esImagen = (nombreArchivo) => /\.(png|jpe?g|gif|webp|bmp)$/i.test(nombreArchivo || "");

// tx_imagen ahora guarda un JSON.stringify con uno o varios archivos: [{ fileName, folder, path }].
// Se mantiene compatibilidad con recibos antiguos donde tx_imagen era solo el nombre del archivo.
const parseComprobantes = (txImagen) => {
  if (!txImagen) return [];
  try {
    const parsed = JSON.parse(txImagen);
    const lista = Array.isArray(parsed) ? parsed : [parsed];
    return lista
      .filter((item) => item && (item.path || item.fileName))
      .map((item) => ({
        fileName: item.fileName || String(item.path).split("/").pop(),
        url: item.path || `${ARCHIVOS_BASE_URL}/${item.folder || CARPETA_ARCHIVO}/${item.fileName}`,
      }));
  } catch {
    return [{ fileName: String(txImagen).split("/").pop(), url: `${ARCHIVOS_BASE_URL}/${CARPETA_ARCHIVO}/${txImagen}` }];
  }
};

const VerReciboModal = ({ open, onClose, idNrorc }) => {
  const [recibo, setRecibo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [cuentasBancos, setCuentasBancos] = useState([]);
  const [pagoEfectivoSeleccionado, setPagoEfectivoSeleccionado] = useState(null);

  const cargarRecibo = useCallback(() => {
    if (!idNrorc) return;
    setError("");
    setCargando(true);
    api
      .get(`api/cartera/recibos-caja/${idNrorc}`)
      .then((data) => {
        if (data?.success && data?.data) {
          setRecibo(data.data);
        } else {
          setError("No se pudo obtener la información del recibo.");
        }
      })
      .catch((err) => {
        console.error("Error al consultar el recibo de caja:", err);
        setError("No se pudo obtener la información del recibo.");
      })
      .finally(() => setCargando(false));
  }, [idNrorc]);

  useEffect(() => {
    if (!open || !idNrorc) return;
    setRecibo(null);
    cargarRecibo();
  }, [open, idNrorc, cargarRecibo]);

  useEffect(() => {
    if (!open) return;
    fetch(N8N_CUENTAS_BANCOS_URL)
      .then((res) => res.json())
      .then((data) => setCuentasBancos(data?.Mensaje?.dListado ?? []))
      .catch((err) => console.error("Error al cargar cuentas de bancos:", err));
  }, [open]);

  if (!open) return null;

  const estado = ESTADOS_RECIBO[Number(recibo?.in_estado)] || { label: "Sin estado", clase: "bg-gray-100 text-gray-600" };
  const comprobantes = parseComprobantes(recibo?.tx_imagen);
  const permiteConvertirEfectivo = Number(recibo?.in_estado) === 6;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:h-[85vh] sm:max-w-3xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-stone-100 bg-[#546C4C] px-5 py-4 sm:rounded-t-3xl">
          <div>
            <h2 className="text-base font-bold text-white">Recibo de caja {idNrorc ? `# FS-RC-${idNrorc}` : ""}</h2>
            <p className="text-xs text-white/70">
              {recibo ? recibo.tx_nomsn : "Consultando información..."}
              {recibo && <span className="ml-2 text-white/50">· Número SAP: {recibo.in_nrosap || "N/A"}</span>}
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {cargando && (
            <div className="flex min-h-[45vh] flex-col items-center justify-center text-center">
              <Receipt className="mb-3 h-14 w-14 animate-pulse text-stone-200" />
              <p className="text-sm font-medium text-stone-500">Cargando información del recibo...</p>
            </div>
          )}

          {!cargando && error && (
            <div className="flex min-h-[45vh] flex-col items-center justify-center text-center">
              <Receipt className="mb-3 h-14 w-14 text-stone-200" />
              <p className="text-sm font-medium text-red-500">{error}</p>
            </div>
          )}

          {!cargando && recibo && (
            <>
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Datos del cliente</h3>
                <div className="flex flex-wrap gap-4 rounded-xl bg-stone-50 px-4 py-2.5 text-xs text-stone-600">
                  <span><span className="font-semibold">Cliente:</span> {recibo.tx_nomsn}</span>
                  <span><span className="font-semibold">Código:</span> {recibo.tx_codsn}</span>
                  <span><span className="font-semibold">Fecha:</span> {formatFecha(recibo.fe_fecha)} · {recibo.fe_hora}</span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${estado.clase}`} title={recibo.tx_motivo_anula || ""}>
                    {estado.label}
                  </span>
                </div>
                {Number(recibo.in_estado) === 3 && recibo.tx_motivo_anula && (
                  <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
                    <span className="font-semibold">Motivo de rechazo:</span> {recibo.tx_motivo_anula}
                  </div>
                )}
              </section>

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Facturas aplicadas</h3>
                <div className="space-y-2">
                  {(recibo.facturas || []).map((f) => (
                    <div key={f.id_linea} className="rounded-xl border border-stone-200 px-4 py-2.5 text-xs text-stone-600">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-stone-800">{f.tx_tipodoc} {f.in_nrosap}</span>
                        <span className="font-bold text-[#546C4C]">{currency(f.db_vlrpag)}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-3 text-stone-500">
                        <span>Fecha doc.: {formatFecha(f.fe_fechadoc)}</span>
                        <span>Vence: {formatFecha(f.fe_fechaven)}</span>
                        <span>Saldo: {currency(f.db_saldofra)}</span>
                        {Number(f.db_prcdto) > 0 && <span>Desc.: {f.db_prcdto}% ({currency(f.db_vlrdto)})</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Medios de pago</h3>
                <div className="space-y-2">
                  {(recibo.pagos || []).map((p) => (
                    <div key={p.id_linea} className="rounded-xl border border-stone-200 px-4 py-2.5 text-xs text-stone-600">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-stone-800">{FORMPG_LABEL(p.tx_formpg)} · {p.tx_nombco}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#546C4C]">{currency(p.db_vlrpag)}</span>
                          {permiteConvertirEfectivo && p.tx_formpg === "EF" && (
                            <button
                              type="button"
                              onClick={() => setPagoEfectivoSeleccionado(p)}
                              className="flex items-center gap-1 rounded-full bg-[#546C4C]/10 px-2.5 py-1 text-[10px] font-semibold text-[#546C4C] transition hover:bg-[#546C4C]/20"
                            >
                              <ArrowLeftRight size={11} />
                              Convertir a consignación
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-3 text-stone-500">
                        {p.tx_ctanro && p.tx_ctanro !== "0" && <span>Cuenta/nro.: {p.tx_ctanro}</span>}
                        {p.tx_referen && <span>Referencia: {p.tx_referen}</span>}
                        {p.fe_venc && <span>Vence: {formatFecha(p.fe_venc)}</span>}
                        {p.tx_aprobado && <span>Aprobado: {p.tx_aprobado}</span>}
                        {p.tx_centralriesgo && <span>Central de riesgo: {p.tx_centralriesgo}</span>}
                        {p.tx_manejo && <span>Manejo: {MANEJO_LABEL(p.tx_manejo)}</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between rounded-xl bg-[#546C4C]/5 px-4 py-3">
                  <span className="text-sm font-medium text-stone-600">Total recibido</span>
                  <span className="text-lg font-bold text-[#546C4C]">{currency(recibo.db_total)}</span>
                </div>
                {Number(recibo.db_vlrpgcta) > 0 && (
                  <p className="mt-1.5 text-right text-xs text-stone-500">
                    Pago a cuenta: <span className="font-semibold">{currency(recibo.db_vlrpgcta)}</span>
                  </p>
                )}
              </section>

              {recibo.tx_coment && (
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Observaciones</h3>
                  <p className="rounded-xl bg-stone-50 px-4 py-2.5 text-sm text-stone-700">{recibo.tx_coment}</p>
                </section>
              )}

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Comprobante de pago</h3>
                {comprobantes.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 px-4 py-6 text-center text-xs text-stone-400">
                    Este recibo no tiene un comprobante adjunto.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {comprobantes.map((c, idx) => (
                      <a
                        key={idx}
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3 transition hover:bg-stone-100"
                      >
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white">
                          {esImagen(c.fileName) ? (
                            <ImageIcon size={26} className="text-stone-400" />
                          ) : (
                            <FileText size={26} className="text-stone-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-stone-700">{c.fileName}</p>
                          <p className="text-xs text-stone-400">
                            {esImagen(c.fileName) ? "Imagen" : "Documento PDF"} · Abrir en una pestaña nueva
                          </p>
                        </div>
                        <ExternalLink size={16} className="shrink-0 text-stone-400" />
                      </a>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        <div className="flex gap-3 border-t border-stone-100 bg-white px-5 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-stone-200 py-3 text-sm font-semibold text-stone-600 transition hover:bg-stone-50">
            Cerrar
          </button>
        </div>
      </div>

      <ConvertirPagoEfectivoModal
        open={!!pagoEfectivoSeleccionado}
        idNrorc={idNrorc}
        pago={pagoEfectivoSeleccionado}
        txImagenActual={recibo?.tx_imagen}
        cuentasBancos={cuentasBancos}
        onClose={() => setPagoEfectivoSeleccionado(null)}
        onGuardado={() => {
          setPagoEfectivoSeleccionado(null);
          cargarRecibo();
        }}
      />
    </div>
  );
};

export default VerReciboModal;

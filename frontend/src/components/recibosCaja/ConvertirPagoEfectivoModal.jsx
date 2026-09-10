import { useEffect, useState } from "react";
import { X, ArrowLeftRight, Camera, Upload, ImagePlus, FileText, Trash2 } from "lucide-react";
import NumInput from "./NumInput";
import { currency } from "./utilsRecibos";
import { MAX_COMPROBANTE_MB, subirComprobantes, parseArchivosExistentes } from "./subirArchivos";
import Funciones from "../../helpers/Funciones";
import { API_MTS, TOKEN } from "../../config/config.jsx";

const hoyISO = () => new Date().toISOString().slice(0, 10);

const ConvertirPagoEfectivoModal = ({ open, idNrorc, pago, txImagenActual, cuentasBancos = [], onClose, onGuardado }) => {
  const [txBanco, setTxBanco] = useState("");
  const [txNombco, setTxNombco] = useState("");
  const [feVenc, setFeVenc] = useState(hoyISO());
  const [txReferen, setTxReferen] = useState("");
  const [dbVlrpag, setDbVlrpag] = useState(0);
  const [comprobantes, setComprobantes] = useState([]); // [{ file, preview }]
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!open || !pago) return;
    setTxBanco("");
    setTxNombco("");
    setFeVenc(hoyISO());
    setTxReferen("");
    setDbVlrpag(Number(pago.db_vlrpag) || 0);
    setComprobantes((prev) => {
      prev.forEach((c) => c.preview && URL.revokeObjectURL(c.preview));
      return [];
    });
  }, [open, pago]);

  if (!open || !pago) return null;

  const handleSeleccionarBanco = (codigo) => {
    const cuenta = cuentasBancos.find((b) => String(b.Codigo) === codigo);
    setTxBanco(codigo);
    setTxNombco(cuenta?.Nombre || "");
  };

  const handleSeleccionarComprobante = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    const validos = [];
    for (const file of files) {
      if (file.size > MAX_COMPROBANTE_MB * 1024 * 1024) {
        Funciones.alerta("Atención", `El archivo "${file.name}" supera el tamaño máximo permitido de ${MAX_COMPROBANTE_MB}MB.`, "info");
        continue;
      }
      validos.push({ file, preview: URL.createObjectURL(file) });
    }
    if (validos.length) setComprobantes((prev) => [...prev, ...validos]);
  };

  const handleQuitarComprobante = (idx) => {
    setComprobantes((prev) => {
      if (prev[idx]?.preview) URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const puedeGuardar = !!(txBanco.trim() && feVenc && txReferen.trim() && dbVlrpag > 0);

  const handleGuardar = async () => {
    if (!puedeGuardar) {
      Funciones.alerta("Atención", "Completa el banco, la fecha, la referencia y el valor de la consignación.", "info");
      return;
    }

    setEnviando(true);
    try {
      const archivosNuevos = comprobantes.length ? await subirComprobantes(comprobantes.map((c) => c.file)) : [];
      const archivosExistentes = parseArchivosExistentes(txImagenActual);
      const tx_imagen = JSON.stringify([...archivosExistentes, ...archivosNuevos]);

      const payload = {
        pago: {
          id_linea: pago.id_linea,
          in_viene_efectivo: 1,
          tx_formpg: "CO",
          tx_banco: txBanco.trim(),
          tx_nombco: txNombco.trim(),
          fe_venc: feVenc,
          tx_referen: txReferen.trim(),
          db_vlrpag: Number(dbVlrpag) || 0,
        },
        tx_imagen,
      };

      const response = await fetch(`${API_MTS}api/cartera/recibos-caja-consignar/${idNrorc}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || data?.error || "No se pudo registrar la consignación.");
      }

      Funciones.alerta("Éxito", "El pago en efectivo fue convertido a consignación correctamente.", "success");
      onGuardado?.();
    } catch (err) {
      console.error("Error al convertir el pago en efectivo a consignación:", err);
      Funciones.alerta("Error", err.message || "No se pudo registrar la consignación.", "error");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-md sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-stone-100 bg-[#546C4C] px-5 py-4 sm:rounded-t-3xl">
          <h2 className="flex items-center gap-2 text-base font-bold text-white">
            <ArrowLeftRight size={18} />
            Convertir a consignación
          </h2>
          <button onClick={onClose} className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 px-5 py-5">
          <p className="text-xs text-stone-500">
            El pago en efectivo por <span className="font-semibold text-stone-700">{currency(pago.db_vlrpag)}</span> se reemplazará por los datos de esta consignación.
          </p>

          <label className="block text-xs font-semibold text-stone-500">
            Banco
            <select
              value={txBanco}
              onChange={(e) => handleSeleccionarBanco(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-[#546C4C]"
            >
              <option value="">Selecciona el banco</option>
              {cuentasBancos.map((b) => (
                <option key={b.Codigo} value={b.Codigo}>{b.Codigo} - {b.Nombre}</option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-semibold text-stone-500">
            Fecha
            <input
              type="date"
              value={feVenc}
              onChange={(e) => setFeVenc(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-[#546C4C]"
            />
          </label>

          <label className="block text-xs font-semibold text-stone-500">
            Referencia
            <input
              type="text"
              value={txReferen}
              onChange={(e) => setTxReferen(e.target.value)}
              maxLength={25}
              placeholder="Referencia. Máximo 25 caracteres"
              className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-[#546C4C]"
            />
          </label>

          <label className="block text-xs font-semibold text-stone-500">
            Valor
            <div className="mt-1 rounded-lg border border-stone-200 bg-white px-2.5 py-2">
              <NumInput value={dbVlrpag} onChange={setDbVlrpag} className="w-full text-sm font-semibold text-[#546C4C]" />
            </div>
          </label>

          <div>
            <span className="mb-1 block text-xs font-semibold text-stone-500">Comprobante de la consignación</span>
            <div className="rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 p-3">
              {comprobantes.length > 0 && (
                <div className="space-y-2">
                  {comprobantes.map((c, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      {c.file.type === "application/pdf" ? (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white">
                          <FileText size={22} className="text-stone-400" />
                        </div>
                      ) : (
                        <img
                          src={c.preview}
                          alt="Comprobante de consignación"
                          className="h-14 w-14 shrink-0 rounded-lg border border-stone-200 object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-stone-700">{c.file.name}</p>
                        <p className="text-xs text-stone-400">{(c.file.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleQuitarComprobante(idx)}
                        title="Quitar archivo"
                        className="flex items-center justify-center rounded-lg p-2 text-stone-300 transition hover:bg-red-50 hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className={`flex flex-col items-center gap-2 text-center ${comprobantes.length ? "mt-3 border-t border-stone-200 pt-3" : "py-1"}`}>
                {!comprobantes.length && (
                  <>
                    <ImagePlus size={22} className="text-stone-300" />
                    <p className="text-xs text-stone-400">Adjunta fotos o PDFs del comprobante (opcional)</p>
                  </>
                )}
                <div className="mt-1 flex flex-wrap justify-center gap-2">
                  <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#546C4C]/10 px-3 py-1.5 text-xs font-semibold text-[#546C4C] transition hover:bg-[#546C4C]/20">
                    <Camera size={14} strokeWidth={2.5} />
                    Tomar foto
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleSeleccionarComprobante} />
                  </label>
                  <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-stone-200/60 px-3 py-1.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-200">
                    <Upload size={14} strokeWidth={2.5} />
                    {comprobantes.length ? "Agregar más archivos" : "Subir del dispositivo"}
                    <input type="file" accept="image/*,application/pdf" multiple className="hidden" onChange={handleSeleccionarComprobante} />
                  </label>
                </div>
              </div>
            </div>
            <p className="mt-1 text-[11px] text-stone-400">* Tamaño máximo {MAX_COMPROBANTE_MB}MB. Se sube al guardar la consignación.</p>
          </div>
        </div>

        <div className="flex gap-3 border-t border-stone-100 bg-white px-5 py-4">
          <button
            onClick={onClose}
            disabled={enviando}
            className="flex-1 rounded-xl border border-stone-200 py-3 text-sm font-semibold text-stone-600 transition hover:bg-stone-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={!puedeGuardar || enviando}
            className="flex-1 rounded-xl bg-[#D98C2B] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c07d24] disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
          >
            {enviando ? "Guardando..." : "Guardar consignación"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConvertirPagoEfectivoModal;

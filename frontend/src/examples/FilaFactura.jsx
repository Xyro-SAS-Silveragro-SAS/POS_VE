import { Trash2 } from "lucide-react";
import NumInput from "./NumInput";
import { currency, calcNeto } from "../utils/Utils";

const FilaFactura = ({ fila, onUpdate, onRemove, canRemove }) => {
  const neto = calcNeto(fila);

  const toggleParcial = () => {
    if (fila.esParcial) {
      // Vuelve a pago completo: el valor a pagar se vuelve a calcular por descuento
      onUpdate({ ...fila, esParcial: false });
    } else {
      // Pasa a pago parcial: bloquea el descuento en 0% y habilita escribir el valor a pagar
      onUpdate({ ...fila, esParcial: true, descuento: 0, valorPagar: 0 });
    }
  };

  const checkboxParcial = (
    <input
      type="checkbox"
      checked={!!fila.esParcial}
      onChange={toggleParcial}
      title="Pago parcial"
      className="h-4 w-4 rounded border-stone-300 text-[#546C4C] focus:ring-[#546C4C]/20"
    />
  );

  const inputFactura = (
    <input
      type="text"
      value={fila.facturaId}
      readOnly
      placeholder="No. Factura"
      className="w-full rounded-lg border border-stone-200 bg-stone-100 px-2.5 py-2 text-sm text-stone-600 outline-none"
    />
  );

  const selectDescuentoClass =
    "w-full bg-transparent text-sm outline-none text-right";

  const selectDescuento = (className = "") => (
    <select
      value={fila.descuento}
      onChange={(e) => onUpdate({ ...fila, descuento: Number(e.target.value) })}
      disabled={fila.esParcial}
      className={`${selectDescuentoClass} ${className} disabled:cursor-not-allowed disabled:text-stone-400`}
    >
      <option value={0}>0%</option>
      <option value={3}>3%</option>
    </select>
  );

  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
      {/* ── Móvil: layout tarjeta ── */}
      <div className="md:hidden space-y-2">
        {/* Fila superior: factura + botón eliminar */}
        <div className="flex gap-2 items-start">
          <div className="flex-1">{inputFactura}</div>
          <button
            type="button"
            onClick={onRemove}
            disabled={!canRemove}
            className="mt-1 flex items-center justify-center rounded-lg p-1.5 text-stone-300 transition hover:bg-red-50 hover:text-red-400 disabled:pointer-events-none disabled:opacity-30"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Grid 2×2 con campos numéricos */}
        <div className="grid grid-cols-2 gap-2">
          <label className="rounded-lg border border-stone-200 bg-stone-100 px-3 py-2">
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-stone-400 mb-0.5">
              Subtotal
            </span>
            <span className="block text-right text-sm text-stone-600">{currency(fila.subtotal)}</span>
          </label>
          <label className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-3 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">
              Parcial
            </span>
            {checkboxParcial}
          </label>
          <label className="rounded-lg border border-stone-200 bg-white px-3 py-2">
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-stone-400 mb-0.5">
              Descuento %
            </span>
            {selectDescuento()}
          </label>
          <label className="rounded-lg border border-stone-200 bg-stone-100 px-3 py-2">
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-stone-400 mb-0.5">
              Total factura
            </span>
            <span className="block text-right text-sm text-stone-600">{currency(fila.valor)}</span>
          </label>
        </div>

        {/* Valor a pagar destacado */}
        <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${fila.esParcial ? "border border-[#546C4C]/40 bg-white" : "bg-[#546C4C]/8"}`}>
          <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">Valor a pagar</span>
          {fila.esParcial ? (
            <NumInput
              value={fila.valorPagar}
              onChange={(v) => onUpdate({ ...fila, valorPagar: v })}
              miles
              className="w-28 text-right text-base font-bold text-[#546C4C]"
            />
          ) : (
            <span className="text-base font-bold text-[#546C4C]">{currency(neto)}</span>
          )}
        </div>
      </div>

      {/* ── Escritorio: grid horizontal ── */}
      <div className="hidden md:grid md:grid-cols-[1fr_minmax(0,110px)_minmax(0,64px)_minmax(0,90px)_minmax(0,110px)_minmax(0,120px)_32px] gap-1.5 items-start">
        {/* No. Factura */}
        {inputFactura}

        {/* Subtotal (referencia) */}
        <div className="flex items-center justify-end rounded-lg border border-stone-200 bg-stone-100 px-2.5 py-2">
          <span className="text-sm text-stone-600">{currency(fila.subtotal)}</span>
        </div>

        {/* Parcial */}
        <div className="flex items-center justify-center rounded-lg border border-stone-200 bg-white px-2 py-2">
          {checkboxParcial}
        </div>

        {/* Descuento */}
        <div className="rounded-lg border border-stone-200 bg-white px-2 py-1.5">
          {selectDescuento()}
        </div>

        {/* Total factura (referencia) */}
        <div className="flex items-center justify-end rounded-lg border border-stone-200 bg-stone-100 px-2.5 py-2">
          <span className="text-sm text-stone-600">{currency(fila.valor)}</span>
        </div>

        {/* Valor a pagar */}
        <div className={`flex items-center justify-end rounded-lg px-2 py-1.5 ${fila.esParcial ? "border border-[#546C4C]/40 bg-white" : "bg-[#546C4C]/5"}`}>
          {fila.esParcial ? (
            <NumInput
              value={fila.valorPagar}
              onChange={(v) => onUpdate({ ...fila, valorPagar: v })}
              miles
              className="text-right text-sm font-semibold text-[#546C4C]"
            />
          ) : (
            <span className="text-sm font-semibold text-[#546C4C]">{currency(neto)}</span>
          )}
        </div>

        {/* Eliminar */}
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          className="flex items-center justify-center rounded-lg p-1 text-stone-300 transition hover:bg-red-50 hover:text-red-400 disabled:pointer-events-none disabled:opacity-30"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default FilaFactura;

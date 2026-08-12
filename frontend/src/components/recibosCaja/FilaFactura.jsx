import { Trash2 } from "lucide-react";
import NumInput from "./NumInput";
import { currency, calcularValorAPagar, DESCUENTOS } from "./utilsRecibos";

const FilaFactura = ({ fila, onUpdate, onRemove }) => {
  const neto = calcularValorAPagar(fila);

  const toggleParcial = () => {
    if (fila.esParcial) {
      onUpdate({ ...fila, esParcial: false });
    } else {
      onUpdate({ ...fila, esParcial: true, db_prcdto: 0, db_vlrdto: 0, db_vlrpag: 0 });
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

  const infoFactura = (
    <div className="w-full rounded-lg border border-stone-200 bg-stone-100 px-2.5 py-2 text-sm text-stone-600">
      <span className="block font-semibold text-stone-700">{fila.tx_tipodoc} {fila.in_nrosap}</span>
      <span className="block text-[11px] text-stone-400">Vence: {fila.fe_fechaven || "N/A"}</span>
    </div>
  );

  const selectDescuento = (className = "") => (
    <select
      value={fila.db_prcdto}
      onChange={(e) => {
        const db_prcdto = Number(e.target.value);
        onUpdate({ ...fila, db_prcdto });
      }}
      disabled={fila.esParcial}
      className={`w-full bg-transparent text-sm outline-none text-right ${className} disabled:cursor-not-allowed disabled:text-stone-400`}
    >
      {DESCUENTOS.map((d) => (
        <option key={d} value={d}>{d}%</option>
      ))}
    </select>
  );

  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
      {/* Móvil */}
      <div className="md:hidden space-y-2">
        <div className="flex gap-2 items-start">
          <div className="flex-1">{infoFactura}</div>
          <button
            type="button"
            onClick={onRemove}
            className="mt-1 flex items-center justify-center rounded-lg p-1.5 text-stone-300 transition hover:bg-red-50 hover:text-red-400"
          >
            <Trash2 size={15} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="rounded-lg border border-stone-200 bg-stone-100 px-3 py-2">
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-stone-400 mb-0.5">Saldo factura</span>
            <span className="block text-right text-sm text-stone-600">{currency(fila.db_saldofra)}</span>
          </label>
          <label className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-3 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">Parcial</span>
            {checkboxParcial}
          </label>
          <label className="rounded-lg border border-stone-200 bg-white px-3 py-2">
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-stone-400 mb-0.5">Descuento %</span>
            {selectDescuento()}
          </label>
          <label className="rounded-lg border border-stone-200 bg-stone-100 px-3 py-2">
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-stone-400 mb-0.5">Fecha doc.</span>
            <span className="block text-right text-sm text-stone-600">{fila.fe_fechadoc || "N/A"}</span>
          </label>
        </div>

        <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${fila.esParcial ? "border border-[#546C4C]/40 bg-white" : "bg-[#546C4C]/8"}`}>
          <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">Valor a pagar</span>
          {fila.esParcial ? (
            <NumInput
              value={fila.db_vlrpag}
              onChange={(v) => onUpdate({ ...fila, db_vlrpag: v })}
              className="w-28 text-right text-base font-bold text-[#546C4C]"
            />
          ) : (
            <span className="text-base font-bold text-[#546C4C]">{currency(neto)}</span>
          )}
        </div>
      </div>

      {/* Escritorio */}
      <div className="hidden md:grid md:grid-cols-[1.4fr_minmax(0,110px)_minmax(0,64px)_minmax(0,90px)_minmax(0,120px)_32px] gap-1.5 items-start">
        {infoFactura}

        <div className="flex items-center justify-end rounded-lg border border-stone-200 bg-stone-100 px-2.5 py-2">
          <span className="text-sm text-stone-600">{currency(fila.db_saldofra)}</span>
        </div>

        <div className="flex items-center justify-center rounded-lg border border-stone-200 bg-white px-2 py-2">
          {checkboxParcial}
        </div>

        <div className="rounded-lg border border-stone-200 bg-white px-2 py-1.5">
          {selectDescuento()}
        </div>

        <div className={`flex items-center justify-end rounded-lg px-2 py-1.5 ${fila.esParcial ? "border border-[#546C4C]/40 bg-white" : "bg-[#546C4C]/5"}`}>
          {fila.esParcial ? (
            <NumInput
              value={fila.db_vlrpag}
              onChange={(v) => onUpdate({ ...fila, db_vlrpag: v })}
              className="text-right text-sm font-semibold text-[#546C4C]"
            />
          ) : (
            <span className="text-sm font-semibold text-[#546C4C]">{currency(neto)}</span>
          )}
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="flex items-center justify-center rounded-lg p-1 text-stone-300 transition hover:bg-red-50 hover:text-red-400"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default FilaFactura;

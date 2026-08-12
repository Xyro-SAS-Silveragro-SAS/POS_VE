import { Trash2 } from "lucide-react";
import NumInput from "./NumInput";
import { MEDIOS_PAGO } from "./utilsRecibos";

const FilaPago = ({ pago, onUpdate, onRemove, canRemove }) => {
  const requiereBanco = pago.tx_formpg !== "EF";

  const selectTipo = (
    <select
      value={pago.tx_formpg}
      onChange={(e) => onUpdate({ ...pago, tx_formpg: e.target.value })}
      className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-[#546C4C]"
    >
      {MEDIOS_PAGO.map((m) => (
        <option key={m.codigo} value={m.codigo}>{m.label}</option>
      ))}
    </select>
  );

  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 space-y-2">
      <div className="flex items-start gap-2">
        <div className="w-32 shrink-0">{selectTipo}</div>
        <div className="flex-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5">
          <NumInput
            value={pago.db_vlrpag}
            onChange={(v) => onUpdate({ ...pago, db_vlrpag: v })}
            placeholder="Valor recibido"
            className="w-full text-sm font-semibold text-[#546C4C]"
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          className="flex items-center justify-center rounded-lg p-2 text-stone-300 transition hover:bg-red-50 hover:text-red-400 disabled:pointer-events-none disabled:opacity-30"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {requiereBanco && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <input
            type="text"
            value={pago.tx_nombco}
            onChange={(e) => onUpdate({ ...pago, tx_nombco: e.target.value })}
            placeholder="Banco"
            className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#546C4C]"
          />
          <input
            type="text"
            value={pago.tx_ctanro}
            onChange={(e) => onUpdate({ ...pago, tx_ctanro: e.target.value })}
            placeholder="N.° cuenta"
            className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#546C4C]"
          />
          <input
            type="text"
            value={pago.tx_referen}
            onChange={(e) => onUpdate({ ...pago, tx_referen: e.target.value })}
            placeholder="Referencia"
            className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#546C4C]"
          />
          {pago.tx_formpg === "TC" && (
            <input
              type="text"
              value={pago.tx_aprobado}
              onChange={(e) => onUpdate({ ...pago, tx_aprobado: e.target.value })}
              placeholder="N.° aprobación"
              className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#546C4C]"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default FilaPago;

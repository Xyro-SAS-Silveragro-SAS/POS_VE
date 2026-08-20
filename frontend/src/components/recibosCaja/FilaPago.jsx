import { Trash2, Banknote, ArrowLeftRight, CreditCard, Landmark } from "lucide-react";
import NumInput from "./NumInput";
import { MEDIOS_PAGO, MANEJOS_CHEQUE } from "./utilsRecibos";

const ICONOS_MEDIO_PAGO = { EF: Banknote, CO: ArrowLeftRight, TC: CreditCard, CH: Landmark };

const FilaPago = ({ pago, onUpdate, onRemove, canRemove, cuentasEfectivo = [], cuentasBancos = [], tarjetas = [], bancos = [] }) => {
  const label = MEDIOS_PAGO.find((m) => m.codigo === pago.tx_formpg)?.label;
  const Icono = ICONOS_MEDIO_PAGO[pago.tx_formpg];
  const hoyISO = new Date().toISOString().slice(0, 10);

  const handleSeleccionarCuentaEfectivo = (codigo) => {
    const cuenta = cuentasEfectivo.find((c) => c.Codigo === codigo);
    onUpdate({ ...pago, tx_banco: codigo, tx_nombco: cuenta?.Nombre || "" });
  };

  const handleSeleccionarCuentaBanco = (codigo) => {
    const cuenta = cuentasBancos.find((b) => b.Codigo === codigo);
    onUpdate({ ...pago, tx_banco: codigo, tx_nombco: cuenta?.Nombre || "" });
  };

  const handleSeleccionarTarjeta = (codigo) => {
    const tarjeta = tarjetas.find((t) => String(t.Codigo) === codigo);
    onUpdate({ ...pago, tx_banco: tarjeta?.Cuenta || "", tx_nombco: tarjeta?.Nombre || "" });
  };

  const handleSeleccionarCuentaCheque = (codigo) => {
    const cuenta = cuentasEfectivo.find((c) => c.Codigo === codigo);
    onUpdate({ ...pago, tx_ctaefec: codigo, tx_nomctaefec: cuenta?.Nombre || "" });
  };

  const handleSeleccionarBancoCheque = (codigo) => {
    const banco = bancos.find((b) => b.Codigo === codigo);
    onUpdate({ ...pago, tx_banco: codigo, tx_nombco: banco?.Nombre || "" });
  };

  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 space-y-2">
      <div className="flex items-start gap-2">
        <div className="flex w-32 shrink-0 items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-sm font-medium text-stone-700">
          {Icono && <Icono size={14} className="shrink-0 text-[#546C4C]" />}
          <span className="truncate">{label}</span>
        </div>
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

      {pago.tx_formpg === "EF" && (
        <select
          value={pago.tx_banco}
          onChange={(e) => handleSeleccionarCuentaEfectivo(e.target.value)}
          className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#546C4C]"
        >
          <option value="">Selecciona la cuenta de efectivo</option>
          {cuentasEfectivo.map((c) => (
            <option key={c.Codigo} value={c.Codigo}>{c.Codigo} - {c.Nombre}</option>
          ))}
        </select>
      )}

      {pago.tx_formpg === "CO" && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <select
            value={pago.tx_banco}
            onChange={(e) => handleSeleccionarCuentaBanco(e.target.value)}
            className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#546C4C]"
          >
            <option value="">Selecciona el banco</option>
            {cuentasBancos.map((b) => (
              <option key={b.Codigo} value={b.Codigo}>{b.Codigo} - {b.Nombre}</option>
            ))}
          </select>
          <input
            type="date"
            value={pago.fe_venc}
            onChange={(e) => onUpdate({ ...pago, fe_venc: e.target.value })}
            className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#546C4C]"
          />
          <input
            type="text"
            value={pago.tx_referen}
            onChange={(e) => onUpdate({ ...pago, tx_referen: e.target.value })}
            placeholder="Referencia"
            className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#546C4C]"
          />
        </div>
      )}

      {pago.tx_formpg === "TC" && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <select
            value={tarjetas.find((t) => t.Nombre === pago.tx_nombco)?.Codigo ?? ""}
            onChange={(e) => handleSeleccionarTarjeta(e.target.value)}
            className="col-span-2 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#546C4C] sm:col-span-1"
          >
            <option value="">Selecciona la tarjeta</option>
            {tarjetas.map((t) => (
              <option key={t.Codigo} value={t.Codigo}>{t.Nombre}</option>
            ))}
          </select>
          <input
            type="text"
            value={pago.tx_ctanro}
            onChange={(e) => onUpdate({ ...pago, tx_ctanro: e.target.value })}
            placeholder="N.° tarjeta"
            className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#546C4C]"
          />
          <input
            type="date"
            value={pago.fe_venc}
            min={hoyISO}
            onChange={(e) => onUpdate({ ...pago, fe_venc: e.target.value })}
            className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#546C4C]"
          />
          <input
            type="text"
            value={pago.tx_referen}
            onChange={(e) => onUpdate({ ...pago, tx_referen: e.target.value })}
            placeholder="Voucher"
            className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#546C4C]"
          />
        </div>
      )}

      {pago.tx_formpg === "CH" && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <select
            value={pago.tx_ctaefec}
            onChange={(e) => handleSeleccionarCuentaCheque(e.target.value)}
            className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#546C4C]"
          >
            <option value="">Selecciona la cuenta</option>
            {cuentasEfectivo.map((c) => (
              <option key={c.Codigo} value={c.Codigo}>{c.Codigo} - {c.Nombre}</option>
            ))}
          </select>
          <select
            value={pago.tx_banco}
            onChange={(e) => handleSeleccionarBancoCheque(e.target.value)}
            className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#546C4C]"
          >
            <option value="">Selecciona el banco</option>
            {bancos.map((b) => (
              <option key={b.Codigo} value={b.Codigo}>{b.Codigo} - {b.Nombre}</option>
            ))}
          </select>
          <input
            type="text"
            value={pago.tx_referen}
            onChange={(e) => onUpdate({ ...pago, tx_referen: e.target.value })}
            placeholder="N.° cheque"
            className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#546C4C]"
          />
          <input
            type="text"
            value={pago.tx_ctanro}
            onChange={(e) => onUpdate({ ...pago, tx_ctanro: e.target.value })}
            placeholder="Cuenta cheque"
            className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#546C4C]"
          />
          <input
            type="text"
            value={pago.tx_aprobado}
            onChange={(e) => onUpdate({ ...pago, tx_aprobado: e.target.value })}
            placeholder="Aprobado"
            className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#546C4C]"
          />
          <input
            type="text"
            value={pago.tx_centralriesgo}
            onChange={(e) => onUpdate({ ...pago, tx_centralriesgo: e.target.value })}
            placeholder="Central riesgo"
            className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#546C4C]"
          />
          <select
            value={pago.tx_manejo}
            onChange={(e) => onUpdate({ ...pago, tx_manejo: e.target.value })}
            className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#546C4C]"
          >
            {MANEJOS_CHEQUE.map((m) => (
              <option key={m.codigo} value={m.codigo}>{m.label}</option>
            ))}
          </select>
          <input
            type="date"
            value={pago.fe_venc}
            min={hoyISO}
            onChange={(e) => onUpdate({ ...pago, fe_venc: e.target.value })}
            className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#546C4C]"
          />
        </div>
      )}
    </div>
  );
};

export default FilaPago;

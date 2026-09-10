import { Trash2 } from "lucide-react";
import NumInput from "./NumInput";
import { currency, DESCUENTOS } from "./utilsRecibos";
import Funciones from "../../helpers/Funciones";

// Se ocultan temporalmente los demás porcentajes de descuento, solo se deja disponible el 3%.
const DESCUENTOS_VISIBLES = DESCUENTOS.filter((d) => d === 3);

const FilaFactura = ({ fila, onUpdate, onRemove }) => {
  const esNotaCredito = fila.tx_tipodoc === "NC";
  const esPagoRecibido = fila.tx_tipodoc === "PR";
  const sinDescuento = esNotaCredito || esPagoRecibido;

  const toggleParcial = () => {
    if (fila.esParcial) {
      onUpdate({ ...fila, esParcial: false, db_prcdto: 0, db_vlrdto: 0, db_vlrpag: fila.db_saldo });
    } else {
      onUpdate({ ...fila, esParcial: true, db_prcdto: 0, db_vlrdto: 0, db_vlrpag: 0 });
    }
  };

  // El pago recibido siempre resta (valor negativo) y no puede superar el tope de la línea
  // (su saldo original). NumInput solo entrega magnitudes positivas, por eso se invierte el signo aquí.
  const handleValorPagoRecibido = (magnitud) => {
    const tope = Math.abs(fila.db_saldo);
    if (magnitud > tope) {
      Funciones.alerta("Atención", `El valor de este pago recibido no puede superar el tope de la línea: ${currency(tope)}.`, "warning");
      onUpdate({ ...fila, db_vlrpag: fila.db_saldo });
      return;
    }
    onUpdate({ ...fila, db_vlrpag: -magnitud });
  };

  const checkboxParcial = esNotaCredito ? (
    <span className="text-xs text-stone-400">N/A</span>
  ) : (
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
      <span className="block text-[11px] text-stone-400">Entrega: {fila.fe_fechadespacho || "N/A"}</span>
      <span className="block text-[11px] text-stone-400">Saldo: {currency(fila.db_saldo)}</span>
    </div>
  );

  // El select fija un % predefinido y calcula su valor en pesos; el campo de abajo permite
  // escribir directamente el valor en pesos del descuento y de ahí se calcula el % equivalente.
  // En ambos casos db_vlrpag (fuente de verdad) se recalcula igual.
  const aplicarDescuentoPorPorcentaje = (db_prcdto) => {
    const db_vlrdto = Math.round((fila.db_saldofra * db_prcdto) / 100);
    onUpdate({ ...fila, db_prcdto, db_vlrdto, db_vlrpag: Math.round(fila.db_saldo - db_vlrdto) });
  };

  const aplicarDescuentoPorValor = (db_vlrdto) => {
    const db_prcdto = fila.db_saldofra ? Math.round((db_vlrdto / fila.db_saldofra) * 10000) / 100 : 0;
    onUpdate({ ...fila, db_prcdto, db_vlrdto, db_vlrpag: Math.round(fila.db_saldo - db_vlrdto) });
  };

  const selectDescuento = (className = "") =>
    sinDescuento ? (
      <span className="block w-full text-right text-sm text-stone-400">N/A</span>
    ) : (
      <div className="space-y-1">
        <select
          value={fila.db_prcdto}
          onChange={(e) => aplicarDescuentoPorPorcentaje(Number(e.target.value))}
          disabled={fila.esParcial}
          className={`w-full bg-transparent text-sm outline-none text-right ${className} disabled:cursor-not-allowed disabled:text-stone-400`}
        >
          <option value="">Sin descuento</option>
          {DESCUENTOS_VISIBLES.map((d) => (
            <option key={d} value={d}>{d === 0 ? "Sin descuento" : `${d}%`}</option>
          ))}
        </select>
        <NumInput
          value={fila.db_vlrdto}
          onChange={aplicarDescuentoPorValor}
          disabled={fila.esParcial}
          placeholder="Valor descuento"
          className="w-full rounded border border-stone-200 bg-white px-1.5 py-0.5 text-xs text-right"
        />
      </div>
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
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-stone-400 mb-0.5">Subtotal factura</span>
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

        <div className="flex items-center justify-between rounded-lg border border-[#546C4C]/40 bg-white px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">Valor a pagar</span>
          {esNotaCredito ? (
            <span className="text-base font-bold text-[#546C4C]">{currency(fila.db_vlrpag)}</span>
          ) : (
            <NumInput
              value={fila.db_vlrpag}
              onChange={esPagoRecibido ? handleValorPagoRecibido : (v) => onUpdate({ ...fila, db_vlrpag: v })}
              className="w-28 text-right text-base font-bold text-[#546C4C]"
            />
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

        <div className="flex items-center justify-end rounded-lg border border-[#546C4C]/40 bg-white px-2 py-1.5">
          {esNotaCredito ? (
            <span className="text-sm font-semibold text-[#546C4C]">{currency(fila.db_vlrpag)}</span>
          ) : (
            <NumInput
              value={fila.db_vlrpag}
              onChange={esPagoRecibido ? handleValorPagoRecibido : (v) => onUpdate({ ...fila, db_vlrpag: v })}
              className="text-right text-sm font-semibold text-[#546C4C]"
            />
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

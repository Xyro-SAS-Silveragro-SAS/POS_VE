export const currency = (valor) =>
  `$${new Intl.NumberFormat("es-CO").format(Math.round(Number(valor) || 0))}`;

export const DESCUENTOS = [0, 3];

export const MEDIOS_PAGO = [
  { codigo: "EF", label: "Efectivo" },
  { codigo: "CO", label: "Transferencia" },
  { codigo: "TC", label: "Tarjeta" },
  { codigo: "CH", label: "Cheque" },
];

const TIPOS_DOC = { Factura: "FAC", "Nota Crédito": "NC", "Nota Débito": "ND" };

export const facturaVacia = (raw) => {
  const saldo = Number(raw.saldo ?? raw.db_saldofra ?? raw.Saldo ?? 0);
  const tipoDocCrudo = raw.tipoDoc ?? raw.tx_tipodoc ?? "Factura";
  return {
    _key: `${raw.nroDoc ?? raw.in_nrosap ?? ""}`,
    tx_tipodoc: TIPOS_DOC[tipoDocCrudo] ?? tipoDocCrudo,
    in_clavesap: raw.claveSap ?? raw.in_clavesap ?? raw.DocEntry ?? 0,
    in_nrosap: raw.nroDoc ?? raw.in_nrosap ?? raw.DocNum ?? "",
    fe_fechadoc: raw.fechaDoc ?? raw.fe_fechadoc ?? raw.DocDate ?? "",
    fe_fechaven: raw.fechaVen ?? raw.fe_fechaven ?? raw.DocDueDate ?? "",
    db_saldofra: saldo,
    esParcial: false,
    db_prcdto: 0,
    db_vlrdto: 0,
    db_vlrpag: saldo,
  };
};

export const calcularDescuentoFactura = (fila) =>
  Math.round((fila.db_saldofra * fila.db_prcdto) / 100);

export const calcularValorAPagar = (fila) =>
  fila.esParcial ? fila.db_vlrpag : fila.db_saldofra - calcularDescuentoFactura(fila);

export const pagoVacio = (tipo = "EF") => ({
  _key: crypto.randomUUID(),
  tx_formpg: tipo,
  tx_banco: "",
  tx_nombco: "",
  tx_ctanro: "",
  fe_venc: new Date().toISOString().slice(0, 10),
  db_vlrpag: 0,
  tx_referen: "",
  tx_aprobado: "",
});

export const currency = (valor) =>
  `$${new Intl.NumberFormat("es-CO").format(Math.round(Number(valor) || 0))}`;

export const DESCUENTOS = [3, 4, 5, 7.85];

export const MEDIOS_PAGO = [
  { codigo: "EF", label: "Efectivo" },
  { codigo: "CO", label: "Consignación" },
  { codigo: "TC", label: "Tarjeta" },
  { codigo: "CH", label: "Cheque" },
];

const TIPOS_DOC = { Factura: "FAC", "Nota Crédito": "NC", "Nota Débito": "ND" };

const soloFecha = (valor) => (valor ? String(valor).slice(0, 10) : "");

export const facturaVacia = (raw) => {
  // db_saldofra se calculaba contra el saldo de la factura por error; el cálculo
  // real de descuento/valor a pagar debe hacerse contra el subtotal. Se conserva
  // el nombre db_saldofra porque el backend de recibos ya espera esa clave.
  const subtotal = Number(raw.subtotal ?? raw.db_saldofra ?? 0);
  const tipoDocCrudo = raw.tipoDoc ?? raw.tx_tipodoc ?? "Factura";
  const fechaDoc = soloFecha(raw.fechaDoc ?? raw.fe_fechadoc ?? raw.DocDate);
  return {
    _key: `${raw.nroDoc ?? raw.in_nrosap ?? ""}`,
    tx_tipodoc: TIPOS_DOC[tipoDocCrudo] ?? tipoDocCrudo,
    in_clavesap: raw.docEntry ?? raw.claveSap ?? raw.in_clavesap ?? raw.DocEntry ?? 0,
    in_nrosap: raw.nroDoc ?? raw.in_nrosap ?? raw.DocNum ?? "",
    fe_fechadoc: fechaDoc,
    fe_fechaven: soloFecha(raw.fechaVen ?? raw.fe_fechaven ?? raw.DocDueDate) || fechaDoc,
    fe_fechadespacho: soloFecha(raw.fechaDespacho ?? raw.FechaDespacho ?? raw.fecha_despacho ?? raw.U_Fecha_Despacho),
    db_saldo: Number(raw.saldo ?? raw.Saldo ?? 0),
    db_saldofra: subtotal,
    esParcial: false,
    db_prcdto: 0,
    db_vlrdto: 0,
    db_vlrpag: subtotal,
  };
};

export const calcularDescuentoFactura = (fila) =>
  Math.round((fila.db_saldofra * fila.db_prcdto) / 100);

export const calcularValorAPagar = (fila) =>
  fila.esParcial ? fila.db_vlrpag : fila.db_saldofra - calcularDescuentoFactura(fila);

export const MANEJOS_CHEQUE = [
  { codigo: "DIA", label: "Al Día" },
  { codigo: "POST", label: "Postfechado" },
  { codigo: "CR", label: "Central de Riesgo" },
];

export const pagoVacio = (tipo = "EF") => ({
  _key: crypto.randomUUID(),
  tx_formpg: tipo,
  tx_banco: "",
  tx_nombco: "",
  tx_ctanro: "",
  tx_ctaefec: "",
  tx_nomctaefec: "",
  fe_venc: new Date().toISOString().slice(0, 10),
  db_vlrpag: 0,
  tx_referen: "",
  tx_aprobado: "",
  tx_centralriesgo: "",
  tx_manejo: tipo === "CH" ? "DIA" : "",
});

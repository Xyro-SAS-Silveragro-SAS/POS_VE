import { UPLOAD_FILE_URL, CARPETA_ARCHIVO, ARCHIVOS_BASE_URL } from "../../config/config.jsx";

export const MAX_COMPROBANTE_MB = 5;

// tx_imagen guarda un JSON.stringify con uno o varios archivos: [{ fileName, folder, path }].
// Se mantiene compatibilidad con recibos antiguos donde tx_imagen era solo el nombre del archivo.
export const parseArchivosExistentes = (txImagen) => {
  if (!txImagen) return [];
  try {
    const parsed = JSON.parse(txImagen);
    const lista = Array.isArray(parsed) ? parsed : [parsed];
    return lista.filter((item) => item && (item.fileName || item.path));
  } catch {
    return [{ fileName: txImagen, folder: CARPETA_ARCHIVO, path: `${ARCHIVOS_BASE_URL}/${CARPETA_ARCHIVO}/${txImagen}` }];
  }
};

// Envía uno o varios archivos al endpoint de carga y retorna el arreglo "files"
// de la respuesta ({ fileName, folder, path } por cada archivo), sin el "success".
export const subirComprobantes = async (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  formData.append("carpeta", CARPETA_ARCHIVO);

  const response = await fetch(UPLOAD_FILE_URL, { method: "POST", body: formData });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data?.success || !Array.isArray(data.files) || !data.files.length || data.files.some((f) => !f.success)) {
    throw new Error(data?.message || data?.error || "No se pudo subir el comprobante de pago.");
  }

  return data.files.map(({ success, ...archivo }) => archivo);
};

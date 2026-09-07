import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import TopBar from "../../components/global/TopBar";
import Funciones from "../../helpers/Funciones";
import { Download, FileSpreadsheet, UploadCloud, X } from "lucide-react";
import plantilla from "../../assets/plantilla.csv?url";
import { N8N_CARGA_MASIVA_URL } from "../../config/config.jsx";
import { useAuth } from "../../context/AuthContext";
import { useConnection } from "../../context/ConnectionContext";
import { db } from "../../db/db";
import api from "../../services/apiService";

const EXTENSIONES_VALIDAS = [".xlsx", ".xls"];

const TIPOS_ENVIO = {
  1: "distribucion",
  2: "remesado",
  3: "bodega",
};

const CargaMasiva = () => {
  const { currentUser } = useAuth();
  const { isOnline } = useConnection();
  const navigate = useNavigate();
  const location = useLocation();
  const tipoProceso = location.state?.tipoProceso || localStorage.getItem('tipoProceso') || 'pedidos';
  const bodHeader = localStorage.getItem('bodega') || '0';
  const [archivo, setArchivo] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const inputRef = useRef(null);

  const esArchivoValido = (file) => {
    const nombre = file.name.toLowerCase();
    return EXTENSIONES_VALIDAS.some((ext) => nombre.endsWith(ext));
  };

  const seleccionarArchivo = (file) => {
    if (!file) return;
    if (!esArchivoValido(file)) {
      Funciones.alerta("Archivo no válido", "Solo se permiten archivos de Excel (.xlsx o .xls).", "error");
      return;
    }
    setArchivo(file);
  };

  const handleInputChange = (e) => {
    seleccionarArchivo(e.target.files[0]);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    seleccionarArchivo(e.dataTransfer.files[0]);
  };

  const handleQuitarArchivo = () => {
    setArchivo(null);
  };

  const handleDescargarPlantilla = () => {
    const link = document.createElement("a");
    link.href = plantilla;
    link.download = "plantilla.csv";
    link.click();
  };

  const handleIniciarCargue = async () => {
    if (!archivo) return;
    setProcesando(true);
    try {
      const formData = new FormData();
      formData.append("file", archivo);
      formData.append("in_tipo", tipoProceso);
      formData.append("tx_cod_alm_pos", bodHeader);
      formData.append("tx_usua", currentUser ? currentUser.cd_sap : '');
      formData.append("tx_nom_emp", currentUser ? currentUser.tx_empleado_sap : '');
      formData.append("tx_usuario_logueado", currentUser ? currentUser.id_usuario : '');

      const response = await fetch(N8N_CARGA_MASIVA_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      const pedidos = await response.json();

      if (!Array.isArray(pedidos) || pedidos.length === 0) {
        Funciones.alerta("Sin pedidos", "El archivo no generó ningún pedido válido para importar.", "info");
        return;
      }

      let sincronizados = 0;
      let conError = 0;

      for (const pedido of pedidos) {
        const { cabecera, lineas } = pedido;
        if (!cabecera) continue;

        const cabeceraNueva = { ...cabecera, sync: 0, masivo: 1 };
        cabeceraNueva.U_Tipoenvio = TIPOS_ENVIO[cabeceraNueva.U_Tipoenvio] || cabeceraNueva.U_Tipoenvio;
        delete cabeceraNueva.id;
        const idLocal = await db.cabeza.add(cabeceraNueva);

        const lineasNuevas = (lineas || []).map((linea) => {
          const lineaNueva = { ...linea, in_id_cabeza: idLocal, sync: 0 };
          delete lineaNueva.id;
          return lineaNueva;
        });

        if (lineasNuevas.length > 0) {
          await db.lineas.bulkAdd(lineasNuevas);
        }

        if (isOnline) {
          const dataSincroniza = {
            identificador: cabecera.id_consec || '',
            tx_contenido: {
              cabecera: { ...cabeceraNueva, id: idLocal },
              lineas: lineasNuevas,
            },
          };

          const items = await api.post('api/ventaExterna/capturarPedido', dataSincroniza);

          if (items.continuar === 1) {
            await db.cabeza.update(idLocal, { sync: 1, DocEntry: items.DocEntry, DocNum: items.DocNum, in_estado: items.in_estado, tx_comentarios: items.tx_comentarios });
            sincronizados++;
          } else {
            await db.cabeza.update(idLocal, { sync: 0, DocEntry: items.DocEntry, DocNum: items.DocNum, in_estado: items.in_estado, tx_comentarios: items.tx_comentarios });
            conError++;
          }
        }
      }

      const irAHome = () => navigate('/home');

      if (!isOnline) {
        Funciones.alerta("Archivo procesado", `Se guardaron ${pedidos.length} pedido(s) localmente. Se sincronizarán cuando haya conexión a internet.`, "success", irAHome);
      } else if (conError > 0) {
        Funciones.alerta("Archivo procesado", `${sincronizados} pedido(s) sincronizado(s) correctamente y ${conError} con error de sincronización.`, "info", irAHome);
      } else {
        Funciones.alerta("Archivo procesado", `${sincronizados} pedido(s) sincronizado(s) correctamente.`, "success", irAHome);
      }

      setArchivo(null);
    } catch (error) {
      console.error("Error al enviar el archivo de carga masiva:", error);
      Funciones.alerta("Error", "No se pudo enviar el archivo. Por favor, intenta nuevamente.", "error");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      <TopBar showSimple={true} />
      <div className="w-full md:p-10 m-auto lg:w-[54%] mb-[10%] mt-[20%] lg:mt-[5%] md:mt-[13%] flex flex-wrap text-gray-700 relative">
        <div className="w-full px-[5%] lg:px-[3%] mb-4">
          <h1 className="text-2xl font-bold mb-2">Carga Masiva</h1>
          <p className="text-gray-500 mb-6">
            Sube un archivo de Excel con tus productos y cantidades para generar un pedido de forma rápida, sin necesidad de agregarlos uno por uno.
          </p>

          {/* Zona de carga */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200 ${
                isDragging ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-green-500 hover:bg-gray-50"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleInputChange}
              />

              {!archivo ? (
                <>
                  <UploadCloud className="text-gray-400 mb-3" size={40} />
                  <p className="font-semibold text-gray-700">Arrastra tu archivo aquí o haz clic para seleccionarlo</p>
                  <p className="text-sm text-gray-400 mt-1">Formatos permitidos: .xlsx, .xls</p>
                </>
              ) : (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-3 bg-gray-100 px-4 py-3 rounded-lg w-full max-w-md"
                >
                  <FileSpreadsheet className="text-green-600 shrink-0" size={28} />
                  <span className="text-sm text-gray-700 truncate flex-1 text-left">{archivo.name}</span>
                  <button onClick={handleQuitarArchivo} className="text-gray-400 hover:text-red-600" aria-label="Quitar archivo">
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="mt-6 flex flex-col md:flex-row gap-3 md:justify-between">
              <button
                onClick={handleDescargarPlantilla}
                className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-6 rounded-lg transition-colors duration-200"
              >
                <Download size={18} />
                Descargar plantilla
              </button>
              <button
                onClick={handleIniciarCargue}
                disabled={!archivo || procesando}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <UploadCloud size={18} />
                {procesando ? "Procesando..." : "Iniciar proceso de cargue"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CargaMasiva;

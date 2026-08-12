import { useState } from "react";
import {
  Building2
} from "lucide-react";
import logo from "../assets/logo.png";

import useSilveragroLogin from "../hooks/useSilveragroLogin";
import LoginButton from "../componentes/LoginButton";
import NuevoReciboModal from "../componentes/NuevoReciboModal";
import PanelUsuarios  from "../componentes/panelUsuarios";
import PanelAdmins    from "../componentes/PanelAdmins";
import "../App.css";

// ---------------------------------------------------------------------------
// Auth config
// ---------------------------------------------------------------------------
const PERFILES_ADMIN = import.meta.env.VITE_PERFILES_ADMIN?.split(",") || ["-1", "1", "31"];


// ---------------------------------------------------------------------------
// App principal
// ---------------------------------------------------------------------------
export default function RecibosCajaApp() {

  const [modalOpen, setModalOpen] = useState(false);
  const [reciboVersion, setReciboVersion] = useState(0);
  const { usuario, login, logout, estaLogueado } = useSilveragroLogin();
  const userIsAdmin = usuario ? PERFILES_ADMIN.includes(String(usuario.in_perfil)) : false;

  async function handleLogin() {
    try {
      await login("Recibos de caja");
    } catch (err) {
      if (err.message !== "Popup cerrado por el usuario") alert("Error al iniciar sesión");
    }
  }

  


  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      {/* Header */}
      <header className="border-b border-gray-700" style={{ backgroundColor: "#546C4C" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img
              src={logo}
              alt="Silveragro"
              className="h-6 sm:h-8 shrink-0 object-contain"
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <div className="min-w-0">
              <h1 className="text-white text-sm sm:text-xl font-bold tracking-wide leading-tight">SARA</h1>
              <p className="text-white/70 text-[10px] sm:text-xs leading-tight">
                <span className="sm:hidden">Abonos, Recibos y Aplicaciones</span>
                <span className="hidden sm:inline">Sistema de Abonos, Recibos y Aplicaciones</span>
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {estaLogueado ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-right text-white hidden sm:block">
                  <p className="text-sm font-medium">{usuario?.tx_usuario || "Usuario"}</p>
                  <p className="text-xs opacity-80">{userIsAdmin ? "Administrador" : "Comercial"}</p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="cursor-pointer bg-white text-[#546C4C] text-xs sm:text-sm font-medium px-3 py-2 rounded-md"
                >
                  <span className="hidden sm:inline">Cerrar sesión</span>
                  <span className="sm:hidden">Salir</span>
                </button>
              </div>
            ) : (
              <LoginButton onClick={handleLogin} />
            )}
          </div>
        </div>
      </header>

      {/* Contenido */}
        

        {estaLogueado ? (
          <main className="m-auto max-w-7xl p-8 bg-white mt-4">

            {userIsAdmin ? (
              <PanelAdmins usuario={usuario}/>
            ):(
              <PanelUsuarios setModalOpen={setModalOpen} usuario={usuario} refreshKey={reciboVersion} />
            )}

          </main>

        ): (
          
          <main className="m-auto w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 items-center flex justify-center">
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <div className="max-w-md mx-auto">
                  <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Acceso requerido</h3>
                  <p className="text-gray-600 mb-6">
                    Para acceder a la esta zona,
                    debe iniciar sesión con sus credenciales de Silveragro.
                  </p>
                  
                </div>
              </div>
            </div>
          </main>
        )}


      <NuevoReciboModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onReciboCreado={() => setReciboVersion((v) => v + 1)}
        usuario={usuario}
      />
    </div>
  );
}

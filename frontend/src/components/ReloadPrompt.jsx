import { useEffect, useState } from 'react'

// Cada cuánto se consulta al servidor si hay una versión nueva (sw.js cambió)
const INTERVALO_REVISION_MS = 5 * 60 * 1000

/**
 * Registra el Service Worker y muestra un aviso cuando se publica una versión nueva.
 *
 * El SW generado por vite-plugin-pwa (registerType: 'autoUpdate') hace skipWaiting + clientsClaim:
 * cuando detecta archivos nuevos en el servidor los descarga y toma el control de la página.
 * En ese momento la página sigue ejecutando el código viejo, así que avisamos al usuario
 * para que recargue cuando quiera (sin perder lo que esté digitando).
 */
function ReloadPrompt() {
  const [hayNuevaVersion, setHayNuevaVersion] = useState(false)

  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return

    // Si no había SW controlando, el primer controllerchange es la instalación inicial, no una actualización
    let teniaControlador = !!navigator.serviceWorker.controller
    let intervalo
    let registro

    const onControllerChange = () => {
      if (teniaControlador) {
        setHayNuevaVersion(true)
      }
      teniaControlador = true
    }

    const revisarActualizacion = () => {
      if (registro && navigator.onLine && document.visibilityState === 'visible') {
        registro.update().catch(() => {})
      }
    }

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)
    document.addEventListener('visibilitychange', revisarActualizacion)

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((r) => {
        registro = r
        intervalo = setInterval(revisarActualizacion, INTERVALO_REVISION_MS)
      })
      .catch((error) => console.log('Error al registrar SW:', error))

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
      document.removeEventListener('visibilitychange', revisarActualizacion)
      clearInterval(intervalo)
    }
  }, [])

  if (!hayNuevaVersion) return null

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[9999] flex items-center gap-3 rounded-lg bg-[#546C4C] px-4 py-3 text-white shadow-lg">
      <button
        type="button"
        className="flex-1 text-left font-medium cursor-pointer"
        onClick={() => window.location.reload()}
      >
        Hay una nueva versión. <span className="underline">Click acá para actualizar</span>
      </button>
      <button
        type="button"
        aria-label="Cerrar"
        className="rounded px-2 text-lg leading-none hover:bg-[#3e5038] cursor-pointer"
        onClick={() => setHayNuevaVersion(false)}
      >
        ×
      </button>
    </div>
  )
}

export default ReloadPrompt

import { useRegisterSW } from 'virtual:pwa-register/react'
import { useState, useEffect } from 'react'

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW registrado: ' + r)
    },
    onRegisterError(error) {
      console.log('Error al registrar SW:', error)
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div className="ReloadPrompt-container">
      {(offlineReady || needRefresh) && (
        <div className="ReloadPrompt-toast">
          <div className="ReloadPrompt-message">
            {offlineReady ? (
              <span>¡App lista para trabajar sin conexión!</span>
            ) : (
              <span>Hay una nueva versión disponible</span>
            )}
          </div>
          {needRefresh && (
            <button
              className="ReloadPrompt-refresh"
              onClick={() => updateServiceWorker(true)}
            >
              Actualizar
            </button>
          )}
          <button className="ReloadPrompt-close" onClick={() => close()}>
            Cerrar
          </button>
        </div>
      )}
    </div>
  )
}

export default ReloadPrompt
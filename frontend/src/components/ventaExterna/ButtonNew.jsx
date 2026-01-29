import { useState, useEffect } from "react"
const ButtonNew = ({nuevoProceso=null, titulo=null,toggleClientes=null,toggleProductos=null, navigate=null}) => {
    const [mostrarMenuFAB, setMostrarMenuFAB] = useState(false)
    const [showReportButton, setShowReportButton] = useState(false)

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch('https://n8n.srv1097949.hstgr.cloud/webhook/configPOSVE');
                if (!response.ok) {
                    setShowReportButton(false);
                    return;
                }
                const data = await response.json();
                if (data && data.botonInforme === true) {
                    setShowReportButton(true);
                } else {
                    setShowReportButton(false);
                }
            } catch {
                setShowReportButton(false);
            }
        };
        fetchConfig();
    }, []);
    // Función para alternar el menú FAB
    const toggleMenuFAB = () => {
        setMostrarMenuFAB(!mostrarMenuFAB)
    }
    // Funciones para manejar cada opción
    const handleNuevo = () => {
        nuevoProceso('')
        setMostrarMenuFAB(false)
    }

    const handleClientes = () => {
        toggleClientes()
        setMostrarMenuFAB(false)
    }

    const handleProductos = () => {
        toggleProductos()
        setMostrarMenuFAB(false)
    }

    const handleReporte = () => {
        navigate && navigate('/reporte-estados')
        setMostrarMenuFAB(false)
    }

    return (
        <>
            {/* Overlay para cerrar el menú al hacer clic fuera */}
            {mostrarMenuFAB && (
                <div 
                className="fixed inset-0 z-40" 
                onClick={() => setMostrarMenuFAB(false)}
                ></div>
            )}

            {/* Botones secundarios del FAB */}
            <div className={`fixed bottom-36 right-5 z-50 transition-all duration-300 ${
                mostrarMenuFAB ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`}>
                {/* Botón Estado Pedidos - Solo visible cuando titulo es Pedidos y showReportButton es true */}
                {titulo === 'Pedidos' && showReportButton && (
                    <div className="flex items-center mb-4">
                        <span className="bg-gray-800 text-white px-3 py-1 rounded-lg text-sm mr-3 shadow-lg whitespace-nowrap">
                            Estado Pedidos
                        </span>
                        <button
                            onClick={handleReporte}
                            className="p-3 bg-green-600 hover:bg-green-700 rounded-full shadow-lg transition-colors duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="size-6">
                                <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clipRule="evenodd" />
                                <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
                            </svg>
                        </button>
                    </div>
                )}
                
                {/* Botón Productos */}
                <div className="flex items-center mb-4">
                <span className="bg-gray-800 text-white px-3 py-1 rounded-lg text-sm mr-3 shadow-lg whitespace-nowrap">
                    Productos
                </span>
                <button
                    onClick={handleProductos}
                    className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg transition-colors duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-package-icon lucide-package"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/></svg>

                </button>
                </div>

                {/* Botón Clientes */}
                <div className="flex items-center mb-4">
                <span className="bg-gray-800 text-white px-3 py-1 rounded-lg text-sm mr-3 shadow-lg whitespace-nowrap">
                    Clientes
                </span>
                <button
                    onClick={handleClientes}
                    className="p-3 bg-green-600 hover:bg-green-700 rounded-full shadow-lg transition-colors duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="size-6">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                    </svg>
                </button>
                </div>

                {/* Botón Nuevo */}
                <div className="flex items-center mb-4">
                <span className="bg-gray-800 text-white px-3 py-1 rounded-lg text-sm mr-3 shadow-lg whitespace-nowrap">
                    Nuevo {(titulo === 'Pedidos') ? 'pedido':'cotización'}
                </span>
                <button
                    onClick={handleNuevo}
                    className="p-3 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg transition-colors duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="size-6">
                    <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                    </svg>
                </button>
                </div>
            </div>

            {/* Botón principal FAB */}
            <button 
                onClick={toggleMenuFAB}
                className={`fixed bottom-20 p-4 cursor-pointer rounded-full right-5 z-50 bg-red-600 hover:bg-red-700 shadow-lg transition-all duration-300 botonAgregaNueva ${
                mostrarMenuFAB ? 'rotate-45' : 'rotate-0'
                }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="size-10">
                <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                </svg>
            </button>
        </>
    )
}

export default ButtonNew;
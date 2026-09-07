import logo from "../../assets/img/logo.png"
import { useState, useEffect, useRef } from "react"
import ConnectionAlert from "./ConnectionAlert"
import { useAuth } from "../../context/AuthContext"
import { VERSION } from "../../config/config.jsx"
import { ArrowLeft, ChevronDown, Receipt, LogOut, User } from "lucide-react"
import { useNavigate } from "react-router-dom"

const TopBar = ({ startTour = null, showSimple = false }) => {
    const [online, setStatus] = useState(navigator.onLine);
    const { currentUser, logout } = useAuth();
    const [bodHeader, setBodHeader] = useState(localStorage.getItem('bodega') || '0');
    const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
    const menuUsuarioRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const cerrarSiClickAfuera = (e) => {
            if (menuUsuarioRef.current && !menuUsuarioRef.current.contains(e.target)) {
                setMenuUsuarioAbierto(false);
            }
        };
        document.addEventListener('mousedown', cerrarSiClickAfuera);
        return () => document.removeEventListener('mousedown', cerrarSiClickAfuera);
    }, []);

    const handleIrRecibosCaja = () => {
        setMenuUsuarioAbierto(false);
        navigate('/recibos-caja');
    };

    const handleLogout = () => {
        setMenuUsuarioAbierto(false);
        logout();
        navigate('/login');
    };

    useEffect(() => {
        // Función para actualizar el estado
        const handleOnlineStatusChange = () => {
            setStatus(navigator.onLine);
        };

        // Establecer el estado inicial
        setStatus(navigator.onLine);

        // Agregar event listeners para detectar cambios
        window.addEventListener('online', handleOnlineStatusChange);
        window.addEventListener('offline', handleOnlineStatusChange);

        // Limpiar event listeners al desmontar
        return () => {
            window.removeEventListener('online', handleOnlineStatusChange);
            window.removeEventListener('offline', handleOnlineStatusChange);
        };
    }, []);

    // Versión simple del TopBar
    if (showSimple) {
        return (
            <>
                <div className={`fixed top-0 ${online ? 'bg-[#546C4C]' : 'bg-red-700'} w-full text-white z-1`}>
                    <ConnectionAlert />
                    <div className="w-full grid grid-cols-12 p-2 m-auto lg:w-[50%]">
                        <div className="col-span-12 flex items-center justify-between">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={24} />
                                <span className="hidden md:inline">Regresar</span>
                            </button>
                            <img src={logo} alt="Logo" className="h-6" />
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Versión completa del TopBar
    return (
        <>
            <div className={`fixed top-0 ${online ? 'bg-[#546C4C]' : 'bg-red-700'} w-full text-white z-1`}>
                {/* alerta para cuando se queda sin internet */}
                <ConnectionAlert />
                <div className="w-full grid grid-cols-12 p-4 m-auto lg:w-[50%]">
                    <div className="col-span-6 lg:col-span-3 flex items-center">
                        <img src={logo} alt="" className="w-[50%]" /> <small className="px-2 ml-2 rounded-lg font-bold bg-gray-100 text-black">{bodHeader}</small>
                        <small className="px-4 px-1">V{VERSION}</small>
                    </div>
                    <div className="col-span-6 lg:col-span-9 justify-end flex items-center nombreUsuario">

                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 mr-4 help" onClick={() => { startTour('home') }}>
                            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                        </svg>

                        <div className="relative" ref={menuUsuarioRef}>
                            <button
                                type="button"
                                onClick={() => setMenuUsuarioAbierto((v) => !v)}
                                className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                <span className="flex items-center justify-center size-7 rounded-full bg-white/15 shrink-0">
                                    <User size={15} />
                                </span>
                                {currentUser && (
                                    <span className="font-bold text-sm max-w-[110px] truncate hidden sm:inline">
                                        {currentUser.tx_nombre?.split(' ')[0]}
                                    </span>
                                )}
                                <ChevronDown size={16} className={`transition-transform duration-200 ${menuUsuarioAbierto ? 'rotate-180' : ''}`} />
                            </button>

                            {menuUsuarioAbierto && currentUser && (
                                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-white text-gray-700 shadow-xl overflow-hidden z-50">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="font-semibold text-sm truncate">{currentUser.tx_nombre}</p>
                                        <p className="text-xs text-gray-500 truncate">{currentUser.tx_correo || currentUser.tx_usuario}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleIrRecibosCaja}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 text-left cursor-pointer"
                                    >
                                        <Receipt size={16} className="text-[#546C4C]" />
                                        Recibos de caja
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 text-left border-t border-gray-100 cursor-pointer"
                                    >
                                        <LogOut size={16} />
                                        Cerrar sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default TopBar
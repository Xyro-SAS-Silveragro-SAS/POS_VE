import logo from "../../assets/img/logo.png"
import { useState, useEffect } from "react"
import ConnectionAlert from "./ConnectionAlert"
import { useAuth } from "../../context/AuthContext"
import { VERSION } from "../../config/config.jsx"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

const TopBar = ({ startTour = null, onUserClick = null, showSimple = false }) => {
    const [online, setStatus] = useState(navigator.onLine);
    const { currentUser } = useAuth();
    const [bodHeader, setBodHeader] = useState(localStorage.getItem('bodega') || '0');
    const navigate = useNavigate();

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


                        {currentUser && (
                            <span className="mr-4 font-bold">{currentUser.tx_nombre.split(' ')[0]}</span>
                        )}

                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 cursor-pointer" onClick={onUserClick}>
                            <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>
        </>
    )
}
export default TopBar
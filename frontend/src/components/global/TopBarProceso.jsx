import { useNavigate } from "react-router"
import { useState, useEffect } from "react"
import { ToastContainer, toast } from 'react-toastify';

const TopBarProceso = ({titulo = '', toggleIA = null }) => {
    const navigate              = useNavigate()
    const [online, setStatus]   = useState(navigator.onLine);

    const guardadoLocal = () => toast("✅ Guardado localmente!");
    const sincronizar   = () => toast("🚀 Enviado a la nube!");

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


    const handleBack = () => {
        navigate(-1)
    }

    return (
        <>

            <ToastContainer
                position="bottom-center"
                autoClose={200}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                />

            <div className={`fixed top-0 ${ online ? 'bg-[#546C4C]' : 'bg-red-700'} w-full text-white z-1`}>
                <div className="w-full grid grid-cols-12 p-5 m-auto lg:w-[50%]">
                    <div className="col-span-1  justify-start flex items-center cursor-pointer" onClick={handleBack}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                            <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="col-span-7  flex items-center font-bold uppercase">
                        {titulo}
                        {/* <small className="px-4 px-1 bg-green-700 rounded-lg font-bold ml-2">ONLINE</small> */}
                    </div>
                    <div className="col-span-4 flex items-center justify-end">
                        
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 mr-4 cursor-pointer" onClick={ () => { toggleIA() } }>
                            <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z" clipRule="evenodd" />
                        </svg>


                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="size-6 mr-4 cursor-pointer" fill="white" onClick={ () => { guardadoLocal() } }>
                            <path d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-242.7c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32L64 32zm0 96c0-17.7 14.3-32 32-32l192 0c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32L96 224c-17.7 0-32-14.3-32-32l0-64zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8 cursor-pointer" onClick={ () => { sincronizar() } }>
                            <path fillRule="evenodd" d="M10.5 3.75a6 6 0 0 0-5.98 6.496A5.25 5.25 0 0 0 6.75 20.25H18a4.5 4.5 0 0 0 2.206-8.423 3.75 3.75 0 0 0-4.133-4.303A6.001 6.001 0 0 0 10.5 3.75Zm2.03 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v4.94a.75.75 0 0 0 1.5 0v-4.94l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z" clipRule="evenodd" />
                        </svg>

                    </div>
                </div>
            </div>
        </>
    )
}
export default TopBarProceso

import { useNavigate } from "react-router"
import { useState, useEffect } from "react"
import { ToastContainer, toast } from 'react-toastify';
import { AudioLines } from "lucide-react"
import Funciones from "../../helpers/Funciones";
import { db } from "../../db/db";

const TopBarProceso = ({titulo = '', toggleIA = null,listaCarrito = [],tipoProceso=null, idProceso=0, startTour=null, setShowDetallesEntrega=null, cabezaPedido=null }) => {
    const navigate                          = useNavigate()
    const [online, setStatus]               = useState(navigator.onLine);
    const [bodHeader, setBodHeader]         = useState(localStorage.getItem('bodega') || '0');

    const mensajeToastElimina = (tipoProceso === 'cotizaciones') ? 'Cotización eliminada' : 'Pedido eliminado'

    const pedidoBorrado = () => toast(`✅ ${mensajeToastElimina}`);

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


    const handleBack = async() => {
        if(listaCarrito.length === 0){
            const titulo = (tipoProceso === 'cotizaciones') ? 'esta cotización' : 'este pedido'
            Funciones.confirmacion('Atención!',`No ha agregado items aún, si regresa ${titulo} se eliminará`,"info", async () => {
                //elimino el pedido
                await db.cabeza.delete(parseInt(idProceso))
                pedidoBorrado()
                navigate('/home')
            },() => {
                
            },"SALIR","QUEDARME")
        }
        else{
            navigate('/home')
        }
    }

    const iniciaAna = () =>{
        //toggleIA();
        Funciones.alerta('Oops...','ANA no esta disponible en este momento. Disculpa las molestias', 'info', () => {})
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
                    <div className="col-span-7 text-[14px] flex items-center font-bold uppercase tituloPedido">
                        {titulo}
                        <small className="px-2 ml-2 rounded-lg font-bold bg-gray-100 text-black">{bodHeader}</small>
                        {/* <small className="px-4 px-1 bg-green-700 rounded-lg font-bold ml-2">ONLINE</small> */}
                    </div>
                    <div className="col-span-4 flex items-center justify-end">
                        {cabezaPedido && cabezaPedido.sync === 1 ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cloud-check-icon lucide-cloud-check"><path d="m17 15-5.5 5.5L9 18"/><path d="M5 17.743A7 7 0 1 1 15.71 10h1.79a4.5 4.5 0 0 1 1.5 8.742"/></svg>
                            </>
                        ):(
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 mr-4 help" onClick={()=>{startTour('proceso')}}>
                                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                                </svg>

                                <AudioLines  className="size-6 mr-4 cursor-pointer asistenteAna" onClick={ () => { iniciaAna() } }/>


                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8 cursor-pointer sincronizarBtn" onClick={ () => { setShowDetallesEntrega(true) } }>
                                    <path fillRule="evenodd" d="M10.5 3.75a6 6 0 0 0-5.98 6.496A5.25 5.25 0 0 0 6.75 20.25H18a4.5 4.5 0 0 0 2.206-8.423 3.75 3.75 0 0 0-4.133-4.303A6.001 6.001 0 0 0 10.5 3.75Zm2.03 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v4.94a.75.75 0 0 0 1.5 0v-4.94l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z" clipRule="evenodd" />
                                </svg>
                            </>
                        )}

                    </div>
                </div>
            </div>
        </>
    )
}
export default TopBarProceso

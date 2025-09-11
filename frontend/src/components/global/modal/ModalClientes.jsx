import { useState } from "react"
import { db } from "../../../db/db"
import { TextCursorInput, Download } from "lucide-react"
import { useConnection } from "../../../context/ConnectionContext"
import syncService from "../../../services/syncService.js"
import Funciones from "../../../helpers/Funciones"
const ModalClientes = ({showClientes = false, toggleClientes = null, setClienteSel = null, onlyView=false}) => {
    const [busqueda, setBusqueda] = useState('')
    const [clientes, setClientes] = useState([])
    const [syncing, setSyncing] = useState(false)
    const { isOnline } = useConnection()

      const consultaClientes = () => {
        db.clientes.toArray().then((clientes) => {
            const clientesBusqueda = clientes.filter((cliente) => {
                return cliente.Llave.toLowerCase().includes(busqueda.toLowerCase())
            })
            setClientes(clientesBusqueda)
        })
      }

      const handleSetCliente = (cliente) => {
        setClienteSel(cliente)
        toggleClientes()
      }

      const handleSetBusqueda = (e) =>{
        const value = e.target.value;
        setBusqueda(value);
      }

      const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
          handleBuscar();
        }
      }

      const handleBuscar = () => {
        consultaClientes()
      }

      const handleSyncClientes = async () => {
        if (!isOnline) {
          Funciones.alerta("Sin conexión", "Se requiere conexión a internet para sincronizar los clientes", "warning");
          return;
        }

        const cdSap = syncService.getUserSapCode();
        if (!cdSap) {
          Funciones.alerta("Error", "No se pudo obtener la información del usuario", "error");
          return;
        }

        const success = await syncService.syncClientes(cdSap, setSyncing);
        if (success) {
          Funciones.alerta("Éxito", "Clientes sincronizados correctamente", "success");
          // Refresh the current search results if there's a search term
          if (busqueda) {
            consultaClientes();
          }
        } else {
          Funciones.alerta("Error", "No se pudieron sincronizar los clientes", "error");
        }
      }
    

    return (
        <>
            <div className={`fixed top-0 left-0 w-full h-dvh bg-white z-50 transform transition-transform duration-200 ease-out ${showClientes ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="relative w-full h-full overflow-auto">
                    <div className="fixed bg-[#546C4C] w-full text-white z-1 top-0">
                        <div className="w-full grid grid-cols-12 p-5 m-auto lg:w-[50%] items-center">
                            <div className="text-center">
                                <svg onClick={toggleClientes} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 cursor-pointer">
                                    <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="col-span-9 text-center">
                                <input type="search" placeholder={`Busca por nombre o código`} className="border p-2 rounded-[5px] w-full border-gray-300 bg-white placeholder-gray-500 text-black" onChange={ (e) => { handleSetBusqueda(e) } } value={ busqueda || '' } 
                                onKeyDown={(e) => { handleKeyDown(e) }}/>
                            </div>
                            <div className="items-center grid justify-end">
                                <svg onClick={handleBuscar} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 cursor-pointer">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                            </div>
                            <div className="items-center grid justify-end">
                                {syncing ? (
                                    <div className="animate-spin">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                        </svg>
                                    </div>
                                ) : (
                                    <Download 
                                        onClick={handleSyncClientes} 
                                        className="size-6 cursor-pointer hover:scale-110 transition-transform" 
                                        title="Sincronizar clientes"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
        
                    <div className="w-full lg:w-[54%] md:p-10 m-auto  text-gray-700 relative  h-auto mt-[90px]">
                        { busqueda != '' && clientes && clientes.length === 0 ? (
                            <div className="text-center py-4 flex flex-wrap items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mt-8 size-12">
                                    <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
                                </svg>
                                <p className="px-12 w-full mt-2">
                                    El usuario no fue encontrado. Posiblemente el cliente no existe en la base de datos o no está asignado a su zona. Por favor verifique.
                                </p>

                            </div>
                        ) : (
                            <>
                                {clientes && clientes.length > 0 && clientes.map((item, index) => (
                                    <div key={index} className="items-center w-full grid grid-cols-12 border-b-1 border-gray-300">
                                        <div  className="col-span-2 font-medium flex justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="col-span-8 py-4 flex flex-wrap font-medium ">
                                            <p className="w-full">
                                                {item.Nombre}
                                            </p>
                                            <small className="w-full">{item.Codigo}</small>
                                            <small className="w-full">Saldo: ${item.Saldo}</small>
                                        </div>
                                        <div className="col-span-2 flex items-center justify-center">
                                            {onlyView === false && (
                                                <svg onClick={()=>{handleSetCliente(item)}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8 cursor-pointer">
                                                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                        {/* doy un mensaje al usuario par que escriba */}
                        { busqueda == '' && (
                            <div className="text-center py-4 flex flex-wrap items-center justify-center">
                                <TextCursorInput className="size-12"/>
                                <p className="px-12 w-full mt-2">
                                    Escribe el nombre o el código del cliente para buscarlo
                                </p>
                            </div>
                        )}


                    </div>
                    
                </div>
            </div>
        </>
    )
}
export default ModalClientes
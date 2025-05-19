import { useParams } from "react-router"
import TopBarProceso from "../../components/global/TopBarProceso"
import { useState, useEffect } from "react"
const Proceso = () => {
    const {tipoProceso, idProceso}  = useParams()
    const [titulo, setTitulo]       = useState('')
    const [showClientes, setShowClientes]     = useState(false);

    useEffect(() => {
        if(idProceso === undefined){
            const tituloPagina = (tipoProceso === 'pedidos') ? 'nuevo pedido' : 'nueva cotización'
            setTitulo(tituloPagina)
        }   
        else{
            const tituloPagina = (tipoProceso === 'pedidos') ? `pedido ${idProceso}` : `cotización ${idProceso}`
            setTitulo(tituloPagina)
        }
    }, [])


    const toggleClientes = () => {
        setShowClientes(!showClientes);
    };

  return (
    <>
        { tipoProceso } - {idProceso}
        <TopBarProceso titulo={titulo}/>
        <div className="w-full lg:w-[54%] md:p-10 m-auto  mt-[15%] lg:mt-[3%] md:mt-[5%] mb-[20%] flex flex-wrap text-gray-700 relative">
            <div className="w-full px-[5%] lg:px-[3%] mb-4 font-bold">
                <div className="w-full flex items-center justify-between text-gray-500">
                    <small>Paso 1: Escoge un cliente</small>
                </div>
                <div className="flex items-center justify-between">
                    JHON ALBERTO PUERTO OLMOS
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8 cursor-pointer" onClick={toggleClientes}>
                        <path d="M8.25 10.875a2.625 2.625 0 1 1 5.25 0 2.625 2.625 0 0 1-5.25 0Z" />
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.125 4.5a4.125 4.125 0 1 0 2.338 7.524l2.007 2.006a.75.75 0 1 0 1.06-1.06l-2.006-2.007a4.125 4.125 0 0 0-3.399-6.463Z" clipRule="evenodd" />
                    </svg>
                </div>

            </div>

            
            <div className="w-full px-[5%] lg:px-[3%] mb-4 font-bold border-t-1 py-4 border-gray-300">
                <div className="w-full flex items-center justify-between text-gray-500">
                    <small>Paso 2: Agrega los productos</small>
                </div>
                <div className="flex items-center justify-between">
                    SELECCIONA UNO O VARIOS PRODUCTOS
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8 cursor-pointer" onClick={toggleClientes}>
                        <path d="M8.25 10.875a2.625 2.625 0 1 1 5.25 0 2.625 2.625 0 0 1-5.25 0Z" />
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.125 4.5a4.125 4.125 0 1 0 2.338 7.524l2.007 2.006a.75.75 0 1 0 1.06-1.06l-2.006-2.007a4.125 4.125 0 0 0-3.399-6.463Z" clipRule="evenodd" />
                    </svg>
                </div>

            </div>
        </div>





{/* Modal clientes*/}
{showClientes && (
    <div className="bg-white top-0 fixed w-full z-50 transition-all duration-300 h-dvh z-2">
        <div className={`relative bg-white w-full h-[60vh] transform transition-transform duration-300 ease-out ${showClientes ? 'translate-y-0' : 'translate-y-full'}`}>
           
            <div className="fixed top-0 bg-[#546C4C] w-full text-white z-1">
                <div className="w-full grid grid-cols-12 p-5 m-auto lg:w-[50%] flex items-center">
                    <div className="text-center">
                        <svg onClick={toggleClientes} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                            <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="col-span-10 text-center">
                        <input  type="search" placeholder={`Busca clientes por nombre o codigo`} className="border p-2 rounded-[5px] w-full border-gray-300 bg-white placeholder-gray-500"/>
                    </div>
                    <div className="items-center grid justify-end">
                        <svg onClick="" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                    </div>
                </div>
            </div>
            
        </div>
    </div>
)}
{/* fin del modal clientes */}



    </>
  )
}
export default Proceso
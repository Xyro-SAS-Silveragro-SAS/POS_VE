import { useParams } from "react-router"
import TopBarProceso from "../../components/global/TopBarProceso"
import { useState, useEffect } from "react"
import defaultImage  from '../../assets/img/default.png'
import Cantidades from "../../components/ventaExterna/Cantidades"
import ModalClientes from "../../components/global/modal/ModalClientes"
import ModalProductos from "../../components/global/modal/ModalProductos"
import ModalIA from "../../components/global/modal/ModalAI"
const Proceso = () => {
    const {tipoProceso, idProceso}  = useParams()
    const [titulo, setTitulo]       = useState('')
    const [showClientes, setShowClientes]     = useState(false);
    const [showProductos, setShowProductos]     = useState(false);
    const [showIA, setShowIA]     = useState(false);

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
    
    const toggleProductos= () => {
        setShowProductos(!showProductos);
    };
    const toggleIA = () => {
        setShowIA(!showIA);
    };

    const handleCantidad = (tipo, item) => {
      
    }

    const items = Array(10).fill().map((_, index) => ({
        id: 1234 + index,
        nombre: 'ABONADORA SEMBRADORA X 12 KILOS '+index,
        cantidad:0,
        codigoItem:'ACCGRAE35N',
        sync: (index % 4 === 0)? false: true
      }))
    

  return (
    <>
        { tipoProceso } - {idProceso}
        <TopBarProceso titulo={titulo} toggleIA={toggleIA}/>
        <div className="w-full lg:w-[54%] md:p-10 m-auto  mt-[15%] lg:mt-[3%] md:mt-[5%] mb-[20%] flex flex-wrap text-gray-700 relative">
            <div className="shadow-lg w-full">
                <div className="w-full px-[5%] lg:px-[3%] mb-4 font-bold">
                    <div className="w-full flex items-center justify-between text-gray-500">
                        <small>Escoge un cliente</small>
                    </div>
                    <div className="flex items-center justify-between">
                        JHON ALBERTO PUERTO OLMOS
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8 cursor-pointer" onClick={toggleClientes}>
                            <path d="M8.25 10.875a2.625 2.625 0 1 1 5.25 0 2.625 2.625 0 0 1-5.25 0Z" />
                            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.125 4.5a4.125 4.125 0 1 0 2.338 7.524l2.007 2.006a.75.75 0 1 0 1.06-1.06l-2.006-2.007a4.125 4.125 0 0 0-3.399-6.463Z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
                {/* <div className="w-full px-[5%] lg:px-[3%] mb-0 font-bold border-t-1 py-4 border-gray-300">
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
                </div> */}
                <div className="w-full px-[5%] lg:px-[3%] font-bold border-t-1 py-4 border-gray-300 flex items-center justify-between">
                    <h2 className="flex items-center uppercase">
                        Productos agregados
                        <span className="bg-red-700 p-2 rounded-full text-white w-[30px] h-[30px] flex items-center justify-center ml-2">40</span>
                    </h2>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8 cursor-pointer" onClick={toggleProductos}>
                        <path d="M8.25 10.875a2.625 2.625 0 1 1 5.25 0 2.625 2.625 0 0 1-5.25 0Z" />
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.125 4.5a4.125 4.125 0 1 0 2.338 7.524l2.007 2.006a.75.75 0 1 0 1.06-1.06l-2.006-2.007a4.125 4.125 0 0 0-3.399-6.463Z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>

            {/* productos */}
            <div className="w-full px-[5%] lg:px-[3%] font-bold border-t-1 py-4 border-gray-300 h-[calc(100vh-250px)] overflow-auto">
                    {items && items.length > 0 && items.map((item, index) => (
                        <div key={index} className="items-center w-full grid grid-cols-12 border-b-1 border-gray-300">
                            <div  className=" col-span-2 font-medium flex text-start">
                                <img alt="" src={`https://demoapi.xyroposadmin.com/api/imgUnItem/${item.codigoItem}`} className="w-full" onError={(e) => {e.target.src = `${ defaultImageUrl }`}}/>
                            </div>
                            <div  className="col-span-10 py-4 font-medium ">
                                {item.nombre}

                                <div className="flex items-center justify-start mt-2">

                                    <Cantidades 
                                        titulo = 'SOLICITADOS'
                                        item = {item}
                                        handleCantidad  = {handleCantidad}
                                        />

                                    <Cantidades 
                                        titulo = 'BONIFICADO'
                                        item = {item}
                                        handleCantidad  = {handleCantidad}
                                        />

                                </div>

                            </div>
                            {/* <div className="col-span-2 flex justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                    <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
                                </svg>
                            </div> */}
                        </div>
                    ))}
            </div>

        </div>





    {/* Modal clientes*/}
        <ModalClientes showClientes={showClientes} toggleClientes={toggleClientes} />
    {/* fin del modal clientes */}

    {/* Modal productos*/}
        <ModalProductos showProductos={showProductos} toggleProductos={toggleProductos} handleCantidad={handleCantidad}/>
    {/* fin del modal productos */}

                    
    {/* Modal IA*/}
        <ModalIA showIA={showIA} toggleIA={toggleIA}/>
    {/* fin del modal IA */}

    </>
  )
}
export default Proceso
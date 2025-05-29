import TopBar from "../../components/global/TopBar"
import Footer from "../../components/global/Footer"
import Filtro from "../../components/global/Filtro"
import { useConnection } from "../../context/ConnectionContext";
import { useEffect, useState } from "react"
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

const Home = () => {
  const [titulo, setTitulo]                                     = useState('')
  const [botonActivo, setBotonActivo]                           = useState('')
  const [mostrarFiltro, setMostrarFiltro]                       = useState(false)
  const [filtroSeleccionado, setFiltroSeleccionado]             = useState('hoy')
  const navigate                                                = useNavigate();
  const { isOnline }                                            = useConnection();
  const { login, isAuthenticated, isLoading, currentUser }      = useAuth();

  useEffect(() => {
    setTitulo('Pedidos')
    setBotonActivo('pedidos')
    //console.log(currentUser)
  },[])

  const handleChangeType = (tipo) => {
     const titulo      = (tipo === 'pedido') ? 'Pedidos' : 'Cotizaciones'
     const botonActivo = (tipo === 'pedido') ? 'pedidos' : 'cotizaciones'
     setBotonActivo(botonActivo)
     setTitulo(titulo)
  }

  const pedidos = Array(10).fill().map((_, index) => ({
    id: 1234 + index,
    cliente: 'Comercializadora El burrito felizmente',
    fecha: '2023-06-15',
    sync: (index % 4 === 0)? false: true
  }))

  const toggleFiltro = () => {
    setMostrarFiltro(!mostrarFiltro)
  }

  const aplicarFiltro = (filtro) => {
    setFiltroSeleccionado(filtro)
    setMostrarFiltro(false)
  }
  const nuevoProceso = (id) => {
    navigate(`/proceso/${botonActivo}/${id}`)
  }

  return (
    <>
      <TopBar/>
        <div className={`w-full md:p-10 m-auto lg:w-[54%] mb-[20%] ${(isOnline) ? ' mt-[20%] lg:mt-[3%] md:mt-[13%] ' : ' mt-[30%] lg:mt-[5%] md:mt-[13%] '} flex flex-wrap text-gray-700 relative`}>
          <div className="w-full  flex items-center justify-between px-[5%] lg:px-[3%] mb-4">
            <h1 className="text-2xl font-bold flex items-center">
              {titulo}
            </h1>
            {/* Filtro */}
            <div className="relative flex items-center">
                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm mr-4">
                  Filtro: {filtroSeleccionado.charAt(0).toUpperCase() + filtroSeleccionado.slice(1)}
                  {/* <button 
                    className="ml-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setFiltroSeleccionado('hoy')}
                  >
                    ×
                  </button> */}
                </span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="size-6 cursor-pointer"
                onClick={toggleFiltro}
              >
                <path d="M18.75 12.75h1.5a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM12 6a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 6ZM12 18a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 18ZM3.75 6.75h1.5a.75.75 0 1 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM5.25 18.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 0 1.5ZM3 12a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 3 12ZM9 3.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM12.75 12a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0ZM9 15.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
              </svg>

              
              
              {/* Menú desplegable de filtros */}
              {mostrarFiltro && (
                <Filtro aplicarFiltro={aplicarFiltro} filtroSeleccionado={filtroSeleccionado}/>
              )}
            </div>
          </div>

          <div className="flex flex-wrap w-full">

              {/* Mostrar filtro seleccionado */}
              

            { pedidos.map((pedido, index) => (
                <div role="button" key={index} className="grid grid-cols-12 px-5 py-4 border-b-1 border-gray-200  w-full cursor-pointer"  onClick={() => nuevoProceso(pedido.id)}>
                    <div className="col-span-2 lg:col-span-1 h-auto flex items-start justify-center">
                    {pedido.sync ? (
                        // chulo
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-10">
                          <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        // nube
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-10">
                          <path fillRule="evenodd" d="M10.5 3.75a6 6 0 0 0-5.98 6.496A5.25 5.25 0 0 0 6.75 20.25H18a4.5 4.5 0 0 0 2.206-8.423 3.75 3.75 0 0 0-4.133-4.303A6.001 6.001 0 0 0 10.5 3.75Zm2.03 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v4.94a.75.75 0 0 0 1.5 0v-4.94l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="col-span-9 lg:col-span-10 relative">
                      <strong>Nro {titulo}: </strong> {pedido.id}<br/>
                      <strong>Cliente: </strong> {pedido.cliente}<br/>
                      <strong>Fecha: </strong> {pedido.fecha}<br/>
                      <small className=" bg-red-600 text-white py-[2px] px-4 font-bold rounded-lg">ESTADO</small>
                    </div>
                    <div className="col-span-1 flex justify-end items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8">
                        <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
                      </svg>
                    </div>
                </div>
            ))}
              
          </div>
          {/* boton de agregar nuevo proceso */}
          <button onClick={() => nuevoProceso('')} className="fixed bottom-20 p-4 cursor-pointer rounded-full right-5 z-10 bg-red-600  shadow-lg/30">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="size-10">
              <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
            </svg>
          </button>

        </div>
        
        

      <Footer handleChangeType={handleChangeType} botonActivo={botonActivo}/>
    </>
  )
}
export default Home
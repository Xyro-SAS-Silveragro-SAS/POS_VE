import TopBar from "../../components/global/TopBar"
import Footer from "../../components/global/Footer"
import Filtro from "../../components/global/Filtro"
import { useConnection } from "../../context/ConnectionContext";
import { useEffect, useState } from "react"
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../db/db";
import { useTourContext } from '../../context/TourContext';

const Home = () => {
  const [titulo, setTitulo]                                             = useState('')
  const [botonActivo, setBotonActivo]                                   = useState('')
  const [mostrarFiltro, setMostrarFiltro]                               = useState(false)
  const [filtroSeleccionado, setFiltroSeleccionado]                     = useState('hoy')
  const navigate                                                        = useNavigate()
  const { isOnline }                                                    = useConnection()
  const { isAuthenticated, isLoading, currentUser, logout }             = useAuth()
  const [listaProcesos, setListaProcesos]                               = useState(null)
  const { 
    startTour
  } = useTourContext();

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('tourHome');
    if (!hasSeenTour) {
      startTour('home');
      localStorage.setItem('tourHome', 'true');
    }
  }, [startTour]);

  useEffect(() => {
    setTitulo('Pedidos')
    setBotonActivo('pedidos')
    startTour()
  },[])   
  
  useEffect(() => {
    if(!isLoading){
      if(!isAuthenticated){
        navigate('/login')
      }
    }
  },[isAuthenticated])

  useEffect(() => {
    const getListaProcesos = async () => {
      const lista = await db.cabeza.where('in_tipo')
                                   .equals(botonActivo.toLowerCase())
                                   .toArray()
      const dataLista = lista.map((item) => {
        return (item.tx_usuario_logueado === currentUser.id_usuario) ? item : null
      })                           
      setListaProcesos(dataLista)
    }
    getListaProcesos()
  },[botonActivo])

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
      <TopBar startTour={startTour} logout={logout}/>
        <div className={`w-full md:p-10 m-auto lg:w-[54%] mb-[20%] ${(isOnline) ? ' mt-[20%] lg:mt-[3%] md:mt-[13%] ' : ' mt-[30%] lg:mt-[5%] md:mt-[13%] '} flex flex-wrap text-gray-700 relative`}>
          <div className="w-full  flex items-center justify-between px-[5%] lg:px-[3%] mb-4">
            <h1 className="text-2xl font-bold flex items-center">
              {titulo}
            </h1>
            {/* Filtro */}
            <div className="relative flex items-center">
                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm mr-4 filtrosActual">
                  Filtro: {filtroSeleccionado.charAt(0).toUpperCase() + filtroSeleccionado.slice(1)}
                </span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="size-6 cursor-pointer selFiltro"
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

          <div className="flex flex-wrap w-full listaItemsHome">
              {/* Mostrar filtro seleccionado */}
              


          {listaProcesos && listaProcesos.length > 0 ? (
            // Tu map actual aquí
            listaProcesos.map((pedido, index) => (
              <div role="button" key={index} className="grid grid-cols-12 px-5 py-4 border-b-1 border-gray-200  w-full cursor-pointer "  onClick={() => nuevoProceso(pedido.id)}>
                  <div className="col-span-2 lg:col-span-1 h-auto flex items-start justify-center ">
                  {pedido.sync === 1 ? (
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
                    <strong>Codigo {titulo.toLowerCase() === 'pedidos' ? 'pedido':'cotización'}: </strong> ****{pedido.id_consec ? String(pedido.id_consec).slice(-5) : ''}<br/>
                    <strong>Cliente: </strong> {pedido.tx_nom_sn_nombre !== '' ? pedido.tx_nom_sn_nombre : 'Sin Cliente'}<br/>
                    <strong>Fecha: </strong> { pedido.dt_fecha_reg ? new Date(pedido.dt_fecha_reg).toLocaleDateString() : 'N/A'}<br/>
                    <small className=" bg-red-600 text-white py-[2px] px-4 font-bold rounded-lg">ESTADO</small>
                  </div>
                  <div className="col-span-1 flex justify-end items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8">
                      <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
                    </svg>
                  </div>
              </div>
            ))
          ) : (
              <div className="flex flex-col items-center justify-center py-12 w-full ">
                  <div className="text-6xl mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-30">
                        <path fillRule="evenodd" d="M6.912 3a3 3 0 0 0-2.868 2.118l-2.411 7.838a3 3 0 0 0-.133.882V18a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-4.162c0-.299-.045-.596-.133-.882l-2.412-7.838A3 3 0 0 0 17.088 3H6.912Zm13.823 9.75-2.213-7.191A1.5 1.5 0 0 0 17.088 4.5H6.912a1.5 1.5 0 0 0-1.434 1.059L3.265 12.75H6.11a3 3 0 0 1 2.684 1.658l.256.513a1.5 1.5 0 0 0 1.342.829h3.218a1.5 1.5 0 0 0 1.342-.83l.256-.512a3 3 0 0 1 2.684-1.658h2.844Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No hay {titulo.toLowerCase()} para mostrar
                  </h3>
                  <p className="text-gray-500 text-center p-8">
                      Aún no has agregado {titulo} a tu lista. Para empezar presiona el botón rojo que está en la parte inferior derecha de la pantalla
                  </p>
              </div>
          )}
              
          </div>
          {/* boton de agregar nuevo proceso */}
          <button onClick={() => nuevoProceso('')} className="fixed bottom-20 p-4 cursor-pointer rounded-full right-5 z-10 bg-red-600  shadow-lg/30 botonAgregaNueva">
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
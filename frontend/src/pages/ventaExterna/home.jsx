import TopBar from "../../components/global/TopBar"
import Footer from "../../components/global/Footer"
import Filtro from "../../components/global/Filtro"
import { useConnection } from "../../context/ConnectionContext";
import { useEffect, useState } from "react"
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../db/db";
import { useTourContext } from '../../context/TourContext';
import ButtonNew from "../../components/ventaExterna/ButtonNew";
import ModalClientes from "../../components/global/modal/ModalClientes";
import ModalProductos from "../../components/global/modal/ModalProductos";
import Funciones from "../../helpers/Funciones";
import api from "../../services/apiService";

const Home = () => {
  const [titulo, setTitulo]                                             = useState('')
  const [botonActivo, setBotonActivo]                                   = useState('')
  const [mostrarFiltro, setMostrarFiltro]                               = useState(false)
  const [filtroSeleccionado, setFiltroSeleccionado]                     = useState('hoy')
  const navigate                                                        = useNavigate()
  const { isOnline }                                                    = useConnection()
  const { isAuthenticated, isLoading, currentUser, logout }             = useAuth()
  const [listaProcesos, setListaProcesos]                               = useState(null)
  const [procesosFiltrados, setProcesosFiltrados]                       = useState(null)
  const [mostrarModalUsuario, setMostrarModalUsuario]                   = useState(false)
  const [showClientes, setShowClientes]                                 = useState(false);
  const [showProductos, setShowProductos]                               = useState(false);
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
  },[isAuthenticated, isLoading, navigate])

  useEffect(() => {
    const getListaProcesos = async () => {
      const lista = await db.cabeza.where('in_tipo')
                                   .equals(botonActivo.toLowerCase())
                                   .reverse() 
                                   .sortBy('dt_fecha_reg')
                                   
      const dataLista = lista.map((item) => {
        return (item.tx_usuario_logueado === currentUser.id_usuario) ? item : null
      }).filter(item => item !== null)                           
      setListaProcesos(dataLista)
    }
    if (botonActivo && currentUser) {
      getListaProcesos()
    }
  },[botonActivo, currentUser])


  const actualizaProcesos = async () => {
    const lista = await db.cabeza.where('in_tipo')
                                   .equals(botonActivo.toLowerCase())
                                   .reverse() 
                                   .sortBy('dt_fecha_reg')
                                   
      const dataLista = lista.map((item) => {
        return (item.tx_usuario_logueado === currentUser.id_usuario) ? item : null
      }).filter(item => item !== null)                           
      setListaProcesos(dataLista)
  } 

  // Efecto para aplicar el filtro cuando cambian los procesos o el filtro seleccionado
  useEffect(() => {
    if (listaProcesos) {
      const procesosFiltrados = filtrarProcesos(listaProcesos, filtroSeleccionado)
      setProcesosFiltrados(procesosFiltrados)
    }
  }, [listaProcesos, filtroSeleccionado])

  // Función para filtrar procesos según el criterio seleccionado
  const filtrarProcesos = (procesos, filtro) => {
    setProcesosFiltrados([])
    if (!procesos || procesos.length === 0) return []

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    return procesos.filter(proceso => {
      
      if (!proceso.dt_fecha_reg) return false
      
      const fechaProceso = new Date(proceso.dt_fecha_reg)
      fechaProceso.setHours(0, 0, 0, 0)

      switch (filtro) {
        case 'Hoy': {
          return fechaProceso.getTime() === hoy.getTime()
        } 
        case 'Ayer':{
          const ayer = new Date(hoy)
          ayer.setDate(hoy.getDate() - 1)
          return fechaProceso.getTime() === ayer.getTime()
        }
        case 'Esta Semana':{
          const inicioSemana = new Date(hoy)
          const diaSemana = hoy.getDay()
          const diasAtras = diaSemana === 0 ? 6 : diaSemana - 1 // Lunes como inicio
          inicioSemana.setDate(hoy.getDate() - diasAtras)
          
          const finSemana = new Date(inicioSemana)
          finSemana.setDate(inicioSemana.getDate() + 6)
          
          return fechaProceso >= inicioSemana && fechaProceso <= finSemana
        }
        case 'Este Mes':{
          return fechaProceso.getMonth() === hoy.getMonth() && 
                 fechaProceso.getFullYear() === hoy.getFullYear()
        }
        case 'mes_pasado':{
          const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)
          const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0)
          return fechaProceso >= mesAnterior && fechaProceso <= finMesAnterior
        }
        case 'ultimos_30_dias':{
          const hace30Dias = new Date(hoy)
          hace30Dias.setDate(hoy.getDate() - 30)
          return fechaProceso >= hace30Dias && fechaProceso <= hoy
        }
        case 'Todos':
          return true
          
        default:
          return true
      }
    })
  }

  const handleChangeType = (tipo) => {
     const titulo      = (tipo === 'pedido') ? 'Pedidos' : 'Cotizaciones'
     const botonActivo = (tipo === 'pedido') ? 'pedidos' : 'cotizaciones'
     setBotonActivo(botonActivo)
     setTitulo(titulo)
  }

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

   const toggleModalUsuario = () => {
    setMostrarModalUsuario(!mostrarModalUsuario)
  }

  const handleLogout = () => {
    logout()
    setMostrarModalUsuario(false)
  }

  // Función para obtener el nombre del filtro en español
  const getNombreFiltro = (filtro) => {
    const nombres = {
      'hoy': 'Hoy',
      'ayer': 'Ayer',
      'esta_semana': 'Esta semana',
      'semana_pasada': 'Semana pasada',
      'este_mes': 'Este mes',
      'mes_pasado': 'Mes pasado',
      'ultimos_30_dias': 'Últimos 30 días',
      'todos': 'Todos'
    }
    return nombres[filtro] || filtro.charAt(0).toUpperCase() + filtro.slice(1)
  }


  const toggleClientes = () => {
      setShowClientes(!showClientes);
  }; 
  
  const toggleProductos= () => {
      setShowProductos(!showProductos);
  };


  const getEstadoBadge = (estado, mensajeServidor) => {
    switch (estado) {
      case 1:
        return <small onClick={()=>{Funciones.alerta("Pedido existoso","Pedido generado y sincronizado en SAP","success")}} className="flex items-center bg-green-600 text-white py-[2px] px-4 font-bold rounded-lg text-[10px]">SINCRONIZADO A SAP <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 lucide lucide-square-arrow-out-up-right-icon lucide-square-arrow-out-up-right"><path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"/><path d="m21 3-9 9"/><path d="M15 3h6v6"/></svg></small>;
      case 2:
        return <small onClick={()=>{Funciones.alerta("Problema de sincronización","+Se ha presentado un problema al sincronizar a SAP. Mensaje error: "+mensajeServidor,"info")}} className="flex items-center bg-green-600 text-white py-[2px] px-4 font-bold rounded-lg text-[10px]">ERROR DE SINCRONIZACION <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 lucide lucide-square-arrow-out-up-right-icon lucide-square-arrow-out-up-right"><path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"/><path d="m21 3-9 9"/><path d="M15 3h6v6"/></svg></small>;
      case 3:
        return <small onClick={()=>{Funciones.alerta("Pedido existente","El UUID del pedido ya existe en la base de datos","info")}} className="flex items-center bg-red-600 text-white py-[2px] px-4 font-bold rounded-lg text-[10px]">ERROR <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 lucide lucide-square-arrow-out-up-right-icon lucide-square-arrow-out-up-right"><path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"/><path d="m21 3-9 9"/><path d="M15 3h6v6"/></svg></small>;
      case 4:
        return <small onClick={()=>{Funciones.alerta("Bloqueo de cartera","El monto del pedido supera el crédito del usuario","info")}} className="flex items-center bg-red-600 text-white py-[2px] px-4 font-bold rounded-lg text-[10px]">ERROR <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 lucide lucide-square-arrow-out-up-right-icon lucide-square-arrow-out-up-right"><path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"/><path d="m21 3-9 9"/><path d="M15 3h6v6"/></svg></small>;
      case 5:
        return <small onClick={()=>{Funciones.alerta("Bloqueo de cartera","El cliente tiene facturas vencidas","info")}} className="flex items-center bg-red-600 text-white py-[2px] px-4 font-bold rounded-lg text-[10px]">ERROR<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 lucide lucide-square-arrow-out-up-right-icon lucide-square-arrow-out-up-right"><path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"/><path d="m21 3-9 9"/><path d="M15 3h6v6"/></svg></small>;
      case 6:
        return <small onClick={()=>{Funciones.alerta("Pedido anulado","Cartera no ha aprobado este pedido. Mensaje cartera: "+mensajeServidor,"info")}} className="flex items-center bg-red-600 text-white py-[2px] px-4 font-bold rounded-lg text-[10px]">NO APROBADO<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 lucide lucide-square-arrow-out-up-right-icon lucide-square-arrow-out-up-right"><path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"/><path d="m21 3-9 9"/><path d="M15 3h6v6"/></svg></small>;
      default:
        return <small  className="bg-gray-300 text-black py-[2px] px-4 font-bold rounded-lg">BORRADOR</small>;
    }
  };

  const verificaEstado = async (id_consec, idProceso) => { 

    const pedido = await api.get('api/pedidos/uuid/'+id_consec)
    console.log(pedido)
    if (pedido) {
       Funciones.alerta("Estado del pedido",pedido.mensaje,"info",async ()=>{
         await db.cabeza.update(parseInt(idProceso), { sync: 1, DocEntry: pedido.doc_entry, DocNum:pedido.doc_num,in_estado:pedido.in_estado,tx_comentarios:pedido.tx_comentarios });
         actualizaProcesos()
       });
    }
}


  return (
    <>
        <TopBar startTour={startTour} onUserClick={toggleModalUsuario} />
        <div className={`w-full md:p-10 m-auto lg:w-[54%] mb-[20%] ${(isOnline) ? ' mt-[20%] lg:mt-[3%] md:mt-[13%] ' : ' mt-[30%] lg:mt-[5%] md:mt-[13%] '} flex flex-wrap text-gray-700 relative`}>
          <div className="w-full  flex items-center justify-between px-[5%] lg:px-[3%] mb-4">
            <h1 className="text-2xl font-bold flex items-center">
              {titulo}
            </h1>
            {/* Filtro */}
            <div className="relative flex items-center">
                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm mr-4 filtrosActual">
                  Filtro: {getNombreFiltro(filtroSeleccionado)}
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
              


          {procesosFiltrados && procesosFiltrados.length > 0 ? (
            // Renderizar procesos filtrados
            procesosFiltrados.map((pedido, index) => (
              <div role="button" key={index} className="grid grid-cols-12 px-5 py-4 border-b-1 border-gray-200  w-full cursor-pointer " >
                  <div className="col-span-2 lg:col-span-1 h-auto flex items-start justify-center ">
                  {pedido.sync === 1 ? (
                      // chulo
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cloud-check-icon lucide-cloud-check size-10"><path d="m17 15-5.5 5.5L9 18"/><path d="M5 17.743A7 7 0 1 1 15.71 10h1.79a4.5 4.5 0 0 1 1.5 8.742"/></svg>
                    ) : (
                      // nube
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-10">
                        <path fillRule="evenodd" d="M10.5 3.75a6 6 0 0 0-5.98 6.496A5.25 5.25 0 0 0 6.75 20.25H18a4.5 4.5 0 0 0 2.206-8.423 3.75 3.75 0 0 0-4.133-4.303A6.001 6.001 0 0 0 10.5 3.75Zm2.03 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v4.94a.75.75 0 0 0 1.5 0v-4.94l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="col-span-9 lg:col-span-10 relative">
                    <strong>Codigo {titulo.toLowerCase() === 'pedidos' ? 'pedido':'cotización'}: </strong> ****{pedido.id_consec.toUpperCase() ? String(pedido.id_consec.toUpperCase()).slice(-5) : ''}<br/>
                    <strong>Cliente: </strong> {pedido.tx_nom_sn_nombre !== '' ? pedido.tx_nom_sn_nombre : 'Sin Cliente'}<br/>

                    { pedido && pedido.in_tipo === 'pedidos' && (
                      <>
                        <strong>Codigo SAP: </strong> { pedido.DocNum !== '' ? pedido.DocNum : 'Sin Código' }<br/>
                      </>
                    )}

                    <strong>Fecha: </strong> { pedido.dt_fecha_reg ? new Date(pedido.dt_fecha_reg).toLocaleDateString() : 'N/A'}<br/>
                    <strong>Valor: </strong> ${ pedido.in_vlr_total ? pedido.in_vlr_total.toLocaleString('es-CO') : 'N/A'}<br/>
                    { pedido && pedido.sync === 0 ? (
                      <small className=" bg-red-600 text-white py-[2px] px-4 font-bold rounded-lg mr-2">SIN SINCRONIZAR</small>
                    ) : (
                      <small className=" bg-green-600 text-white py-[2px] px-4 font-bold rounded-lg mr-2">SINCRONIZADO</small>
                    )}
                    
                    <div className="flex items-center gap-2 mt-2">
                      {pedido && getEstadoBadge(pedido.in_estado, pedido.tx_comentarios)}
                    
                      {[2, 3, 4, 5].includes(Number(pedido.in_estado)) && (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" title="Actualizar estado" onClick={() => verificaEstado(pedido.id_consec, pedido.id)}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                          </svg>
                      )}
                    </div>

                  </div>
                  <div className="col-span-1 flex justify-end items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8 cursor-pointer"  onClick={() => nuevoProceso(pedido.id)}>
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
                      {filtroSeleccionado === 'hoy' 
                        ? `Aún no has agregado ${titulo.toLowerCase()} hoy. Para empezar presiona el botón rojo que está en la parte inferior derecha de la pantalla`
                        : `No hay ${titulo.toLowerCase()} en el período seleccionado (${getNombreFiltro(filtroSeleccionado)}). Prueba con otro filtro o agrega nuevos ${titulo.toLowerCase()}.`
                      }
                  </p>
              </div>
          )}
              
          </div>
          
          {/* boton de agregar nuevo proceso */}
          <ButtonNew nuevoProceso={nuevoProceso} toggleClientes={toggleClientes} toggleProductos={toggleProductos} titulo={titulo} />

        </div>
        


     {/* Modal de información del usuario */}
        {mostrarModalUsuario && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={toggleModalUsuario}>
            <div className="bg-white rounded-lg p-6 w-11/12 max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
              {/* Header del modal */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Información del Usuario</h2>
                <button onClick={toggleModalUsuario} className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Contenido del modal */}
              {currentUser && (
                <div className="space-y-4">
                  {/* Avatar del usuario */}
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-10 text-gray-600">
                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  {/* Información del usuario */}
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{currentUser.tx_nombre}</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>ID Usuario:</strong> {currentUser.id_usuario}</p>
                      {currentUser.tx_email && (
                        <p><strong>Email:</strong> {currentUser.tx_email}</p>
                      )}
                      {currentUser.tx_telefono && (
                        <p><strong>Teléfono:</strong> {currentUser.tx_telefono}</p>
                      )}
                      {currentUser.tx_cargo && (
                        <p><strong>Cargo:</strong> {currentUser.tx_cargo}</p>
                      )}
                    </div>
                  </div>

                  {/* Estado de conexión */}
                  <div className="flex items-center justify-center space-x-2 py-2">
                    <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-600">
                      {isOnline ? 'Conectado' : 'Sin conexión'}
                    </span>
                  </div>

                  {/* Botón de cerrar sesión */}
                  <div className="pt-4 border-t">
                    <button
                      onClick={handleLogout}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                        <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                      </svg>
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Modal clientes*/}
        <ModalClientes showClientes={showClientes} toggleClientes={toggleClientes} setClienteSel={() => {}}  onlyView={true}/>
        {/* fin del modal clientes */}

        {/* Modal productos*/}
        <ModalProductos showProductos={showProductos} toggleProductos={toggleProductos} handleAddToCar={() => {}} onlyView={true}/> 


      <Footer handleChangeType={handleChangeType} botonActivo={botonActivo}/>
    </>
  )
}
export default Home
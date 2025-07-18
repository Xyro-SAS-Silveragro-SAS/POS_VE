import { useParams, useNavigate, Link } from "react-router"
import TopBarProceso from "../../components/global/TopBarProceso"
import { useState, useEffect,useCallback  } from "react"
import ModalClientes from "../../components/global/modal/ModalClientes"
import ModalProductos from "../../components/global/modal/ModalProductos"
import ModalIA from "../../components/global/modal/ModalAI"
import { useAuth } from "../../context/AuthContext"
import CardProducto from "../../components/ventaExterna/CardProducto"
import Funciones from "../../helpers/Funciones"
import { useTourContext } from '../../context/TourContext';
import { db } from "../../db/db"
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import ModalDetallesEntrega from "../../components/global/modal/ModalDetallesEntrega"
import { API_MTS } from "../../config/config"


const Proceso = () => {
    
    const {isAuthenticated, isLoading, currentUser }              = useAuth()
    const navigate                                                  = useNavigate()
    const {tipoProceso, idProceso}                                  = useParams()
    const [cargando, setCargando]                                   = useState(false)
    const [idPedidoActual, setPedidoActual]                         = useState(0)
    const [showClientes, setShowClientes]                           = useState(false);
    const [showProductos, setShowProductos]                         = useState(false);
    const [showIA, setShowIA]                                       = useState(false);
    const [clienteSel, setClienteSel]                               = useState({})   
    const [cabezaPedido, setCabezaPedido]                           = useState({})
    const [listaCarrito, setListaCarrito]                           = useState([]) // Inicializar como array vacío
    const [totalSolicitadas, setTotalSolicitadas]                   = useState(0)
    const [totalBonificadas, setTotalBonificadas]                   = useState(0)
    // Nuevo estado para controlar el colapso del panel de totales
    const [showDetails, setShowDetails]                             = useState(false);
    const { startTour}                                              = useTourContext();
    const [bodHeader, setBodHeader]                                 = useState(localStorage.getItem('bodega') || '0');
    const [showDetallesEntrega, setShowDetallesEntrega]             = useState(false);
    const [destinos, setDestinos]                                    = useState([]);
    const [isInitialized, setIsInitialized]                         = useState(false); // Nuevo estado para controlar la inicialización

    const agregadoCarrito                                           = () => toast("✅ Agregado al carrito!");

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('tourProceso');
        if (!hasSeenTour) {
            startTour('proceso');
            localStorage.setItem('tourProceso', 'true');
        }
    }, [startTour]);

    useEffect(() => {
        if(!isLoading){
            if(!isAuthenticated){
                navigate('/login')
            }
        }
    },[isAuthenticated, isLoading, navigate])

    // Efecto principal de inicialización - solo se ejecuta una vez
    useEffect(() => {
        if (!isInitialized) {
            initializeProcess();
        }
    }, [tipoProceso, idProceso, isInitialized]);

    // Efecto para actualizar cabeza cuando cambia el cliente - con validaciones
    useEffect(() => {
        if (clienteSel && 
            Object.keys(clienteSel).length > 0 && 
            idPedidoActual && 
            isInitialized &&
            cabezaPedido?.id) {
            updateCabezaConCliente();
        }
    }, [clienteSel, idPedidoActual, isInitialized]);
    
    // Efecto separado para cargar items cuando existe cabeza
    useEffect(() => {
        const loadItemsAndDestinos = async () => {
            if (cabezaPedido?.id && isInitialized) {
                try {
                    await getListaItems();
                    if (cabezaPedido.tx_cod_sn) {
                        await getDestinos();
                    }
                } catch (error) {
                    console.error('Error loading items and destinos:', error);
                }
            }
        };

        loadItemsAndDestinos();
    }, [cabezaPedido?.id, cabezaPedido?.tx_cod_sn, isInitialized]);
    
    // Efecto para calcular totales - optimizado para evitar loops
    const calculaYActualizaTotales = useCallback(async () => {
        if (!isInitialized || !cabezaPedido?.id) return;
        try {
            calculaCantidades();
            await capturaTotales();
        } catch (error) {
            console.error('Error calculating totals:', error);
        }
    }, [listaCarrito, cabezaPedido?.id, isInitialized]);

    useEffect(() => {
        if (listaCarrito.length >= 0 && isInitialized) {
            calculaYActualizaTotales();
        }
    }, [listaCarrito, calculaYActualizaTotales]);

    async function initializeProcess() {
        if (isInitialized) return; // Prevenir múltiples inicializaciones
        
        setCargando(true);
        
        try {
            // Cuando el pedido no existe lo creo
            if(idProceso === undefined){
                const nuevaCabeza = {
                    id_consec:uuidv4(),
                    DocNum:0,
                    DocEntry:0,
                    in_tipo:tipoProceso,
                    num_doc:0,
                    num_fac:0,
                    CondicionPago:'',
                    tx_cod_sn:'',
                    tx_nom_sn_nombre:'',
                    tx_dir_cli_pos:'',
                    tx_dir_code_cli_pos:"",
                    tx_dir_add_cli_pos:"",
                    fechaEntrega:"",
                    tipoEnvio:"",
                    observaciones:"",
                    tx_tel_cli_pos:"",
                    tx_cod_alm_pos:bodHeader,
                    in_subtot_pos:0,
                    in_vlr_total:0,
                    in_vlr_total_imp:0,
                    in_estado:0,
                    dt_fecha_reg:new Date(),
                    tx_usua:currentUser ? currentUser.cd_sap : '',
                    tx_comentarios:tipoProceso,
                    tx_nom_emp:currentUser ? currentUser.tx_empleado_sap : '',
                    in_cod_emp:0,
                    resp_api:'',
                    in_lst_precio:0,
                    tx_usuario_logueado:currentUser ? currentUser.id_usuario : '',
                    es_cotizacion:0,
                    sync:0,
                };
                
                // Inserto una nueva cabeza para obtener el id
                const id = await db.cabeza.add(nuevaCabeza);
                
                // Pongo el id del pedido en localStorage
                localStorage.setItem('idPedidoActual', id);
                localStorage.setItem('tipoProceso', tipoProceso);
                setPedidoActual(id);
                
                // Establezco la cabeza del pedido
                setCabezaPedido({...nuevaCabeza, id});
                
                // Redirecciono al usuario a la pagina con el idDelPedido
                navigate(`/proceso/${tipoProceso}/${id}`);
            } else {
                // Pongo el id del pedido en localStorage
                localStorage.setItem('idPedidoActual', idProceso);
                localStorage.setItem('tipoProceso', tipoProceso);
                setPedidoActual(parseInt(idProceso));
                
                // Consulto la data del pedido actual para persistir
                const infoCabeza = await db.cabeza.get(parseInt(idProceso));
                
                if (infoCabeza) {
                    setCabezaPedido(infoCabeza);
                } else {
                    console.error('No se encontró la cabeza del pedido con ID:', idProceso);
                    // Manejar el caso donde no se encuentra la cabeza
                    navigate('/home');
                    return;
                }
            }
        } catch (error) {
            console.error('Error al inicializar el proceso:', error);
            toast.error('Error al cargar el proceso');
        } finally {
            setCargando(false);
            setIsInitialized(true); // Marcar como inicializado
        }
    }

    const updateCabezaConCliente = async () => {
        try {
            if (!cabezaPedido?.id || !clienteSel) return;
            
            const cabezaActualizada = {
                ...cabezaPedido,
                tx_cod_sn: clienteSel.Codigo || '',
                tx_nom_sn_nombre: clienteSel.Nombre || '',
                tx_dir_cli_pos: clienteSel.Direccion || '',
                tx_tel_cli_pos: clienteSel.Telefono || '',
                CondicionPago: clienteSel.CondicionPago || ''
            };
            
            await db.cabeza.update(parseInt(idPedidoActual), cabezaActualizada);
            setCabezaPedido(cabezaActualizada);
        } catch (error) {
            console.error('Error al actualizar cabeza con cliente:', error);
        }
    };

    const toggleClientes = () => {
        setShowClientes(!showClientes);
    }; 
    
    const toggleProductos= () => {
        setShowProductos(!showProductos);
    };
    
    const toggleIA = () => {
        setShowIA(!showIA);
    };

    // Nueva función para toggle del panel de detalles
    const toggleDetails = () => {
        setShowDetails(!showDetails);
    };

    const handleRefresh = () => {
        navigate(`/home`);
    }

    // Función para obtener el título
    const getTitulo = () => {
        if (cargando) return 'Cargando...';
        
        if (!cabezaPedido || !cabezaPedido.id_consec) return 'Cargando...';
        
        const ultimosDigitos = String(cabezaPedido.id_consec).slice(-5);
        
        if (tipoProceso?.toLowerCase() === 'pedidos') {
            return `Pedido ****${ultimosDigitos}`;
        } else {
            return `Cotización ****${ultimosDigitos}`;
        }
    };

    //funcion que agrega al carrito las lineas
    const handleAddToCar = async (item) => {
        if(!cabezaPedido?.id) {
            toast.error('Error: No hay pedido activo');
            return;
        }

        if(parseInt(item.CantSolicitada) === 0 && parseInt(item.CantBonificada) === 0){
            Funciones.alerta("Atención","Debe seleccionar una cantidad para agregar al carrito, ya sea cantidad normal o bonificada","info",()=>{})
            return;
        }

        try {
            //busco si ya ese producto esta en el carrito
            const existe = await db.lineas
                .where('in_id_cabeza')
                .equals(cabezaPedido.id)
                .and(linea => linea.ItemCode === item.ItemCode)
                .first();
                
            if(existe){
                //actualizo las cantidades nada mas
                const dataUpdate = { 
                    CantSolicitada: parseInt(existe.CantSolicitada) + parseInt(item.CantSolicitada), 
                    CantBonificada: parseInt(existe.CantBonificada) + parseInt(item.CantBonificada) 
                };
                //actualizo las cantidades en la base de datos
                await db.lineas.update(parseInt(existe.id), dataUpdate);
            }
            else{
                const dataGuardarLinea = {
                    in_id_cabeza: cabezaPedido.id,
                    ItemCode: item.ItemCode,
                    Articulo: item.Articulo,
                    Precio: item.Precio,
                    CantSolicitada: item.CantSolicitada,
                    CantBonificada: item.CantBonificada,
                    Cantidad: item.Cantidad,
                    CodigoBarras: item.CodigoBarras,
                    in_dto_pos: 0,
                    Impuesto: item.Impuesto,
                    PorcImpto: item.PorcImpto,
                    ListaPrecio: item.ListaPrecio,
                    Comprometido: item.Comprometido,
                    in_estado_lin_pos: 0,
                    dt_fecha_reg: new Date(),
                    tx_usua_reg: currentUser ? currentUser.id_usuario : '',
                    CodAlmacen: item.CodAlmacen,
                    sync: 0,
                }
                await db.lineas.add(dataGuardarLinea);
            }

            // Recargar la lista después de agregar
            await getListaItems();
            calculaYActualizaTotales()
            agregadoCarrito();
            
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            toast.error('Error al agregar producto al carrito');
        }
    }

    const refrescaCatidades = async () => {
        await getListaItems();
        calculaYActualizaTotales()
    }

    const getListaItems = async () => {
        try {
            if (!cabezaPedido?.id) {
                setListaCarrito([]);
                return;
            }
            
            const lista = await db.lineas
                .where('in_id_cabeza')
                .equals(cabezaPedido.id)
                .toArray();
                
            setListaCarrito(lista || []);
        } catch (error) {
            console.error('Error al obtener lista de items:', error);
            setListaCarrito([]);
        }
    }

    const calculaCantidades = () => {
        if (!Array.isArray(listaCarrito)) {
            setTotalSolicitadas(0);
            setTotalBonificadas(0);
            return;
        }

        let totalCantidad = 0;
        let totalCantidadBonificada = 0;

        listaCarrito.forEach(item => {
            totalCantidad += parseInt(item.CantSolicitada) || 0;
            totalCantidadBonificada += parseInt(item.CantBonificada) || 0;
        });
        
        setTotalSolicitadas(totalCantidad);
        setTotalBonificadas(totalCantidadBonificada);
    }

    const capturaTotales = async () => {
        try {
            if (!cabezaPedido?.id) return;
            
            if (!Array.isArray(listaCarrito) || listaCarrito.length === 0) {
                // Si no hay productos, resetear totales
                const dataUpdate = {
                    in_vlr_total: 0,
                    in_subtot_pos: 0,
                    in_vlr_total_imp: 0
                };
                
                await db.cabeza.update(cabezaPedido.id, dataUpdate);
                setCabezaPedido(prev => ({ ...prev, ...dataUpdate }));
                return;
            }


            let descuento = 0;
            let impuestosBon = 0;
            let totalNoImp = 0;
            let impuestos = 0;
            let total = 0;

            // Iterar sobre cada producto en el carrito
            for (let item of listaCarrito) {
                let descAplicar = 0;
                let subtotalItem = (parseFloat(item.Precio) || 0) * (parseInt(item.CantSolicitada) || 0);
                let descto = 0;
                
                if (descAplicar > 0) {
                    descto = ((subtotalItem * descAplicar) / 100);
                    descuento += descto;
                }
                
                // Calcular impuestos para productos bonificados
                impuestosBon = 0;
                if ((parseInt(item.CantBonificada) || 0) > 0) {
                    impuestosBon = ((parseFloat(item.PorcImpto) || 0) / 100) * ((parseFloat(item.Precio) || 0) * (parseInt(item.CantBonificada) || 0));
                }
                
                // Acumular totales
                totalNoImp += subtotalItem;
                impuestos += ((parseFloat(item.PorcImpto) || 0) / 100) * (parseFloat(subtotalItem) - parseFloat(descto));
                impuestos += impuestosBon;
            }
            
            total = (totalNoImp + impuestos) - descuento;

            const dataUpdate = {
                in_vlr_total: total,
                in_subtot_pos: totalNoImp,
                in_vlr_total_imp: impuestos
            };
            await db.cabeza.update(cabezaPedido.id, dataUpdate);
            
            // Actualizar el estado local inmediatamente
            setCabezaPedido(prev => ({ ...prev, ...dataUpdate }));

        } catch (error) {
            console.error('Error al capturar totales:', error);
        }
    }

    // Agregar función para manejar el guardado
    const handleSaveDetalles = async (detalles) => {
        try {
            if (!cabezaPedido?.id) return;
            
            const dataUpdate = {
                ...cabezaPedido,
                fecha_entrega: detalles.fechaEntrega,
                tipo_envio: detalles.tipoEnvio,
                observaciones: detalles.observaciones
            };
            
            await db.cabeza.update(cabezaPedido.id, dataUpdate);
            setCabezaPedido(dataUpdate);
            
            Funciones.alerta(
                "Éxito",
                "Detalles de entrega guardados correctamente",
                "success",
                () => {}
            );
        } catch (error) {
            console.error('Error al guardar detalles:', error);
            Funciones.alerta(
                "Error",
                "No se pudieron guardar los detalles",
                "error",
                () => {}
            );
        }
    };

    const abreModalDetallesEntrega = (valor) => {
        // Verificar si clienteSel tiene propiedades (es un objeto con datos)
        const clienteSeleccionado = clienteSel && Object.keys(clienteSel).length > 0;
        
        if(!clienteSeleccionado && listaCarrito.length === 0){
            Funciones.alerta("Atención","Debe seleccionar un cliente y agregar productos al carrito antes de continuar","info",()=>{})
        }
        else{
            setShowDetallesEntrega(valor);
        }
    }

    const getDestinos = async () => {
        try {
            if (!cabezaPedido?.tx_cod_sn) {
                setDestinos([]);
                return;
            }
            
            const destinosClientes = await db.destinos
                .where('SN')
                .equals(cabezaPedido.tx_cod_sn)
                .toArray();
                
            setDestinos(destinosClientes || []);
        } catch (error) {
            console.error('Error fetching destinos:', error);
            setDestinos([]);
        }
    }

    // Mostrar loading mientras se inicializa
    if (cargando || !isInitialized) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-2xl mb-4">Cargando...</div>
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
                </div>
            </div>
        );
    }

    const handleConvertirPedido = () => {
        Funciones.confirmacion("Atencion","Está a punto de convertir esta cotización en un pedido, ¿Desea continuar?","info", async()=>{
            
            // Clona la cabeza y las líneas para no mutar el estado original
            const cabezaNuevaPedido = { ...cabezaPedido };
            const uuidCotizacion    = cabezaNuevaPedido.id_consec
            const nuevoIdConsec = uuidv4();
            cabezaNuevaPedido.id_consec = nuevoIdConsec;
            cabezaNuevaPedido.in_tipo = 'pedidos'; 
            cabezaNuevaPedido.sync = 0; 
            cabezaNuevaPedido.DocNum = 0;
            cabezaNuevaPedido.DocEntry = 0;
            cabezaNuevaPedido.in_estado = 0;
            cabezaNuevaPedido.tx_comentarios = `Pedido generado de la cotizacion: ${uuidCotizacion}`;
            cabezaNuevaPedido.dt_fecha_reg = new Date();

            //borro el id actual de la cabza acutal para que Dexie cree uno nuevo
            delete cabezaNuevaPedido.id; 
            //Inserto la nueva cabeza
            const nuevoIdCabeza = await db.cabeza.add(cabezaNuevaPedido);

            // Clona y actualiza las líneas
            const lineasNuevoPedido = listaCarrito.map(item => {
                const nuevaLinea = { ...item };
                nuevaLinea.in_id_cabeza = nuevoIdCabeza;
                nuevaLinea.sync = 0;
                nuevaLinea.dt_fecha_reg = new Date();
                // Opcional: limpia otros campos si es necesario
                delete nuevaLinea.id; // Elimina el id anterior para que Dexie genere uno nuevo
                return nuevaLinea;
            });

            // Inserta todas las líneas nuevas
            await db.lineas.bulkAdd(lineasNuevoPedido);

            // Redirige al nuevo pedido
            navigate(`/proceso/pedidos/${nuevoIdCabeza}`);
            window.location.reload();
        })
    };

    return (
        <>
            <TopBarProceso titulo={getTitulo()} toggleIA={toggleIA} listaCarrito={listaCarrito} tipoProceso={tipoProceso} idProceso={idProceso} startTour={startTour} setShowDetallesEntrega={abreModalDetallesEntrega} cabezaPedido={cabezaPedido}/>
            
            <div className="w-full lg:w-[54%] md:p-10 m-auto  mt-[22%] lg:mt-[3%] md:mt-[5%] flex flex-wrap text-gray-700 relative">
                <div className="shadow-lg w-full">
                    <div className="w-full px-[5%] lg:px-[3%] mb-4 font-bold">
                        <div className="w-full flex items-center justify-between text-gray-500">
                            <small>CLIENTE</small>
                        </div>
                        <div className="flex items-center justify-between clienteSeleccionado">
                            {
                                (cabezaPedido.tx_nom_sn_nombre && cabezaPedido.tx_nom_sn_nombre !== "") ? cabezaPedido.tx_nom_sn_nombre : "SELECCIONA UN CLIENTE"
                            }

                            {cabezaPedido && cabezaPedido.sync === 0 && (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8 cursor-pointer agregaCliente" onClick={toggleClientes}>
                                    <path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
                                </svg>
                            )}

                        </div>
                    </div>
                    <div className="w-full grid grid-cols-12 px-[5%] lg:px-[3%] font-bold border-t-1 py-4 border-gray-300 items-center justify-between ">
                        <h2 className="col-span-11 grid items-center uppercase">
                            Productos agregados
                            <small className="font-normal cantidadesPedido">
                                Líneas: {listaCarrito.length} | Solicitadas: {totalSolicitadas} | Bonificadas: {totalBonificadas}
                            </small>
                            {/* <span className="bg-red-700 p-2 rounded-full text-white w-[30px] h-[30px] flex items-center justify-center ml-2">{listaCarrito.length}</span> */}
                        </h2> 
                        {/* boton de ver el modal de productos */}
                        {cabezaPedido && cabezaPedido.sync === 0 && (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"  className=" col-span-1 size-8 cursor-pointer agregaProductos" onClick={toggleProductos}>
                                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" />
                            </svg>
                        )}

                    </div>
                </div>

                {/* productos */}
                <div className="w-full px-[5%] lg:px-[3%] font-bold border-t-1 py-4 border-gray-300 h-auto mb-30 carrito">

                        {listaCarrito && listaCarrito.length > 0 ? (
                            listaCarrito.map((item, index) => (
                                <CardProducto item={item} key={index} index={index} buttonAdd={false} buttonDel={true} initializeProcess={initializeProcess} modificaDb={true} sync={cabezaPedido.sync} calculaYActualizaTotales={refrescaCatidades}/>
                        ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="text-6xl mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-30">
                                        <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Tu carrito está vacío
                                </h3>
                                <p className="text-gray-500 text-center">
                                    No hay productos agregados al {tipoProceso} aún
                                </p>
                            </div>
                        )}

                       
                </div>
            </div>
            
            {/* Panel de Totales Colapsable */}
            <div className="w-full  bg-black text-white fixed bottom-0 totales">
                <div className="w-full lg:w-[50%] m-auto">
                    <div className="p-4">
                        {/* Botón de toggle con flecha */}
                        <div className="flex justify-center mb-0 relative">
                            <button 
                                onClick={toggleDetails}
                                className="flex items-center justify-center transition-colors duration-100 absolute bg-black top-[-30px] rounded-t-lg py-1 px-10"
                            >
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    viewBox="0 0 24 24" 
                                    fill="currentColor" 
                                    className={`w-6 h-6 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`}
                                >
                                    <path fillRule="evenodd" d="M11.47 7.72a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06L12 9.31l-6.97 6.97a.75.75 0 0 1-1.06-1.06l7.5-7.5Z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>

                        {/* Detalles colapsables */}
                        <div className={`overflow-hidden transition-all duration-75 ${showDetails ? 'max-h-auto opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="space-y-3 mb-4">


                                {/* muestro los detalles solo cuando ya este sincronizado */}
                                {cabezaPedido && cabezaPedido.sync === 1 && (
                                    <>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                            <span className="font-bold">FECHA DOC:</span>
                                            <span className="font-normal uppercase">
                                                {cabezaPedido.dt_fecha_reg.toISOString().split('T')[0]}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                            <span className="font-bold">FECHA ENTREGA:</span>
                                            <span className="font-normal uppercase">
                                                {cabezaPedido.fechaEntrega}
                                            </span>
                                        </div>
                                        { cabezaPedido && cabezaPedido.in_tipo === 'pedidos' && (
                                            <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                                <span className="font-bold">CODIGO SAP:</span>
                                                <span className="font-normal uppercase">
                                                    {cabezaPedido.DocNum}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                            <span className="font-bold">ESTADO:</span>
                                            <span className="font-normal uppercase">
                                                {cabezaPedido.sync === 1? 'Sincronizado' : 'No sincronizado'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                            <span className="font-bold">TIPO ENVIO:</span>
                                            <span className="font-normal uppercase">
                                                {cabezaPedido.tipoEnvio !== "" ? cabezaPedido.tipoEnvio : 'Desconocido'}
                                            </span>
                                        </div>
                                        
                                        <div className="grid py-2 border-b border-gray-700">
                                            <div className="font-bold">DESTINO:</div>
                                            <div>
                                                {cabezaPedido.tx_dir_add_cli_pos !== "" ? cabezaPedido.tx_dir_add_cli_pos : 'Desconocido'} - 
                                                {cabezaPedido.tx_dir_cli_pos !== "" ? cabezaPedido.tx_dir_cli_pos : 'Desconocido'}
                                            </div>
                                        </div>
                                        
                                        <div className="grid py-2 border-b border-gray-700">
                                            <div className="font-bold">ASESOR COMERCIAL:</div>
                                            <div>
                                                {cabezaPedido.tx_nom_emp !== "" ? cabezaPedido.tx_nom_emp : 'Desconocido'}
                                            </div>
                                        </div>
                                        <div className="grid py-2 border-b border-gray-700">
                                            <div className="font-bold">COMENTARIOS:</div>
                                            <div>
                                                {cabezaPedido.observaciones !== "" ? cabezaPedido.observaciones : 'Desconocido'}
                                            </div>
                                        </div>
                                    </>
                                )}

                                



                                {/* Subtotal */}
                                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                    <span className="font-bold uppercase">Subtotal:</span>
                                    <span className="font-normal">
                                        ${cabezaPedido.in_subtot_pos ? cabezaPedido.in_subtot_pos.toLocaleString('es-CO') : '0'}
                                    </span>
                                </div>
                                
                                {/* Impuestos */}
                                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                    <span className="font-bold uppercase">Impuestos (IVA):</span>
                                    <span className="font-normal">
                                        ${cabezaPedido.in_vlr_total_imp ? cabezaPedido.in_vlr_total_imp.toLocaleString('es-CO') : '0'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Total - siempre visible */}
                        <div className="flex justify-between items-center py-3">
                            <span className="text-lg font-bold">TOTAL:</span>
                            <span className="text-xl font-bold">
                                ${cabezaPedido.in_vlr_total ? cabezaPedido.in_vlr_total.toLocaleString('es-CO') : '0'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-3 gap-2">
                        {cabezaPedido && cabezaPedido.sync === 1 && cabezaPedido.in_tipo ==='cotizaciones' && (
                            <>
                                <Link to={`${API_MTS}api/cotizacion/pdf/${cabezaPedido.id_consec}`} target="_blank" className="m-auto bg-red-700 p-4 lg:w-[50%] font-bold rounded-lg flex items-center  cursor-pointer justify-between">
                                    BAJAR PDF
                                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className="size-5 ml-4">
                                        <path d="M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 144-208 0c-35.3 0-64 28.7-64 64l0 144-48 0c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128zM176 352l32 0c30.9 0 56 25.1 56 56s-25.1 56-56 56l-16 0 0 32c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-48 0-80c0-8.8 7.2-16 16-16zm32 80c13.3 0 24-10.7 24-24s-10.7-24-24-24l-16 0 0 48 16 0zm96-80l32 0c26.5 0 48 21.5 48 48l0 64c0 26.5-21.5 48-48 48l-32 0c-8.8 0-16-7.2-16-16l0-128c0-8.8 7.2-16 16-16zm32 128c8.8 0 16-7.2 16-16l0-64c0-8.8-7.2-16-16-16l-16 0 0 96 16 0zm80-112c0-8.8 7.2-16 16-16l48 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0 0 32 32 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0 0 48c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-64 0-64z"/>
                                    </svg>
                             

                                </Link>
                                
                                <button onClick={handleConvertirPedido} className="m-auto bg-[#708F65] p-4 lg:w-[50%] font-bold rounded-lg flex items-center  cursor-pointer justify-between">
                                    CONVERTIR EN PEDIDO
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                        <path fillRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 0 1 3.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 0 1 3.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875ZM12.75 12a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V18a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V12Z" clipRule="evenodd" />
                                        <path d="M14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z" />
                                    </svg>
                                </button>
                            </>
                        )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal clientes*/}
            <ModalClientes showClientes={showClientes} toggleClientes={toggleClientes} setClienteSel={setClienteSel}  onlyView={false}/>
            {/* fin del modal clientes */}

            {/* Modal productos*/}
            <ModalProductos showProductos={showProductos} toggleProductos={toggleProductos} handleAddToCar={handleAddToCar}  onlyView={false}/>
            {/* fin del modal productos */}

            {/* Modal IA*/}
            <ModalIA showIA={showIA} toggleIA={toggleIA} handleAddToCar={handleAddToCar} setClienteSel={setClienteSel}/>
            {/* fin del modal IA */}

        
            <ModalDetallesEntrega 
                isOpen={showDetallesEntrega} 
                onClose={() => setShowDetallesEntrega(false)}
                onSave={handleSaveDetalles}
                titulo={tipoProceso?.toLowerCase()}
                destinos = {destinos}
                idProceso={idProceso}
                tipoProceso = {tipoProceso}
                handleRefresh={handleRefresh}
                cabezaPedido={cabezaPedido}
            />
        </>
    )
}

export default Proceso
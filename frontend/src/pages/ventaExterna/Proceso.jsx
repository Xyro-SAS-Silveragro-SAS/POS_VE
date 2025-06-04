import { useParams, useNavigate } from "react-router"
import TopBarProceso from "../../components/global/TopBarProceso"
import { useState, useEffect } from "react"
import defaultImage  from '../../assets/img/default.png'
import Cantidades from "../../components/ventaExterna/Cantidades"
import ModalClientes from "../../components/global/modal/ModalClientes"
import ModalProductos from "../../components/global/modal/ModalProductos"
import ModalIA from "../../components/global/modal/ModalAI"
import ModalTodosProductos from "../../components/global/modal/ModalTodosProductos"
import { useAuth } from "../../context/AuthContext"
import CardProducto from "../../components/ventaExterna/CardProducto"
import { db } from "../../db/db"
import { v4 as uuidv4 } from 'uuid';

const Proceso = () => {
    const {currentUser}                                         = useAuth()
    const navigate                                              = useNavigate()
    const {tipoProceso, idProceso}                              = useParams()
    const [cargando, setCargando]                               = useState(false)
    const [titulo, setTitulo]                                   = useState('')
    const [idPedidoActual, setPedidoActual]                     = useState(0)
    const [showModalTodosProductos, setShowModalTodosProductos] = useState(false);
    const [showClientes, setShowClientes]                       = useState(false);
    const [showProductos, setShowProductos]                     = useState(false);
    const [showIA, setShowIA]                                   = useState(false);
    const [clienteSel, setClienteSel]                           = useState({})   
    const [cabezaPedido, setCabezaPedido]                       = useState({})
    const [dataCabeza, setDataCabeza]                           = useState({
            id_consec:uuidv4(),
            DocNum:0,
            DocEntry:0,
            in_tipo:tipoProceso,
            num_doc:0,
            num_fac:0,
            tx_cod_sn:'',
            tx_nom_sn_nombre:'',
            tx_dir_cli_pos:'',
            tx_tel_cli_pos:"",
            tx_cod_alm_pos:"",
            in_subtot_pos:0,
            in_vlr_total:0,
            in_estado:0,
            dt_fecha_reg:new Date(),
            tx_usua:currentUser ? currentUser.id_usuario : '',
            tx_comentarios:"",
            tx_nom_emp:'-Ningún empleado del departamento de ventas-',
            in_cod_emp:0,
            resp_api:'',
            in_lst_precio:0,
            tx_usuario_logueado:currentUser ? currentUser.id_usuario : '',
            es_cotizacion:0,
            sync:0,
          }
    )
    const [dataLineas, setDataLineas]             = useState({
            id_num_lin_pos:0,
            id_num_doc_pos:0,
            tx_cod_art_pos:0,
            tx_desc_art_pos:0,
            in_vlr_unit_pos:0,
            in_cantidad:0,
            in_cantbonif_pos:0,
            in_stock_pos:0,
            lotes:0,
            CodigoBarras:0,
            in_dto_pos:0,
            in_dto_pos_bk:0,
            tx_cod_imp_pos:0,
            in_porc_imp_pos:0,
            in_tot_lin_pos:0,
            in_estado_lin_pos:0,
            id_tienda:0,
            id_caja:0,
            dt_fecha_reg:0,
            tx_usua_reg:currentUser ? currentUser.id_usuario : '',
            esNube:0,
            CodAlmacen:0,
            EsInventariable:0,
            conDescuentoCliente:0,
            sync:0,
    })

    useEffect(() => {
        async function initializeProcess() {
            setCargando(true);
            
            try {
                // Cuando el pedido no existe lo creo
                if(idProceso === undefined){
                    const nuevaCabeza = {
                        ...dataCabeza,
                        id_consec: uuidv4(),
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
                    setPedidoActual(idProceso);
                    
                    // Consulto la data del pedido actual para persistir
                    // CORRECCIÓN: usar idProceso en lugar de idPedidoActual
                    const infoCabeza = await db.cabeza.get(parseInt(idProceso));
                    
                    if (infoCabeza) {
                        setCabezaPedido(infoCabeza);
                    } else {
                        console.error('No se encontró la cabeza del pedido con ID:', idProceso);
                        // Opcional: redirigir o manejar el error
                    }
                }
            } catch (error) {
                console.error('Error al inicializar el proceso:', error);
            } finally {
                setCargando(false);
            }
        }
        
        initializeProcess();
    }, [tipoProceso, idProceso]); // Agregar dependencias correctas

    useEffect(() => {
        // Actualizar cabeza cuando cambie el cliente seleccionado
        if (clienteSel && Object.keys(clienteSel).length > 0 && idPedidoActual) {
            updateCabezaConCliente();
        }
    }, [clienteSel, idPedidoActual]);

    const updateCabezaConCliente = async () => {
        try {
            const cabezaActualizada = {
                ...cabezaPedido,
                tx_cod_sn: clienteSel.Codigo || '',
                tx_nom_sn_nombre: clienteSel.Nombre || '',
                tx_dir_cli_pos: clienteSel.Direccion || '',
                tx_tel_cli_pos: clienteSel.Telefono || '',
            };
            
            await db.cabeza.update(parseInt(idPedidoActual), cabezaActualizada);
            setCabezaPedido(cabezaActualizada);
        } catch (error) {
            console.error('Error al actualizar cabeza con cliente:', error);
        }
    };


    const toggleModalTodosProductos = () => {
        setShowModalTodosProductos(!showModalTodosProductos);
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

    const handleCantidad = (tipo, item, cantidad) => {
        // Implementar lógica para manejar cantidades
    }

    const items = Array(2).fill().map((_, index) => ({
        id: 1234 + index,
        nombre: 'ABONADORA SEMBRADORA X 12 KILOS '+index,
        cantidad:0,
        codigoItem:'ACCGRAE35N',
        sync: (index % 4 === 0)? false: true
    }));

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

    return (
        <>
            <TopBarProceso titulo={getTitulo()} toggleIA={toggleIA}/>
            
            <div className="w-full lg:w-[54%] md:p-10 m-auto  mt-[22%] lg:mt-[3%] md:mt-[5%] flex flex-wrap text-gray-700 relative">
                <div className="shadow-lg w-full">
                    <div className="w-full px-[5%] lg:px-[3%] mb-4 font-bold">
                        <div className="w-full flex items-center justify-between text-gray-500">
                            <small>Escoge un cliente</small>
                        </div>
                        <div className="flex items-center justify-between">
                            {
                                (cabezaPedido.tx_nom_sn_nombre && cabezaPedido.tx_nom_sn_nombre !== "") ? cabezaPedido.tx_nom_sn_nombre : "SELECCIONA UN CLIENTE"
                            }

                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8 cursor-pointer" onClick={toggleClientes}>
                                <path d="M8.25 10.875a2.625 2.625 0 1 1 5.25 0 2.625 2.625 0 0 1-5.25 0Z" />
                                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.125 4.5a4.125 4.125 0 1 0 2.338 7.524l2.007 2.006a.75.75 0.1 0 1.06-1.06l-2.006-2.007a4.125 4.125 0 0 0-3.399-6.463Z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <div className="w-full px-[5%] lg:px-[3%] font-bold border-t-1 py-4 border-gray-300 flex items-center justify-between ">
                        <h2 className="flex items-center uppercase">
                            Productos agregados
                            <span className="bg-red-700 p-2 rounded-full text-white w-[30px] h-[30px] flex items-center justify-center ml-2">40</span>
                        </h2>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8 cursor-pointer" onClick={toggleProductos}>
                            <path d="M8.25 10.875a2.625 2.625 0 1 1 5.25 0 2.625 2.625 0 0 1-5.25 0Z" />
                            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.125 4.5a4.125 4.125 0 1 0 2.338 7.524l2.007 2.006a.75.75 0.1 0 1.06-1.06l-2.006-2.007a4.125 4.125 0 0 0-3.399-6.463Z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>

                {/* productos */}
                <div className="w-full px-[5%] lg:px-[3%] font-bold border-t-1 py-4 border-gray-300 h-auto overflow-auto">
                        {items && items.length > 0 && items.map((item, index) => (
                           <CardProducto item={item} key={index} index={index}/>
                        ))}
                        {/* Botón Ver Todos los Productos */}
                        <div className="w-full px-[5%] lg:px-[3%] py-4 border-t border-gray-300">
                            <button 
                                onClick={toggleModalTodosProductos}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625Z" />
                                    <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
                                </svg>
                                VER TODOS LOS {items.length} PRODUCTOS
                            </button>
                        </div>



                </div>

            </div>
            
            {/* Panel de Totales */}
            <div className="w-full py-4 bg-black text-white">
                <div className="rounded-lg sborder border-gray-200 p-4">
                    <div className="space-y-3">
                        {/* Subtotal */}
                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                            <span className=" font-normal">Subtotal:</span>
                            <span className=" font-normal">
                                ${cabezaPedido.in_subtot_pos ? cabezaPedido.in_subtot_pos.toLocaleString('es-CO') : '0'}
                            </span>
                        </div>
                        
                        {/* Impuestos */}
                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                            <span className="font-normal">Impuestos (IVA):</span>
                            <span className="font-normal">
                                ${((cabezaPedido.in_vlr_total || 0) - (cabezaPedido.in_subtot_pos || 0)).toLocaleString('es-CO')}
                            </span>
                        </div>
                        
                        {/* Total */}
                        <div className="flex justify-between items-center py-3">
                            <span className="text-lg font-bold">TOTAL:</span>
                            <span className="text-xl font-bold">
                                ${cabezaPedido.in_vlr_total ? cabezaPedido.in_vlr_total.toLocaleString('es-CO') : '0'}
                            </span>
                        </div>
                    </div>
                    
                </div>
            </div>

            {/* Modal clientes*/}
            <ModalClientes showClientes={showClientes} toggleClientes={toggleClientes} setClienteSel={setClienteSel} />
            {/* fin del modal clientes */}

            {/* Modal productos*/}
            <ModalProductos showProductos={showProductos} toggleProductos={toggleProductos}/>
            {/* fin del modal productos */}

            {/* Modal IA*/}
            <ModalIA showIA={showIA} toggleIA={toggleIA}/>
            {/* fin del modal IA */}

            {/* modal todos lo productos */}
            <ModalTodosProductos toggleModalTodosProductos={toggleModalTodosProductos} items={items} showModalTodosProductos={showModalTodosProductos}/>
            {/* fin modal todos lo productos */}
        </>
    )
}

export default Proceso
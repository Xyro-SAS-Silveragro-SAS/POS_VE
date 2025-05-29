import { VERSION, API_MTS, TOKEN, USER_TOKEN } from "../../config/config"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import api from "../../services/apiService"
import ApiSL from "../../services/apiSL";
import ApiMTS from "../../services/apiMts";
import { db } from "../../db/db"
import { useConnection } from "../../context/ConnectionContext"
import { useAuth } from "../../context/AuthContext"
import ConnectionAlert from "../../components/global/ConnectionAlert"
import Funciones from "../../helpers/Funciones"
import logo from "../../assets/img/logo.png"
import xyro from "../../assets/img/xyro.png"
import Mensajes from "../../data/Mensajes"
const Login = () => {
    const [cargando, setCargando]                   = useState(true)
    const navigate                                  = useNavigate()
    const { isOnline }                              = useConnection()
    const { login, isAuthenticated, isLoading }     = useAuth()
    const [almacenes, setAlmacenes]                 = useState([])
    const [mensajeAleatorio, setMensajeAleatorio]   = useState("")

    const [dataLogin, setDataLogin] = useState({
        usuario: '',
        clave: '',
        bodega: ''
    })
    //efecto para cargar usuarios de la api y guardarlos en la base de datos local
    useEffect(() => {
        sessionStorage.removeItem('auth_token');
        if(isOnline){
            cargarUsuariosNube();
            getAlmacenesNube();
        }
        else{
            //leo los almacenes de la base de datos local
            db.almacenes.toArray().then((almacenes) => {
                setAlmacenes(almacenes)
            })
        }

        const indiceAleatorio = Math.floor(Math.random() * Mensajes.length);
        setMensajeAleatorio(Mensajes[indiceAleatorio]);

    }, []) 

    const getAlmacenesNube = async () => {
        try {
          setCargando(true)
          // Consultar la API para obtener los almacenes
          const almacenes = await api.get('api/bodegas')
          if (almacenes.datos && almacenes.datos.length > 0) {
                //pongo el listado de almacenes en el state
                setAlmacenes(almacenes.datos)
                // Almacenar los usuarios en la base de datos local
                // Borro la data de los usuarios para volverla a cargar con lo que venga en el api
                await db.table('almacenes').clear()
                // Insertar cada usuario en la base de datos
                for (const almacen of almacenes.datos) {
                    // Si el usuario tiene bodegas, las guardamos como parte del objeto
                    await db.almacenes.add(almacen)
                }
            }
            setCargando(false)
        }
        catch (error) {
            console.error("Error al cargar almacenes:", error)
            setCargando(false)
        }
    }
    const getClientes = async () => {
        try {
          setCargando(true)
          // Consultar la API para obtener los almacenes
          const clientes = await api.get('api/clientes/vexterna')
          if (clientes.datos && clientes.datos.length > 0) {
                // Almacenar los usuarios en la base de datos local
                // Borro la data de los usuarios para volverla a cargar con lo que venga en el api
                await db.table('clientes').clear()
                // Insertar cada usuario en la base de datos
                for (const cliente of clientes.datos) {
                    // Si el usuario tiene bodegas, las guardamos como parte del objeto
                    await db.clientes.add(cliente)
                }
            }
            setCargando(false)
        }
        catch (error) {
            console.error("Error al cargar clientes:", error)
            setCargando(false)
        }
    }

    const getItems = async (bodega) => {
        try {
          setCargando(true)
          // Consultar la API para obtener los almacenes
          const items = await api.get('api/inventario/bodega/BOD')
          if (items.datos && items.datos.length > 0) {
                // Almacenar los usuarios en la base de datos local
                // Borro la data de los usuarios para volverla a cargar con lo que venga en el api
                await db.table('items').clear()
                // Insertar cada usuario en la base de datos
                for (const item of items.datos) {
                    // Si el usuario tiene bodegas, las guardamos como parte del objeto
                    await db.items.add(item)
                }
            }
            setCargando(false)
        }
        catch (error) {
            console.error("Error al cargar clientes:", error)
            setCargando(false)
        }
    }

    const getDestinos = async () => {
        try {
          setCargando(true)
          // Consultar la API para obtener los almacenes
          const destinos = await api.get('api/clientes/destinos')
          if (destinos.datos && destinos.datos.length > 0) {
                // Almacenar los usuarios en la base de datos local
                // Borro la data de los usuarios para volverla a cargar con lo que venga en el api
                await db.table('destinos').clear()
                // Insertar cada usuario en la base de datos
                for (const item of destinos.datos) {
                    // Si el usuario tiene bodegas, las guardamos como parte del objeto
                    await db.destinos.add(item)
                }
            }
            setCargando(false)
        }
        catch (error) {
            console.error("Error al cargar clientes:", error)
            setCargando(false)
        }
    }

    const cargarUsuariosNube = async () => {
        try {
            setCargando(true)
            // Consultar la API para obtener los usuarios
            const usuarios = await api.get('api/usuarios/vexterna')
            if (usuarios.datos && usuarios.datos.length > 0) {
                // Almacenar los usuarios en la base de datos local
                // Borro la data de los usuarios para volverla a cargar con lo que venga en el api
                await db.table('usuarios').clear()
                // Insertar cada usuario en la base de datos
                for (const usuario of usuarios.datos) {
                    // Si el usuario tiene bodegas, las guardamos como parte del objeto
                    await db.usuarios.add(usuario)
                }
            }
            setCargando(false)

        } catch (error) {
            console.error("Error al cargar usuarios:", error)
            setCargando(false)
        }
    }
    const handleChange = (e, field) => {
        const value = e.target.value;
        setDataLogin(prevData => {
            const updatedData = {
                ...prevData,
                [field]: value
            };
            return updatedData;
        });
    }
    const handleLogin = async () => {
        const result = await login(dataLogin);
        console.log(result)

        if (result.success) {
            //consulto las tablas restantes solo si hay internet
            if(isOnline){
                //consulto las tablas restantes
                Funciones.alerta("Atencion", "Bienvenido "+result.user.tx_nombre, result.success ? 'success' : 'error', async () => {
                    await getClientes().catch(err => console.error("Error cargando clientes en segundo plano:", err));
                    await getItems(dataLogin.bodega).catch(err => console.error("Error cargando items en segundo plano:", err));
                    await getDestinos().catch(err => console.error("Error cargando destinos en segundo plano:", err));
                    navigate('/home');
                })
            }
            else{
                
                Funciones.alerta("Atencion", "Bienvenido "+result.user.tx_nombre, result.success ? 'success' : 'error', async () => {
                    navigate('/home');
                })
            }
        }
    }
  return (
    <>
        {/* alerta de conexion */}
        <ConnectionAlert/>

        <div className="w-[100%] h-dvh bg-[#546C4C] text-gray-600">
            <div className="m-auto py-[20%] px-[10%] w-full md:w-[80%] lg:w-[30%] lg:p-[5%]">
                <img src={logo} alt="" className="mb-[10%] w-[60%] m-auto"/>

                <blockquote className="text-center italic text-white/90 mb-8 border-l-4 border-red-500 pl-4 py-2">
                    {mensajeAleatorio}
                </blockquote>

                <div className="grid mb-4">
                    <h2 className="font-bold mb-2 text-white">Ingrese el correo electrónico</h2>
                    <input 
                        type="text" 
                        className="border-1 border-gray-300 p-3  rounded-lg bg-[#f6f6f6]" 
                        placeholder="Escribe tu correo electrónico" 
                        value={dataLogin.usuario || ''} 
                        onChange={(e) => handleChange(e, 'usuario')}
                    />
                    {/* <small className="text-white">Normalmente es el correo electr&oacute;nico.</small> */}
                </div>

                <div className="grid mb-4">
                    <h2 className="font-bold mb-2 text-white">Ingrese la contraseña</h2>
                    <input 
                        type="password" 
                        className="border-1 border-gray-300 p-3  rounded-lg bg-[#f6f6f6]" 
                        placeholder="Contrase&ntilde;a" 
                        value={dataLogin.clave || ''} 
                        onChange={(e) => handleChange(e, 'clave')}
                    />
                </div>
                
                <div className="grid mb-4">
                    <h2 className="font-bold mb-2 text-white">Bodega</h2>
                    <select className="border-1 border-gray-300 p-3  rounded-lg bg-[#f6f6f6]" placeholder="Ejemplo: Calle 20 # 15 - 15" 
                        value={dataLogin.bodega || ''} 
                        onChange={(e) => handleChange(e, 'bodega')} >
                        <option value="">SELECCIONE...</option>
                        { almacenes && almacenes.map( (almacen, index) => (
                            <option key={index} value={almacen.tx_codigo}>{almacen.tx_nombre}</option>
                        ))}
                    </select>
                </div>


                <button 
                        onClick={handleLogin} 
                        type="button" 
                        className='cursor-pointer bg-red-700 flex justify-center py-4 px-8 w-full text-white rounded-md font-bold mt-10'
                        disabled={isLoading || cargando}
                    >
                        {isLoading || cargando ? 'CARGANDO...' : 'INGRESAR'}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 ml-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                    </button>
                

            </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-4 bg-[#4E6446]">
            <div className="grid grid-cols-12 flex items-center">
                <div className="col-span-12 flex items-center justify-center text-white">
                    <img src={xyro} className="w-[50px] mr-4" alt="Logo Xyro" />
                    <small>Versi&oacute;n {VERSION}</small>
                </div>
            </div>
        </div>
    </>
  )
}
export default Login
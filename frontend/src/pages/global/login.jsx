import { VERSION, API_MTS } from "../../config/config"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import api from "../../services/apiService"
import { db } from "../../db/db"
import { useConnection } from "../../context/ConnectionContext"
import { useAuth } from "../../context/AuthContext"
import ConnectionAlert from "../../components/global/ConnectionAlert"
import Funciones from "../../helpers/Funciones"
import logo from "../../assets/img/logo.png"
import xyro from "../../assets/img/xyro.png"
const Login = () => {
    const [cargando, setCargando]   = useState(true)
    const navigate                  = useNavigate()
    const { isOnline }              = useConnection()
    const { login, isAuthenticated, isLoading } = useAuth()
    const [almacenes, setAlmacenes] = useState([])

    const [dataLogin, setDataLogin] = useState({
        usuario: '',
        clave: '',
        bodega: ''
    })
    //efecto para cargar usuarios de la api y guardarlos en la base de datos local
    useEffect(() => {
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
    }, []) 

    const getAlmacenesNube = async () => {
        try {
          setCargando(true)
          // Consultar la API para obtener los almacenes
          const almacenes = await api.get('bodegas')
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
    const cargarUsuariosNube = async () => {
        try {
            setCargando(true)
            // Consultar la API para obtener los usuarios
            const usuarios = await api.get('usuarios')
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
        

        if (result.success) {
            //consulto las tablas restantes solo si hay internet
            if(isOnline){
                //consulto las tablas restantes
                //await cargarTablasRestantes();
                Funciones.alerta("Atencion", "Bienvenido", result.success ? 'success' : 'error', () => {
                    navigate('/home');
                })
            }
            else{
                navigate('/home');
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
                    "Tu pasión cierra ventas, tu servicio crea lealtad."
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
                            <option key={index} value={almacen.id}>{almacen.tx_nombre}</option>
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
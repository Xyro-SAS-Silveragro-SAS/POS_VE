import { VERSION, API_MTS, TOKEN, USER_TOKEN } from "../../config/config"
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
import Mensajes from "../../data/Mensajes"
import datosInteresantes from "../../data/Interesantes"
import PreloaderLogin from "../../components/global/PreloaderLogin"

const Login = () => {
    const [loading, setLoading]                     = useState(false);
    const [cargando, setCargando]                   = useState(true)
    const navigate                                  = useNavigate()
    const { isOnline }                              = useConnection()
    const { login, isAuthenticated, isLoading }     = useAuth()
    const [almacenes, setAlmacenes]                 = useState([])
    const [mensajeAleatorio, setMensajeAleatorio]   = useState("")
    const [datoAleatorio, setDatoAleatorio]         = useState("")

    // Estados para PWA
    const [deferredPrompt, setDeferredPrompt]       = useState(null)
    const [showInstallButton, setShowInstallButton] = useState(false)
    const [isAppInstalled, setIsAppInstalled]       = useState(false)

    const [dataLogin, setDataLogin] = useState({
        usuario: '',
        clave: '',
        bodega: ''
    })

    // Detectar si la app ya está instalada
    const checkIfAppInstalled = () => {
        // Método 1: Verificar si está en modo standalone (instalada)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        
        // Método 2: Verificar si está ejecutándose como PWA
        const isRunningStandalone = window.navigator.standalone === true;
        
        // Método 3: Verificar user agent (para algunos navegadores)
        const isInWebAppiOS = window.navigator.standalone;
        
        return isStandalone || isRunningStandalone || isInWebAppiOS;
    }

    // Configurar event listeners para PWA
    useEffect(() => {
        // Verificar si la app ya está instalada
        setIsAppInstalled(checkIfAppInstalled());

        // Event listener para el evento beforeinstallprompt
        const handleBeforeInstallPrompt = (e) => {
            console.log('beforeinstallprompt event fired');
            // Prevenir que el navegador muestre su propio prompt
            e.preventDefault();
            // Guardar el evento para usarlo después
            setDeferredPrompt(e);
            // Mostrar nuestro botón de instalación
            if (!checkIfAppInstalled()) {
                setShowInstallButton(true);
            }
        };

        // Event listener para cuando se instala la app
        const handleAppInstalled = (e) => {
            console.log('App installed successfully');
            setShowInstallButton(false);
            setIsAppInstalled(true);
            setDeferredPrompt(null);
            
            // Mostrar mensaje de éxito
            Funciones.alerta("¡Éxito!", "La aplicación se ha instalado correctamente", 'success');
        };

        // Agregar event listeners
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // Cleanup
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    // Función para manejar la instalación de la PWA
    const handleInstallPWA = async () => {
        if (!deferredPrompt) {
            console.log('No hay prompt de instalación disponible');
            return;
        }

        try {
            // Mostrar el prompt de instalación
            const result = await deferredPrompt.prompt();
            console.log('Resultado del prompt:', result);

            // Esperar a que el usuario responda al prompt
            const choiceResult = await deferredPrompt.userChoice;
            console.log('Elección del usuario:', choiceResult.outcome);

            if (choiceResult.outcome === 'accepted') {
                console.log('Usuario aceptó instalar la PWA');
                setShowInstallButton(false);
            } else {
                console.log('Usuario rechazó instalar la PWA');
            }

            // Limpiar el prompt usado
            setDeferredPrompt(null);
        } catch (error) {
            console.error('Error al intentar instalar la PWA:', error);
        }
    };

    //efecto para cargar usuarios de la api y guardarlos en la base de datos local
    useEffect(() => {
        sessionStorage.removeItem('auth_token');
        if(isOnline){
            cargarUsuariosNube();
            getAlmacenesNube();
        }
        else{
            setCargando(false)
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
                // Almacenar los usuarios en la base de datos local
                // Borro la data de los usuarios para volverla a cargar con lo que venga en el api
                await db.table('almacenes').clear()
                // Si el usuario tiene bodegas, las guardamos como parte del objeto
                await db.almacenes.bulkAdd(almacenes.datos)
                //pongo los almacenes de la db
                await db.almacenes.toArray().then((almacenes) => {
                    setAlmacenes(almacenes)
                })
            }
            setCargando(false)
        }
        catch (error) {
            console.error("Error al cargar almacenes:", error)
            setCargando(false)
        }
    }
    const getClientes = async (cdSap) => {
        try {
          setCargando(true)
          // Consultar la API para obtener los almacenes
          const clientes = await api.get('api/clientes/vexterna/codigo/'+cdSap)
          if (clientes.datos && clientes.datos.length > 0) {
                // Almacenar los usuarios en la base de datos local
                // Borro la data de los usuarios para volverla a cargar con lo que venga en el api
                await db.table('clientes').clear()
                // Si el usuario tiene bodegas, las guardamos como parte del objeto
                await db.clientes.bulkAdd(clientes.datos)
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
          const items = await api.get('api/inventario/bodega/'+bodega)
          if (items.datos && items.datos.length > 0) {
                // Almacenar los usuarios en la base de datos local
                // Borro la data de los usuarios para volverla a cargar con lo que venga en el api
                await db.table('items').clear()
                // Si el usuario tiene bodegas, las guardamos como parte del objeto
                await db.items.bulkAdd(items.datos)
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
                // Si el usuario tiene bodegas, las guardamos como parte del objeto
                await db.destinos.bulkAdd(destinos.datos)
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
                // Si el usuario tiene bodegas, las guardamos como parte del objeto
                await db.usuarios.bulkAdd(usuarios.datos)
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
            // Guardar la fecha de inicio de sesión en localStorage
            const today = new Date().toISOString().split('T')[0];
            localStorage.setItem('loginDate', today);

            //consulto las tablas restantes solo si hay internet
            if(isOnline){
                setLoading(true);
                const indiceAleatorioD = Math.floor(Math.random() * datosInteresantes.length);
                setDatoAleatorio(datosInteresantes[indiceAleatorioD]);

                //solo los clientes que tengan el cd_sap del usuario
                await getClientes(result.user.cd_sap).catch(err => console.error("Error cargando clientes en segundo plano:", err));
                await getItems(dataLogin.bodega).catch(err => console.error("Error cargando items en segundo plano:", err));
                await getDestinos().catch(err => console.error("Error cargando destinos en segundo plano:", err));
                //consulto las tablas restantes
                Funciones.alerta("Atencion", "Bienvenido "+result.user.tx_nombre, result.success ? 'success' : 'error', async () => {
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
        {/* Preloader overlay */}
        {loading && (
            <PreloaderLogin loading={loading} logo={logo} />
        )}

       
        {/* alerta de conexion */}
        <ConnectionAlert/>

        <div className="w-[100%] h-dvh bg-[#546C4C] text-gray-600">
            <div className="m-auto py-[20%] px-[10%] w-full md:w-[80%] lg:w-[30%] lg:p-[5%]">
                <img src={logo} alt="" className="mb-[10%] w-[60%] m-auto"/>

                {/* Botón de instalación PWA */}
                {showInstallButton && !isAppInstalled && (
                    <div className="mb-6 p-4 bg-blue-100 border border-blue-300 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600 mr-3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-blue-800">
                                        ¡Instala la aplicación!
                                    </p>
                                    <p className="text-xs text-blue-600">
                                        Accede más rápido desde tu dispositivo
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={handleInstallPWA}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Instalar
                            </button>
                        </div>
                    </div>
                )}

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

        <div className="absolute bottom-0 left-0 w-full p-4 bg-[#4E6446] z-1">
            <div className="grid grid-cols-12 items-center">
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
import { VERSION } from "../../config/config"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import logo from "../../assets/img/logo.png"
const Login = () => {
    const [formData, setFormData] = useState({
        usuario: '',
        clave: '',
        bodega: ''
    })
    const navigate = useNavigate()

    const handleChange = (e, field) => {
        const value = e.target.value;
        setFormData(prevData => {
            const updatedData = {
                ...prevData,
                [field]: value
            };
            return updatedData;
        });
    }

    const login = async () => {
      navigate('/home')
    }
  return (
    <>
        <div className="w-[100%] h-dvh bg-[#546C4C] text-gray-600">
            <div className="m-auto py-[20%] px-[10%] w-full md:w-[80%] lg:w-[30%] lg:p-[5%]">
                <img src={logo} alt="" className="mb-[20%]"/>
                

                <div className="grid mb-4">
                    <h2 className="font-bold mb-2 text-white">Ingrese el correo electrónico</h2>
                    <input 
                        type="text" 
                        className="border-1 border-gray-300 p-3  rounded-lg bg-[#f6f6f6]" 
                        placeholder="Nombre de usuario" 
                        value={ formData.usuario|| ''} 
                        onChange={(e) => handleChange(e, 'nombreTienda')}
                    />
                    {/* <small className="text-white">Normalmente es el correo electr&oacute;nico.</small> */}
                </div>

                <div className="grid mb-4">
                    <h2 className="font-bold mb-2 text-white">Ingrese la contraseña</h2>
                    <input 
                        type="text" 
                        className="border-1 border-gray-300 p-3  rounded-lg bg-[#f6f6f6]" 
                        placeholder="Contrase&ntilde;a" 
                        value={ formData.clave|| ''} 
                        onChange={(e) => handleChange(e, 'clave')}
                    />
                </div>
                
                <div className="grid mb-4">
                    <h2 className="font-bold mb-2 text-white">Bodega</h2>
                    <select className="border-1 border-gray-300 p-3  rounded-lg bg-[#f6f6f6]" placeholder="Ejemplo: Calle 20 # 15 - 15" 
                        value={formData.bodega || ''} 
                        onChange={(e) => handleChange(e, 'bodega')}
                    >
                        <option value="">SELECCIONE...</option>
                        
                    </select>
                </div>


                <button onClick={login} type="button" className='cursor-pointer bg-red-700 flex justify-center py-4 px-8 w-full text-white rounded-md font-bold mt-10'>
                    INGRESAR
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 ml-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                </button>
                <p className="text-center text-white mt-10">Versi&oacute;n {VERSION}</p>

            </div>
        </div>
    </>
  )
}
export default Login
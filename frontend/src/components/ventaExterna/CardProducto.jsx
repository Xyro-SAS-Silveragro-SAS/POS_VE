import { useState, useEffect } from "react"
import Cantidades from "./Cantidades"
import Funciones from "../../helpers/Funciones"
const CardProducto = ({index=null, item=null, handleAddToCar=null}) => {
    const [producto, setProductos]             = useState('')

    useEffect(() => {
        setProductos(item)
    }, [item])

    const handleChangePrecio = (item) => {
        Funciones.alertaBox("Ajuste de precio","Escriba el precio si desea cambiarlo","info", (valorCaja)=>{
            setProductos(prevProductos => {
                    if (prevProductos.id === item.id) {
                        return { ...prevProductos, Precio: valorCaja };
                    }
                    return prevProductos;
                }
            );
        }, ()=>{}, "GUARDAR","CANCELAR","text","Cambio de precio",producto.Precio,"Escriba el nuevo precio. No usar puntos ni caracteres");
    }


    const handleCambiaCantidad = (itemModificado, nuevaCantidad, tipo) => {
        setProductos(prevProductos =>{
            //console.log(prevProductos)
            if(prevProductos.id === itemModificado.id) { // Asume que 'id' es un identificador único
                if (tipo === 'normal') {
                    return { ...prevProductos, CantSolicitada: nuevaCantidad };
                } else if (tipo === 'bonificado') {
                    return { ...prevProductos, CantBonificada: nuevaCantidad }; // Asume que existe CantBonificada
                }
            }
        });
    };

    return (
        <>
            <div key={index} className="items-center w-full grid grid-cols-12 border-b-1 border-gray-300">
                <div id="fotoProducto" className=" col-span-2 font-medium flex items-start h-full  text-start py-4">
                    <img alt="" src={`https://demoapi.xyroposadmin.com/api/imgUnItem/${producto.ItemCode}`} className="w-full" onError={(e) => {e.target.src = `${ defaultImage }`}}/>
                </div>
                <div  className="col-span-8 py-4 font-medium px-2 text-sm flex flex-wrap relative">
                    <strong>
                        {producto.Articulo} <small>({producto.ItemCode})</small>
                    </strong>

                    <span className='text-lg mt-2 w-full flex items-center' >
                        <strong>V. Unitario:</strong> ${Funciones.formatearPrecio(producto.Precio )}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 ml-3" onClick={() => {handleChangePrecio(producto)}}>
                            <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                            <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                        </svg>

                    </span>

                    <span className='text-lg w-full'>
                        <strong>V. Total:</strong> ${Funciones.formatearPrecio(producto.Precio * (producto.CantSolicitada || 0))}
                    </span>

                    <div className="flex items-center justify-start mt-2">

                        <Cantidades 
                            titulo = 'SOLICITADOS'
                            item = {producto}
                            tipo='normal'
                            handleCantidad  = {handleCambiaCantidad}
                            cantidad = {producto.CantSolicitada || 0} // Asegúrate de que esta propiedad exista en tu item
                            />

                        <Cantidades 
                            titulo = 'BONIFICADO'
                            item = {producto}
                            tipo='bonificado'
                            handleCantidad  = {handleCambiaCantidad}
                            cantidad = {producto.CantBonificada || 0} // Asegúrate de que esta propiedad exista en tu item
                            />

                    </div>

                </div>
                <div className="col-span-2 flex justify-center items-start h-full pt-4 relative">
                    <div className='bg-black p-2 rounded-full text-white items-center absolute right-4 top-4'>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 cursor-pointer" onClick={() => {handleAddToCar(producto)}}>
                            <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>
        </>
    )
    
}
export default CardProducto
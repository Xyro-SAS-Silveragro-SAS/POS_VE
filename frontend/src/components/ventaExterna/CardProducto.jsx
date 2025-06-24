import { useState, useEffect } from "react"
import Cantidades from "./Cantidades"
import Funciones from "../../helpers/Funciones"
import defaultImage  from '../../assets/img/default.png'
import { db } from "../../db/db"

    

const CardProducto = ({index=null, item=null, handleAddToCar=null, buttonAdd=true, buttonDel=false, initializeProcess=null,modificaDb=false, sync=null}) => {
    const [producto, setProductos]              = useState('')
    const [showImageModal, setShowImageModal]   = useState(false)
    const [imageUrl, setImageUrl]               = useState('')

    useEffect(() => {
        setProductos(item)
    }, [item])

    useEffect(() => {
        // Establecer la URL de la imagen
        if (producto && producto.ItemCode) {
            setImageUrl(`https://api.xyroposadmin.com/api/imgUnItem/${producto.ItemCode}`)
        }
    }, [producto])

    const handleChangePrecio = (item) => {
        Funciones.alertaBox("Ajuste de precio","Escriba el precio si desea cambiarlo","info", (valorCaja)=>{
            setProductos(prevProductos => {
                    if (prevProductos.id === item.id) {


                        if(modificaDb){
                            db.lineas
                                .where('id')
                                .equals(item.id)
                                .modify({ Precio: valorCaja })
                                .then(() => {
                                    initializeProcess()
                                })
                                .catch((error) => {
                                    console.error('Error al actualizar la cantidad en la línea:', error);
                                });
                        }

                        return { ...prevProductos, Precio: valorCaja };
                    }
                    return prevProductos;
                }
            );
        }, ()=>{}, "GUARDAR","CANCELAR","text","Cambio de precio",producto.Precio,"Escriba el nuevo precio. No usar puntos ni caracteres");
    }

    const handleCambiaCantidad = (itemModificado, nuevaCantidad, tipo) => {
        setProductos(prevProductos =>{
            if(prevProductos.id === itemModificado.id) {
                if (tipo === 'normal') {
                    //actualizo la cantidad solicitada en la DB
                    if(modificaDb){
                        db.lineas
                            .where('id')
                            .equals(itemModificado.id)
                            .modify({ CantSolicitada: nuevaCantidad })
                            .then(() => {
                                 setTimeout(() => {
                                    //initializeProcess();
                                }, 50);
                            })
                            .catch((error) => {
                                console.error('Error al actualizar la cantidad en la línea:', error);
                            });
                    }
                    return { ...prevProductos, CantSolicitada: nuevaCantidad };
                } else if (tipo === 'bonificado') {
                    if(modificaDb){
                        db.lineas
                            .where('id')
                            .equals(itemModificado.id)
                            .modify({ CantBonificada: nuevaCantidad })
                            .then(() => {
                                 setTimeout(() => {
                                    //initializeProcess();
                                }, 50);
                            })
                            .catch((error) => {
                                console.error('Error al actualizar la cantidad en la línea:', error);
                            });
                    }
                    return { ...prevProductos, CantBonificada: nuevaCantidad };
                }
            }
        });
    };

    const handleImageClick = () => {
        setShowImageModal(true);
    };

    const closeImageModal = () => {
        setShowImageModal(false);
    };

    const handleImageError = (e) => {
        e.target.src = defaultImage;
        setImageUrl(defaultImage);
    };

    const handleEliminarProducto = (item) => {
        Funciones.confirmacion("Eliminar Producto","¿Desea eliminar este producto del pedido?","info", async()=>{
            db.lineas
                .where('id')
                .equals(item.id)
                .delete()
                .then(() => {
                    initializeProcess()
                })
                .catch((error) => {
                    console.error('Error al eliminar el producto de la línea:', error);
                });
        })
    }

    return (
        <>
            <div key={index} className="items-center w-full grid grid-cols-12 border-b-1 border-gray-300">
                <div id="fotoProducto" className="relative col-span-2 font-medium flex items-start h-full text-start py-4 ">
                    <img 
                        alt={producto.Articulo || "Producto"} 
                        src={imageUrl || defaultImage} 
                        className="w-full cursor-pointer hover:opacity-80 transition-opacity duration-200" 
                        onError={handleImageError}
                        onClick={handleImageClick}
                        title="Haz clic para ver en grande"
                    />
                </div>
                <div className="col-span-8 py-4 font-medium px-2 text-sm flex flex-wrap relative">
                    <strong onClick={handleImageClick} className="cursor-pointer hover:underline">
                        {producto.Articulo} <small>({producto.ItemCode})</small>
                    </strong>

                    <span className='text-lg mt-2 w-full flex items-center' >
                        <strong>V. Unitario:</strong> ${Funciones.formatearPrecio(producto.Precio )}
                        {sync === 0 && (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 ml-3" onClick={() => {handleChangePrecio(producto)}}>
                                <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                                <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                            </svg>
                        )}

                    </span>

                    <span className='text-lg w-full'>
                        <strong>V. Total:</strong> ${Funciones.formatearPrecio(producto.Precio * (producto.CantSolicitada || 0))}
                    </span>

                    {sync === 0 ? (
                        <>
                        <div className="flex items-center justify-start mt-2">
                                <Cantidades 
                                    titulo = 'SOLICITADOS'
                                    item = {producto}
                                    tipo='normal'
                                    handleCantidad  = {handleCambiaCantidad}
                                    cantidad = {producto.CantSolicitada || 0}
                                />

                                <Cantidades 
                                    titulo = 'BONIFICADO'
                                    item = {producto}
                                    tipo='bonificado'
                                    handleCantidad  = {handleCambiaCantidad}
                                    cantidad = {producto.CantBonificada || 0}
                                />
                            </div>
                            </>
                        ) : (
                            <>
                             <span className='text-lg w-full'>
                                <strong>Solicitadas:</strong> {producto.CantSolicitada}
                            </span>
                             <span className='text-lg w-full'>
                                <strong>Bonificadas:</strong> {producto.CantBonificada}
                            </span>
                            </>
                        )}
                </div>
                
                <div className="col-span-2 flex justify-center items-start h-auto pt-4 relative">
                    {buttonAdd && (
                        <div className='bg-black p-2 rounded-full text-white items-center absolute right-2 bottom-10'>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 cursor-pointer" onClick={() => {handleAddToCar(producto)}}>
                                <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}

                    {buttonDel && sync === 0  && (
                        <div className='bg-black p-2 rounded-full text-white items-center absolute right-0 bottom-10'>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 cursor-pointer botonEliminar" onClick={()=>{handleEliminarProducto(producto)}}>
                                <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Zoom de Imagen */}
            {showImageModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={closeImageModal}>
                    <div className="relative max-w-full max-h-full bg-white">
                        {/* Botón de cerrar */}
                        <button 
                            onClick={closeImageModal}
                            className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors duration-200 z-10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-700">
                                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                            </svg>
                        </button>
                        
                        {/* Imagen ampliada */}
                        <img 
                            src={imageUrl} 
                            alt={producto.Articulo || "Producto ampliado"}
                            className="w-[70%] max-h-full object-contain rounded-t-lg m-auto"
                            onError={handleImageError}
                            onClick={(e) => e.stopPropagation()} // Evita que se cierre al hacer clic en la imagen
                        />
                        
                        {/* Información del producto en el modal */}
                        <div className=" bottom-0 left-0 right-0 bg-black text-white p-4 rounded-b-lg">
                            <h3 className="font-bold text-lg">{producto.Articulo}</h3>
                            <p className="text-sm opacity-90">Código: {producto.ItemCode}</p>
                            <p className="text-sm opacity-90">Almacen: {producto.CodAlmacen}</p>
                            <p className="text-sm opacity-90">Lista precio: {producto.ListaPrecio}</p>
                            <p className="text-sm opacity-90">Impuesto: {producto.Impuesto} - {producto.PorcImpto}%</p>
                            <p className="text-sm opacity-90">Codigo de barras: {producto.CodigoBarras}</p>
                            <p className="text-sm opacity-90">Existencias: {producto.Cantidad}</p>
                            <p className="text-sm opacity-90">Comprometido: {producto.Comprometido}</p>
                            <p className="text-sm opacity-90">Precio: ${Funciones.formatearPrecio(producto.Precio)}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default CardProducto
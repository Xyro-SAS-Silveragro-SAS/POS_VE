import { useState, useEffect } from "react"
import Cantidades from "./Cantidades"
import Funciones from "../../helpers/Funciones"
import defaultImage  from '../../assets/img/default.png'
import { db } from "../../db/db"
import ApiSL from "../../services/apiSL"
import {Share2} from 'lucide-react'
import { URL_SITE } from "../../config/config"
import { useAuth } from "../../context/AuthContext"

    

const CardProducto = ({index=null, item=null, handleAddToCar=null, buttonAdd=true, buttonDel=false, modificaDb=false, sync=null, onlyView=false, calculaYActualizaTotales=null}) => {
    const [producto, setProductos]              = useState('')
    const [showImageModal, setShowImageModal]   = useState(false)
    const [imageUrl, setImageUrl]               = useState('')
    const [dataTiendas, setDataTiendas]         = useState(null);
    const [loadingTiendas, setLoadingTiendas]   = useState(false)
    const [activeTab, setActiveTab]             = useState('info');
    const { currentUser }                       = useAuth();

    useEffect(() => {
        setProductos(item)
    }, [item])

    useEffect(() => {
        // Establecer la URL de la imagen
        if (producto && producto.ItemCode) {
            setImageUrl(`https://api.xyroposadmin.com/api/imgUnItem/${producto.ItemCode}`)
        }
    }, [producto])

    useEffect(() => {
    if (showImageModal) {
        const fetchTiendas = async () => {
                try {
                    setLoadingTiendas(true);
                    const dataTiendas = await ApiSL.get(`/api/inventory/Bodegas/${producto.ItemCode}`);
                    setDataTiendas(dataTiendas.data.datos);
                } catch (e) {
                    console.log("Error:", e);
                } finally {
                    setLoadingTiendas(false);
                }
            };
            fetchTiendas();
        }
    }, [showImageModal, producto.ItemCode]);

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
                                    calculaYActualizaTotales()
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
                                    calculaYActualizaTotales();
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
                                    calculaYActualizaTotales();
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
                    calculaYActualizaTotales()
                })
                .catch((error) => {
                    console.error('Error al eliminar el producto de la línea:', error);
                });
        })
    }


    const shareProduct = async () => {
        const shareUrl = `${URL_SITE}infoProducto/${localStorage.getItem('bodega')}/${producto.ItemCode}`;
        const shareData = {
        title: producto.Articulo,
        text: `${producto.Articulo}\n\nPrecio: ${Funciones.formatearPrecio(producto.Precio)}\nStock: ${producto.Cantidad} unidades`,
        url: shareUrl
        };

        try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            // Fallback: copiar al portapapeles
            await navigator.clipboard.writeText(shareUrl);
            alert('Enlace copiado al portapapeles');
        }
        } catch (error) {
        console.error('Error sharing:', error);
        // Fallback manual
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Enlace copiado al portapapeles');
        }
    };


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


                    <span className='text-md w-full mt-2'>
                        <strong className="mr-1">Impuesto:</strong> {producto.Impuesto} - {producto.PorcImpto}%
                    </span>
                    <span className='text-md w-full mt-2'>
                        <strong className="mr-1">Stock:</strong> {producto.Cantidad }
                    </span>

                    <span className='text-md mt-2 w-full flex items-center' >
                        <strong className="mr-1">V. Uni:</strong> ${Funciones.formatearPrecio(producto.Precio )}
                        {sync === 0 && onlyView === false && currentUser.in_perfil === 27 && (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 ml-3" onClick={() => {handleChangePrecio(producto)}}>
                                <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                                <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                            </svg>
                        )}

                    </span>

                    <span className='text-md w-full'>
                        <strong className="mr-1">V. Total:</strong> ${Funciones.formatearPrecio(producto.Precio * (producto.CantSolicitada || 0))}
                    </span>

                    <span className='text-md w-full'>
                        <strong>Fecha actual:</strong> {new Date().toLocaleDateString()}
                    </span>


                    {sync === 0 && onlyView === false ? (
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
                
                {onlyView === false && (
                    
                    <div className="col-span-2 flex justify-center items-start h-auto pt-4 relative">
                        {buttonAdd && (
                            <div className='bg-black p-2 rounded-full text-white items-center absolute right-2 bottom-10'>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 cursor-pointer" onClick={() => {handleAddToCar(producto); setProductos(prev => ({ ...prev, CantSolicitada: "0", CantBonificada: "0" }));}}>
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

                )}

            </div>

            {/* Modal de Zoom de Imagen */}
            {showImageModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" >
                    <div className="relative max-w-full max-h-full bg-white rounded-lg overflow-hidden">
                        {/* Botón de cerrar */}
                        <button 
                            onClick={closeImageModal}
                            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors duration-200 z-10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-700">
                                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <button className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors duration-200 z-10" onClick={shareProduct}>
                            <Share2 className="w-5 h-5 " />
                        </button>
                        
                        {/* Imagen ampliada */}
                        <img 
                            src={imageUrl} 
                            alt={producto.Articulo || "Producto ampliado"}
                            className="w-[70%] max-h-96 object-contain rounded-t-lg m-auto"
                            onError={handleImageError}
                            onClick={(e) => e.stopPropagation()}
                        />
                        
                        {/* Contenedor de las pestañas */}
                        <div className="bg-white">
                            {/* Pestañas de navegación */}
                            <div className="flex border-b border-gray-200">
                                <button
                                    onClick={() => setActiveTab('info')}
                                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200 ${
                                        activeTab === 'info' 
                                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    Información del Producto
                                </button>
                                <button
                                    onClick={() => setActiveTab('stock')}
                                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200 ${
                                        activeTab === 'stock' 
                                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    Stock en Sucursales
                                </button>
                            </div>
                            
                            {/* Contenido de las pestañas */}
                            <div className="p-4 bg-gray-900 text-white min-h-64">
                                {activeTab === 'info' && (
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-lg text-blue-200">{producto.Articulo}</h3>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-gray-300">Código:</span>
                                                <span className="ml-2 text-white">{producto.ItemCode}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-300">Almacén:</span>
                                                <span className="ml-2 text-white">{producto.CodAlmacen}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-300">Lista precio:</span>
                                                <span className="ml-2 text-white">{producto.ListaPrecio}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-300">Impuesto:</span>
                                                <span className="ml-2 text-white">{producto.Impuesto} - {producto.PorcImpto}%</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-300">Código de barras:</span>
                                                <span className="ml-2 text-white">{producto.CodigoBarras}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-300">Existencias:</span>
                                                <span className="ml-2 text-green-400 font-semibold">{producto.Cantidad}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-300">Comprometido:</span>
                                                <span className="ml-2 text-yellow-400 font-semibold">{producto.Comprometido}</span>
                                            </div>
                                            <div className="col-span-2 border-t border-gray-700 pt-2 mt-2">
                                                <span className="text-gray-300">Precio:</span>
                                                <span className="ml-2 text-green-400 font-bold text-lg">${Funciones.formatearPrecio(producto.Precio)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {activeTab === 'stock' && (
                                    <div>
                                        <h3 className="font-bold text-lg text-blue-200 mb-3">STOCK EN OTRAS SUCURSALES</h3>
                                        {loadingTiendas ? (
                                            <div className="flex items-center justify-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                                <span className="ml-2 text-gray-300">Cargando...</span>
                                            </div>
                                        ) : dataTiendas && dataTiendas.length > 0 ? (
                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                {/* Encabezados */}
                                                <div className="grid grid-cols-2 gap-4 border-b border-gray-600 pb-2 mb-2">
                                                    <div className="text-gray-300 font-semibold">Sucursal</div>
                                                    <div className="text-gray-300 font-semibold">Cantidad</div>
                                                </div>
                                                {/* Datos */}
                                                {dataTiendas.map((item, index) => (
                                                    <div className="grid grid-cols-2 gap-4 py-1 hover:bg-gray-800 rounded px-2 transition-colors" key={index}>
                                                        <div className="text-white">{item.bodega}</div>
                                                        <div className={`font-semibold ${item.cantidad > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                            {item.cantidad}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-400">
                                                No hay información de stock disponible
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default CardProducto
import { useState, useEffect } from "react"
import { db } from "../../../db/db"
import { MapPin, X } from "lucide-react"
import { getDestinosFromSL } from "../../../services/serviceLayer"

const ModalDestinos = ({ showDestinos = false, toggleDestinos = null, clienteSeleccionado = null }) => {
    const [destinos, setDestinos] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const consultaDestinos = async () => {
            if (!clienteSeleccionado) return;
            
            setLoading(true);
            try {
                // Consultar destinos desde Service Layer
                const destinosData = await getDestinosFromSL(clienteSeleccionado.Codigo);
                setDestinos(destinosData);
            } catch (error) {
                console.error('Error al consultar destinos:', error);
                setDestinos([]);
            } finally {
                setLoading(false);
            }
        }

        if (showDestinos && clienteSeleccionado) {
            consultaDestinos();
        }
    }, [showDestinos, clienteSeleccionado]);

    const handleClose = () => {
        setDestinos([]);
        toggleDestinos();
    }

    return (
        <>
            <div className={`fixed top-0 left-0 w-full h-dvh bg-white z-50 transform transition-transform duration-200 ease-out ${showDestinos ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="relative w-full h-full overflow-auto">
                    {/* Header */}
                    <div className="fixed bg-[#546C4C] w-full text-white z-1 top-0">
                        <div className="w-full grid grid-cols-12 p-5 m-auto lg:w-[50%] items-center">
                            <div className="text-center">
                                <svg 
                                    onClick={handleClose} 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    viewBox="0 0 24 24" 
                                    fill="currentColor" 
                                    className="size-6 cursor-pointer"
                                    title="Volver"
                                >
                                    <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="col-span-10 text-center">
                                <h2 className="text-lg font-semibold">
                                    Destinos de {clienteSeleccionado?.Nombre || 'Cliente'}
                                </h2>
                                <p className="text-sm opacity-90">
                                    Código: {clienteSeleccionado?.Codigo}
                                </p>
                            </div>
                            <div className="text-center">
                                <X 
                                    onClick={handleClose}
                                    className="size-6 cursor-pointer hover:bg-white hover:bg-opacity-20 rounded"
                                    title="Cerrar"
                                />
                            </div>
                        </div>
                    </div>
        
                    {/* Content */}
                    <div className="w-full lg:w-[54%] md:p-10 m-auto text-gray-700 relative h-auto mt-[120px]">
                        {loading ? (
                            <div className="text-center py-8 flex flex-wrap items-center justify-center">
                                <div className="animate-spin">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-12 text-[#546C4C]">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                    </svg>
                                </div>
                                <p className="w-full mt-4 text-center">
                                    Cargando destinos...
                                </p>
                            </div>
                        ) : destinos.length === 0 ? (
                            <div className="text-center py-8 flex flex-wrap items-center justify-center">
                                <MapPin className="size-12 text-gray-400"/>
                                <p className="px-12 w-full mt-4">
                                    No se encontraron destinos para este cliente.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-800 mb-2">
                                        Total de destinos: {destinos.length}
                                    </h3>
                                </div>
                                
                                {destinos.map((destino, index) => (
                                    <div key={destino.RowNum || index} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <div className="p-6">
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="w-12 h-12 bg-[#546C4C] rounded-full flex items-center justify-center">
                                                        <MapPin className="w-6 h-6 text-white" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                                                Destino #{index + 1}
                                                            </h4>
                                                            {destino.AddressName && (
                                                                <div className="mb-2">
                                                                    <span className="text-sm font-medium text-gray-600">Dirección:</span>
                                                                    <p className="text-gray-800">{destino.AddressName}</p>
                                                                </div>
                                                            )}
                                                            {destino.Street && (
                                                                <div className="mb-2">
                                                                    <span className="text-sm font-medium text-gray-600">Calle:</span>
                                                                    <p className="text-gray-800">{destino.Street}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            {destino.City && (
                                                                <div className="mb-2">
                                                                    <span className="text-sm font-medium text-gray-600">Ciudad:</span>
                                                                    <p className="text-gray-800">{destino.City}</p>
                                                                </div>
                                                            )}
                                                            {destino.BPCode && (
                                                                <div className="mb-2">
                                                                    <span className="text-sm font-medium text-gray-600">Código BP:</span>
                                                                    <p className="text-gray-800">{destino.BPCode}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default ModalDestinos
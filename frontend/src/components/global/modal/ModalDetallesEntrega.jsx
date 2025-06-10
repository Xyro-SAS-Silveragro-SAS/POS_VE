import { useState,  } from 'react';

const ModalDetallesEntrega = ({ isOpen, onClose, onSave, titulo, destinos=null }) => {
    const [formData, setFormData] = useState({
        fechaEntrega: '',
        tipoEnvio: '',
        observaciones: '',
        destino: ''
    });


    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 bg-black/50 z-50 transition-opacity`}>
            <div 
                className="fixed bottom-0 inset-x-0 h-[75vh] bg-white rounded-t-3xl transition-transform duration-600 transform w-full lg:w-[50%] md:w-[90%] m-auto"
                style={{
                    boxShadow: '0px -4px 12px rgba(0, 0, 0, 0.1)'
                }}
            >
                <div className="w-full h-full flex flex-col p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Detalles de Entrega</h2>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1">
                        <div className="space-y-6">
                            {/* Fecha de Entrega */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha de Entrega
                                </label>
                                <input
                                    type="date"
                                     min={(() => {
                                        const tomorrow = new Date();
                                        tomorrow.setDate(tomorrow.getDate() + 1);
                                        return tomorrow.toISOString().split('T')[0];
                                    })()}// Establece la fecha mínima como mañana
                                    name="fechaEntrega"
                                    value={formData.fechaEntrega}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Tipo de Envío */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Envío
                                </label>
                                <select
                                    name="tipoEnvio"
                                    value={formData.tipoEnvio}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                    required
                                >
                                    <option value="">Seleccione un tipo de envío</option>
                                    <option value="distribucion">Distribución</option>
                                    <option value="remesado">Remesado</option>
                                    <option value="bodega">Recibir en bodega</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Destino
                                </label>
                                <select
                                    name="destino"
                                    value={formData.destino}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                    required
                                >
                                    <option value="">Seleccione un destino</option>

                                    {destinos && destinos.map((destino) => (
                                        <option value="distribucion">{destino.Address}  - {destino.Street}</option>
                                    ))}

                                </select>
                            </div>

                            {/* Observaciones */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Observaciones
                                </label>
                                <textarea
                                    name="observaciones"
                                    value={formData.observaciones}
                                    onChange={handleChange}
                                    maxLength={200}
                                    rows="4"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                                    placeholder="Ingrese observaciones adicionales..."
                                />
                                <small>Máximo {formData.observaciones.length}/200 Caracteres</small>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                type="submit"
                                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex justify-center items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8 cursor-pointer sincronizarBtn mr-2" >
                                    <path fillRule="evenodd" d="M10.5 3.75a6 6 0 0 0-5.98 6.496A5.25 5.25 0 0 0 6.75 20.25H18a4.5 4.5 0 0 0 2.206-8.423 3.75 3.75 0 0 0-4.133-4.303A6.001 6.001 0 0 0 10.5 3.75Zm2.03 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v4.94a.75.75 0 0 0 1.5 0v-4.94l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z" clipRule="evenodd" />
                                </svg>
                                SINCRONIZAR {(titulo === 'pedidos') ? 'PEDIDO' : 'COTIZACIÓN'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ModalDetallesEntrega;
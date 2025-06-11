import { useState,  } from 'react';
import Funciones from '../../../helpers/Funciones';
import { db } from '../../../db/db';
import { useConnection } from '../../../context/ConnectionContext';
import api from '../../../services/apiService';
import { useNavigate } from 'react-router';
const ModalDetallesEntrega = ({ isOpen, onClose, onSave, titulo, destinos=null, idProceso=null, tipoProceso=null, handleRefresh={handleRefresh} }) => {
    
    const { isOnline }            = useConnection()
    
    const navigate                = useNavigate()
    const [formData, setFormData] = useState({
        fechaEntrega: '',
        tipoEnvio: '',
        observaciones: '',
        destino: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSendProccess = async () => {

        if(formData.fechaEntrega === ''){
            Funciones.alerta('Atención!', 'Debe ingresar una fecha de entrega', 'info', () => {});
        }
        else if(formData.tipoEnvio === ''){
            Funciones.alerta('Atención!', 'Debe seleccionar un tipo de envio', 'info', () => {});
        }
        else if(formData.observaciones !== '' && formData.observaciones.length < 10){
            Funciones.alerta('Atención!', 'Si escribe notificaciones estas deben superar los 10 caracteres', 'info', () => {});
        }
        else if(formData.destino === ''){
            Funciones.alerta('Atención!', 'Debe seleccionar un destino', 'info', () => {});
        }
        else{
            const proceso = (tipoProceso === 'pedidos') ? 'pedido' : 'cotización';
            Funciones.confirmacion('Atención!', `¿Está seguro de sincronizar los datos ingresados en el ${proceso}?`, 'info', async () => {
                const destinoSplit = formData.destino.split('-');
                //valido campos
                const dataGuardar = {
                    tx_dir_cli_pos:destinoSplit[2],
                    tx_dir_code_cli_pos: destinoSplit[0],
                    tx_dir_add_cli_pos: destinoSplit[1],
                    fechaEntrega: formData.fechaEntrega,
                    tipoEnvio: formData.tipoEnvio,
                    observaciones: formData.observaciones,
                }
                
                //actualizo la data de los detalles finales
                await db.cabeza.update(parseInt(idProceso), dataGuardar);
                
                // consulto la cabeza
                const cabeza = await db.cabeza.get(parseInt(idProceso));
                if (!cabeza) {
                    throw new Error('No se encontró el registro de cabecera');
                }

                // consulto las lineas
                const lineas = await db.lineas
                    .where('in_id_cabeza')
                    .equals(parseInt(idProceso))
                    .toArray();

                const dataSincroniza = {
                    identificador: cabeza.id_consec || '',
                    tx_contenido: {
                        cabecera: cabeza,
                        lineas: lineas
                    }
                }

                //valido si estamos online para enviar a sincronizar
                if(isOnline){
                    const items = await api.post('api/ventaExterna/capturarPedido',dataSincroniza)
                    if(items.continuar === 1 || items.continuar === 3){
                        Funciones.alerta('Éxito!', items.mensaje, 'success', async() => {
                            //actualizo el estado de sincronización
                            await db.cabeza.update(parseInt(idProceso), { sync: 1 });
                            handleRefresh()
                        });
                    }
                    else{
                         Funciones.alerta('Atención!', `${items.mensaje} `, 'info', async() => {
                            //actualizo el estado de sincronización
                            await db.cabeza.update(parseInt(idProceso), { sync: 0 });
                            handleRefresh()
                        });
                    }
                }else{
                    Funciones.alerta('Atención!', 'No se pudo sincronizar, verifique su conexión a internet', 'error', () => {});
                }
                
            })
        }
    }

    

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

                                    {destinos && destinos.map((destino, index) => (
                                        <option key={index} value={` ${destino.id_destinos}-${destino.Address}-${destino.Street}`} >{destino.Address}  - {destino.Street}</option>
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
                            <button onClick={handleSendProccess}
                                type="submit"
                                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex justify-center items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8 cursor-pointer sincronizarBtn mr-2" >
                                    <path fillRule="evenodd" d="M10.5 3.75a6 6 0 0 0-5.98 6.496A5.25 5.25 0 0 0 6.75 20.25H18a4.5 4.5 0 0 0 2.206-8.423 3.75 3.75 0 0 0-4.133-4.303A6.001 6.001 0 0 0 10.5 3.75Zm2.03 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v4.94a.75.75 0 0 0 1.5 0v-4.94l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z" clipRule="evenodd" />
                                </svg>
                                SINCRONIZAR {(titulo === 'pedidos') ? 'PEDIDO' : 'COTIZACIÓN'}
                            </button>
                        </div>
                    
                </div>
            </div>
        </div>
    );
};

export default ModalDetallesEntrega;
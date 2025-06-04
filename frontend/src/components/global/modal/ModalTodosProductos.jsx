const ModalTodosProductos = ({toggleModalTodosProductos=null,showModalTodosProductos=false,items=null}) => {
    return (
        <>
         {/* Modal Todos los Productos */}
         {showModalTodosProductos && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">
                                Todos los Productos ({items.length})
                            </h2>
                            <button 
                                onClick={toggleModalTodosProductos}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            <div className="grid gap-4">
                                {items.map((item, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 h-20 flex-shrink-0">
                                                <img 
                                                    alt={item.nombre} 
                                                    src={`https://demoapi.xyroposadmin.com/api/imgUnItem/${item.codigoItem}`} 
                                                    className="w-full h-full object-cover rounded-md" 
                                                    onError={(e) => {e.target.src = defaultImage}}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800 mb-2">{item.nombre}</h3>
                                                <p className="text-sm text-gray-600 mb-2">Código: {item.codigoItem}</p>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-gray-700">Cantidad:</span>
                                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                                                            {item.cantidad}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-gray-700">Estado:</span>
                                                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                                                            item.sync 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {item.sync ? 'Sincronizado' : 'Pendiente'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-gray-200 bg-gray-50">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-600">
                                    Total de productos: <span className="font-semibold">{items.length}</span>
                                </p>
                                <button 
                                    onClick={toggleModalTodosProductos}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* fin del modal todos los productos */}
        </>
    )
}
export default ModalTodosProductos;
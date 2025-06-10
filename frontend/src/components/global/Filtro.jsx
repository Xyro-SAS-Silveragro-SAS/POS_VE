const Filtro = ({aplicarFiltro = null,filtroSeleccionado = 'Hoy'}) => {
    return (
        <>
            <div className="absolute top-0 right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                  <div className="py-1">
                    <div 
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${filtroSeleccionado === 'Hoy' ? 'bg-gray-100 font-bold' : ''}`}
                      onClick={() => aplicarFiltro('Hoy')}
                    >
                      Hoy
                    </div>
                    <div 
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${filtroSeleccionado === 'Ayer' ? 'bg-gray-100 font-bold' : ''}`}
                      onClick={() => aplicarFiltro('Ayer')}
                    >
                      Ayer
                    </div>
                    <div 
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${filtroSeleccionado === 'estasemana' ? 'bg-gray-100 font-bold' : ''}`}
                      onClick={() => aplicarFiltro('Esta Semana')}
                    >
                      Esta semana
                    </div>
                    <div 
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${filtroSeleccionado === 'estemes' ? 'bg-gray-100 font-bold' : ''}`}
                      onClick={() => aplicarFiltro('Este Mes')}
                    >
                      Este mes
                    </div>
                    <div 
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${filtroSeleccionado === 'todos' ? 'bg-gray-100 font-bold' : ''}`}
                      onClick={() => aplicarFiltro('Todos')}
                    >
                      Todos
                    </div>
                  </div>
            </div>
        </>
    )
}
export default Filtro
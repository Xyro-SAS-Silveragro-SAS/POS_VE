
const Cantidades = ({titulo = "", tipo='normal',item = null, handleCantidad = null, cantidad = 0}) => {
    return (
        <>
            <div className="flex flex-wrap">
                <div className="font-bold w-full"><small className="font-bold">{titulo}</small></div>
                <div className="flex items-center">
                    <svg onClick={() => handleCantidad(item, parseInt(cantidad) - 1, tipo)}  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-10 cursor-pointer mr-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <p className="p-0 mr-4">
                        {cantidad}
                    </p>
                    <svg onClick={() => handleCantidad(item, parseInt(cantidad) + 1, tipo)}  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-10 cursor-pointer mr-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </div>
            </div>
        </>
    )
}
export default Cantidades
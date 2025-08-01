
import { useState } from 'react'
import { db } from '../../../db/db'
import { PackageSearch } from "lucide-react"
import CardProducto from '../../ventaExterna/CardProducto'

const ModalProductos = ({showProductos = false, toggleProductos = null, handleAddToCar=null, onlyView=false}) => {
    const [busqueda, setBusqueda]               = useState('')
    const [productos, setProductos]             = useState('')

    const handleSetBusqueda = (e) =>{
        const value = e.target.value;
        setBusqueda(value);
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleBuscar();
        }
    }

    const consultaProductos = () => {
        db.items.toArray().then((items) => {
            const productosBusqueda = items.filter((item) => {
                return item.LlaveArt.toLowerCase().includes(busqueda.toLowerCase())
            })
            productosBusqueda.sort((a, b) => b.Cantidad - a.Cantidad);
            setProductos(productosBusqueda)
        })
    }
    const handleBuscar = () => {
        consultaProductos()
    }

    return (
        <>
            <div className={`fixed top-0 left-0 w-full h-dvh bg-white z-50 transform transition-transform duration-200 ease-out ${showProductos ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="relative w-full h-full overflow-auto">
                    <div className="fixed bg-[#546C4C] w-full text-white z-1 top-0">
                        <div className="w-full grid grid-cols-12 p-5 m-auto lg:w-[50%] items-center">
                            <div className="text-center">
                                <svg onClick={toggleProductos} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 cursor-pointer">
                                    <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="col-span-10 text-center">
                                <input type="search" placeholder={`Busca por nombre o código`} className="border p-2 rounded-[5px] w-full border-gray-300 bg-white placeholder-gray-500 text-black"  onChange={ (e) => { handleSetBusqueda(e) } } value={ busqueda || '' } 
                                onKeyDown={(e) => { handleKeyDown(e) }}/>
                            </div>
                            <div className="items-center grid justify-end">
                                <svg onClick={handleBuscar} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                            </div>
                        </div>
                    </div>
        
                    <div className="w-full p-2 lg:w-[54%] md:p-10 m-auto text-gray-700 relative h-auto mt-[90px]">
                        {productos && productos.length > 0 && productos.map((item, index) => (
                            <CardProducto item={item} key={index} handleAddToCar={handleAddToCar} sync={0} onlyView={onlyView} />
                        ))}


                        { busqueda == '' && (
                            <div className="text-center py-4 flex flex-wrap items-center justify-center">
                                <PackageSearch className="size-12"/>
                                <p className="px-12 w-full mt-2">
                                    Escribe el nombre o el código del producto para buscarlo
                                </p>
                            </div> 
                        )}

                    </div>
                    
                </div>
            </div>
        </>
    )
}
export default ModalProductos
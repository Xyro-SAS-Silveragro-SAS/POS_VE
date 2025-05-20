const ModalClientes = ({showClientes = false, toggleClientes = null}) => {
    const items = Array(10).fill().map((_, index) => ({
        id: 1234 + index,
        nombre: 'ABONADORA SEMBRADORA X 12 KILOS '+index,
        cantidad:0,
        codigoItem:'ACCGRAE35N',
        sync: (index % 4 === 0)? false: true
      }))
    

    return (
        <>
            <div className={`fixed top-0 left-0 w-full h-dvh bg-white z-50 transform transition-transform duration-200 ease-out ${showClientes ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="relative w-full h-full">
                    <div className="bg-[#546C4C] w-full text-white z-1">
                        <div className="w-full grid grid-cols-12 p-5 m-auto lg:w-[50%] flex items-center">
                            <div className="text-center">
                                <svg onClick={toggleClientes} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 cursor-pointer">
                                    <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="col-span-10 text-center">
                                <input type="search" placeholder={`Busca clientes por nombre o codigo`} className="border p-2 rounded-[5px] w-full border-gray-300 bg-white placeholder-gray-500 text-dark"/>
                            </div>
                            <div className="items-center grid justify-end">
                                <svg onClick="" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                            </div>
                        </div>
                    </div>
        
                <div className="w-full lg:w-[54%] md:p-10 m-auto flex flex-wrap text-gray-700 relative">
                            {items && items.length > 0 && items.map((item, index) => (
                                <div key={index} className="items-center w-full grid grid-cols-12 border-b-1 border-gray-300">
                                    <div  className="col-span-2 font-medium flex justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="col-span-8 py-4 flex flex-wrap font-medium ">
                                        <p className="w-full">
                                            A&D AGRODISTRIBUCIONES S.A.S
                                        </p>
                                        <small className="w-full">C830028104</small>
                                        <small className="w-full">Saldo: $0</small>
                                    </div>
                                    <div className="col-span-2 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8 cursor-pointer" onClick={toggleClientes}>
                                            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            ))}
                    </div>
                    
                </div>
            </div>
        </>
    )
}
export default ModalClientes
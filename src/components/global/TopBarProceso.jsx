import { useNavigate } from "react-router"
import { useState, useEffect } from "react"

const TopBarProceso = ({titulo = ''}) => {
    const navigate = useNavigate()


    const handleBack = () => {
        navigate(-1)
    }

    return (
        <>
            <div className="fixed top-0 bg-[#546C4C] w-full text-white z-1">
                <div className="w-full grid grid-cols-12 p-5 m-auto lg:w-[50%]">
                    <div className="col-span-1  justify-start flex items-center cursor-pointer" onClick={handleBack}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                            <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="col-span-9  flex items-center font-bold uppercase">
                        {titulo}
                        <small className="px-4 px-1 bg-green-700 rounded-lg font-bold ml-2">ONLINE</small>
                    </div>
                    <div className="col-span-2 flex items-center justify-end">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="size-6 mr-4 cursor-pointer" fill="white">
                            <path d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-242.7c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32L64 32zm0 96c0-17.7 14.3-32 32-32l192 0c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32L96 224c-17.7 0-32-14.3-32-32l0-64zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8 cursor-pointer">
                            <path fillRule="evenodd" d="M10.5 3.75a6 6 0 0 0-5.98 6.496A5.25 5.25 0 0 0 6.75 20.25H18a4.5 4.5 0 0 0 2.206-8.423 3.75 3.75 0 0 0-4.133-4.303A6.001 6.001 0 0 0 10.5 3.75Zm2.03 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v4.94a.75.75 0 0 0 1.5 0v-4.94l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z" clipRule="evenodd" />
                        </svg>

                    </div>
                </div>
            </div>
        </>
    )
}
export default TopBarProceso

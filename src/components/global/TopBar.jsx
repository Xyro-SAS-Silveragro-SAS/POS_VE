import favicon from "../../assets/favicon.png"
import logo from "../../assets/img/logo.png"
import { useNavigate } from "react-router"
const TopBar = () => {
    const navigate = useNavigate()

    const logout = () => {
        navigate('/login')
    }
    return (
        <>
            <div className="fixed top-0 bg-[#546C4C] w-full text-white z-1">
                <div className="w-full grid grid-cols-12 p-5 m-auto lg:w-[50%]">
                    <div className="col-span-6 lg:col-span-3 flex items-center">
                        <img src={logo} alt="" className="w-[100%]"/> 
                        <small className="px-4 px-1 bg-green-700 rounded-lg font-bold">ONLINE</small>
                    </div>
                    <div className="col-span-6 lg:col-span-9 justify-end flex items-center" onClick={logout}>
                        <span className="mr-4 font-bold">Farez</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 cursor-pointer">
                            <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>
        </>
    )
}
export default TopBar
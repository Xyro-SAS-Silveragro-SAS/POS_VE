import { useState, useRef, useEffect } from "react";

const ModalIA = ({showIA = false, toggleIA = null}) => {
    
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [responses, setResponses] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const chatEndRef = useRef(null);

    // Función para desplazarse al final del chat cuando hay nuevos mensajes
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [responses]);

    const startListening = () => {
        setIsListening(true);
        // Aquí iría la lógica para activar el micrófono
        setTranscript('');
    };

    const stopListening = () => {
        setIsListening(false);
        // Aquí iría la lógica para detener el micrófono y procesar el audio
        if (transcript) {
            addMessage(transcript);
        }
    };

    const addMessage = (text) => {
        // Añadir mensaje del usuario
        const updatedResponses = [...responses, { type: 'user', text }];
        setResponses(updatedResponses);
        setTranscript('');
        setInputMessage('');
        
        // Simular respuesta del bot después de un breve retraso
        setTimeout(() => {
            const botResponse = getBotResponse(text);
            setResponses([...updatedResponses, { type: 'ai', text: botResponse }]);
        }, 800);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (inputMessage.trim()) {
            addMessage(inputMessage);
        }
    };

    // Función simple para generar respuestas del bot
    const getBotResponse = (message) => {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('hola') || lowerMessage.includes('buenos días') || lowerMessage.includes('buenas')) {
            return '¡Hola! Soy ANA, tu Asistente de Negocio Automatizado. ¿En qué puedo ayudarte hoy?';
        } else if (lowerMessage.includes('ventas') || lowerMessage.includes('venta')) {
            return 'Las ventas de hoy ascienden a $1,250,000. ¿Necesitas un desglose por categoría o vendedor?';
        } else if (lowerMessage.includes('cliente') || lowerMessage.includes('clientes')) {
            return 'Tenemos 120 clientes activos. ¿Quieres ver la lista de los más recientes o los que tienen pedidos pendientes?';
        } else if (lowerMessage.includes('producto') || lowerMessage.includes('inventario')) {
            return 'El inventario actual tiene 450 productos. Hay 15 productos con stock bajo. ¿Quieres ver el detalle?';
        } else if (lowerMessage.includes('gracias')) {
            return '¡De nada! Estoy aquí para ayudarte. ¿Hay algo más en lo que pueda asistirte?';
        } else {
            return 'Entiendo tu consulta. Permíteme procesarla y te responderé en breve. ¿Puedes proporcionar más detalles?';
        }
    };

    return (
        <>
            <div className={`fixed top-0 left-0 w-full h-dvh bg-white z-50 transform transition-transform duration-200 ease-out ${showIA ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="relative w-full h-full flex flex-col">
                    {/* Cabecera */}
                    <div className="bg-[#546C4C] w-full text-white z-10">
                        <div className="w-full grid grid-cols-12 p-4 m-auto lg:w-[50%] items-center">
                            <div className="col-span-1 text-center">
                                <svg onClick={toggleIA} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 cursor-pointer">
                                    <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="col-span-10 text-center flex items-center justify-center">
                                <span className="font-bold text-xl mr-2">ANA</span>
                                <span className="text-sm">Asistente de Negocio Automatizado</span>
                                {isListening && (
                                    <div className="ml-2 flex space-x-1">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-75"></div>
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-150"></div>
                                    </div>
                                )}
                            </div>
                            <div className="col-span-1"></div>
                        </div>
                    </div>
        
                    {/* Área de chat */}
                    <div className="flex-grow w-full lg:w-[54%] m-auto overflow-hidden flex flex-col">
                        <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
                            {responses.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <div className="w-20 h-20 bg-[#546C4C] rounded-full flex items-center justify-center mb-4">
                                        {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="size-12">
                                            <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                                            <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                                        </svg> */}
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="size-12">
                                            <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z" clipRule="evenodd" />
                                        </svg>

                                    </div>
                                    <h3 className="text-xl font-bold text-[#546C4C] mb-2">¡Hola! Soy ANA</h3>
                                    <p className="text-center mb-4">Tu Asistente de Negocio Automatizado</p>
                                    <p className="text-center text-sm">Puedes preguntarme sobre:</p>
                                    <ul className="text-center text-sm mt-2 space-y-1">
                                        <li>• Estado de ventas</li>
                                        <li>• Información de clientes</li>
                                        <li>• Inventario de productos</li>
                                        <li>• Pedidos pendientes</li>
                                    </ul>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {responses.map((response, index) => (
                                        <div key={index} className={`flex ${response.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            {response.type === 'ai' && (
                                                <div className="w-8 h-8 bg-[#546C4C] rounded-full flex items-center justify-center mr-2">
                                                    <span className="text-white text-xs font-bold">ANA</span>
                                                </div>
                                            )}
                                            <div className={`max-w-[70%] p-3 rounded-lg ${response.type === 'user' ? 'bg-[#546C4C] text-white rounded-tr-none' : 'bg-gray-200 text-gray-800 rounded-tl-none'}`}>
                                                {response.text}
                                            </div>
                                            {response.type === 'user' && (
                                                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center ml-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="size-5">
                                                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <div ref={chatEndRef} />
                                </div>
                            )}
                            
                            {isListening && (
                                <div className="mt-4 p-3 bg-gray-200 rounded-lg animate-pulse">
                                    <p className="text-gray-500 italic flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 mr-2 text-red-500">
                                            <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                                            <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                                        </svg>
                                        Escuchando: {transcript || "..."}
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        {/* Área de entrada de mensaje */}
                        <div className="p-4 bg-white border-t border-gray-200">
                            <form onSubmit={handleSendMessage} className="flex items-center">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder="Escribe tu mensaje aquí..."
                                    className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#546C4C]"
                                    disabled={isListening}
                                />
                                <button
                                    type="button"
                                    onClick={isListening ? stopListening : startListening}
                                    className={`p-3 ${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-[#546C4C] hover:bg-[#3e5038]'} text-white rounded-none transition-colors`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                        <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                                        <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                                    </svg>
                                </button>
                                <button
                                    type="submit"
                                    className="p-3 bg-[#546C4C] hover:bg-[#3e5038] text-white rounded-r-lg transition-colors"
                                    disabled={isListening || !inputMessage.trim()}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                        <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ModalIA
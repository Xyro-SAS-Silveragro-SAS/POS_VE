import { useState } from "react";
const ModalIA = ({showIA = false, toggleIA = null}) => {
    
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [responses, setResponses] = useState([]);

    const startListening = () => {
        setIsListening(true);
        // Aquí iría la lógica para activar el micrófono
        setTranscript('');
    };

    const stopListening = () => {
        setIsListening(false);
        // Aquí iría la lógica para detener el micrófono y procesar el audio
        if (transcript) {
            // Simular respuesta de la IA
            setTimeout(() => {
                setResponses([...responses, 
                    { type: 'user', text: transcript },
                    { type: 'ai', text: '¡Hola! Soy ANA, tu asistente virtual. ¿En qué puedo ayudarte hoy?' }
                ]);
                setTranscript('');
            }, 1000);
        }
    };

    return (
        <>
            <div className={`fixed top-0 left-0 w-full h-dvh bg-white z-50 transform transition-transform duration-200 ease-out ${showIA ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="relative w-full h-full">
                    <div className="bg-[#546C4C] w-full text-white z-1">
                        <div className="w-full grid grid-cols-12 p-5 m-auto lg:w-[50%] items-center">
                            <div className="text-center">
                                <svg onClick={toggleIA} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 cursor-pointer">
                                    <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="col-span-10 text-center flex items-center justify-center">
                                <span className="font-bold text-xl mr-2">ANA</span>
                                <span className="text-sm">Tu asistente virtual</span>
                                {isListening && (
                                    <div className="ml-2 flex space-x-1">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-75"></div>
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-150"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
        
                    <div className="w-full lg:w-[54%] md:p-10 m-auto flex flex-wrap text-gray-700 relative h-[calc(100vh-180px)]">
                        {/* Área de conversación */}
                        <div className="w-full h-[calc(100%-80px)] overflow-y-auto p-4 bg-gray-50 rounded-lg mb-4">
                            {responses.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-16 mb-4">
                                        <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                                        <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                                    </svg>
                                    <p className="text-center">Presiona el botón del micrófono para hablar con ANA</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {responses.map((response, index) => (
                                        <div key={index} className={`flex ${response.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] p-3 rounded-lg ${response.type === 'user' ? 'bg-[#546C4C] text-white' : 'bg-gray-200 text-gray-800'}`}>
                                                {response.text}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {isListening && (
                                <div className="mt-4 p-3 bg-gray-200 rounded-lg">
                                    <p className="text-gray-500 italic">Escuchando: {transcript || "..."}</p>
                                </div>
                            )}
                        </div>
                        
                        {/* Controles de voz */}
                        <div className="w-full h-20 flex items-center justify-center space-x-6">
                            {!isListening ? (
                                <button 
                                    onClick={startListening}
                                    className="w-16 h-16 bg-[#546C4C] rounded-full flex items-center justify-center shadow-lg hover:bg-[#3e5038] transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="size-8">
                                        <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                                        <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                                    </svg>
                                </button>
                            ) : (
                                <button 
                                    onClick={stopListening}
                                    className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors animate-pulse"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="size-8">
                                        <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                            
                            <button 
                                className="text-sm text-gray-500 hover:text-gray-700"
                                onClick={() => {
                                    setResponses([]);
                                    setTranscript('');
                                    setIsListening(false);
                                }}
                            >
                                Reiniciar conversación
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ModalIA
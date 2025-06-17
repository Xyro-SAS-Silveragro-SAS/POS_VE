import { useState, useEffect, useRef } from "react";
import { GoogleGenAI } from '@google/genai';
import { APIKEY_GEMINI } from "../../../config/config";

const gemini    = new GoogleGenAI({ apiKey: APIKEY_GEMINI });

const ModalIA = ({showIA = false, toggleIA = null}) => {
    
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [finalTranscript, setFinalTranscript] = useState(''); // Texto acumulado final
    const [isSupported, setIsSupported] = useState(true);
    const recognitionRef = useRef(null);
    const silenceTimerRef = useRef(null);

    // Inicializar el reconocimiento de voz
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            
            // Configuración para español
            recognitionRef.current.lang = 'es-ES';
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.maxAlternatives = 1;

            // Eventos del reconocimiento
            recognitionRef.current.onstart = () => {
                console.log('🎤 Reconocimiento de voz iniciado');
            };

            recognitionRef.current.onresult = (event) => {
                let interimTranscriptTemp = '';
                let newFinalTranscript = '';

                // Procesar solo los resultados nuevos desde el último índice
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcriptPart = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        newFinalTranscript += transcriptPart + ' ';
                    } else {
                        interimTranscriptTemp += transcriptPart;
                    }
                }

                // Actualizar el texto final acumulado si hay nuevo texto final
                if (newFinalTranscript.trim()) {
                    setFinalTranscript(prev => prev + newFinalTranscript);
                }

                // Mostrar el texto temporal (lo que se está hablando ahora)
                setTranscript(interimTranscriptTemp);
                
                // Si hay actividad (texto final o temporal), configurar timer para detectar silencio
                if (newFinalTranscript.trim() || interimTranscriptTemp.trim()) {
                    // Limpiar el timer anterior si existe
                    if (silenceTimerRef.current) {
                        clearTimeout(silenceTimerRef.current);
                    }
                    
                    // Configurar nuevo timer para detectar silencio
                    silenceTimerRef.current = setTimeout(() => {
                        if (isListening && recognitionRef.current) {
                            console.log('🔇 Silencio detectado, procesando texto...');
                            stopListening();
                        }
                    }, 3000);
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('❌ Error en reconocimiento de voz:', event.error);
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    alert('Permiso de micrófono denegado. Por favor, permite el acceso al micrófono.');
                }
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                console.log('🛑 Reconocimiento de voz terminado');
                setIsListening(false);
                
                // Limpiar timer de silencio
                if (silenceTimerRef.current) {
                    clearTimeout(silenceTimerRef.current);
                    silenceTimerRef.current = null;
                }
            };

        } else {
            setIsSupported(false);
            console.log('❌ Reconocimiento de voz no soportado en este navegador');
        }

        // Cleanup
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
            }
        };
    }, []);

    const startListening = () => {
        if (!isSupported) {
            alert('Tu navegador no soporta reconocimiento de voz. Prueba con Google Chrome o Microsoft Edge.');
            return;
        }

        if (recognitionRef.current && !isListening) {
            setTranscript('');
            setFinalTranscript(''); // Limpiar también el texto acumulado
            setIsListening(true);
            
            try {
                recognitionRef.current.start();
            } catch (error) {
                console.error('❌ Error al iniciar reconocimiento:', error);
                setIsListening(false);
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            
            // Limpiar timer de silencio
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = null;
            }
            
            // Procesar el texto capturado (texto final + cualquier texto temporal restante)
            const fullText = finalTranscript + transcript;
            if (fullText.trim()) {
                console.log('📝 TEXTO CAPTURADO COMPLETO:');
                console.log('================');
                console.log(fullText.trim());
                console.log('================');
                
                // Aquí puedes llamar a tu función para procesar con Gemini
                processWithGemini(fullText.trim());
                
                // Limpiar los transcripts después de procesarlos
                setTranscript('');
                setFinalTranscript('');
            }
        }
    };

    // Función placeholder para procesar con Gemini
    const processWithGemini = async (text) => {
        console.log('🤖 Enviando a Gemini para procesar:', text);

        const prompt = `Actua como un asesor de ventas al cual le van a solicitar realizar un pedido de productos. Analiza el texto que te proporcionare en el cual se habla de un pedido que están solicitando.

            Ten en cuenta que hay productos que pueden ser complicados en la pronunciación del cliente, adjunto una lista de palabras que pueden ayudar a mejorar la busqueda: bravecto, aplaws, nexgard

            Requerimientos:

            - Identifica el nombre del cliente
            - Identifica la lista de productos que se nombran en el texto. Esta lista es de productos para mascotas
            - Identifica la cantidad de producto que se solicita para cada producto


            Respuesta: Formato json con la siguiente estructura:

            {
                cliente: nombre del cliente,
                productos: [
                    {
                        item: nombre del producto,
                        cantidad: cantidad de producto solicitado
                    }
                ]
            }

            importante: 

            - Responde solo el formato json solicitado
            - no des explicaciones
            - no des recomendaciones
            - no resumen


            Texto del usuario: ${text};
        `;

        const response = await gemini.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt
        }); 

        const textoSalida = formatResponse(response.text.trim());
        console.log(textoSalida);
        return response.text.trim();
    };


    const formatResponse = (text) => {
    // Asegurarse de que los párrafos estén correctamente etiquetados
    let formattedText = text;
    
    // Asegurarse de que el texto tenga etiquetas de párrafo
    if (!formattedText.includes('<p>')) {
      formattedText = `<p>${formattedText}</p>`;
      // Reemplazar saltos de línea dobles con cierre y apertura de párrafo
      formattedText = formattedText.replace(/\n\n/g, '</p><p>');
    }
    
    // Mejorar la presentación de listas
    formattedText = formattedText.replace(/<li>/g, '<li class="ai-list-item">');
    
    // Mejorar la presentación de tablas
    formattedText = formattedText.replace(/<table>/g, '<table class="ai-table">');
    
    return formattedText;
  };

    // Limpiar el reconocimiento cuando se cierre el modal
    useEffect(() => {
        if (!showIA && recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
            setTranscript('');
            setFinalTranscript(''); // Limpiar también el texto acumulado
            
            // Limpiar timer de silencio
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = null;
            }
        }
    }, [showIA, isListening]);

    return (
        <>
            <div className={`fixed top-0 left-0 w-full h-dvh bg-white z-50 transform transition-transform duration-200 ease-out ${showIA ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="relative w-full h-full">
                    {/* Header */}
                    <div className="bg-[#546C4C] w-full text-white">
                        <div className="w-full grid grid-cols-12 p-5 m-auto lg:w-[50%] items-center">
                            <div className="text-center">
                                <svg onClick={toggleIA} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 cursor-pointer">
                                    <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="col-span-10 text-center flex items-center justify-center">
                                <span className="font-bold text-xl mr-2">ANA</span>
                                <span className="text-sm">Captura de voz</span>
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
        
                    {/* Contenido principal */}
                    <div className="w-full lg:w-[54%] m-auto flex flex-col items-center justify-center h-[calc(100vh-120px)] text-gray-700">
                        
                        {/* Estado visual */}
                        <div className="text-center mb-8">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                                 className={`size-24 mx-auto mb-4 transition-colors ${isListening ? 'text-red-500' : 'text-gray-400'}`}>
                                <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                                <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                            </svg>
                            
                            <h2 className="text-2xl font-bold mb-2">
                                {isListening ? 'Escuchando...' : 'Captura de Voz'}
                            </h2>
                            
                            <p className="text-gray-500 mb-4">
                                {isListening 
                                    ? 'Habla ahora. Se detendrá automáticamente tras 3 segundos de silencio.' 
                                    : isSupported 
                                        ? 'Presiona el botón para comenzar a hablar'
                                        : 'Reconocimiento de voz no disponible en este navegador'
                                }
                            </p>
                            
                            // Mostrar texto en tiempo real mientras se habla (acumulado + temporal)
                            {isListening && (finalTranscript || transcript) && (
                                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-blue-700">
                                        <span className="font-semibold">Capturando:</span> 
                                        <span className="text-blue-800">{finalTranscript}</span>
                                        <span className="text-blue-600 italic">{transcript}</span>
                                    </p>
                                    {finalTranscript && (
                                        <p className="text-xs text-blue-500 mt-1">
                                            Texto confirmado: {finalTranscript.split(' ').length} palabras
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {/* Botón de control */}
                        <div className="flex flex-col items-center space-y-4">
                            {!isListening ? (
                                <button 
                                    onClick={startListening}
                                    disabled={!isSupported}
                                    className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 ${
                                        isSupported 
                                            ? 'bg-[#546C4C] hover:bg-[#3e5038] cursor-pointer active:scale-95' 
                                            : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                                    title={isSupported ? "Iniciar captura de voz" : "Reconocimiento de voz no disponible"}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="size-10">
                                        <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                                        <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                                    </svg>
                                </button>
                            ) : (
                                <button 
                                    onClick={stopListening}
                                    className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-all transform hover:scale-105 active:scale-95 animate-pulse"
                                    title="Detener captura"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="size-10">
                                        <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                            
                            <p className="text-sm text-gray-400">
                                {isListening ? 'Toca para detener manualmente' : 'Toca para comenzar'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ModalIA
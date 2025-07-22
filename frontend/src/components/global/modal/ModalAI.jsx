import { useState, useEffect, useRef } from "react";
import { GoogleGenAI } from '@google/genai';
import { APIKEY_GEMINI, API_VECTOR, OLLAMA_URL, MODEL_NAME } from "../../../config/config";
import axios from "axios";
import Funciones from "../../../helpers/Funciones";
import { db } from "../../../db/db";

const gemini    = new GoogleGenAI({ apiKey: APIKEY_GEMINI });

const ModalIA = ({showIA = false, toggleIA = null, handleAddToCar=null, setClienteSel=null }) => {
    
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
            recognitionRef.current.lang = 'es-MX';
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


            Requerimientos:

            * Identifica el nombre del cliente, si o identificas cliente pon la palabra: desconocido
            * Identifica la lista de productos que se nombran en el texto. Esta lista es de productos para mascotas
            * Identifica la cantidad de producto que se solicita para cada producto
            * **Utiliza la siguiente lista de palabras clave SÓLO para corregir o asimilar productos que creas que el cliente intentó pronunciar de manera similar.**
            * **NO agregues ninguna palabra de esta lista a la salida JSON a menos que esté CLARAMENTE implicada o pronunciada de forma similar en el texto del usuario.**
            * **Esta lista es una referencia fonética/ortográfica para ayudarte a interpretar nombres difíciles, NO una lista de productos a incluir por defecto.**
            * **Lista de Referencia:** bravecto, applaws, nexgard, taste of the wild, hapatogan, agility gold, purina, hills, royal canin, proplan, monello, dog chow, cat chow, felix, friskies, whiskas, cânida, nutra nugget, nutra gold, mira, nupec, biopet, maxi can, maxicat, donkan, agrosuper, masterdog, mastercat, ricocat, ricocan.


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
            - Para las cantidades solo agrega el numero, no incluyas palabras.
            - si el usuario no asigna cantidad agrega 1 por defecto


            Texto del usuario: ${text};
        `;

        //uso de ollama con el modelo llama3.2:latest
        try {
            // const response = await axios.post(`${OLLAMA_URL}api/generate`, {
            // model: MODEL_NAME,
            // prompt: prompt,
            // stream: false
            // });

            //usando el modelo Gemini
            const response = await gemini.models.generateContent({
                model: "gemini-2.0-flash",
                contents: prompt
            }); 


            //const textoSalida = formatResponse(response.data.response.trim());// Para OLLAMA
            const textoSalida = formatResponse(response.text.trim());
            const dataBuscar  = {
                query: JSON.parse(formatResponse(textoSalida)),
                limit:1
            }
            const busqueda      = await axios.post(`${API_VECTOR}api/buscar`, dataBuscar); 
            const dataRespuesta = busqueda.data;

            if(dataRespuesta.success){
                //verifico que venga la posicion resulta
                if(dataRespuesta.results){

                     if(dataRespuesta.results.cliente){
                        console.log("Cliente")
                        //busco el cliente con la respuesta que me haya dado la IA
                        try{
                            db.clientes
                            .where('Codigo')
                            .equals(dataRespuesta.results.cliente.Codigo)
                            .toArray()
                            .then((cliente) => {
                                console.log(cliente)
                                setClienteSel(cliente[0]);
                            })
                        }
                        catch(error){
                            console.error('Error general:', error);
                            Funciones.alerta(
                                "Error",
                                "Ocurrió un error al procesar el producto",
                                "error",
                                () => {}
                            );
                        }
                    }

                    //capturo los productos para buscarlos en la base de datos.
                    if(dataRespuesta.results.productos && dataRespuesta.results.productos.length > 0){
                        //busco los productos en la base de datos para empezar a agregarlos al carrito
                        dataRespuesta.results.productos.map((item) => {
                            const codigoProducto    =   item.payload.ItemCode
                            const cantidad          =   item.payload.cantidad
                            console.log(`Producto as buscar localmente: ${codigoProducto}`)
                            console.log(`Cantidad Producto as buscar localmente: ${cantidad}`)

                            try {
                            db.items
                                .where('ItemCode')
                                .equals(codigoProducto)
                                .toArray()
                                .then((items) => {
                                    if (items && items.length > 0) {
                                        handleAddToCar({
                                            ...items[0],
                                            CantSolicitada: cantidad
                                        });
                                    } else {
                                        Funciones.alerta(
                                            "Atención",
                                            `No se encontró el producto ${codigoProducto} en la base de datos local`,
                                            "warning",
                                            () => {}
                                        );
                                    }
                                })
                                .catch(error => {
                                    console.error('Error al buscar producto:', error);
                                    Funciones.alerta(
                                        "Error",
                                        "No se pudo agregar el producto al carrito",
                                        "error",
                                        () => {}
                                    );
                                });
                        } catch (error) {
                            console.error('Error general:', error);
                            Funciones.alerta(
                                "Error",
                                "Ocurrió un error al procesar el producto",
                                "error",
                                () => {}
                            );
                        }
                            
                        })
                    }
                    
                   

                    toggleIA()
                }
                else{
                    Funciones.alerta("Atención","Ana no ha podido encontrar productos relacionados. Paso 1","info",()=>{})
                }
            }
            else{
                Funciones.alerta("Atención","Ana no ha podido encontrar productos relacionados. Paso 2","info",()=>{})
            }

            //return response.text.trim();

        } catch (error) {
            console.error('Error consultando DeepSeek:', error);
            throw error;
        }

        
    };


    const formatResponse = (text) => {
        // Remove backticks, 'json' word and any whitespace at the start/end
        let formattedText = text
            .replace(/`/g, '')          // Remove backticks
            .replace(/^json\s*/i, '')   // Remove 'json' at the start (case insensitive)
            .trim();                    // Remove extra whitespace
            
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
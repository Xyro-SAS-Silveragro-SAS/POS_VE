import React, { useState, useEffect } from 'react';
import { ClipLoader } from 'react-spinners';
import datosInteresantes from '../../data/Interesantes';

const PreloaderLogin = ({ loading, logo }) => {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [isFactChanging, setIsFactChanging] = useState(false);

  // Array de datos curiosos
  const facts = datosInteresantes;

  // Rotar datos curiosos cada 4 segundos
  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setIsFactChanging(true);
      
      setTimeout(() => {
        setCurrentFactIndex((prev) => (prev + 1) % facts.length);
        setIsFactChanging(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [loading, facts.length]);

  if (!loading) return null;

  return (
    <>
      {/* CSS en un componente de estilo */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        .gradient-bg {
          background: linear-gradient(135deg, #546C4C 0%, #40553a 50%, #2d3e26 100%);
          font-family: 'Inter', sans-serif;
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .pulse-ring {
          animation: pulseRing 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
        }
        
        @keyframes pulseRing {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          40% {
            opacity: 0.8;
          }
          80%, 100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
        
        .floating {
          animation: floating 3s ease-in-out infinite;
        }
        
        @keyframes floating {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .typewriter {
          overflow: hidden;
          border-right: 2px solid rgba(255, 255, 255, 0.7);
          white-space: nowrap;
          animation: typing 2s steps(40, end), blink-caret 0.75s step-end infinite;
        }
        
        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
        }
        
        @keyframes blink-caret {
          from, to { border-color: transparent; }
          50% { border-color: rgba(255, 255, 255, 0.7); }
        }
        
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .dots::after {
          content: '';
          animation: dots 1.5s steps(4, end) infinite;
        }
        
        @keyframes dots {
          0%, 20% { content: ''; }
          40% { content: '.'; }
          60% { content: '..'; }
          80%, 100% { content: '...'; }
        }
        
        .fact-card {
          transform: scale(0.9);
          animation: scaleIn 0.5s ease-out 1s forwards;
        }
        
        @keyframes scaleIn {
          to {
            transform: scale(1);
          }
        }
        
        .progress-bar {
          width: 0%;
          animation: progressLoad 4s ease-out infinite;
        }
        
        @keyframes progressLoad {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 90%; }
        }
        
        .fact-text-transition {
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        
        .particle {
          position: absolute;
          background: white;
          border-radius: 50%;
          opacity: 0.3;
          animation: floating 3s ease-in-out infinite;
        }
      `}</style>

      <div className="fixed top-0 left-0 w-full h-screen z-50 gradient-bg flex items-start justify-center">
        {/* Partículas flotantes de fondo */}
        {/* <div className="absolute inset-0 overflow-hidden">
          <div className="particle w-2 h-2 top-[20%] left-[10%] opacity-30" style={{ animationDelay: '0s' }}></div>
          <div className="particle w-1 h-1 top-[60%] left-[80%] opacity-40" style={{ animationDelay: '1s' }}></div>
          <div className="particle w-3 h-3 top-[30%] right-[20%] opacity-20" style={{ animationDelay: '2s' }}></div>
          <div className="particle w-1.5 h-1.5 bottom-[40%] left-[70%] opacity-35" style={{ animationDelay: '0.5s' }}></div>
        </div> */}
        
        {/* Contenedor principal */}
        <div className="glass-effect p-10 w-[90%] max-w-md mx-auto rounded-3xl shadow-2xl text-white relative overflow-hidden fade-in-up mt-[20%] lg:mt-[5%]">
          {/* Efecto shimmer de fondo */}
          {/* <div className="absolute inset-0 shimmer opacity-10 rounded-3xl"></div> */}
          
          {/* Anillo pulsante de fondo */}
          {/* <div className="absolute inset-0 rounded-3xl pulse-ring border-2 border-white opacity-20"></div> */}
          
          {/* Logo con efecto flotante */}
          <div className="text-center mb-0 relative z-10">
            <div className="inline-block p-4 rounded-full bg-opacity-20">
              {logo ? (
                <img src={logo} alt="Logo" className="w-[60%] rounded-lg object-contain m-auto" />
              ) : (
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-green-800 font-bold text-2xl">
                  LOGO
                </div>
              )}
            </div>
          </div>
          
          {/* Spinner personalizado con ClipLoader */}
          <div className="flex justify-center mb-6 relative z-10">
            <div className="relative">
              <ClipLoader
                color="#fff"
                loading={loading}
                size={60}
              />
              {/* Anillo exterior decorativo */}
              <div className="absolute inset-0 border-2 border-white opacity-20 rounded-full animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}></div>
            </div>
          </div>
          
          {/* Mensaje principal */}
          <div className="text-center mb-8 relative z-10">
            <h3 className="text-xl font-semibold mb-3 typewriter">
              Configurando inventario
            </h3>
            <p className="text-sm opacity-90 leading-relaxed">
              Espere un momento mientras se configura el inventario de la bodega seleccionada
              {/* <span className="dots"></span> */}
            </p>
          </div>
          
          {/* Barra de progreso */}
          <div className="mb-8 relative z-10">
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
              <div className="progress-bar bg-white h-2 rounded-full shadow-lg"></div>
            </div>
          </div>
          
          {/* Tarjeta "Sabías que" */}
          <div className="fact-card relative z-10">
            <div className="bg-white bg-opacity-10 rounded-2xl p-6 border border-white border-opacity-20">
              <div className="flex items-start space-x-3">
                {/* Icono */}
                <div className="flex-shrink-0 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-lg">💡</span>
                </div>
                
                {/* Contenido */}
                <div className="flex-1">
                  <h4 className="font-semibold text-black mb-2 text-sm">
                    Tips de ventas
                  </h4>
                  <p 
                    className={`text-sm leading-relaxed opacity-90 text-black fact-text-transition ${
                      isFactChanging ? 'opacity-0 transform translate-y-2' : 'opacity-90 transform translate-y-0'
                    }`}
                  >
                    {facts[currentFactIndex]}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Indicador de carga en la parte inferior */}
          <div className="text-center mt-6 relative z-10">
            {/* <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div> */}
            <p className="text-xs opacity-70 mt-2">Sincronizando datos...</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PreloaderLogin;
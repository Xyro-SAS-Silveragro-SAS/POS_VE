import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTour } from '@reactour/tour';

const TourContext = createContext();

// Steps de los tours organizados por página
const tourSteps = {
  home: [
    {
        selector: '.help',
        content: 'Hola, Soy ANA, la asistente virtual de Silveragro. Bienvenido a la aplicación de venta externa. Te daré un tour para que aprendas a conocerla mejor.',
    },
    {
      selector: '.filtrosActual',
      content: 'Acá se mostrará el filtro que tienes seleccionado',
    },
    {
      selector: '.selFiltro',
      content: 'Acá puedes seleccionar uno de los diferentes filtros para buscar pedidos o cotizaciones',
    },
    {
      selector: '.nombreUsuario',
      content: 'Este es el nombre del usuario que está logueado y las opciones de menú',
    },
    {
      selector: '.listaItemsHome',
      content: 'En esta zona se mostrarán los pedidos o cotizaciones que cumplan con el filtro seleccionado',
    },
    {
      selector: '.botonAgregaNueva',
      content: 'Al presionar este botón se abrirá una nueva ventana para crear un nuevo pedido o cotización.',
    },
    {
      selector: '.pestana1',
      content: 'Aquí se mostrarán los pedidos que están en proceso o que ya están sincronizados a SAP.',
    },
    {
      selector: '.pestana2',
      content: 'Aquí se mostrarán las cotizaciones que están en proceso o que ya están sincronizadas a SAP.',
    }
  ],
  
  proceso: [
    {
      selector: '.tituloPedido',
      content: 'Este es el número del pedido o de la cotización que vas a realizar',
    },
    {
      selector: '.asistenteAna',
      content: 'Acá podrás realizar el pedido completamente por voz usando la asistente ANA',
    },
    {
      selector: '.sincronizarBtn',
      content: 'Cuando hayas terminado de realizar el pedido o la cotización, presiona este botón para sincronizarlo con SAP',
    },
    {
      selector: '.clienteSeleccionado',
      content: 'Acá se mostrara el nombre del cliente al que se le realizará el pedido o la cotización',
    },
    {
      selector: '.agregaCliente',
      content: 'Por medio de este botón podrás agregar un nuevo cliente al pedido o la cotización',
    },
    {
      selector: '.cantidadesPedido',
      content: 'Cantidades de los productos que se van a agregar al pedido o la cotización',
    },
    {
      selector: '.agregaProductos',
      content: 'Selecciona los productos que vas a agregar al pedido o la cotización',
    },
    {
      selector: '.carrito',
      content: 'En esta zona se mostrarán los productos que se han agregado al pedido o la cotización. Podrás eliminarlo del carrito, agregar más o menos cantidades solicitadas o bonificadas, alterar el precio si está permitido y ampliar la imagen al tocarla.',
    },
    {
      selector: '.totales',
      content: 'Este es el total del pedido o la cotización',
    }
  ],

  login: [
    {
      selector: '.loginForm',
      content: 'Ingresa tus credenciales para acceder al sistema',
    },
    {
      selector: '.loginButton',
      content: 'Presiona aquí para iniciar sesión',
    }
  ]
};

export const TourContextProvider = ({ children }) => {
  const [currentTour, setCurrentTour] = useState(null);
  const [tourHistory, setTourHistory] = useState([]);
  const { setSteps, setIsOpen, isOpen } = useTour();

  // Función para iniciar un tour específico
  const startTour = (tourName, autoStart = true) => {
    if (tourSteps[tourName]) {
      setCurrentTour(tourName);
      setSteps(tourSteps[tourName]);
      
      if (autoStart) {
        setIsOpen(true);
      }

      // Guardar en historial
      setTourHistory(prev => [...prev, {
        tourName,
        timestamp: new Date(),
        completed: false
      }]);

      // Marcar como visto en localStorage
      const seenTours = JSON.parse(localStorage.getItem('seenTours') || '{}');
      seenTours[tourName] = new Date().toISOString();
      localStorage.setItem('seenTours', JSON.stringify(seenTours));
    }
  };

  // Función para terminar el tour actual
  const endTour = () => {
    setIsOpen(false);
    
    // Marcar como completado
    if (currentTour) {
      setTourHistory(prev => 
        prev.map(tour => 
          tour.tourName === currentTour && !tour.completed
            ? { ...tour, completed: true, completedAt: new Date() }
            : tour
        )
      );
    }
    
    setCurrentTour(null);
  };

  // Verificar si un tour ya fue visto
  const hasSeen = (tourName) => {
    const seenTours = JSON.parse(localStorage.getItem('seenTours') || '{}');
    return !!seenTours[tourName];
  };

  // Resetear tour (para testing o re-mostrar)
  const resetTour = (tourName) => {
    const seenTours = JSON.parse(localStorage.getItem('seenTours') || '{}');
    delete seenTours[tourName];
    localStorage.setItem('seenTours', JSON.stringify(seenTours));
  };

  // Obtener estadísticas de tours
  const getTourStats = () => {
    const seenTours = JSON.parse(localStorage.getItem('seenTours') || '{}');
    const totalTours = Object.keys(tourSteps).length;
    const seenCount = Object.keys(seenTours).length;
    
    return {
      total: totalTours,
      seen: seenCount,
      remaining: totalTours - seenCount,
      percentage: Math.round((seenCount / totalTours) * 100)
    };
  };

  const value = {
    // Estado actual
    currentTour,
    isActive: isOpen,
    steps: currentTour ? tourSteps[currentTour] : [],
    
    // Funciones principales
    startTour,
    endTour,
    
    // Utilidades
    hasSeen,
    resetTour,
    getTourStats,
    tourHistory,
    
    // Tours disponibles
    availableTours: Object.keys(tourSteps),
    
    // Verificar si un tour específico está disponible
    isTourAvailable: (tourName) => !!tourSteps[tourName]
  };

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useTourContext = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTourContext debe ser usado dentro de TourContextProvider');
  }
  return context;
};
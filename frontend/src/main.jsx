import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from "react-router";
import './index.css'
import App from './App.jsx'
import Login from './pages/global/login.jsx';
import Home from './pages/ventaExterna/home.jsx';
import ReloadPrompt from './components/reloadPrompt.jsx';
import Proceso from './pages/ventaExterna/Proceso.jsx';
import { ConnectionProvider } from './context/ConnectionContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { TourProvider } from '@reactour/tour'
import { TourContextProvider } from './context/TourContext.jsx';
import InfoProducto from './pages/external/InfoProducto.jsx';

const root = document.getElementById('root');

// Steps vacíos - se manejan desde el TourContext
const initialSteps = [];

createRoot(root).render(
  <ConnectionProvider>
      <TourProvider steps={initialSteps}>
        <TourContextProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Login />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/home" element={<Home />} />
                      <Route path="/proceso/:tipoProceso/:idProceso?" element={<Proceso />} />
                      <Route path="/infoProducto/:bodega/:producto" element={<InfoProducto />} />
                      
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </TourContextProvider>
      </TourProvider>
  </ConnectionProvider>
);
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from "react-router";
import './index.css'
import App from './App.jsx'
import Login from './pages/global/login.jsx';
import Home from './pages/ventaExterna/home.jsx';
import ReloadPrompt from './components/reloadPrompt.jsx';
import Proceso from './pages/ventaExterna/Proceso.jsx';
const root = document.getElementById('root');

createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/proceso/:tipoProceso/:idProceso?" element={<Proceso />} />
    </Routes>
    <ReloadPrompt />
  </BrowserRouter>
  
);
// AppRoutes.js
import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import App from './App'; 
import Catalogo from './Pages/Cartera/FreeBoocks/Catalogo'; 

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal */}
        <Route path="/" element={<App />} />
        
        {/* Ruta para Catálogo */}
        <Route path="/cartera/FreeBoocks" element={<Catalogo />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;

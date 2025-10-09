// src/Routes.js
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import App from './App'; // Asegúrate de que la ruta sea correcta
import Catalogo from './Catalogo'; // Asegúrate de que Catalogo esté importado

const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta principal con App como contenedor */}
      <Route path="/" element={<App />}>
        {/* Ruta anidada para Catalogo */}
        <Route path="cartera/FreeBoocks/Catalogo" element={<Catalogo />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

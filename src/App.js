// Routes.js o en tu archivo de rutas
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import App from './App'; // Asegúrate de que App esté importado
import Catalogo from './Catalogo'; // Asegúrate de que Catalogo esté importado
import Footer from './components/Footer/Footer.jsx';

const AppRoutes = () => {
  return (
    <>
    <Routes>
      <Route path="/" element={<App />}>
        {/* Ruta anidada para Catalogo */}
        <Route path="cartera/Freeboocks/Catalogo" element={<Catalogo />} />
      </Route>
    </Routes>
    <Footer />
    </>
  );
};

export default AppRoutes;

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LmAi from '../components/Asistente/LmAi';
import HomeRoute from '../Pages/HomeRoute';
import Perfil from '../components/Usuarios/Perfil.jsx';
import CallbackPage from '../Pages/CallbackPage';
import Clubs from '../Pages/Clubs.jsx';
import Membresias from '../Pages/Membresias.jsx';
import MiMembresia from '../Pages/MiMembresia.jsx';
import StripeSuccessRedirect from '../components/StripeSuccessRedirect.jsx';
import AgregarClubWrapper from '../components/Clubs/AgregarClubWrapper.jsx';
import RegistroTienda from '../Pages/MarketPlace/RegistroTienda.jsx';
import AgregarProducto from '../Pages/MarketPlace/AgregarProducto.jsx';
import PreguntasProducto from '../components/MarketPlace/PreguntasProducto.jsx';
import MarketPlace from '../Pages/MarketPlace/MarketPlace.jsx';
import Tienda from '../Pages/MarketPlace/Tienda.jsx';
import Producto from '../Pages/MarketPlace/Producto.jsx';
import MiUbicacion from '../components/MiUbicacion';
import Carrito from '../Pages/MarketPlace/Carrito.jsx';
import AgregarContenido from '../Pages/Blog/AgregarContenido.jsx';

const Rutas = () => (
    <Routes>
              <Route path="/" element={<HomeRoute />} />
              <Route path="/callback" element={<CallbackPage />} />
              <Route path="/perfil/:username" element={<Perfil />} />
              <Route path="/lmai" element={<LmAi />} />
              <Route path='/clubs' element={<Clubs />} />
              <Route path='/agregar-club' element={<AgregarClubWrapper />} />
              <Route path='/blog/agregar-contenido' element={<AgregarContenido />} />
              <Route path='/membresias' element={<Membresias />} />
              <Route path='/mi-membresia' element={<MiMembresia />} />
              <Route path='/registro-vendedor' element={<RegistroTienda />} />
              <Route path='/agregar-producto' element={<AgregarProducto />} />
              <Route path="/stripe-success/:slug" element={<StripeSuccessRedirect />} />
              <Route path="/market" element={<MarketPlace />} />
              <Route path="/carrito" element={<Carrito />} />
              <Route path="/market/producto/:slug" element={<Producto />} />
              
              <Route path="/ubicacion" element={<MiUbicacion />} />

              <Route path="/market/store/:slug" element={<Tienda />}>
                <Route path="agregar-producto" element={<AgregarProducto />} />
                <Route path="pedidos" element={<PreguntasProducto />} />
                <Route path="entregados" element={<PreguntasProducto />} />
                <Route path="productos" element={<PreguntasProducto />} />
                <Route path="preguntas-producto" element={<PreguntasProducto />} />
                <Route path="pagos" element={<PreguntasProducto />} />
                <Route path="configuracion" element={<PreguntasProducto />} />
              </Route>
            </Routes>
);
export default Rutas
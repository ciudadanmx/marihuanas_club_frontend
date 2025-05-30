import React from 'react';
import { Routes, Route } from 'react-router-dom';

import LmAi from '../components/Asistente/LmAi';
import TTS from '../components/Tts.jsx';
import TextToSpeech from '../components/TextToSpeech.jsx';

import HomeRoute from '../Pages/HomeRoute';
import GanaRoute from '../Pages/GanaRoute';
import Perfil from '../components/Usuario/Perfil';
import RegistroPasajero from '../Pages/RegistroPasajero';
import RegistroConductor from '../Pages/RegistroConductor';
import RequisitosConductor from '../components/Taxis/RequisitosConductor.jsx';
import PreRegistroConductor from '../Pages/PreRegistroConductor';
import TaxisRoute from '../Pages/TaxisRoute';
import RestaurantesRoute from '../Pages/RestaurantesRoute';
import MarketRoute from '../Pages/MarketRoute';
import AcademiaRoute from '../Pages/AcademiaRoute';
import ComunidadRoute from '../Pages/ComunidadRoute';
import GenRoute from '../Pages/GenRoute';
import OpWalletRoute from '../Pages/OpWalletRoute';
import CallbackPage from '../Pages/CallbackPage';
import Academia from '../components/Taxis/Academia/Academia.jsx';
import Clubs from '../Pages/Clubs.jsx';
import Membresias from '../Pages/Membresias.jsx';
import StripeSuccessRedirect from '../components/StripeSuccessRedirect.jsx';
import AgregarClubWrapper from '../components/Clubs/AgregarClubWrapper.jsx';
import RegistroTienda from '../Pages/RegistroTienda.jsx';
import AgregarProducto from '../Pages/AgregarProducto.jsx';
import PreguntasProducto from '../components/MarketPlace/PreguntasProducto.jsx';
import MarketPlace from '../Pages/MarketPlace.jsx';
import Tienda from '../Pages/Tienda.jsx';
import Producto from '../Pages/Producto.jsx';
import MiUbicacion from '../components/MiUbicacion';


const Rutas = () => (
    <Routes>
              <Route path="/" element={<HomeRoute />} />
              <Route path="/callback" element={<CallbackPage />} />
              <Route path="/gana" element={<GanaRoute />} />
              <Route path="/taxis" element={<TaxisRoute />} />
              <Route path="/taxis/conductor/registro" element={<RegistroConductor />} />
              <Route path="/taxis/conductor/preregistro" element={<PreRegistroConductor />} />
              <Route path="/taxis/conductor/requisitos" element={<RequisitosConductor />} />
              <Route path="/taxis/pasajero/registro" element={<RegistroPasajero />} />
              <Route path="/comida" element={<RestaurantesRoute />} />
              <Route path="/marketa" element={<MarketRoute />} />
              <Route path="/academias" element={<AcademiaRoute />} />
              <Route path="/comunidad" element={<ComunidadRoute />} />
              <Route path="/gen" element={<GenRoute />} />
              <Route path="/cartera" element={<OpWalletRoute />} />
              <Route path="/perfil/:username" element={<Perfil />} />
              <Route path="/tts" element={<TTS />} />
              <Route path="/ttz" element={<TextToSpeech />} />
              <Route path="/lmai" element={<LmAi />} />
              {/* aca se agrega el componente de academia que está en components/Academia/Acadenia.jsx   */}
              <Route path='/academia' element={<Academia />} />
              
              <Route path='/clubs' element={<Clubs />} />
              <Route path='/agregar-club' element={<AgregarClubWrapper />} />
              <Route path='/membresias' element={<Membresias />} />
              <Route path='/registro-vendedor' element={<RegistroTienda />} />
              <Route path='/agregar-producto' element={<AgregarProducto />} />
              <Route path="/stripe-success/:slug" element={<StripeSuccessRedirect />} />
              <Route path="/market" element={<MarketPlace />} />
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
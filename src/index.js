// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, useParams, useLocation } from 'react-router-dom';

import { RolesProvider } from './Contexts/RolesContext.jsx';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Auth0Provider } from '@auth0/auth0-react';

import './styles/global.css';

/* ---------- Páginas principales ---------- */
import HomeRoute from './Pages/HomeRoute.jsx';
import GanaRoute from './Pages/GanaRoute.jsx';
import TaxisRoute from './Pages/TaxisRoute.jsx';
import RestaurantesRoute from './Pages/RestaurantesRoute.jsx';
import MarketRoute from './Pages/MarketRoute.jsx';
import Rompecabezas from './components/Academia/Rompecabezas.jsx';
import ComunidadRoute from './Pages/ComunidadRoute.jsx';
import GenRoute from './Pages/GenRoute.jsx';
import OpWalletRoute from './Pages/OpWalletRoute.jsx';
import CallbackPage from './Pages/CallbackPage.jsx';
import RegistroPasajero from './Pages/RegistroPasajero.jsx';
import RegistroConductor from './Pages/RegistroConductor.jsx';
import PreRegistroConductor from './Pages/PreRegistroConductor.jsx';
import Clubs from './Pages/Clubs.jsx';
import Membresias from './Pages/Membresias.jsx';
import MiMembresia from './Pages/MiMembresia.jsx';
import MarketPlace from './Pages/MarketPlace/MarketPlace.jsx';
import ProductosPage from './Pages/MarketPlace/ProductosPage.jsx';
import CursosPage from './Pages/Cursos/Cursos.jsx';
import Curso from './Pages/Cursos/Curso.jsx';
import ContenidosPage from './Pages/Blog/Contenidos.jsx';
import Contenido from './Pages/Blog/Contenido.jsx';
import AgregarCurso from './Pages/Blog/AgregarCurso.jsx';
import EditarContenido from './Pages/Blog/EditarContenido.jsx';
import EliminarContenido from './Pages/Blog/EliminarContenido.jsx';
import EditarCurso from './Pages/Cursos/EditarCurso.jsx';
import EliminarCurso from './Pages/Cursos/EliminarCurso.jsx';
import Wiki from './Pages/Wiki.jsx'; // ✅ NUEVO

import { AuthProvider } from './Contexts/AuthContext';
import Food from './Pages/Food/Food.jsx';
import AgregarTarea from './Pages/Coowork/AgregarTarea.jsx';

/* ---------- Componentes / Pages adicionales ---------- */
import NavBar from './components/NavBar/NavBar.jsx';
import Perfil from './components/Usuario/Perfil.jsx';
import RequisitosConductor from './components/Taxis/RequisitosConductor.jsx';
import Academia from './components/Taxis/Academia/Academia.jsx';
import Asistente from './components/Asistente/Asistente.jsx';
import LmAi from './components/Asistente/LmAi.jsx';
import TTS from './components/Tts.jsx';
import TextToSpeech from './components/TextToSpeech.jsx';
import StripeSuccessRedirect from './components/StripeSuccessRedirect.jsx';
import AgregarClubWrapper from './components/Clubs/AgregarClubWrapper.jsx';
import RegistroTienda from './Pages/MarketPlace/RegistroTienda.jsx';
import AgregarProducto from './Pages/MarketPlace/AgregarProducto.jsx';
import Tienda from './Pages/MarketPlace/Tienda.jsx';
import Producto from './Pages/MarketPlace/Producto.jsx';
import MiUbicacion from './components/MiUbicacion.jsx';
import Carrito from './Pages/MarketPlace/Carrito.jsx';
import MisProductos from './Pages/MarketPlace/MisProductos.jsx';
import PedidosEntregados from './Pages/MarketPlace/PedidosEntregados.jsx';
import PagosTienda from './Pages/MarketPlace/PagosTienda.jsx';
import ConfiguracionTienda from './Pages/MarketPlace/ConfiguracionTienda.jsx';
import EliminarProducto from './Pages/MarketPlace/EliminarProducto.jsx';
import HomeViewModelWrapper from './components/Florateca/home/HomeViewModelWrapper.jsx';
import DetailViewModelWrapper from './components/Florateca/detail/DetailViewModelWrapper.jsx';
import FloratecaLayout from './components/Florateca/FloratecaLayout.jsx';
import QuienesSomos from './Pages/Info/QuienesSomos.jsx';
import PreguntasFrecuentes from './Pages/Info/PreguntasFrecuentes.jsx';
import EventosPage from './components/Eventos/index.jsx';
import Evento from './Pages/Eventos/Evento.jsx';
import CrearEvento from './Pages/Eventos/CrearEvento.jsx';
import AdminDashboard from './Pages/Admin/AdminDashboard.jsx';
import LegalPage from './Pages/Legal/LegalPage.jsx';
import Prueba from './Pages/Prueba.jsx';
import TestConsumoResponsable from './Pages/Herramientas/TestConsumoResponsable.jsx';
import HerramientasPage from './Pages/Herramientas/HerramientasPage.jsx';
import Juegos from './Pages/Herramientas/Juegos.jsx';
import JuegoStatic from './Pages/Herramientas/JuegoStatic.jsx';
import ITokens from './Pages/Cartera/ITokens.jsx';
import Catalogo from './Pages/Cartera/FreeBoocks/Catalogo.jsx';
import Coowork from './Pages/Coowork/Coowork.jsx';
import Agencia from './Pages/Coowork/Agencia.jsx';
import Pasajero from './components/Taxis/Pasajero.jsx';

/* ---------- Contexts / Providers adicionales ---------- */
import { CartProvider } from './Contexts/CartContext';
import { NotificationsProvider } from './Contexts/NotificationsContext';
import { SnackbarProvider } from 'notistack';

import WikiViewer from './components/Wiki/WikiViewer.jsx';

/* ---------- Helpers / Wrappers ---------- */
const getReturnUrl = () => {
  const match = document.cookie.match(new RegExp('(^| )returnTo=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : '/ganar';
};

const onRedirectCallback = (appState) => {
  const target = appState?.returnTo || getReturnUrl() || '/';
  try {
    window.history.replaceState({}, document.title, target);
  } catch (e) {
    window.location.href = target;
  }
};

// Wrappers con useParams
const EditarContenidoWrapper = () => {
  const { slug } = useParams();
  return <EditarContenido filtros="editar" parametros={slug} />;
};
const EliminarContenidoWrapper = () => {
  const { slug } = useParams();
  return <EliminarContenido filtros="eliminar" parametros={slug} />;
};
const EditarCursoWrapper = () => {
  const { slug } = useParams();
  return <EditarCurso filtros="editar" parametros={slug} />;
};
const EliminarCursoWrapper = () => {
  const { slug } = useParams();
  return <EliminarCurso filtros="eliminar" parametros={slug} />;
};
const EliminarProductoWrapper = () => {
  const { slug } = useParams();
  return <EliminarProducto filtros="eliminar" parametros={slug} />;
};

/* ---------- Auth0 ---------- */
const domain = process.env.REACT_APP_AUTH0_DOMAIN;
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
const audience = process.env.REACT_APP_AUTH0_AUDIENCE;

/* ---------- Componente principal con lógica del Nav ---------- */
function AppWithConditionalNavbar() {
  const location = useLocation();

  // 🔥 Ocultar NavBar si la ruta es /wiki
  const hideNavbar = location.pathname === '/wiki';

  return (
    <>
      {!hideNavbar && <NavBar />}

      <Routes>
        {/* Rutas sin Navbar */}
        <Route path="/wiki" element={<WikiViewer />} />

        {/* Rutas con Navbar */}
        <Route path="/" element={<HomeRoute />} />
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="/gana" element={<GanaRoute />} />
        <Route path="/taxis" element={<TaxisRoute />} />
        <Route path="/taxis/conductor/registro" element={<RegistroConductor />} />
        <Route path="/taxis/conductor/preregistro" element={<PreRegistroConductor />} />
        <Route path="/taxis/conductor/requisitos" element={<RequisitosConductor />} />
        <Route path="/taxis/pasajero/registro" element={<RegistroPasajero />} />
        <Route path="/taxis/pasajero/viaje" element={<Pasajero />} />
        <Route path="/food" element={<RestaurantesRoute />} />
        <Route path="/market" element={<MarketPlace />} />
        <Route path="/academia" element={<Rompecabezas />} />
        <Route path="/academias" element={<Academia />} />
        <Route path="/comunidad" element={<ComunidadRoute />} />
        <Route path="/gen" element={<GenRoute />} />
        <Route path="/cartera/itokens" element={<ITokens />} />
        <Route path="/cartera/FreeBoocks" element={<Catalogo />} />
        <Route path="/cartera/:moneda" element={<OpWalletRoute />} />
        <Route path="/cartera" element={<OpWalletRoute />} />
        <Route path="/perfil/:username" element={<Perfil />} />
        <Route path="/tts" element={<TTS />} />
        <Route path="/ttz" element={<TextToSpeech />} />
        <Route path="/lmai" element={<LmAi />} />
        <Route path="/evento/:slug" element={<Evento />} />
        <Route path="/eventos" element={<EventosPage />} />
        <Route path="/eventos/crear-evento" element={<CrearEvento />} />
        <Route path="/legal" element={<LegalPage />} />
        <Route path="/quienes-somos" element={<WikiViewer />} />
        <Route path="/preguntas-frecuentes" element={<PreguntasFrecuentes />} />
        <Route path="/marketplaces" element={<MarketPlace />} />
        <Route path="/clubs" element={<Clubs />} />
        <Route path="/clubs/agregar-club" element={<AgregarClubWrapper />} />
        <Route path="/herramientas/agregar-tarea" element={<AgregarTarea />} />
        <Route path="/agregar-curso" element={<AgregarCurso />} />
        <Route path="/membresias" element={<Membresias />} />
        <Route path="/mi-membresia" element={<MiMembresia />} />
        <Route path="/registro-vendedor" element={<RegistroTienda />} />
        <Route path="/agregar-producto" element={<AgregarProducto />} />
        <Route path="/stripe-success/:slug" element={<StripeSuccessRedirect />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/market/producto/:slug" element={<Producto />} />
        <Route path="/market/store/:slug" element={<Tienda />}>
          <Route path="agregar-producto" element={<AgregarProducto />} />
          <Route path="pedidos" element={<MisProductos />} />
          <Route path="entregados" element={<PedidosEntregados />} />
          <Route path="productos" element={<AgregarProducto />} />
          <Route path="pagos" element={<PagosTienda />} />
          <Route path="configuracion" element={<ConfiguracionTienda />} />
        </Route>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/ubicacion" element={<MiUbicacion />} />
        <Route path="/prueba" element={<Prueba />} />
        <Route path="/cursos/*" element={<CursosPage />} />
        <Route path="/curso/:slug" element={<Curso />} />
        <Route path="/cursos/editar/:slug" element={<EditarCursoWrapper />} />
        <Route path="/cursos/eliminar/:slug" element={<EliminarCursoWrapper />} />
        <Route path="/contenidos/*" element={<ContenidosPage />} />
        <Route path="/contenido/:slug" element={<Contenido />} />
        <Route path="/contenidos/editar/:slug" element={<EditarContenidoWrapper />} />
        <Route path="/contenidos/eliminar/:slug" element={<EliminarContenidoWrapper />} />
        <Route path="/productos/eliminar/:slug" element={<EliminarProductoWrapper />} />
        <Route path="/productos/*" element={<ProductosPage />} />
        <Route path="/comida" element={<Food />} />
        <Route path="/ayuda" element={<WikiViewer />} />
        <Route path="/documentacion-transparencia" element={<WikiViewer />} />
        
        <Route path="/comprar-tokens" element={<OpWalletRoute />} />
        
        <Route path="/herramientas" element={<HerramientasPage />} />
        <Route path="/herramientas/test-consumo" element={<TestConsumoResponsable />} />
        <Route path="/herramientas/juegos" element={<Juegos />} />
        <Route path="/herramientas/juego-static" element={<JuegoStatic />} />
        <Route path="/coowork" element={<Coowork />} />
        <Route path="/herramientas/mi-agencia" element={<Agencia />} />
        <Route path="/florateca" element={<FloratecaLayout />}>
          <Route index element={<HomeViewModelWrapper />} />
          <Route path="detalle/:slug" element={<DetailViewModelWrapper />} />
        </Route>
      </Routes>

      {!hideNavbar && <Asistente />}
    </>
  );
}

/* ---------- Render principal ---------- */
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('No se encontró el elemento #root — crea un <div id="root"></div> en tu index.html');
} else {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        redirectUri={window.location.origin}
        cacheLocation="localstorage"
        useRefreshTokens={true}
        authorizationParams={{
          audience: audience,
          scope: 'openid profile email offline_access',
        }}
        onRedirectCallback={onRedirectCallback}
      >
        <AuthProvider>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <RolesProvider>
              <NotificationsProvider>
                <CartProvider>
                  <Router>
                    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                      <AppWithConditionalNavbar />
                    </SnackbarProvider>
                  </Router>
                </CartProvider>
              </NotificationsProvider>
            </RolesProvider>
          </LocalizationProvider>
        </AuthProvider>
      </Auth0Provider>
    </React.StrictMode>
  );
}

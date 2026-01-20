import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';

import Probador from '../components/Probador.jsx';
// 🧠 Importaciones existentes
import LmAi from '../components/Asistente/LmAi';
import HomeRoute from '../Pages/HomeRoute';
import Perfil from '../components/Usuarios/Perfil.jsx';
import Favoritos from '../components/Usuarios/Favoritos.jsx';
//import CallbackPage from '../Pages/CallbackPage';
//Clubs
import Clubs from '../Pages/Clubs/Clubs.jsx';
import AgregarClubWrapper from '../components/Clubs/AgregarClubWrapper.jsx';
import RequisitosJardinero from '../Pages/Clubs/RequisitosJardinero.jsx';
import TiposClubs from '../Pages/Clubs/TiposClubs.jsx';
import MiClub from '../Pages/Clubs/MiClub.jsx';
import Sembrar from '../components/Clubs/Sembrar.jsx';
import GestionClub from '../components/Clubs/GestionClub.jsx';

//Membresías
import Membresias from '../Pages/Membresias.jsx';
import MiMembresia from '../Pages/MiMembresia.jsx';
import MembershipCheckout from '../components/Membresias/MembershipCheckout.jsx';
import ProbarMembresia from '../components/Membresias/ProbarMembresia.jsx';
import Anuncios from '../Pages/Anuncios/Anuncios.jsx';
import Club from '../Pages/Clubs/Club.jsx';
import QrScanner from '../components/Clubs/QrScanner.jsx';
import ComunidadPage from '../Pages/ComunidadPage';
import NumeroPlantas from '../components/Membresias/NumeroPlantas.jsx';
//Stripe y Ubicación
import StripeSuccessRedirect from '../components/StripeSuccessRedirect.jsx';
import MiUbicacion from '../components/MiUbicacion';
//MarketPlace
import RegistroTienda from '../Pages/MarketPlace/RegistroTienda.jsx';
import AgregarProducto from '../Pages/MarketPlace/AgregarProducto.jsx';
import PreguntasProducto from '../components/MarketPlace/PreguntasProducto.jsx';
import MarketPlace from '../Pages/MarketPlace/MarketPlace.jsx';
import Tienda from '../Pages/MarketPlace/Tienda.jsx';
import ProductosPage from '../Pages/MarketPlace/ProductosPage.jsx';
import Producto from '../Pages/MarketPlace/Producto.jsx';
import Carrito from '../Pages/MarketPlace/Carrito.jsx';
import VendePage from '../Pages/Gana/VendePage';
import MisProductos from '../Pages/MarketPlace/MisProductos';
import PedidosEntregados from '../Pages/MarketPlace/PedidosEntregados.jsx';
import PagosTienda from '../Pages/MarketPlace/PagosTienda.jsx';
import ConfiguracionTienda from '../Pages/MarketPlace/ConfiguracionTienda.jsx';
import EliminarProducto from '../Pages/MarketPlace/EliminarProducto.jsx';
import Compras from "../Pages/MarketPlace/Compras.jsx";
//Herramientas
import HerramientasPage from '../Pages/Herramientas/HerramientasPage';
import TestConsumoResponsable from '../Pages/Herramientas/TestConsumoResponsable';
import HomeViewModelWrapper from '../components/Florateca/home/HomeViewModelWrapper.jsx';
import DetailViewModelWrapper from '../components/Florateca/detail/DetailViewModelWrapper.jsx';
import FloratecaLayout from '../components/Florateca/FloratecaLayout.jsx';
import Juegos from '../Pages/Herramientas/Juegos.jsx';
import JuegoStatic from '../Pages/Herramientas/JuegoStatic';
import KitAutoCultivo from '../Pages/Herramientas/KitAutoCultivo.jsx';
import Maria from '../Pages/Herramientas/Maria.jsx';
//Eventos
import EventosPage from '../components/Eventos/index.jsx';
import CrearEvento from '../Pages/Eventos/CrearEvento.jsx';

import EscribirBitacora from '../Pages/Clubs/EscribirBitacora.jsx';

//Gana
import Gana from '../Pages/Gana/Gana.jsx';
import PromueveMembresias from '../Pages/Gana/PromueveMembresias';
import Internacional from '../Pages/Gana/Internacional/Internacional.jsx';
import GeneraContenidos from '../Pages/Gana/GeneraContenidos.jsx';
//Usuario
import UsuarioPage from '../Pages/Usuarios/UsuarioPage';
import AdminDashboard from '../Pages/Admin/AdminDashboard.jsx';
//Cursos
import CursoDetalle from '../Pages/Cursos/Curso.jsx';
import Cursos from '../Pages/Cursos/Cursos';
import AgregarCurso from '../Pages/Blog/AgregarCurso.jsx';
import EliminarCurso from '../Pages/Cursos/EliminarCurso.jsx';
import EditarCurso from '../Pages/Cursos/EditarCurso.jsx';
import CursosPage from '../Pages/Cursos/Cursos';
import Curso from '../Pages/Cursos/Curso.jsx';
//Contenidos
import ContenidosPage from '../Pages/Blog/Contenidos';
import AgregarContenido from '../Pages/Blog/AgregarContenido.jsx';
import EditarContenido from '../Pages/Blog/EditarContenido';
import EliminarContenido from '../Pages/Blog/EliminarContenido';
import Contenido from '../Pages/Blog/Contenido';
//Legal
import LegalPage from '../Pages/Legal/LegalPage';
import GeneradorAmparo from '../Pages/Legal/GeneradorAmparo.jsx';
import GeneradorEscritoLibre from '../Pages/Legal/GeneradorEscritoLibre.jsx';
import Amparo from '../Pages/Legal/Amparo.jsx';
import GeneradorActaYEstatutos from '../Pages/Legal/GeneradorActaYEstatutos.jsx';
import InstruccionesActa from '../Pages/Legal/InstruccionesActa.jsx';
import TuAbogado from '../Pages/Legal/TuAbogado.jsx';
import Activismo from '../Pages/Legal/Activismo.jsx';
//Info
import QuienesSomos from '../Pages/Info/QuienesSomos';
import PreguntasFrecuentes from '../Pages/Info/PreguntasFrecuentes.jsx';
import Evento from '../Pages/Eventos/Evento.jsx';

import RegistroBitacora from '../Pages/Clubs/RegistroBitacora.jsx';
import EditarRegistroBitacora from '../Pages/Clubs/EditarRegistroBitacora.jsx';

// 🧩 Wiki
import WikiBar from '../components/WikiBar.jsx';
import WikiViewer from '../components/Wiki/WikiViewer.jsx';
import WikiHome from '../Pages/Wiki/WikiHome.jsx'; // si planeas tener una página principal para la wiki

import NotificationTester from '../components/NotificationTester.jsx';
import ActivaTuMembresia from '../components/Membresias/ActivaTuMembresia.jsx';
import Humo from '../components/Membresias/Humo/Humo.jsx';

import Registrar from './components/Registrar.jsx';

// 🧰 Wrappers
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

// 💡 Layout exclusivo para la Wiki
const WikiLayout = ({ children }) => (
  <>
    <WikiBar />
    <div style={{ paddingTop: '64px' }}>{children}</div>
  </>
);

const Rutas = () => (
  <Routes>
    {/* RUTAS NORMALES */}
    <Route path="/" element={<HomeRoute />} />
    <Route path="/probador" element={<Probador />} />
    <Route path="/registrar" element={<Registrar />} />
    
    <Route path="/lmai" element={<LmAi />} />
    <Route path="/herramientas/test-consumo-responsable" element={<TestConsumoResponsable />} />
    <Route path="/herramientas/maria" element={<Maria />} />
    <Route path="/herramientas/kitautocultivo" element={<KitAutoCultivo />} />
    <Route path="/herramientas" element={<HerramientasPage />} />
    <Route path="/herramientas/florateca" element={<FloratecaLayout />}>
      <Route index element={<HomeViewModelWrapper />} />
      <Route path="strain/:id" element={<DetailViewModelWrapper />} />
    </Route>
    <Route path="/juegos" element={<Juegos />} />
    <Route path="/juega/:nombre" element={<JuegoStatic />} />
    <Route path="/perfil/:username" element={<Perfil />} />
    <Route path="/favoritos" element={<Favoritos />} />
    <Route path="/favoritos/*" element={<Favoritos />} />
    <Route path="/miqr" element={<UsuarioPage />} />
    <Route path="/ubicacion" element={<MiUbicacion />} />
    <Route path="/info/quienes" element={<QuienesSomos />} />
    <Route path="/info/faq" element={<PreguntasFrecuentes />} />
    <Route path="/evento/:slug" element={<Evento />} />
    <Route path="/eventos/crear-evento" element={<CrearEvento />} />
    
    <Route path="/club/bitacoras/:registro" element={<RegistroBitacora />} />
    <Route path="/club/bitacora/editar/:registro" element={<EditarRegistroBitacora />} />
    <Route path="/club/bitacora/escribir" element={<EscribirBitacora />} />
    
    <Route path="/eventos" element={<EventosPage />} />
    <Route path="/clubs" element={<Clubs />} />
    <Route path="/clubs/miclub/*" element={<MiClub />} />
    <Route path="/clubs/:nombre_club" element={<Club />} />
    <Route path="/clubs/requisitos-jardinero" element={<RequisitosJardinero />} />
    <Route path="/clubs/agregar-club" element={<AgregarClubWrapper tipo='consumo' />} />
    <Route path="/clubs/agregar-club/cultivo" element={<AgregarClubWrapper tipo='cultivo' />} />
    <Route path="/clubs/tipos-clubs" element={<TiposClubs />} />
    <Route path="/clubs/qrscanner" element={<QrScanner />} />
    <Route path="/contenidos/agregar-contenido" element={<AgregarContenido />} />
    <Route path="/cursos/agregar-curso" element={<AgregarCurso />} />
    <Route path="/cursos/editar/:slug" element={<EditarCursoWrapper />} />
    <Route path="/cursos/eliminar/:slug" element={<EliminarCursoWrapper />} />
    <Route path="/cursos/*" element={<CursosPage />} />
    <Route path="/curso/:slug/*" element={<Curso />} />
    <Route path="/membresias" element={<Membresias />} />
    <Route path="/membresias/cultivo/order" element={<NumeroPlantas />} />
    <Route path="/membresias/jardinero/order" element={<RequisitosJardinero />} />
    <Route path="/membresias/pagar/*" element={<ProbarMembresia />} />
    <Route path="/membresias/pago/plan/:planId" element={<ProbarMembresia />} />
    <Route path="/membresias/adquirir/*" element={<MembershipCheckout />} />
    <Route path="/mi-membresia" element={<MiMembresia />} />
    <Route path="/admin/dashboard" element={<AdminDashboard />} />
    <Route path="/legal" element={<LegalPage />} />
    <Route path="/legal/rutalegal" element={<LegalPage />} />
    <Route path="/legal/misdocumentos" element={<LegalPage />} />
    <Route path="/legal/activismo" element={<Activismo />} />
    <Route path="/legal/tuabogado" element={<TuAbogado />} />
    <Route path="/legal/instrucciones-acta" element={<InstruccionesActa />} />
    <Route path="/legal/generadoracta" element={<GeneradorActaYEstatutos />} />
    <Route path="/legal/generadoramparo" element={<GeneradorAmparo />} />
    <Route path="/legal/generadorlibre" element={<GeneradorEscritoLibre />} />
    <Route path="/legal/amparo" element={<Amparo />} />
    <Route path="/comunidad" element={<ComunidadPage />} />
    <Route path="/gana" element={<Gana />} />
    <Route path="/gana/internacionaliza" element={<Internacional />} />
    <Route path="/gana/promueve" element={<PromueveMembresias />} />
    <Route path="/gana/vende" element={<VendePage />} />
    <Route path="/gana/genera-contenidos" element={<GeneraContenidos />} />
    <Route path="/contenidos/editar/:slug" element={<EditarContenidoWrapper />} />
    <Route path="/contenidos/eliminar/:slug" element={<EliminarContenidoWrapper />} />
    <Route path="/contenidos/*" element={<ContenidosPage />} />
    <Route path="/contenido/:slug" element={<Contenido />} />


    <Route path="/notificationtester" element={<NotificationTester />} />
    <Route path="/activatumembresia" element={<ActivaTuMembresia />} />
    <Route path="/humo" element={<Humo />} />

    {/* 🧠 RUTAS CON SU PROPIO LAYOUT (sin NavBar, usando WikiBar) */}
    <Route
      path="/wiki"
      element={
        <WikiLayout>
          <WikiHome />
        </WikiLayout>
      }
    />
    <Route
      path="/wiki/:slug"
      element={
        <WikiLayout>
          <WikiViewer />
        </WikiLayout>
      }
    />

    <Route path="/registro-vendedor" element={<RegistroTienda />} />
    <Route path="/agregar-producto" element={<AgregarProducto />} />
    <Route path="/stripe-success/:slug" element={<StripeSuccessRedirect />} />
    <Route path="/market" element={<MarketPlace />} />
    <Route path="/carrito" element={<Carrito />} />
    <Route path="/market/compras/*" element={<Compras />} />
    <Route path="/market/producto/:slug" element={<Producto />} />
    <Route path="/productos/eliminar/:slug" element={<EliminarProductoWrapper />} />
    <Route path="/productos/*" element={<ProductosPage />} />
    <Route path="/market/store/:slug" element={<Tienda />}>
      <Route path="agregar-producto" element={<AgregarProducto />} />
      <Route path="pedidos" element={<MisProductos />} />
      <Route path="entregados" element={<PedidosEntregados />} />
      <Route path="productos" element={<AgregarProducto />} />
      <Route path="preguntas-producto" element={<MisProductos />} />
      <Route path="pagos" element={<PagosTienda />} />
      <Route path="configuracion" element={<ConfiguracionTienda />} />
    </Route>
    <Route path="/comunidad/mis-anuncios" element={<Anuncios />} />
    <Route path="/comunidad/mis-anuncios/:slug" element={<Anuncios />}>
      <Route path="programados" element={<Anuncios />} />
      <Route path="historial" element={<Anuncios />} />
      <Route path="configuracion" element={<Anuncios />} />
    </Route>
  </Routes>
);

export default Rutas;
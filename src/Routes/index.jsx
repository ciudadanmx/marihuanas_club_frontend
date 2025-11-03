import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';

// 🧠 Importaciones existentes
import LmAi from '../components/Asistente/LmAi';
import HomeRoute from '../Pages/HomeRoute';
import Perfil from '../components/Usuarios/Perfil.jsx';
import CallbackPage from '../Pages/CallbackPage';
import Clubs from '../Pages/Clubs/Clubs.jsx';
import RequisitosJardinero from '../Pages/Clubs/RequisitosJardinero.jsx';
import TiposClubs from '../Pages/Clubs/TiposClubs.jsx';
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
import LegalPage from '../Pages/Legal/LegalPage';
import TestConsumoResponsable from '../Pages/Herramientas/TestConsumoResponsable';
import HerramientasPage from '../Pages/Herramientas/HerramientasPage';
import ComunidadPage from '../Pages/ComunidadPage';
import EventosPage from '../components/Eventos/index.jsx';
import Gana from '../Pages/Gana/Gana.jsx';
import VendePage from '../Pages/Gana/VendePage';
import UsuarioPage from '../Pages/Usuarios/UsuarioPage';
import AdminDashboard from '../Pages/Admin/AdminDashboard.jsx';
import MisProductos from '../Pages/MarketPlace/MisProductos';
import PromueveMembresias from '../Pages/Gana/PromueveMembresias';
import CursoDetalle from '../Pages/Cursos/Curso.jsx';
import ContenidosPage from '../Pages/Blog/Contenidos';
import EditarContenido from '../Pages/Blog/EditarContenido';
import EliminarContenido from '../Pages/Blog/EliminarContenido';
import Contenido from '../Pages/Blog/Contenido';
import Cursos from '../Pages/Cursos/Cursos';
import PedidosEntregados from '../Pages/MarketPlace/PedidosEntregados.jsx';
import PagosTienda from '../Pages/MarketPlace/PagosTienda.jsx';
import ConfiguracionTienda from '../Pages/MarketPlace/ConfiguracionTienda.jsx';
import AgregarCurso from '../Pages/Blog/AgregarCurso.jsx';
import EliminarCurso from '../Pages/Cursos/EliminarCurso.jsx';
import EditarCurso from '../Pages/Cursos/EditarCurso.jsx';
import EliminarProducto from '../Pages/MarketPlace/EliminarProducto.jsx';
import HomeViewModelWrapper from '../components/Florateca/home/HomeViewModelWrapper.jsx';
import Curso from '../Pages/Cursos/Curso.jsx';
import CursosPage from '../Pages/Cursos/Cursos';
import ProductosPage from '../Pages/MarketPlace/ProductosPage.jsx';
import QuienesSomos from '../Pages/Info/QuienesSomos';
import PreguntasFrecuentes from '../Pages/Info/PreguntasFrecuentes.jsx';
import Evento from '../Pages/Eventos/Evento.jsx';
import DetailViewModelWrapper from '../components/Florateca/detail/DetailViewModelWrapper.jsx';
import FloratecaLayout from '../components/Florateca/FloratecaLayout.jsx';
import CrearEvento from '../Pages/Eventos/CrearEvento.jsx';
import Juegos from '../Pages/Herramientas/Juegos.jsx';
import JuegoStatic from '../Pages/Herramientas/JuegoStatic';
import MembershipCheckout from '../components/Membresias/MembershipCheckout.jsx';
import ProbarMembresia from '../components/Membresias/ProbarMembresia.jsx';
import Internacional from '../Pages/Internacional/Internacional.jsx';
import GeneradorAmparo from '../Pages/Legal/GeneradorAmparo.jsx';
import GeneradorEscritoLibre from '../Pages/Legal/GeneradorEscritoLibre.jsx';
import Amparo from '../Pages/Legal/Amparo.jsx';
import GeneradorActaYEstatutos from '../Pages/Legal/GeneradorActaYEstatutos.jsx';
import InstruccionesActa from '../Pages/Legal/InstruccionesActa.jsx';
import TuAbogado from '../Pages/Legal/TuAbogado.jsx';
import Activismo from '../Pages/Legal/Activismo.jsx';
import Anuncios from '../Pages/Anuncios/Anuncios.jsx';
import Club from '../Pages/Clubs/Club.jsx';
import QRscanner from '../components/Clubs/QRscanner.jsx';

// 🧩 Wiki
import WikiBar from '../components/WikiBar.jsx';
import WikiViewer from '../components/Wiki/WikiViewer.jsx';
import WikiHome from '../Pages/Wiki/WikiHome.jsx'; // si planeas tener una página principal para la wiki

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
    <Route path="/herramientas/test-consumo-responsable" element={<TestConsumoResponsable />} />
    <Route path="/herramientas" element={<HerramientasPage />} />
    <Route path="/juegos" element={<Juegos />} />
    <Route path="/juega/:nombre" element={<JuegoStatic />} />
    <Route path="/callback" element={<CallbackPage />} />
    <Route path="/perfil/:username" element={<Perfil />} />
    <Route path="/lmai" element={<LmAi />} />
    <Route path="/info/quienes" element={<QuienesSomos />} />
    <Route path="/info/faq" element={<PreguntasFrecuentes />} />
    <Route path="/herramientas/florateca" element={<FloratecaLayout />}>
      <Route index element={<HomeViewModelWrapper />} />
      <Route path="strain/:id" element={<DetailViewModelWrapper />} />
    </Route>
    <Route path="/evento/:slug" element={<Evento />} />
    <Route path="/clubs" element={<Clubs />} />
    <Route path="/clubs/:nombre_club" element={<Club />} />
    <Route path="/clubs/requisitos-jardinero" element={<RequisitosJardinero />} />
    <Route path="/clubs/agregar-club" element={<AgregarClubWrapper />} />
    <Route path="/clubs/tipos-clubs" element={<TiposClubs />} />
    <Route path="/contenidos/agregar-contenido" element={<AgregarContenido />} />
    <Route path="/agregar-curso" element={<AgregarCurso />} />
    <Route path="/membresias" element={<Membresias />} />
    <Route path="/membresias/pagar/*" element={<ProbarMembresia />} />
    <Route path="/membresias/adquirir/*" element={<MembershipCheckout />} />
    <Route path="/mi-membresia" element={<MiMembresia />} />
    <Route path="/registro-vendedor" element={<RegistroTienda />} />
    <Route path="/agregar-producto" element={<AgregarProducto />} />
    <Route path="/stripe-success/:slug" element={<StripeSuccessRedirect />} />
    <Route path="/market" element={<MarketPlace />} />
    <Route path="/carrito" element={<Carrito />} />
    <Route path="/market/producto/:slug" element={<Producto />} />
    <Route path="/admin/dashboard" element={<AdminDashboard />} />
    <Route path="/legal" element={<LegalPage />} />
    <Route path="/legal/activismo" element={<Activismo />} />
    <Route path="/legal/tuabogado" element={<TuAbogado />} />
    <Route path="/legal/instrucciones-acta" element={<InstruccionesActa />} />
    <Route path="/legal/generadoracta" element={<GeneradorActaYEstatutos />} />
    <Route path="/legal/generadoramparo" element={<GeneradorAmparo />} />
    <Route path="/legal/generadorlibre" element={<GeneradorEscritoLibre />} />
    <Route path="/legal/amparo" element={<Amparo />} />
    <Route path="/comunidad" element={<ComunidadPage />} />
    <Route path="/eventos" element={<EventosPage />} />
    <Route path="/eventos/crear-evento" element={<CrearEvento />} />
    <Route path="/gana" element={<Gana />} />
    <Route path="/gana/internacionaliza" element={<Internacional />} />
    <Route path="/gana/promueve" element={<PromueveMembresias />} />
    <Route path="/gana/vende" element={<VendePage />} />
    <Route path="/usuario" element={<UsuarioPage />} />
    <Route path="/productos/eliminar/:slug" element={<EliminarProductoWrapper />} />
    <Route path="/productos/*" element={<ProductosPage />} />
    <Route path="/cursos/editar/:slug" element={<EditarCursoWrapper />} />
    <Route path="/cursos/eliminar/:slug" element={<EliminarCursoWrapper />} />
    <Route path="/cursos/*" element={<CursosPage />} />
    <Route path="/curso/:slug" element={<Curso />} />
    <Route path="/contenidos/editar/:slug" element={<EditarContenidoWrapper />} />
    <Route path="/contenidos/eliminar/:slug" element={<EliminarContenidoWrapper />} />
    <Route path="/contenidos/*" element={<ContenidosPage />} />
    <Route path="/contenido/:slug" element={<Contenido />} />
    <Route path="/ubicacion" element={<MiUbicacion />} />
    <Route path="/comunidad/mis-anuncios" element={<Anuncios />} />
    <Route path="/clubs/qrscanner" element={<QRscanner />} />

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

    <Route path="/market/store/:slug" element={<Tienda />}>
      <Route path="agregar-producto" element={<AgregarProducto />} />
      <Route path="pedidos" element={<MisProductos />} />
      <Route path="entregados" element={<PedidosEntregados />} />
      <Route path="productos" element={<AgregarProducto />} />
      <Route path="preguntas-producto" element={<MisProductos />} />
      <Route path="pagos" element={<PagosTienda />} />
      <Route path="configuracion" element={<ConfiguracionTienda />} />
    </Route>
    <Route path="/comunidad/mis-anuncios/:slug" element={<Anuncios />}>
      <Route path="programados" element={<Anuncios />} />
      <Route path="historial" element={<Anuncios />} />
      <Route path="configuracion" element={<Anuncios />} />
    </Route>
  </Routes>
);

export default Rutas;

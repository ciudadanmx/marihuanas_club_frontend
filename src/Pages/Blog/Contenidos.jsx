import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Contenidos from '../../components/Blog/Contenidos';

// Wrappers to extract URL params and pass props to Contenidos
const ContenidosUsuario = () => {
  const { user } = useAuth0();
  const usuario = user?.email || ''; // Verifica si user existe antes de acceder a .email
  return <Contenidos filtros="mis-contenidos" parametros={usuario} />;
};

const ContenidosBusqueda = () => {
  const { cadena } = useParams();
  return <Contenidos filtros="busqueda" parametros={cadena} />;
};

const ContenidosCategoria = () => {
  const { slug } = useParams();
  return <Contenidos filtros="categoria" parametros={slug} />;
};

const ContenidosPage = () => {
  return (
    <Routes>
      {/* /contenidos */}
      <Route index element={<Contenidos />} />
      {/* /contenidos/mis-contenidos */}
      <Route path="mis-contenidos" element={<ContenidosUsuario />} />
      {/* /contenidos/busqueda/:cadena */}
      <Route path="busqueda/:cadena" element={<ContenidosBusqueda />} />
      {/* /contenidos/categoria/:slug */}
      <Route path="categoria/:slug" element={<ContenidosCategoria />} />
    </Routes>
  );
};

export default ContenidosPage;

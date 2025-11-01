// src/pages/Anuncios.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

// Panels
import MisProductos from '../MarketPlace/MisProductos';
import PedidosPendientes from '../MarketPlace/PedidosPendientes';
import PedidosEntregados from '../MarketPlace/PedidosEntregados';
import ConfiguracionTienda from '../MarketPlace/ConfiguracionTienda';

// Pestanas genérico (import según tu estructura)
import Pestanas from '../../components/Pestanas';

const Anuncios = () => {
  const { slug } = useParams();
  const location = useLocation();
  const { user, isLoading } = useAuth0();

  const [tabIndex, setTabIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [productos, setProductos] = useState([]);
  const [storeImageURL, setStoreImageURL] = useState(null); // lo dejamos por si luego quieres mostrarla

  // Rutas de prueba (ahorita TODO apunta a /comunidad/mis-anuncios + path)
  const basePrueba = '/comunidad/mis-anuncios';
  const tabs = [
    { label: 'Por defecto', path: '' },                     // /comunidad/mis-anuncios
    { label: 'Programados', path: 'programados' },         // /comunidad/mis-anuncios/programados
    { label: 'Historial de Publicaciones', path: 'historial' }, // /comunidad/mis-anuncios/historial
    { label: 'Configuración', path: 'configuracion' }      // /comunidad/mis-anuncios/configuracion
  ];

  // responsive listener (solo para la UI local)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // sincroniza tabIndex con la URL de prueba (usa includes para detectar subrutas)
  useEffect(() => {
    const path = (location.pathname || '').toLowerCase();

    if (path.includes(`${basePrueba}/programados`)) setTabIndex(1);
    else if (path.includes(`${basePrueba}/historial`)) setTabIndex(2);
    else if (path.includes(`${basePrueba}/configuracion`)) setTabIndex(3);
    else setTabIndex(0); // por defecto
  }, [location.pathname]);

  // fetch productos (por email) — se mantiene para cuando uses MisProductos
  useEffect(() => {
    if (!user?.email) return;

    const fetchProductos = async () => {
      try {
        const baseUrl = (process.env.REACT_APP_STRAPI_URL || '').replace(/\/$/, '');
        if (!baseUrl) return;
        const url = `${baseUrl}/api/productos?populate=*&filters[store_email][$eq]=${encodeURIComponent(user.email)}`;
        const res = await axios.get(url);
        setProductos(res.data?.data || []);
      } catch (error) {
        console.error('❌ Error al cargar productos:', error);
      }
    };

    fetchProductos();
  }, [user]);

  // opcional: fetch datos de tienda si en algún momento quieres mostrar imagen o nombre real
  useEffect(() => {
    if (!slug) return;
    const fetchStoreData = async () => {
      try {
        const baseUrl = (process.env.REACT_APP_STRAPI_URL || '').replace(/\/$/, '');
        if (!baseUrl) return;
        const res = await axios.get(`${baseUrl}/api/stores?filters[slug][$eq]=${slug}&populate=imagen`);
        const tienda = res.data?.data?.[0];
        const imagen = tienda?.attributes?.imagen?.data?.attributes?.url;
        if (imagen) setStoreImageURL(`${baseUrl}${imagen}`);
      } catch (error) {
        console.error('❌ Error al traer datos de la tienda:', error);
      }
    };
    fetchStoreData();
  }, [slug]);

  if (isLoading) return <p>Cargando...</p>;

  const filtros = 'mios'; // lo pasamos a MisProductos

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column-reverse' : 'row',
        padding: '24px',
        gap: '32px',
        flexWrap: 'wrap'
      }}
    >
      {/* Columna principal (pestañas + panel) */}
      <div style={{ flex: '1 1 100%' }}>
        <Pestanas
          tabs={tabs}
          basePath={basePrueba} // <-- todas las rutas de prueba parten de aquí
          onTabChange={(index) => setTabIndex(index)}
          collapseAt={640}
        />

        <div>
          {tabIndex === 0 && <PedidosPendientes />}
          {tabIndex === 1 && <PedidosEntregados />}
          {tabIndex === 2 && <MisProductos filtros={filtros} productos={productos} />}
          {tabIndex === 3 && <ConfiguracionTienda />}
        </div>
      </div>
    </div>
  );
};

export default Anuncios;

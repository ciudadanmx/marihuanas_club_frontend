import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuthInfo } from '../Contexts/AuthContext';
import StoreImage from '../assets/agencia.png';
import AgregarProducto from './AgregarProducto';
import PreguntasProducto from '../components/MarketPlace/PreguntasProducto';

const Tienda = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { auth0User, strapiUser, isLoading, isAuthenticated } = useAuthInfo();
  const [tabIndex, setTabIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const tabs = [
    { label: 'Pedidos a entregar', path: '' },
    { label: 'Entregados', path: 'entregados' },
    { label: 'Productos', path: 'productos' },
    { label: 'Agregar producto', path: 'agregar-producto' },
    { label: 'Preguntas', path: 'preguntas-producto' },
    { label: 'Pagos', path: 'pagos' },
    { label: 'Configuración', path: 'configuracion' }
  ];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Actualiza tabIndex según la ruta actual
  useEffect(() => {
    const path = location.pathname;

    if (path.includes('/agregar')) setTabIndex(3);
    else if (path.includes('/productos')) setTabIndex(2);
    else if (path.includes('/entregados')) setTabIndex(1);
    else if (path.includes('/preguntas')) setTabIndex(4);
    else if (path.includes('/pagos')) setTabIndex(5);
    else if (path.includes('/configuracion')) setTabIndex(6);
    else setTabIndex(0); // default: pedidos a entregar
  }, [location.pathname]);

  const handleTabClick = (index, path) => {
    setTabIndex(index);
    // Navegar a la ruta correspondiente, teniendo en cuenta el slug de la tienda
    const basePath = `/market/store/${slug}`;
    // Si path está vacío, navegamos al basePath
    const newPath = path ? `${basePath}/${path}` : basePath;
    navigate(newPath);
  };

  if (isLoading) return <p>Cargando...</p>;
  if (!isAuthenticated || !auth0User) return <p>No estás autenticado.</p>;

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
      {/* Columna izquierda */}
      <div style={{ flex: '0 0 30%', textAlign: 'center' }}>
        <img
          src={StoreImage}
          alt="Tienda"
          style={{
            width: '100%',
            aspectRatio: '1 / 1',
            borderRadius: '16px',
            boxShadow: '0px 4px 10px rgba(0,0,0,0.1)',
            objectFit: 'cover'
          }}
        />
        <h1 style={{ marginTop: '16px', marginBottom: '8px', fontSize: '2rem', fontWeight: 'bold' }}>
          {slug}
        </h1>
        <p>Productos: <strong>24</strong> &nbsp;&nbsp; Ventas: <strong>700</strong></p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '8px' }}>
          <i className="material-icons" style={{ color: '#FFC107' }}>star</i>
          <i className="material-icons" style={{ color: '#FFC107' }}>star</i>
          <i className="material-icons" style={{ color: '#FFC107' }}>star</i>
          <i className="material-icons" style={{ color: '#FFC107' }}>star_half</i>
          <i className="material-icons" style={{ color: '#ccc' }}>star_border</i>
          <span style={{ marginLeft: '8px' }}>325 calificaciones</span>
        </div>
        <p style={{ marginTop: '8px' }}>201 reseñas</p>
        <p>Usuario Auth0: {auth0User.email}</p>
        <p>
          Usuario Strapi: {strapiUser ? strapiUser.username || strapiUser.email : 'No registrado en Strapi'}
        </p>
      </div>

      {/* Columna derecha */}
      <div style={{ flex: '1 1 65%' }}>
        <div
          style={{
            borderBottom: '1px solid #ccc',
            marginBottom: '16px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px'
          }}
        >
          {tabs.map(({ label, path }, index) => (
            <button
              key={label}
              onClick={() => handleTabClick(index, path)}
              className={`tab-button ${tabIndex === index ? 'active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div>
          {tabIndex === 0 && <PreguntasProducto />}
          {tabIndex === 1 && <PreguntasProducto />}
          {tabIndex === 2 && <PreguntasProducto />}
          {tabIndex === 3 && <AgregarProducto />}
          {tabIndex === 4 && <PreguntasProducto />}
          {tabIndex === 5 && <PreguntasProducto />}
          {tabIndex === 6 && <PreguntasProducto />}
        </div>


      </div>
    </div>
  );
};

export default Tienda;

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthInfo } from '../Contexts/AuthContext'; // Ajusta la ruta si es necesario
import StoreImage from '../assets/agencia.png';
import AgregarProducto from './AgregarProducto'; // Asegúrate de que la ruta sea correcta

const Tienda = () => {
  const { slug } = useParams();
  const { auth0User, strapiUser, isLoading, isAuthenticated } = useAuthInfo();
  const [tabIndex, setTabIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      {/* Izquierda */}
      <div style={{ flex: '0 0 30%', textAlign: 'center' }}>
        <img
          src={StoreImage}
          alt="Tienda"
          style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: '16px', boxShadow: '0px 4px 10px rgba(0,0,0,0.1)', objectFit: 'cover' }}
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

      {/* Derecha */}
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
          {['Pedidos a entregar', 'Entregados', 'Productos', 'Agregar producto', 'Preguntas', 'Pagos', 'Configuración'].map((label, index) => (
  <button
    key={label}
    onClick={() => setTabIndex(index)}
    className={`tab-button ${tabIndex === index ? 'active' : ''}`}
  >
    {label}
  </button>
))}
        </div>

        <div>
          {tabIndex === 0 && <p>Lista de pedidos pendientes...</p>}
          {tabIndex === 1 && <p>Historial de entregas...</p>}
          {tabIndex === 2 && <p>Tus productos...</p>}
          {tabIndex === 3 && <AgregarProducto />} {/* Aquí se muestra el componente real */}
          {tabIndex === 4 && <p>Preguntas frecuentes de clientes...</p>}
          {tabIndex === 5 && <p>Pagos y facturación...</p>}
          {tabIndex === 6 && <p>Configuraciones de la tienda...</p>}
        </div>
      </div>
    </div>
  );
};

export default Tienda;

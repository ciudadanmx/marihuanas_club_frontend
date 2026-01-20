// src/index.js
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import PreLoader from './components/PreLoader.jsx';
import { useNavigate } from 'react-router-dom'
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { AuthProvider } from './Contexts/AuthContext';
import { RolesProvider } from './Contexts/RolesContext';
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { CartProvider }  from './Contexts/CartContext';
import NavBar from './components/NavBar/NavBar.jsx';
import Rutas from './Routes/index.jsx';
import Asistente from './components/Asistente/Asistente';
import { SnackbarProvider } from 'notistack';
import { NotificationsProvider } from './Contexts/NotificationsContext';
import Footer from './components/Footer/Footer.jsx';
import './styles/index.css';

import { findUserInStrapi } from './utils/strapiUserService.jsx';
// IMPORTA ScrollToTop
import ScrollToTop from './components/ScrollToTop.jsx';
import AuthGate from './components/AuthGate.jsx';

const domain    = process.env.REACT_APP_AUTH0_DOMAIN;
const clientId  = process.env.REACT_APP_AUTH0_CLIENT_ID;
const audience  = process.env.REACT_APP_AUTH0_AUDIENCE;

// Componente wrapper que decide si mostrar NavBar u ocultarla según la ruta
const AppWrapper = () => {
  const { isLoading } = useAuth0();
  const location = useLocation();

  if (isLoading) {
    return <PreLoader />;
  }

  const isWikiRoute = location.pathname.startsWith('/wiki');

  const sectionMap = {
    productos: 'market',
    contenido: 'contenidos',
    club: 'clubs',
    carrito: 'market',
    curso: 'cursos',
  };

  const pathSection = location.pathname.split('/').filter(Boolean)[0];
  const siteSection = sectionMap[pathSection] ?? pathSection ?? '';

  return (
    <>
      <ScrollToTop behavior="auto" />
      {!isWikiRoute && <NavBar siteSection={siteSection} />}
      <Rutas />
      <AuthGate>
        <Asistente />
      </AuthGate>
      <Footer />
    </>
  );
};



const Auth0ProviderWithNavigate = ({ children }) => {
  const navigate = useNavigate();

  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || '/', { replace: true });
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        audience,
        scope: 'openid profile email offline_access',
        redirect_uri: window.location.origin,
      }}
      cacheLocation="localstorage"
      useRefreshTokens
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
    <Auth0ProviderWithNavigate>
      <AuthProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
          <RolesProvider>
            <NotificationsProvider>
              <CartProvider>
                
                  <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                   
                      <AppWrapper />
                   
                  </SnackbarProvider>
                
              </CartProvider>
            </NotificationsProvider>
          </RolesProvider>
        </LocalizationProvider>
      </AuthProvider>
    </Auth0ProviderWithNavigate>
    </Router>
  </React.StrictMode>
);

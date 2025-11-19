// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
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
import './styles/index.css';
import Footer from './components/Footer/Footer.jsx';

const domain    = process.env.REACT_APP_AUTH0_DOMAIN;
const clientId  = process.env.REACT_APP_AUTH0_CLIENT_ID;
const audience  = process.env.REACT_APP_AUTH0_AUDIENCE;   // Si no usas API, quita este prop

const onRedirectCallback = (appState) => {
  const target = appState?.returnTo || '/';
  window.history.replaceState({}, document.title, target);
};

// Componente wrapper que decide si mostrar NavBar u ocultarla según la ruta
const AppWrapper = () => {
  const { isLoading } = useAuth0();
  const location = useLocation();

  if (isLoading) {
    return <div>Cargando autenticación...</div>;
  }

  // Ocultar NavBar para cualquier ruta que empiece con /wiki
  const isWikiRoute = location.pathname.startsWith('/wiki');

  // Extraer la primera sección de la URL: lo que está entre la primera y la segunda "/"
  // Ejemplo: /market/comprar -> "market"
  // Si la ruta es "/" o no tiene segmento, queda cadena vacía ''
  var siteSection = (location.pathname.split('/').filter(Boolean)[0]) || '';
  if (siteSection === 'productos') siteSection = 'market';

  return (
    <>
      {/* Pasamos siteSection a NavBar solo si no es ruta wiki */}
      {!isWikiRoute && <NavBar siteSection={siteSection} />}
      <Rutas />
      <Asistente />
      <Footer />
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
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
                    <AppWrapper />
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

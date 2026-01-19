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

const domain    = process.env.REACT_APP_AUTH0_DOMAIN;
const clientId  = process.env.REACT_APP_AUTH0_CLIENT_ID;
const audience  = process.env.REACT_APP_AUTH0_AUDIENCE;

// Componente wrapper que decide si mostrar NavBar u ocultarla según la ruta
const AppWrapper = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();

  const [checkingUser, setCheckingUser ] = useState(true);

  useEffect(() => {
    const checkUserInStrapi = async () => {
      //No hacer nada si
      if (!isAuthenticated || !user?.email) {
        setCheckingUser(false);
        return;
      }

      //Evitar loop infinito si ya estamos en registro
      if(location.pathname.startsWith('/registrar')) {
        setCheckingUser(false);
        return;
      }

      try {
        const data = await findUserInStrapi(user.email);
        const strapiUser = data?.[0];

        console.log('strapeando', strapiUser);
        console.log('strapeando', strapiUser.registrado);
        console.log('strapeando');

        //No existe usuario
        if (!strapiUser) {
          console.log('strapeando, no existe strapiUser');
          navigate('/registrar', { replace: true});
          return;
        }

        //Existe pero no está registrado
        if (strapiUser.registrado !== true) {
          console.log('strapeando no registrado ');
          navigate('/registrar', { replace: true });
          return;
        }

        //usuario válido
        setCheckingUser(false);
    } catch (err) {
      console.error('Error verificando usuario en strapi');
      setCheckingUser(false);
    }
    };

    checkUserInStrapi();
  }, [isAuthenticated, user])

  if (isLoading || checkingUser) {
  return (
    <PreLoader />
  );
}


  // Ocultar NavBar para cualquier ruta que empiece con /wiki
  const isWikiRoute = location.pathname.startsWith('/wiki');

  // Extraer la primera sección de la URL: lo que está entre la primera y la segunda "/"
  // Ejemplo: /market/comprar -> "market"
  // Si la ruta es "/" o no tiene segmento, queda cadena vacía ''
  var siteSection = (location.pathname.split('/').filter(Boolean)[0]) || '';
  if (siteSection === 'productos') siteSection = 'market';
  if (siteSection === 'contenido') siteSection = 'contenidos';
  if (siteSection === 'club') siteSection = 'clubs';
  if (siteSection === 'carrito') siteSection = 'market';
  if (siteSection === 'curso') siteSection = 'cursos';
  //...

  return (
    <>
      {/* Este componente obliga a hacer scroll arriba en cada navegación */}
      <ScrollToTop behavior="auto" />

      {/* Pasamos siteSection a NavBar solo si no es ruta wiki */}
      {!isWikiRoute && <NavBar siteSection={siteSection} />}
      <Rutas />
      <Asistente />
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
    <Auth0ProviderWithNavigate
    >
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

// src/index.js
import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import { AuthProvider } from './Contexts/AuthContext'; 
import { RolesProvider } from './Contexts/RolesContext';
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { BrowserRouter as Router } from 'react-router-dom';
import { CartProvider }  from './Contexts/CartContext';
import NavBar from './components/NavBar/NavBar.jsx';
import Rutas from './Routes/index.jsx';
import Asistente from './components/Asistente/Asistente';
import { SnackbarProvider } from 'notistack';
import { NotificationsProvider } from './Contexts/NotificationsContext';
import './styles/index.css';

const domain    = process.env.REACT_APP_AUTH0_DOMAIN;
const clientId  = process.env.REACT_APP_AUTH0_CLIENT_ID;
const audience  = process.env.REACT_APP_AUTH0_AUDIENCE;   // Si no usas API, quita este prop
const scope     = 'openid profile email offline_access';


const onRedirectCallback = (appState) => {
  // Usa appState.returnTo si existe, o al home
  const target = appState?.returnTo || '/';
  window.history.replaceState({}, document.title, target);
};

const AppWrapper = () => {
  const { isLoading } = useAuth0();

  if (isLoading) {
    return <div>Cargando autenticación...</div>; // o un splash bonito
  }

  return (
    <>
      <NavBar />
      <Rutas />
      <Asistente />
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
   {/*  <Auth0Provider
      domain={domain}
      clientId={clientId}
      redirectUri={window.location.origin}
      onRedirectCallback={(appState) => {
        const target = appState?.returnTo || '/';
        window.history.replaceState({}, document.title, target);
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
      authorizationParams={{
        audience: audience,
        scope: {scope},
      }}
    > */}

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

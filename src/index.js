import React from 'react';
import ReactDOM from 'react-dom/client';
import { RolesProvider } from './Contexts/RolesContext'; 
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { BrowserRouter as Router } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';  // Importa Auth0Provider
import { SnackbarProvider } from 'notistack';
import NavBar from './components/NavBar/NavBar.jsx';
import Rutas from './Routes/index.jsx';
import Asistente from './components/Asistente/Asistente';
import { AuthProvider } from './Contexts/AuthContext'; 
import { CartProvider }  from './Contexts/CartContext';
import './styles/index.css';

// Función global para leer la cookie
const getReturnUrl = () => {
  const match = document.cookie.match(new RegExp('(^| )returnTo=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : '/gana';
};

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      authorizationParams={{ 
        redirect_uri: window.location.origin,
        audience: 'https://api.ciudadan.org',
        scope: 'openid profile email',
       }}
      onRedirectCallback={(appState) => {
        const returnTo = getReturnUrl();
        window.location.replace(returnTo);
        document.cookie = "returnTo=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";        
      }}
    >
      <AuthProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
        <RolesProvider>
          <CartProvider>
            <Router>
              <SnackbarProvider
               maxSnack={3}
               anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
              <NavBar />
              <Rutas />
              <Asistente />
              </SnackbarProvider>
            </Router>
          </CartProvider>
        </RolesProvider>
      </LocalizationProvider>
      </AuthProvider>
    </Auth0Provider>
  </React.StrictMode>
);
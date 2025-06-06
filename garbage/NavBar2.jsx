import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Se agregó useNavigate junto con Link
import { registerUserInStrapi, findUserInStrapi } from '../../utils/strapiUserService.jsx';
import { FaBalanceScale, FaUniversity, FaTools , FaDollarSign } from 'react-icons/fa';
import { RiHomeSmileFill } from "react-icons/ri";
import { BiStore } from "react-icons/bi";
import { MdOndemandVideo } from "react-icons/md";
import { IoCalendarNumberOutline } from "react-icons/io5";
import { RiVipCrownFill, RiUserCommunityFill  } from "react-icons/ri";
import guestImage from '../../assets/guest.png'; // Ajusta la ruta si es necesario
import defaultProfileImage from '../../assets/guest.png'; // Cambia esto si tienes una imagen predeterminada de perfil
import BotonCircular from '../Usuarios/BotonCircular.jsx';
import MenuIcon from './MenuIcon.jsx';
import NotificationsIcon from './NotificationsIcon.jsx';
import CartIcon from './CartIcon.jsx';
import UserMenu from './UserMenu.jsx';
import NavButton from './NavButton.jsx';
import '../../styles/NavBar.css';
import '../../styles/CuentaIcon.css';
import '../../styles/AccountMenu.css';

import Direccionador from '../../utils/Direccionador.jsx';

const NavBar = ({ SetIsMenuOpen }) => {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();
  const [isMenuOpen, setIsMenuOpen] = useState(SetIsMenuOpen || false);
  const navigate = useNavigate();

  // Estados para llevar la cuenta de la ruta y repeticiones (routeRepeat)
  const [lastRoute, setLastRoute] = useState('');
  const [routeRepeat, setRouteRepeat] = useState(0);

  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState('');
  const location = useLocation();
  const isHomeOrInfo = location.pathname === '/' || location.pathname.startsWith('/info/');

  const [logoSrc, setLogoSrc] = useState("");

  const iconMap = {
    clubs: <RiHomeSmileFill />,
    legal: <FaBalanceScale />,
    membresias: <RiVipCrownFill />,
    market: <BiStore />,
    contenidos: <MdOndemandVideo />,
    cursos: <FaUniversity />,
    herramientas: <FaTools />,
    eventos: <IoCalendarNumberOutline />,
    comunidad: <RiUserCommunityFill  />,
    gana: < FaDollarSign />
  };

  useEffect(() => {
    const handleResize = () => {
      setLogoSrc(window.innerWidth < 490 ? "/logo192.png" : "/ciudadan_logo.png");
    };

    handleResize(); // 🔥 Se ejecuta al montar el componente

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  // Actualizamos activeTab en el evento onClick y navegamos
  const handleNavigation = (path) => {
    setActiveTab(path);
    if (path === lastRoute) {
      const newRepeat = routeRepeat + 1;
      setRouteRepeat(newRepeat);
      navigate(path, { state: { routeRepeat: newRepeat } });
      setIsMenuOpen(false);
    } else {
      setLastRoute(path);
      setRouteRepeat(0);
      navigate(path, { state: { routeRepeat: 0 } });
      setIsMenuOpen(false);
    }
  };

  const handleLinkClick = (path) => {
    // Realiza la navegación
    handleNavigation(path);
    // Cierra el menú
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleUserRegistration = async () => {
      if (!isLoading && isAuthenticated && user) {
        const userEmail = user.email;
        try {
          const existingUsers = await findUserInStrapi(userEmail);
          if (Array.isArray(existingUsers) && existingUsers.length === 0) {
            const result = await registerUserInStrapi(userEmail, user.name);
            console.log('Usuario registrado en Strapi:', result);
          }
        } catch (error) {
          console.error('Error al buscar o registrar usuario en Strapi:', error);
        }
      }
    };
    handleUserRegistration();
  }, [isLoading, isAuthenticated, user]);

  const toggleDropdown = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogin = async () => {
    console.log('**********Iniciando login');
  // Guarda la URL actual antes de hacer login
  const currentUrl = window.location.pathname + window.location.search;
  document.cookie = `returnTo=${encodeURIComponent(currentUrl)}; path=/; max-age=3600`;
  console.log("URL guardada en cookie antes de login:", currentUrl);

  try {
    await loginWithRedirect();

    // Este bloque se ejecutará al regresar del login SÓLO si el login está ocurriendo en un popup.
    if (isAuthenticated && user) {
      const userEmail = user.email;
      const userName = user.name;
      console.log("Autenticado con:", userEmail);

      const existingUsers = await findUserInStrapi(userEmail);
      console.log("Resultado búsqueda en Strapi:", existingUsers);

      if (Array.isArray(existingUsers) && existingUsers.length === 0) {
        const result = await registerUserInStrapi(userEmail, userName);
        console.log("Usuario registrado en Strapi:", result);
      } else {
        console.log("El usuario ya existe en Strapi.");
      }
    } else {
      console.log("No está autenticado después de login.");
    }
  } catch (error) {
    console.error("Error durante el login o el registro en Strapi:", error);
  }

  setIsMenuOpen(false);
};

  const handleLogout = () => {
    // Elimina la cookie de retorno antes de cerrar sesión
    document.cookie = "returnTo=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    console.log("Cookie de returnTo eliminada antes de logout");
    // Redirige a la página principal después del logout
    logout({ returnTo: window.location.origin });
    setIsMenuOpen(false);
  };

  return (
    <>

{/*     <Direccionador 
        eventUrl="http://localhost:8000/chat" 
        eventKey="ya estoy invocando a la función llamar a taxi" 
        redirectPath="/taxi" 
      /> */}

      <section 
        className="navbar"
        style={{
          backgroundImage: "url('/fondo.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="navbar-arriba">
          <div className="nav-links">
            <div className='columnas'>
              <div className="columnax">
                <div className="logo-container" alt="MaRiHuaNaS.CLuB --> Red de Clubs Cannábicos Mex." onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                  <img 
                    src={logoSrc} 
                    alt="Marihuanas.club Logo" 
                    name="Marihuanas.club - Red de Clubs 420 Logo"
                    className={`logo-img ${isHomeOrInfo ? "en-home" : ""}`}
                  />
                </div>
              </div>
              
              <div className="columnax columna3">
                <div className="nav-linky">
                  <MenuIcon
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    authenticated={isAuthenticated}
                    userData={user}
                    className="cuenta-icon"
                  />
                </div>
                
                <div className="nav-linky">
                  <NotificationsIcon
                    handleLogout={handleLogout}
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    authenticated={isAuthenticated}
                    userData={user}
                    className="cuenta-icon"
                  />

                  <CartIcon
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    authenticated={isAuthenticated}
                    userData={user}
                    className="cuenta-icon"
                  />
                </div>

                <div className="nav-linky">
                  <div className="cuenta-icon-container" onClick={() => { isAuthenticated ? toggleDropdown() : handleLogin(); }}>
                    <img
                      src={isAuthenticated ? (user?.picture || defaultProfileImage) : guestImage}
                      alt="Profile"
                      className="cuenta-icon"
                    />
                  </div>
                </div>

                <UserMenu 
                  handleLogin={handleLogin}
                  isMenuOpen={isMenuOpen}
                  setIsMenuOpen={setIsMenuOpen}
                  handleLogout={handleLogout}
                  handleLinkClick={handleLinkClick}
                  defaultProfileImage={defaultProfileImage}
                  guestImage={guestImage}
                  Link={Link}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="navbar-abajo">
          <div className="nav-links wraper">
            {["clubs", "legal", "membresias", "market", "contenidos", "cursos", "herramientas", "eventos", "comunidad", "gana"].map((section) => (
              <NavButton
                key={section}
                section={section}
                activeTab={activeTab}
                handleNavigation={handleNavigation}
                iconMap={iconMap}
              />
            ))}
          </div>
        </div>  
      </section>
    </>
  );
};

export default NavBar;

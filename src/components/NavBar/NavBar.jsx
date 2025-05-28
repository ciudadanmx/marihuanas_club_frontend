import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Se agregó useNavigate junto con Link
import { registerUserInStrapi, findUserInStrapi } from '../../utils/strapiUserService';
import { FaUniversity, FaDollarSign } from 'react-icons/fa';

import { FaBalanceScale, FaTools  } from 'react-icons/fa';
import { RiHomeSmileFill } from "react-icons/ri";
import { BiStore } from "react-icons/bi";
import { MdOndemandVideo } from "react-icons/md";
import { IoCalendarNumberOutline } from "react-icons/io5";
import { RiVipCrownFill, RiUserCommunityFill  } from "react-icons/ri";

import guestImage from '../../assets/guest.png'; // Ajusta la ruta si es necesario
import defaultProfileImage from '../../assets/guest.png'; // Cambia esto si tienes una imagen predeterminada de perfil
import BotonCircular from './../Usuarios/BotonCircular.jsx';
import AIInput from './AIInput';
import MenuIcon from './MenuIcon';
//import MessagesIcon from './MessagesIcon';
import NotificationsIcon from './NotificationsIcon';
import UserMenu from './UserMenu.jsx';
import NavButton from './NavButton.jsx';
import '../../styles/NavBar.css';
import '../../styles/CuentaIcon.css';
import '../../styles/AccountMenu.css';


import Direccionador from '../../utils/Direccionador';
import CiudadanBadge from '../CiudadanBadge';

const NavBar = ({ SetIsMenuOpen }) => {
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();
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

  /*   const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }; */

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
      if (isAuthenticated && user) {
        const userEmail = user.email;
        try {
          const existingUsers = await findUserInStrapi(userEmail);
          if (Array.isArray(existingUsers) && existingUsers.length === 0) {
            const result = await registerUserInStrapi(userEmail, user.name);
            //console.log('Usuario registrado en Strapi:', result);
          }
        } catch (error) {
          console.error('Error al buscar o registrar usuario en Strapi:', error);
        }
      }
    };
    handleUserRegistration();
  }, [isAuthenticated, user]);

  
  

 

  

  const toggleDropdown = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogin = () => {
    // Guarda la URL actual antes de hacer login
    const currentUrl = window.location.pathname + window.location.search;
    document.cookie = `returnTo=${encodeURIComponent(currentUrl)}; path=/; max-age=3600`;
    console.log("URL guardada en cookie antes de login:", currentUrl);
    // Redirige a Auth0
    loginWithRedirect();
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

    {/* Componente direccionador: 
           eventUrl: URL del endpoint de streaming (ajusta la URL si es necesario)
           eventKey: palabra clave para detectar la redirección (ej. "llamar a taxi")
           redirectPath: ruta a la que se redirige (ej. "/taxi")
      */}
      <Direccionador 
        eventUrl="http://localhost:8000/chat" 
        eventKey="ya estoy invocando a la función llamar a taxi" 
        redirectPath="/taxi" 
      />


      <section className="navbar"
        style={{
          backgroundImage: "url('/fondo.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          height: "100px",
        }}
      >
        <div>
        <div className='nav-links columnas columnax'>
            
            <div className="logo-container" alt="MaRiHuaNaS.CLuB --> Red de Clubs 4.20 Mex." onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>

                <img 
                    src={logoSrc} 
                    alt="Marihuanas.Club Logo" 
                    name="Marihuanas.Club - Red de Clubs 4.20 Mex. - Logo"
                    className={`logo-img ${isHomeOrInfo ? "en-home" : ""}`}
                />
                
                <CiudadanBadge />
            </div>
            
            

            <span className="columna3">
           
              <span className="nav-linky">
                <MenuIcon
                  isOpen={isMenuOpen}
                  onClose={() => setIsMenuOpen(false)}
                  authenticated={isAuthenticated}
                  userData={user}
                  className="cuenta-icon"
                />
              </span>
              <span className="nav-linky">
                <NotificationsIcon
                  isOpen={isMenuOpen}
                  onClose={() => setIsMenuOpen(false)}
                  authenticated={isAuthenticated}
                  userData={user}
                  className="cuenta-icon"
                />
              </span>
              <span className="nav-linky">
                <NotificationsIcon
                  isOpen={isMenuOpen}
                  onClose={() => setIsMenuOpen(false)}
                  authenticated={isAuthenticated}
                  userData={user}
                  className="cuenta-icon"
                />
              </span>
              <span className="nav-linky">
                <div className="cuenta-icon-container" onClick={() => { isAuthenticated ? toggleDropdown() : handleLogin(); }}>
                  <img
                    src={isAuthenticated ? (user?.picture || defaultProfileImage) : guestImage}
                    alt="Profile"
                    className="cuenta-icon"
                  />
                </div>
              </span>
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
            </span>
          </div>
        </div>
        </section>
        <section>
        <div clasName="invisible">
            <span className="nav-links navbar-abajo">
            {["clubs", "legal", "membresias", "market", "contenidos", "cursos", "herramientas","eventos", "comunidad", "gana"].map((section) => (
                <NavButton className="nav-links"
                key={section}
                section={section}
                activeTab={activeTab}
                handleNavigation={handleNavigation}
                iconMap={iconMap}
                />
            ))}
            </span>
        </div>
      
      </section>
    </>
  );
};

export default NavBar;
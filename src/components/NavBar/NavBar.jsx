import React, { useState, useEffect, useRef } from 'react';
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
//import defaultProfileImage from '../../assets/guest.png'; // Cambia esto si tienes una imagen predeterminada de perfil
//import BotonCircular from './../Usuarios/BotonCircular.jsx';

import MenuIcon from './MenuIcon';
import UserIcon from './UserIcon.jsx'
//import MessagesIcon from './MessagesIcon';
import CartIcon from './CartIcon';
import NavButton from './NavButton.jsx';
import '../../styles/NavBar.css';
import '../../styles/CuentaIcon.css';
import '../../styles/AccountMenu.css';
import { useNotifications } from '../../Contexts/NotificationsContext';
import HearthButton from './HearthButton.jsx';


const NavBar = ({ SetIsMenuOpen, ctiveTab }) => {

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [isInfoMenuOpen, setIsInfoMenuOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const InfoRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      const targets = [profileRef.current, notifRef.current, InfoRef.current];
      const clickedInside = targets.some(ref => ref && ref.contains(event.target));
      if (!clickedInside) {
        closeAllMenus();
      }
    };


    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };




    const allowedSections = ["clubs", "legal", "membresias", "market", "contenidos", "cursos", "herramientas","eventos", "comunidad", "gana"];
    const segments = location.pathname.split('/').filter(Boolean); // elimina entradas vacías
    const firstSegment = (segments[0] || '').toLowerCase();
    if (allowedSections.includes(firstSegment)) {
      // setea activeTab con el mismo formato que usa NavButton (sin slash)
      setActiveTab(firstSegment);
      // también sincroniza lastRoute para consistencia con handleNavigation
      setLastRoute(`/${firstSegment}`);
    }else if (location.pathname === '/' || location.pathname.startsWith('/info/')) {
      // si estamos en home o info, limpiamos
      setActiveTab('');
      setLastRoute('');
    }

  }, []);

  useEffect(() => {
    const handleResize = () => {
      setLogoSrc(window.innerWidth < 490 ? "/logo193.png" : "/marihuanasclub_logo.png");
    };

    // 🔥 Obtenemos el primer path de la URL actual
    const path = `/${window.location.pathname.split('/')[1]}`;
    //llamammos a handlenavigation para que haga setActiveTab y se haga el efecto en el botón de la sección activa
    //handleNavigation(path);

    handleResize(); // Se ejecuta al montar el componente

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    console.log('cerrando sesión');
    // Elimina la cookie de retorno antes de cerrar sesión
    document.cookie = "returnTo=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    console.log("Cookie de returnTo eliminada antes de logout");
    // Redirige a la página principal después del logout
    logout({ returnTo: window.location.origin });
    setIsMenuOpen(false);
  };
  //********************quitar !!!!! */


  const closeAllMenus = () => {
    setIsProfileMenuOpen(false);
    setIsNotificationMenuOpen(false);
    setIsInfoMenuOpen(false);
  };
  
  const { notificationsNum } = useNotifications();
  return (
    <>


      <section className="navbar"
        style={{
          width: "100%",
          backgroundImage: "url('/fondo.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          height: "120px",
        }}
      >
        <div>
        <div className='nav-links columnas'>            
            <div className="logo-container" alt="MaRiHuaNaS.CLuB --> Red de Clubs 4.20 Mex." onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <img 
                    src={logoSrc} 
                    alt="Marihuanas.Club Logo" 
                    name="Marihuanas.Club - Red de Clubs 4.20 Mex. - Logo"
                    className={'logo-img en-home'}
                />     
            </div>

            <div className="columna3">
           
              <div className="nav-linky">
                <MenuIcon
                  isOpen={isInfoMenuOpen}
                  onClose={() => setIsInfoMenuOpen(false)}
                  authenticated={isAuthenticated}
                  userData={user}
                  className="cuenta-icon"
                  containerRef={InfoRef}
                  setIsOpen={(open) => {
                    closeAllMenus(); // <--- CIERRA LOS DEMÁS
                    setIsInfoMenuOpen(open);
                  }}
                />
              </div>
              <div className="nav-linky">
                <MenuIcon
                  action='notifications'
                  isOpen={isNotificationMenuOpen}
                  setIsOpen={(open) => {
                    closeAllMenus(); // <--- CIERRA LOS DEMÁS
                    setIsNotificationMenuOpen(open);
                  }}
                  onClose={() => setIsNotificationMenuOpen(false)}
                  authenticated={isAuthenticated}
                  userData={user}
                  containerRef={notifRef}
                  className="cuenta-icon"
                  handleLogout={handleLogout}
                  count={notificationsNum()}
                />
              </div>

              <div className="nav-linky">
                <HearthButton
                  isOpen={isMenuOpen}
                  onClose={() => setIsMenuOpen(false)}
                  authenticated={isAuthenticated}
                  userData={user}
                  className="cuenta-icon"
                />
              </div>


              <div className="nav-linky">
                <CartIcon
                  isOpen={isMenuOpen}
                  onClose={() => setIsMenuOpen(false)}
                  authenticated={isAuthenticated}
                  userData={user}
                  className="cuenta-icon"
                />
              </div>
              
              

              <UserIcon 
                handleLogin={handleLogin}
                isMenuOpen={isProfileMenuOpen}
                setIsMenuOpen={(open) => {
                  closeAllMenus(); // <--- CIERRA LOS DEMÁS
                  setIsProfileMenuOpen(open);
                }}
                handleLogout={handleLogout}
                handleLinkClick={handleLinkClick}
                defaultProfileImage={guestImage}
                guestImage={guestImage}
                Link={Link}
                containerRef={profileRef}
              />
            </div>
          </div>
        </div>
        </section>
        <section>
        <div>
            <div className="nav-links navbar-abajo">
            {["clubs", "legal", "membresias", "market", "contenidos", "cursos", "herramientas","eventos", "comunidad", "gana"].map((section) => (
                <NavButton 
                  key={section}
                  section={section}
                  activeTab={activeTab}
                  handleNavigation={handleNavigation}
                  iconMap={iconMap}
                  handleLogout={handleLogout}
                />
            ))}
            </div>
        </div>
      
      </section>
    </>
  );
};

export default NavBar;

import React, { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// IMPORTS QUE YA TENÍAS
// borré io y axios porque no queremos socket duplicado en NavBar
import {
  FaUniversity, FaDollarSign, FaBalanceScale, FaTools
} from 'react-icons/fa';
import { RiHomeSmileFill, RiVipCrownFill, RiUserCommunityFill } from 'react-icons/ri';
import { BiStore } from "react-icons/bi";
import { MdOndemandVideo } from "react-icons/md";
import { IoCalendarNumberOutline } from "react-icons/io5";

import { registerUserInStrapi, findUserInStrapi } from '../../utils/strapiUserService';
import guestImage from '../../assets/guest.png';
import MenuIcon from './MenuIcon';
import NotificationsIcon from './NotificationsIcon.jsx';
import UserIcon from './UserIcon.jsx';
import CartIcon from './CartIcon';
import NavButton from './NavButton.jsx';
import '../../styles/NavBar.css';
import '../../styles/CuentaIcon.css';
import '../../styles/AccountMenu.css';
import { useNotifications } from '../../Contexts/NotificationsContext';
import HearthButton from './HearthButton.jsx';
import MenuTopBar from './MenuTopBar.jsx';

const NavBar = ({ SetIsMenuOpen, siteSection }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [isInfoMenuOpen, setIsInfoMenuOpen] = useState(false);
  const [topBarOpen, setTopBarOpen] = useState(false); // <-- Estado de la barra superior

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const InfoRef = useRef(null);
  const topBarRef = useRef(null);

  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const [isMenuOpen, setIsMenuOpen] = useState(SetIsMenuOpen || false);
  const navigate = useNavigate();

  const [lastRoute, setLastRoute] = useState('siteSection');
  const [routeRepeat, setRouteRepeat] = useState(0);

  const [activeTab, setActiveTab] = useState('');
  const location = useLocation();
  const isHomeOrInfo = location.pathname === '/' || location.pathname.startsWith('/info/');

  const [logoSrc, setLogoSrc] = useState("");

  siteSection = '/'+ siteSection;

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
      const clickedInside = targets.some(ref => ref && ref.contains && ref.contains(event.target));
      if (!clickedInside) {
        closeAllMenus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setLogoSrc(window.innerWidth < 490 ? "/logo193.png" : "/marihuanasclub_logo.png");

      // Al redimensionar, actualiza la altura de la topBar para la animación si está abierta
      if (topBarRef.current && topBarOpen) {
        topBarRef.current.style.maxHeight = topBarRef.current.scrollHeight + 'px';
      }

    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [topBarOpen]);

  useEffect(() => {
    setActiveTab(siteSection);
  }, [location.pathname]);

  const handleLinkClick = (path) => {
    handleNavigation(path);
    setIsMenuOpen(false);
  };

  const closeAllMenus = () => {
    setIsProfileMenuOpen(false);
    setIsNotificationMenuOpen(false);
    setIsInfoMenuOpen(false);
  };

  // Toggle de la topBar: calculamos la altura para la animación
  const toggleTopBar = () => {
    setTopBarOpen(prev => {
      const next = !prev;
      // si la referencia existe y vamos a abrir, ajustamos maxHeight
      if (topBarRef.current) {
        if (!next) {
          topBarRef.current.style.maxHeight = '0px';
        } else {
          // fuerza reflow para que la transición funcione si venimos de 0
          topBarRef.current.style.maxHeight = '0px';
          // pequeño timeout para permitir el reflow
          setTimeout(() => {
            if (topBarRef.current) topBarRef.current.style.maxHeight = topBarRef.current.scrollHeight + 'px';
          }, 20);
        }
      }
      return next;
    });
  };

  // Inicializamos los estilos de la topBar a 0
  useEffect(() => {
    if (topBarRef.current && !topBarOpen) topBarRef.current.style.maxHeight = '0px';
  }, []);

  // --- Notifications: usamos el contexto centralizado (NO sockets aquí) ---
  // El context expone: notificaciones, loading, error, unreadCount, refreshNotificaciones, markAsRead, pushNotification
  const { unreadCount, refreshNotificaciones } = useNotifications();

  // Si quieres comportamiento optimista local, puedes añadirlo; por ahora usamos el contador real
  // const [optimisticUnread, setOptimisticUnread] = useState(0);

  // registro de usuario en Strapi (mantengo tal como tenías)
  useEffect(() => {
    const handleUserRegistration = async () => {
      if (isAuthenticated && user) {
        const userEmail = user.email;
        try {
          const existingUsers = await findUserInStrapi(userEmail);
          if (Array.isArray(existingUsers) && existingUsers.length === 0) {
            await registerUserInStrapi(userEmail, user.name);
          }
        } catch (error) {
          console.error('Error al buscar o registrar usuario en Strapi:', error);
        }
      }
    };
    handleUserRegistration();
  }, [isAuthenticated, user]);

  const handleLogin = () => {
    // Guarda la URL completa (ruta, query y hash) en una cookie, codificada para evitar problemas con caracteres especiales
    const currentUrl =
      window.location.pathname + window.location.search + window.location.hash;
    document.cookie = `returnTo=${encodeURIComponent(currentUrl)}; path=/; max-age=3600`;
    console.log('************ Guardando cookie en componente login:', currentUrl);
    
    // Redirige a Auth0 para/ iniciar sesión
    loginWithRedirect({
      appState: {
        returnTo: location.pathname + location.search,
      },
    });
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    document.cookie = "returnTo=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    logout({ returnTo: window.location.origin });
    setIsMenuOpen(false);
  };

  // cuenta que pasamos al MenuIcon: número real (desde context)
  const displayCount = Number(unreadCount || 0);

  return (
    <>

      <MenuTopBar
        iconMap={iconMap}
        isOpen={topBarOpen}
        setIsOpen={(open) => {
          if (topBarRef.current) {
            if (!open) {
              topBarRef.current.style.maxHeight = '0px';
            } else {
              topBarRef.current.style.maxHeight = '0px';
              setTimeout(() => {
                if (topBarRef.current) topBarRef.current.style.maxHeight = topBarRef.current.scrollHeight + 'px';
              }, 20);
            }
          }
          closeAllMenus();
          setTopBarOpen(open);
        }}
        topBarRef={topBarRef}
        handleNavigation={handleNavigation}
      />
    
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
                id="marihuanas-club-logo"
                src={logoSrc}
                alt="Marihuanas.Club Logo"
                name="Marihuanas.Club - Red de Clubs 4.20 Mex. - Logo"
                className={'logo-img en-home'}
              />
            </div>

            <div className="columna3">
              <div className="nav-linky corredo" >
                <MenuIcon
                  isOpen={topBarOpen}
                  setIsOpen={(open) => {
                    // animación: ajusta maxHeight para la transición
                    if (topBarRef.current) {
                      if (!open) {
                        topBarRef.current.style.maxHeight = '0px';
                      } else {
                        // forzamos reflow para que la transición se anime bien
                        topBarRef.current.style.maxHeight = '0px';
                        setTimeout(() => {
                          if (topBarRef.current) topBarRef.current.style.maxHeight = topBarRef.current.scrollHeight + 'px';
                        }, 20);
                      }
                    }
                    // cierra otras menus si hace falta
                    closeAllMenus();
                    setTopBarOpen(open);
                  }}
                  className="cuenta-icon"
                />
              </div>

              <div className="nav-linky">
                <NotificationsIcon
                  action='notifications'
                  isOpen={isNotificationMenuOpen}
                  setIsOpen={(open) => {
                    closeAllMenus();
                    setIsNotificationMenuOpen(open);
                  }}
                  onClose={() => setIsNotificationMenuOpen(false)}
                  authenticated={isAuthenticated}
                  userData={user}
                  containerRef={notifRef}
                  className="cuenta-icon"
                  handleLogout={handleLogout}
                  count={displayCount}
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
                  closeAllMenus();
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

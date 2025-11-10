import React, { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

import { registerUserInStrapi, findUserInStrapi } from '../../utils/strapiUserService';
import { FaUniversity, FaDollarSign } from 'react-icons/fa';
import { FaBalanceScale, FaTools  } from 'react-icons/fa';
import { RiHomeSmileFill } from "react-icons/ri";
import { BiStore } from "react-icons/bi";
import { MdOndemandVideo } from "react-icons/md";
import { IoCalendarNumberOutline } from "react-icons/io5";
import { RiVipCrownFill, RiUserCommunityFill  } from "react-icons/ri";

import guestImage from '../../assets/guest.png';
import MenuIcon from './MenuIcon';
import UserIcon from './UserIcon.jsx'
import CartIcon from './CartIcon';
import NavButton from './NavButton.jsx';
import '../../styles/NavBar.css';
import '../../styles/CuentaIcon.css';
import '../../styles/AccountMenu.css';
import { useNotifications } from '../../Contexts/NotificationsContext';
import HearthButton from './HearthButton.jsx';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;

const NavBar = ({ SetIsMenuOpen, siteSection }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [isInfoMenuOpen, setIsInfoMenuOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const InfoRef = useRef(null);

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
      const clickedInside = targets.some(ref => ref && ref.contains(event.target));
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
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // --- Notifications context (usa lo que tengas disponible) ---
  // Asegúrate que tu NotificationsContext exponga refreshNotificaciones si quieres que pushNotification
  // dispare una recarga desde el servidor.
  const { notificationsNum, refreshNotificaciones } = useNotifications();

  // contador optimista local para respuesta instantánea en UI
  const [optimisticUnread, setOptimisticUnread] = useState(0);

  // Cuando el número real cambie (viene del contexto), limpiamos el optimismo
  // calculamos el número actual a partir de la función
  const currentNotificationsNum = typeof notificationsNum === 'function' ? notificationsNum() : 0;
  useEffect(() => {
    // si el backend refrescó, limpiamos el contador optimista
    setOptimisticUnread(0);
  }, [currentNotificationsNum]);

  /**
   * pushNotification
   * - notif: objeto recibido por socket (ya mapeado en el on('notification'))
   * Comportamiento:
   * 1) incrementa contador optimista para feedback inmediato
   * 2) si existe refreshNotificaciones en el contexto, la llama para traer la lista actualizada
   * 3) si ocurre error, mantiene el incremento optimista para que el usuario vea la alerta
   */
  const pushNotification = async (notif) => {
    try {
      // 1) Feedback inmediato en UI
      setOptimisticUnread((v) => v + 1);

      // 2) Si tu contexto provee la función para refrescar, la usamos
      if (typeof refreshNotificaciones === 'function') {
        await refreshNotificaciones(); // espera a que el servidor responda y el contexto se actualice
        // al actualizar el contexto, el useEffect que observa currentNotificationsNum limpiará optimisticUnread
      } else {
        // Si no existe refresh, opcionalmente podrías guardar la notificación localmente (no lo hacemos aquí)
        console.warn('pushNotification: refreshNotificaciones no disponible; aplicado incremento optimista.');
      }

      // opcional: puedes mostrar una pequeña animación, sonido o toast aquí
      // example: toast('Nueva notificación');
    } catch (err) {
      console.error('pushNotification error:', err);
      // no quitar el optimisticUnread para que el usuario vea algo; podrías revertir si quieres:
      // setOptimisticUnread((v) => Math.max(0, v - 1));
    }
  };

  // ---------- Socket: conectar y escuchar eventos ----------
  useEffect(() => {
    if (!SOCKET_URL) {
      console.warn('REACT_APP_SOCKET_URL no definido; el socket no se conectará.');
      return;
    }

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      console.log('NavBar conectado al socket', SOCKET_URL, 'id:', socket.id);
    });

    socket.on('notification', (data) => {
      const newNotif = {
        id: data.id ?? `notif_${Date.now()}`,
        title: data.title ?? 'Notificación',
        message: data.message ?? (data.body ?? JSON.stringify(data)).slice(0, 250),
        createdAt: data.createdAt ?? new Date().toISOString(),
        read: false,
        data,
        type: data.type ?? 'generic'
      };
      // Llamamos a la función que actualiza contador y refresca notificaciones
      pushNotification(newNotif);
    });

    socket.on('disconnect', (reason) => console.log('Socket desconectado:', reason));
    socket.on('connect_error', (err) => console.warn('Error de conexión socket:', err));

    return () => socket.disconnect();
    // NOTA: pushNotification no está en dependencias para evitar reconectar el socket constantemente.
    // Si tu linter reclama, puedes envolver pushNotification en useCallback y añadirla.
  }, [SOCKET_URL]); // intentionally minimal deps

  useEffect(() => {
    const handleUserRegistration = async () => {
      if (isAuthenticated && user) {
        const userEmail = user.email;
        try {
          const existingUsers = await findUserInStrapi(userEmail);
          if (Array.isArray(existingUsers) && existingUsers.length === 0) {
            const result = await registerUserInStrapi(userEmail, user.name);
          }
        } catch (error) {
          console.error('Error al buscar o registrar usuario en Strapi:', error);
        }
      }
    };
    handleUserRegistration();
  }, [isAuthenticated, user]);

  const handleLogin = () => {
    const currentUrl = window.location.pathname + window.location.search;
    document.cookie = `returnTo=${encodeURIComponent(currentUrl)}; path=/; max-age=3600`;
    loginWithRedirect();
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    document.cookie = "returnTo=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    logout({ returnTo: window.location.origin });
    setIsMenuOpen(false);
  };

  // cuenta que pasamos al MenuIcon: número real + optimista
  const displayCount = currentNotificationsNum + optimisticUnread;

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
                    closeAllMenus();
                    setIsInfoMenuOpen(open);
                  }}
                />
              </div>

              <div className="nav-linky">
                <MenuIcon
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

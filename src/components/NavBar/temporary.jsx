// src/components/NavBar/NavBar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

import { registerUserInStrapi, findUserInStrapi } from '../../utils/strapiUserService';
import { FaUniversity, FaDollarSign, FaBalanceScale, FaTools } from 'react-icons/fa';
import { RiHomeSmileFill, RiVipCrownFill, RiUserCommunityFill } from 'react-icons/ri';
import { BiStore } from 'react-icons/bi';
import { MdOndemandVideo } from 'react-icons/md';
import { IoCalendarNumberOutline } from 'react-icons/io5';

import guestImage from '../../assets/guest.png';
import MenuIcon from './MenuIcon';
import UserIcon from './UserIcon.jsx';
import CartIcon from './CartIcon';
import NavButton from './NavButton.jsx';
import HearthButton from './HearthButton.jsx';

import '../../styles/NavBar.css';
import '../../styles/CuentaIcon.css';
import '../../styles/AccountMenu.css';

import { useNotifications } from '../../Contexts/NotificationsContext'; // opcional

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;
const STRAPI_URL = process.env.REACT_APP_STRAPI_URL; // ejemplo: https://mi-strapi/api

const LOCALSTORAGE_KEY = 'ciudadan_notifications_v1';

const NavBar = ({ SetIsMenuOpen, siteSection }) => {
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [isInfoMenuOpen, setIsInfoMenuOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(SetIsMenuOpen || false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const InfoRef = useRef(null);

  const [lastRoute, setLastRoute] = useState('siteSection');
  const [routeRepeat, setRouteRepeat] = useState(0);
  const [activeTab, setActiveTab] = useState('');
  const [logoSrc, setLogoSrc] = useState("");

  siteSection = '/' + siteSection;

  const iconMap = {
    clubs: <RiHomeSmileFill />,
    legal: <FaBalanceScale />,
    membresias: <RiVipCrownFill />,
    market: <BiStore />,
    contenidos: <MdOndemandVideo />,
    cursos: <FaUniversity />,
    herramientas: <FaTools />,
    eventos: <IoCalendarNumberOutline />,
    comunidad: <RiUserCommunityFill />,
    gana: <FaDollarSign />
  };

  // Contexto opcional de notificaciones
  const notificationsContext = useNotifications?.();
  const ctxNotifications = notificationsContext?.notifications ?? null;
  const ctxAddNotification = notificationsContext?.addNotification ?? null;
  const ctxMarkAllRead = notificationsContext?.markAllAsRead ?? null;
  const ctxNotificationsNum = notificationsContext?.notificationsNum ?? null;

  // Estado local de notificaciones
  const [notifications, setNotifications] = useState(() => {
    // arrancamos desde localStorage si existe
    try {
      const raw = localStorage.getItem(LOCALSTORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error leyendo notifs de localStorage', e);
    }
    // si el contexto ya tiene notifs, úsalas
    if (Array.isArray(ctxNotifications)) return ctxNotifications.slice();
    return [];
  });

  const [unreadCount, setUnreadCount] = useState(() => {
    // si contexto tiene contador
    if (typeof ctxNotificationsNum === 'function') return ctxNotificationsNum();
    return notifications.filter(n => !n.read).length;
  });

  // ---------- Helpers: sincronización y persistencia ----------
  const persistNotifications = (array) => {
    try {
      const payload = JSON.stringify(array);
      localStorage.setItem(LOCALSTORAGE_KEY, payload);
    } catch (e) {
      console.warn('No se pudo guardar notificaciones en localStorage', e);
    }
  };

  const mergeNotifications = (baseArray, incomingArray) => {
    // baseArray: array existente (más viejo o local)
    // incomingArray: nuevo array (ej: venido desde Strapi o socket)
    // Queremos unir por id (si no hay id usamos timestamp-unique)
    const map = new Map();
    // inserta base primero (para mantener orden histórico)
    for (const it of baseArray) {
      const id = it.id ?? (`local_${it.createdAt ?? JSON.stringify(it)}`);
      map.set(id, it);
    }
    // inserta incoming sobrescribiendo por id si existe (para que los más recientes tengan prioridad)
    for (const it of incomingArray) {
      const id = it.id ?? (`inc_${it.createdAt ?? JSON.stringify(it)}`);
      map.set(id, it);
    }
    // convertimos a array ordenado por createdAt desc (más nuevo primero)
    const arr = Array.from(map.values()).sort((a, b) => {
      const ta = new Date(a.createdAt || a._createdAt || Date.now()).getTime();
      const tb = new Date(b.createdAt || b._createdAt || Date.now()).getTime();
      return tb - ta;
    });
    return arr;
  };

  const recalcUnread = (arr) => arr.filter(n => !n.read).length;

  // pushNotification evita duplicados y sincroniza con contexto si existe
  const pushNotification = (notif) => {
    setNotifications(prev => {
      // normalizar id
      const id = notif.id ?? (`notif_${Date.now()}`);
      if (prev.some(n => n.id === id)) return prev;
      const next = [ { ...notif, id }, ...prev ];
      persistNotifications(next);
      if (typeof ctxAddNotification === 'function') {
        try { ctxAddNotification(notif); } catch (e) { console.warn('ctxAddNotification falló', e); }
      }
      setUnreadCount(recalcUnread(next));
      return next;
    });
  };

  // marcar todas como leídas localmente y via API Strapi (si el usuario está logueado y Strapi URL disponible)
  const markAllAsRead = async () => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      persistNotifications(next);
      setUnreadCount(0);
      return next;
    });

    // sincronizar con contexto si existe
    if (typeof ctxMarkAllRead === 'function') {
      try { ctxMarkAllRead(); } catch (e) { console.warn('ctxMarkAllRead fallo', e); }
    }

    // si tenemos STRAPI_URL y el usuario, intentamos marcar en Strapi (bulk o por id)
    if (STRAPI_URL && isAuthenticated) {
      try {
        // Intentamos un endpoint hipotético /notifications/mark-all-read (ajusta si tu API cambia)
        await axios.post(`${STRAPI_URL.replace(/\/$/, '')}/notifications/mark-all-read`, {}, {
          withCredentials: true,
        });
      } catch (e) {
        // si no existe, hacemos por cada notificación marcada como no-leída que venga de Strapi (tiene campo idStrapi)
        try {
          const raw = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY) || '[]');
          const toUpdate = raw.filter(n => n.idStrapi || n._id).map(n => n.idStrapi ?? n._id).filter(Boolean);
          await Promise.all(toUpdate.map(idStrapi => {
            // patch a /notifications/:id con { read: true }
            return axios.put(`${STRAPI_URL.replace(/\/$/, '')}/notifications/${idStrapi}`, { data: { read: true } }, { withCredentials: true }).catch(() => {});
          }));
        } catch (err) {
          console.warn('No se pudo marcar notificaciones en Strapi', err);
        }
      }
    }
  };

  // marcar 1 notificación como leída (por ejemplo al abrir el detalle)
  const markNotificationRead = async (notifId) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === notifId ? ({ ...n, read: true }) : n);
      persistNotifications(next);
      setUnreadCount(recalcUnread(next));
      return next;
    });

    // si viene con idStrapi, actualizar en Strapi
    const notif = notifications.find(n => n.id === notifId) || null;
    if (STRAPI_URL && notif && (notif.idStrapi || notif._id) && isAuthenticated) {
      const idStrapi = notif.idStrapi ?? notif._id;
      try {
        await axios.put(`${STRAPI_URL.replace(/\/$/, '')}/notifications/${idStrapi}`, { data: { read: true } }, { withCredentials: true });
      } catch (e) {
        console.warn('No se pudo marcar notificación como leída en Strapi', e);
      }
    }
  };

  // ---------- Traer notificaciones desde Strapi al montar ----------
  useEffect(() => {
    let mounted = true;
    const fetchFromStrapi = async () => {
      if (!STRAPI_URL) {
        console.warn('REACT_APP_STRAPI_URL no definido; omitiendo fetch de Strapi');
        return;
      }
      try {
        // Ajusta la ruta según tu colección en Strapi. Aquí asumimos /notifications?populate=*
        const url = `${STRAPI_URL.replace(/\/$/, '')}/notifications?populate=*`;
        const res = await axios.get(url, { withCredentials: true });
        // transformar según la estructura de Strapi v4: res.data.data -> array
        const strapiArrayRaw = res.data?.data ?? res.data ?? [];
        const strapiArray = strapiArrayRaw.map(item => {
          // intenta normalizar campos comunes
          const idStrapi = item.id ?? item._id ?? (item.attributes && item.attributes.id);
          const attrs = item.attributes ?? item;
          return {
            id: attrs.idClient ?? `strapi_${idStrapi}`, // id con preferencia a idClient si existe
            idStrapi,
            title: attrs.title ?? attrs.titulo ?? 'Notificación',
            message: attrs.message ?? attrs.descripcion ?? attrs.body ?? '',
            createdAt: attrs.publishedAt ?? attrs.createdAt ?? attrs.created_at ?? new Date().toISOString(),
            read: !!attrs.read,
            data: attrs.data ?? attrs.payload ?? {},
            raw: item
          };
        });

        if (!mounted) return;

        // merge con localStorage actual y con estado actual
        setNotifications(prev => {
          // leemos localStorage por si cambió
          let localArr = [];
          try {
            const rawLS = localStorage.getItem(LOCALSTORAGE_KEY);
            localArr = rawLS ? JSON.parse(rawLS) : [];
          } catch (e) { localArr = prev.slice(); }

          // fusionar localArr + strapiArray + prev (prev incluye ya cambios hechos mientras cargaba)
          const merged = mergeNotifications(localArr, [...strapiArray, ...prev]);
          persistNotifications(merged);
          setUnreadCount(recalcUnread(merged));
          // sincronizar con contexto
          if (Array.isArray(ctxNotifications) && typeof ctxAddNotification === 'function') {
            try {
              // opcional: sincronizar agregando los que faltan
              for (const n of merged) {
                if (!ctxNotifications.some(cn => cn.id === n.id)) ctxAddNotification(n);
              }
            } catch (e) { /* noop */ }
          }
          return merged;
        });

      } catch (error) {
        console.error('Error trayendo notificaciones de Strapi:', error);
      }
    };

    fetchFromStrapi();

    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [STRAPI_URL, isAuthenticated]);

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

    socket.on('oferta', (data) => {
      // estructura esperada de ejemplo:
      // { id, title, message, createdAt, originAddress, destinationAddress, driverName, type: 'oferta' }
      const newNotif = {
        id: data.id ?? `oferta_${Date.now()}`,
        title: data.title ?? 'Oferta de viaje',
        message: data.message ?? `${data.driverName ? data.driverName + ' ' : ''} te ofrece un viaje`,
        createdAt: data.createdAt ?? new Date().toISOString(),
        read: false,
        data,
        type: data.type ?? 'oferta'
      };
      pushNotification(newNotif);
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
      pushNotification(newNotif);
    });

    socket.on('disconnect', (reason) => console.log('Socket desconectado:', reason));
    socket.on('connect_error', (err) => console.warn('Error de conexión socket:', err));

    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // solo una vez

  // ---------- Sincronización con contexto externo ----------
  useEffect(() => {
    if (Array.isArray(ctxNotifications)) {
      // si el contexto cambia, hacemos merge respetando ids
      setNotifications(prev => {
        const merged = mergeNotifications(prev, ctxNotifications);
        persistNotifications(merged);
        setUnreadCount(recalcUnread(merged));
        return merged;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctxNotifications]);

  // ---------- Guardar en localStorage cada vez que notifications cambia ----------
  useEffect(() => {
    persistNotifications(notifications);
    setUnreadCount(recalcUnread(notifications));
  }, [notifications]);

  // ---------- Registro en Strapi cuando el usuario hace login ----------
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

  // ---------- Responsive logo ----------
  useEffect(() => {
    const handleResize = () => {
      setLogoSrc(window.innerWidth < 490 ? "/logo193.png" : "/marihuanasclub_logo.png");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ---------- Click fuera para cerrar menus ----------
  useEffect(() => {
    const handleClickOutside = (event) => {
      const targets = [profileRef.current, notifRef.current, InfoRef.current];
      const clickedInside = targets.some(ref => ref && ref.contains(event.target));
      if (!clickedInside) closeAllMenus();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeAllMenus = () => {
    setIsProfileMenuOpen(false);
    setIsNotificationMenuOpen(false);
    setIsInfoMenuOpen(false);
  };

  // ---------- Manejo notificaciones UI ----------
  const handleOpenNotifications = () => {
    // abrir menú y marcar como leídas
    setIsNotificationMenuOpen(true);
    setIsProfileMenuOpen(false);
    setIsInfoMenuOpen(false);
    markAllAsRead();
  };

  // abrir una notificación individual (ej: ver detalle)
  const handleOpenNotificationItem = (notif) => {
    // marca como leída localmente
    markNotificationRead(notif.id);
    // acción por tipo
    if (notif.type === 'oferta' && notif.data && notif.data.relatedPath) {
      navigate(notif.data.relatedPath);
    }
    // si tiene acción propia, la ejecutas aquí
  };

  // ---------- Navegación ----------
  useEffect(() => {
    setActiveTab(siteSection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

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
    handleNavigation(path);
    setIsMenuOpen(false);
  };

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
            <div
              className="logo-container"
              alt="Ciudadan Logo"
              onClick={() => navigate('/')}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={logoSrc}
                alt="Ciudadan Logo"
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
                    if (open) handleOpenNotifications();
                    else setIsNotificationMenuOpen(false);
                  }}
                  onClose={() => setIsNotificationMenuOpen(false)}
                  authenticated={isAuthenticated}
                  userData={user}
                  containerRef={notifRef}
                  className="cuenta-icon"
                  handleLogout={handleLogout}
                  count={unreadCount}
                  notificationsList={notifications}
                  onOpenItem={handleOpenNotificationItem}
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
            {["clubs", "legal", "membresias", "market", "contenidos", "cursos", "herramientas", "eventos", "comunidad", "gana"].map((section) => (
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

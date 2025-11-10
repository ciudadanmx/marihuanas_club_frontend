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

import { useNotifications } from '../../Contexts/NotificationsContext';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;
const STRAPI_URL = process.env.REACT_APP_STRAPI_URL;
const LOCALSTORAGE_KEY = 'ciudadan_notifications_v1';

const NavBar = ({ SetIsMenuOpen, siteSection }) => {
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();

  // Menús y refs
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [isInfoMenuOpen, setIsInfoMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const InfoRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState(SetIsMenuOpen || false);

  // Rutas / pestaña activa
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

  // ---------- CONTEXT: adaptamos tu NotificationsContext ----------
  const notificationsContext = useNotifications(); // tu hook real
  const ctxRawNotifs = notificationsContext?.notificaciones ?? null;
  const ctxCargando = notificationsContext?.cargando ?? false;
  const ctxNotificationsNumFn = typeof notificationsContext?.notificationsNum === 'function'
    ? notificationsContext.notificationsNum
    : null;
  const ctxRefresh = notificationsContext?.refreshNotificaciones ?? null;

  // Normalizador de items Strapi -> formato interno
  const normalizeStrapiItem = (item) => {
    const attrs = item?.attributes ?? item;
    const idStrapi = item?.id ?? attrs?.id ?? Math.floor(Math.random() * 1e9);
    const title = attrs?.title ?? attrs?.titulo ?? attrs?.mensaje ?? attrs?.subject ?? 'Notificación';
    const message = attrs?.message ?? attrs?.descripcion ?? attrs?.body ?? attrs?.mensaje ?? '';
    let rawLeida = attrs?.leida ?? attrs?.read ?? false;
    let read = false;
    if (typeof rawLeida === 'boolean') read = rawLeida;
    else if (typeof rawLeida === 'number') read = rawLeida === 1;
    else if (typeof rawLeida === 'string') read = ['1', 'true', 'si', 'yes'].includes(rawLeida.toLowerCase());
    else read = !!rawLeida;

    const createdAt = attrs?.publishedAt ?? attrs?.createdAt ?? attrs?.created_at ?? new Date().toISOString();

    return {
      id: attrs?.idClient ?? `strapi_${idStrapi}`,
      idStrapi,
      title,
      message,
      createdAt,
      read,
      data: attrs?.data ?? attrs?.payload ?? {},
      raw: item
    };
  };

  const ctxNotificationsNormalized = Array.isArray(ctxRawNotifs)
    ? ctxRawNotifs.map(normalizeStrapiItem)
    : null;

  // ---------- Estado local de notificaciones y contador ----------
  const [notifications, setNotifications] = useState(() => {
    try {
      const raw = localStorage.getItem(LOCALSTORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) { /* noop */ }
    if (Array.isArray(ctxNotificationsNormalized)) return ctxNotificationsNormalized.slice();
    return [];
  });
  const [unreadCount, setUnreadCount] = useState(() => {
    if (typeof ctxNotificationsNumFn === 'function') return ctxNotificationsNumFn();
    return (Array.isArray(ctxNotificationsNormalized) ? ctxNotificationsNormalized.filter(n => !n.read).length : 0);
  });

  // ---------- Modal de notificación (estado) ----------
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // ---------- Helpers: persistencia y merge ----------
  const persistNotifications = (arr) => {
    try {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(arr));
    } catch (e) {
      console.warn('No se pudo guardar notificaciones en localStorage', e);
    }
  };

  const recalcUnread = (arr) => Array.isArray(arr) ? arr.filter(n => !n.read).length : 0;

  const mergeNotifications = (baseArray, incomingArray) => {
    const map = new Map();
    for (const it of (baseArray || [])) {
      const id = it.id ?? (`local_${it.createdAt ?? JSON.stringify(it)}`);
      map.set(id, it);
    }
    for (const it of (incomingArray || [])) {
      const id = it.id ?? (`inc_${it.createdAt ?? JSON.stringify(it)}`);
      map.set(id, it);
    }
    const arr = Array.from(map.values()).sort((a, b) => {
      const ta = new Date(a.createdAt || Date.now()).getTime();
      const tb = new Date(b.createdAt || Date.now()).getTime();
      return tb - ta;
    });
    return arr;
  };

  const pushNotification = (notif) => {
    setNotifications(prev => {
      const id = notif.id ?? `notif_${Date.now()}`;
      if (prev.some(n => n.id === id)) return prev;
      const next = [{ ...notif, id }, ...prev];
      persistNotifications(next);
      setUnreadCount(recalcUnread(next));
      return next;
    });
  };

  // ---------- MARCAR (solo al confirmar desde modal) ----------
  const markNotificationRead = async (notifId) => {
    setModalLoading(true);
    try {
      // actualizar localmente
      setNotifications(prev => {
        const next = prev.map(n => n.id === notifId ? ({ ...n, read: true }) : n);
        persistNotifications(next);
        setUnreadCount(recalcUnread(next));
        return next;
      });

      // actualizar en Strapi si tiene idStrapi
      const notif = notifications.find(n => n.id === notifId) || null;
      if (STRAPI_URL && isAuthenticated && notif && notif.idStrapi) {
        await axios.put(`${STRAPI_URL.replace(/\/$/, '')}/api/notificaciones/${notif.idStrapi}`, { data: { leida: true } });
      }

      // refrescar contexto si existe
      if (typeof ctxRefresh === 'function') {
        try { ctxRefresh(); } catch (e) { /* noop */ }
      }
    } catch (e) {
      console.warn('Error marcando notificación como leída', e);
    } finally {
      setModalLoading(false);
      setIsNotifModalOpen(false);
      setSelectedNotif(null);
    }
  };

  const markNotificationUnread = async (notifId) => {
    setModalLoading(true);
    try {
      setNotifications(prev => {
        const next = prev.map(n => n.id === notifId ? ({ ...n, read: false }) : n);
        persistNotifications(next);
        setUnreadCount(recalcUnread(next));
        return next;
      });

      const notif = notifications.find(n => n.id === notifId) || null;
      if (STRAPI_URL && isAuthenticated && notif && notif.idStrapi) {
        await axios.put(`${STRAPI_URL.replace(/\/$/, '')}/api/notificaciones/${notif.idStrapi}`, { data: { leida: false } });
      }

      if (typeof ctxRefresh === 'function') {
        try { ctxRefresh(); } catch (e) {}
      }
    } catch (e) {
      console.warn('Error marcando notificación como no leída', e);
    } finally {
      setModalLoading(false);
      setIsNotifModalOpen(false);
      setSelectedNotif(null);
    }
  };

  // ---------- Fetch inicial desde Strapi (filtrado por user_email y leida=false) ----------
  useEffect(() => {
    let mounted = true;
    const fetchFromStrapi = async () => {
      if (!STRAPI_URL) return;
      if (!user?.email) return;

      try {
        const url = `${STRAPI_URL.replace(/\/$/, '')}/api/notificaciones?populate=*&filters[user_email][$eq]=${encodeURIComponent(user.email)}&filters[leida][$eq]=false`;
        const res = await axios.get(url);
        const rawData = res.data?.data ?? [];

        const strapiArray = rawData.map(item => {
          const attrs = item.attributes ?? item;
          return {
            id: attrs.idClient ?? `strapi_${item.id ?? Math.random().toString(36).slice(2,9)}`,
            idStrapi: item.id,
            title: attrs.title ?? attrs.titulo ?? attrs.mensaje ?? 'Notificación',
            message: attrs.message ?? attrs.descripcion ?? attrs.body ?? attrs.mensaje ?? '',
            createdAt: attrs.publishedAt ?? attrs.createdAt ?? new Date().toISOString(),
            read: !!attrs.leida, // respetamos lo que venga; el filtro trae las no leídas pero por seguridad
            data: attrs.data ?? {},
            raw: item
          };
        });

        if (!mounted) return;
        let localArr = [];
        try { localArr = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY) || '[]'); } catch (e) { localArr = []; }

        const merged = mergeNotifications(localArr, [...strapiArray, ...notifications]);
        persistNotifications(merged);
        if (!mounted) return;
        setNotifications(merged);
        setUnreadCount(recalcUnread(merged));

        console.log(`[NavBar] Strapi fetched: ${strapiArray.length} items, merged total: ${merged.length}, unread: ${recalcUnread(merged)}`);
      } catch (error) {
        console.error('Error trayendo notificaciones de Strapi:', error);
      }
    };

    fetchFromStrapi();
    return () => { mounted = false; };
  }, [STRAPI_URL, user?.email]); // re-fetch cuando cambie user.email

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
  }, [SOCKET_URL]);

  // ---------- Sincronización si el contexto cambia externamente ----------
  useEffect(() => {
    if (Array.isArray(ctxNotificationsNormalized)) {
      setNotifications(prev => {
        const merged = mergeNotifications(prev, ctxNotificationsNormalized);
        persistNotifications(merged);
        setUnreadCount(recalcUnread(merged));
        return merged;
      });
    }
  }, [JSON.stringify(ctxNotificationsNormalized)]);

  // ---------- Guardar en localStorage cuando cambien las notificaciones ----------
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

  // ---------- UI / handlers ----------
  useEffect(() => { setActiveTab(siteSection); }, [location.pathname, siteSection]);

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

  // Abrir menú de notificaciones: ya no marca como leídas
  const handleOpenNotifications = () => {
    setIsNotificationMenuOpen(true);
    setIsProfileMenuOpen(false);
    setIsInfoMenuOpen(false);
    // NO marcar como leídas automáticamente
  };

  // Cuando el usuario hace click en una notificación en el MenuIcon
  const handleOpenNotificationItem = (notif) => {
    // abrimos modal con la notificación seleccionada (no marcamos)
    setSelectedNotif(notif);
    setIsNotifModalOpen(true);
  };

  // ---------- Modal JSX (puedes extraerlo a su propio componente) ----------
  const NotificationModal = ({ notif, open, onClose }) => {
    if (!notif) return null;
    return (
      <div className={`notif-modal ${open ? 'open' : ''}`} role="dialog" aria-modal="true">
        <div className="notif-modal-backdrop" onClick={() => onClose(false)} />
        <div className="notif-modal-content">
          <header className="notif-modal-header">
            <h3>{notif.title}</h3>
            <small>{new Date(notif.createdAt).toLocaleString()}</small>
          </header>
          <main className="notif-modal-body">
            <p>{notif.message}</p>
            {notif.data && Object.keys(notif.data).length > 0 && (
              <pre style={{ whiteSpace: 'pre-wrap', maxHeight: '200px', overflow: 'auto' }}>
                {JSON.stringify(notif.data, null, 2)}
              </pre>
            )}
          </main>
          <footer className="notif-modal-footer">
            {!notif.read ? (
              <>
                <button
                  className="btn primary"
                  onClick={() => markNotificationRead(notif.id)}
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Guardando...' : 'Marcar como leída y cerrar'}
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    setIsNotifModalOpen(false);
                    setSelectedNotif(null);
                  }}
                  disabled={modalLoading}
                >
                  Cerrar sin marcar
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn warning"
                  onClick={() => markNotificationUnread(notif.id)}
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Guardando...' : 'Marcar como no leída'}
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    setIsNotifModalOpen(false);
                    setSelectedNotif(null);
                  }}
                  disabled={modalLoading}
                >
                  Cerrar
                </button>
              </>
            )}
          </footer>
        </div>
        <style jsx>{`
          .notif-modal { position: fixed; top:0; left:0; width:100%; height:100%; display:none; align-items:center; justify-content:center; z-index:2000; }
          .notif-modal.open { display:flex; }
          .notif-modal-backdrop { position:absolute; inset:0; background:rgba(0,0,0,0.4); }
          .notif-modal-content { position:relative; background:#fff; padding:18px; border-radius:8px; max-width:640px; width:90%; z-index:2001; box-shadow:0 10px 40px rgba(0,0,0,0.3); }
          .notif-modal-header h3 { margin:0 0 6px 0; }
          .notif-modal-body { margin:12px 0; max-height:320px; overflow:auto; }
          .notif-modal-footer { display:flex; gap:10px; justify-content:flex-end; }
          .btn { padding:8px 12px; border-radius:6px; border:1px solid #ddd; background:#f5f5f5; cursor:pointer; }
          .btn.primary { background:#fff200; border-color:#d4c300; font-weight:700; }
          .btn.warning { background:#ffefc4; border-color:#e0b400; }
          .btn:disabled { opacity:0.6; cursor:not-allowed; }
        `}</style>
      </div>
    );
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
                  onOpenItem={handleOpenNotificationItem} // ahora abre modal (no marca)
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

      {/* Modal de notificación */}
      <NotificationModal
        notif={selectedNotif}
        open={isNotifModalOpen}
        onClose={() => {
          setIsNotifModalOpen(false);
          setSelectedNotif(null);
        }}
      />
    </>
  );
};

export default NavBar;

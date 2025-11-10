import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { io } from 'socket.io-client';

// Crear el contexto
const NotificationsContext = createContext();

export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider = ({ children }) => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const socketRef = useRef(null);

  const fetchNotificaciones = async () => {
    if (!isAuthenticated || !user) return;

    try {
      setCargando(true);
      const token = await getAccessTokenSilently();

      const response = await axios.get(
        `${process.env.REACT_APP_STRAPI_URL}/api/notificaciones?populate=usuario&filters[usuario][email][$eq]=${user.email}`
      );

      setNotificaciones(response.data?.data || []);
    } catch (error) {
      console.error("❌ Error al traer notificaciones:", error);
    } finally {
      setCargando(false);
    }
  };

  // Devuelve solo las no leídas
  const notificationsNum = () => {
    return notificaciones.filter(n => !n.attributes.leida).length;
  };

  useEffect(() => {
    fetchNotificaciones();
  }, [isAuthenticated, user]);

  // SOCKET: cuando llegue 'notification' llamamos exactamente a fetchNotificaciones()
  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_STRAPI_URL;
    if (!SOCKET_URL) {
      console.warn('NotificationsContext: no hay REACT_APP_SOCKET_URL ni REACT_APP_STRAPI_URL definido para socket.');
      return;
    }

    // desconectar si existía una conexión previa
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    (async () => {
      try {
        // Intentamos obtener token si lo necesitas en el socket (no modifica tu fetch)
        const token = typeof getAccessTokenSilently === 'function'
          ? await getAccessTokenSilently()
          : null;

        const socket = io(SOCKET_URL, {
          auth: token ? { token } : undefined,
          transports: ['websocket'],
          autoConnect: true,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          console.debug('NotificationsContext: socket conectado', socket.id);
        });

        socket.on('connect_error', (err) => {
          console.error('NotificationsContext socket connect_error:', err);
        });

        // ÚNICO CAMBIO: al recibir 'notification' volvemos a traer tal cual con fetchNotificaciones()
        socket.on('notification', (payload) => {
          console.debug('NotificationsContext: evento socket notification recibido:', payload);
          // llamamos exactamente a la función que ya tenías
          fetchNotificaciones();
        });
      } catch (err) {
        console.error('NotificationsContext: error inicializando socket:', err);
      }
    })();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        console.debug('NotificationsContext: socket desconectado (cleanup).');
      }
    };
  }, [isAuthenticated, user, getAccessTokenSilently]);

  return (
    <NotificationsContext.Provider
      value={{
        notificaciones,
        cargando,
        notificationsNum,
        refreshNotificaciones: fetchNotificaciones,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

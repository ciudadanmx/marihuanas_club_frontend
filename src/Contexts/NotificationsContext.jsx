import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

// Crear el contexto
const NotificationsContext = createContext();

export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider = ({ children }) => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

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

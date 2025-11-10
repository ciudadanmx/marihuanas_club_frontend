// src/components/Notifications/NotificationsMenu.jsx
import React, { useEffect, useRef } from 'react';
import { useNotifications } from '../../Contexts/NotificationsContext';
import '../../styles/NotificationsMenu.css';
import notificationIcon from '../../assets/notification.png'; // ícono 40x40

const NotificationsMenu = ({ handleLogout, isOpen, containerRef }) => {
  const { notificaciones, cargando, fetchNotifications } = useNotifications();
  const prevIsOpen = useRef(false);

  // Cada vez que isOpen pasa a true, solicitamos notificaciones forzando la petición.
  useEffect(() => {
    // Detectamos transición false -> true
    if (!prevIsOpen.current && isOpen) {
      console.debug('NotificationsMenu: isOpen pasó a true — refrescando notificaciones (force).');
      if (typeof fetchNotifications === 'function') {
        fetchNotifications({ force: true })
          .then(res => {
            console.debug('NotificationsMenu: fetchNotifications resolvió, recibidas:', res?.length ?? '(sin array)');
          })
          .catch(err => {
            console.error('NotificationsMenu: error al refrescar notificaciones:', err);
          });
      } else {
        console.warn('NotificationsMenu: fetchNotifications no está disponible en el contexto.');
      }
    }
    prevIsOpen.current = isOpen;
  }, [isOpen, fetchNotifications]);

  // Logs para depuración rápida (quita en producción)
  useEffect(() => {
    console.debug('NotificationsMenu render — isOpen:', isOpen, 'notificaciones:', notificaciones.length, 'cargando:', cargando);
  }, [isOpen, notificaciones, cargando]);

  return (
    <div ref={containerRef}>
      <div className={`notifications-menu ${isOpen ? 'open' : 'closed'} purple textoChico`}>
        <ul className="notif-list">
          {cargando ? (
            <li className="notif-loading">Cargando...</li>
          ) : !Array.isArray(notificaciones) || notificaciones.length === 0 ? (
            <li className="notif-empty">No hay notificaciones</li>
          ) : (
            notificaciones.map((notif) => {
              const id = notif.id ?? (notif.attributes && notif.attributes.id) ?? Math.random();
              const { tipo, leida, timestamp, cuerpo } = notif.attributes || {};
              const textoCuerpo = cuerpo?.[0]?.children?.[0]?.text || cuerpo?.text || '(sin contenido)';

              return (
                <li key={id} className="notif-item">
                  <div className="notif-grid">
                    <img src={notificationIcon} alt="icon" className="notif-icon" />
                    <div className="notif-content">
                      <div className="notif-message">{textoCuerpo}</div>
                      <div className="notif-date">{timestamp ? new Date(timestamp).toLocaleString() : ''}</div>
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
};

export default NotificationsMenu;

import React from 'react';
import { useNotifications } from '../../Contexts/NotificationsContext';
import '../../styles/NotificationsMenu.css';
import notificationIcon from '../../assets/notification.png'; // ícono 40x40

const NotificationsMenu = ({ handleLogout, isOpen, containerRef }) => {
  const { notificaciones, cargando } = useNotifications();

  return (
    <div ref={containerRef}>
      <div className={`notifications-menu ${isOpen ? 'open' : 'closed'} purple textoChico`}>
        <ul className="notif-list">
          {cargando ? (
            <li className="notif-loading">Cargando...</li>
          ) : notificaciones.length === 0 ? (
            <li className="notif-empty">No hay notificacionessssssssssssssssssss</li>
          ) : (
            notificaciones.map((notif, i) => {
              const { tipo, leida, timestamp, cuerpo } = notif.attributes;
              const textoCuerpo = cuerpo?.[0]?.children?.[0]?.text || '(sin contenido)';

              return (
                <li key={i} className="notif-item">
                  <div className="notif-grid">
                    <img src={notificationIcon} alt="icon" className="notif-icon" />
                    <div className="notif-content">
                      
                      <div className="notif-message">{textoCuerpo}</div>
                      <div className="notif-date">{new Date(timestamp).toLocaleString()}</div>
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

import React from 'react';
import { useNotifications } from '../../Contexts/NotificationsContext';
import '../../styles/NotificationsMenu.css';
import notificationIcon from '../../assets/notification.png'; // ícono 40x40

const SafeText = ({ children }) => (
  <span>{(children === null || children === undefined) ? '—' : children}</span>
);

const NotificationsMenu = ({ handleLogout, isOpen = false, containerRef = null }) => {
  // <-- Llamada al hook SIEMPRE en el tope del componente (no dentro de try/catch/if)
  const hookResult = useNotifications();

  // Normalizar/desestructurar con valores por defecto para que no reviente
  const {
    notificaciones = [],
    cargando = false,
    error = null,
    refresh = null
  } = hookResult || {};

  const listaNotificaciones = Array.isArray(notificaciones) ? notificaciones : [];

  return (
    <div ref={containerRef}>
      <div className={`notifications-menu ${isOpen ? 'open' : 'closed'} purple textoChico`}>
        <ul className="notif-list">
          {cargando ? (
            <li className="notif-loading">Cargando...</li>
          ) : error ? (
            <li className="notif-error">
              No fue posible cargar notificaciones.
              <div className="notif-error-sub">({error?.message ?? 'Error desconocido'})</div>
              {refresh && (
                <button
                  type="button"
                  onClick={() => {
                    try {
                      refresh();
                    } catch (e) {
                      console.error('Error al reintentar refresh:', e);
                    }
                  }}
                >
                  Reintentar
                </button>
              )}
            </li>
          ) : listaNotificaciones.length === 0 ? (
            <li className="notif-empty">No hay notificaciones</li>
          ) : (
            listaNotificaciones.map((notif, i) => {
              const attributes = notif?.attributes ?? notif ?? {};
              const tipo = attributes?.tipo ?? attributes?.title ?? 'Notificación';
              const leida = attributes?.leida ?? attributes?.read ?? false;
              const timestamp = attributes?.timestamp ?? attributes?.createdAt ?? attributes?.date;
              const cuerpo = attributes?.cuerpo ?? attributes?.body ?? null;

              let textoCuerpo = '(sin contenido)';
              if (typeof cuerpo === 'string' && cuerpo.trim()) textoCuerpo = cuerpo;
              else if (Array.isArray(cuerpo)) {
                textoCuerpo = cuerpo?.[0]?.children?.[0]?.text ?? cuerpo?.[0]?.text ?? '(sin contenido)';
              } else if (typeof cuerpo === 'object' && cuerpo !== null) {
                textoCuerpo = cuerpo?.text ?? JSON.stringify(cuerpo).slice(0, 120);
              }

              const dateObj = timestamp ? new Date(timestamp) : null;
              const dateStr = dateObj && !isNaN(dateObj) ? dateObj.toLocaleString() : '—';
              const key = notif?.id ?? notif?._id ?? `notif-${i}`;

              return (
                <li key={key} className="notif-item">
                  <div className="notif-grid">
                    <img src={notificationIcon} alt="icon" className="notif-icon" />
                    <div className="notif-content">
                      <div className="notif-title">
                        <strong><SafeText>{tipo}</SafeText></strong>{' '}
                        <SafeText>{leida ? '✅' : '📬'}</SafeText>
                      </div>
                      <div className="notif-message"><SafeText>{textoCuerpo}</SafeText></div>
                      <div className="notif-date"><SafeText>{dateStr}</SafeText></div>
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

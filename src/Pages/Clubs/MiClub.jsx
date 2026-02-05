import Pestanas from '../../components/Pestanas';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useRoles } from '../../Contexts/RolesContext.jsx';

import InfoMiClub from '../../components/Clubs/InfoMiClub.jsx';
import Bitacora from '../../components/Clubs/Bitacora.jsx';
import Documentos from '../../components/Clubs/Documentos.jsx';
import MisPlantas from '../../components/Clubs/MisPlantas/MisPlantas.jsx';
import DetallePlanta from '../../components/Clubs/MisPlantas/DetallePlanta.jsx'; // <-- verifica la ruta si tu carpeta es "MisPlantas" (mantuve la original)
import Sembrar from '../../components/Clubs/Sembrar.jsx';
import IngresarSemillas from '../../components/Clubs/IngresarSemillas.jsx';
import GestionClub from '../../components/Clubs/GestionClub.jsx';

// Nuevos componentes que mencionaste
import Cosechar from '../../components/Clubs/Cosechar.jsx';
import Esquejear from '../../components/Clubs/Esquejear.jsx';
import Entregar from '../../components/Clubs/Entregar.jsx';
import Excedentes from '../../components/Clubs/Excedentes.jsx';
import ClubActions from '../../components/Clubs/ClubActions.jsx';
import Agenda from '../../components/Clubs/Agenda.jsx'; // <-- nueva pestaña Agenda para admin

const MiClub = () => {
  const location = useLocation();
  const { user, isLoading } = useAuth0();
  const { isJardinero, userData } = useRoles();

  // Durante desarrollo NO memoizamos roles: queremos re-evaluar siempre
  // (useMemo provoca que el rol se "pegue" si alguna dependencia no cambia)
  const jardinero = userData ? isJardinero() : false;

  const [tabIndex, setTabIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  const basePrueba = '/clubs/miclub';

  /**
   * Tabs principales.
   * - Usuarios normales: muestran Info, Bitácora, Documentos, Mis Plantas.
   * - Admins (jardineros): NO muestran "Mis Plantas" (está dentro de Gestión),
   *   y ahora tienen una pestaña adicional "Agenda" **después** de Mi Bitácora.
   */
  const tabs = !jardinero
    ? [
        { label: 'Info tu Club', path: 'info' },
        { label: 'Mi Bitácora', path: 'bitacora' },
        { label: 'Documentación Legal', path: 'documentos' },
        { label: 'Mis Plantas', path: 'misplantas' },
      ]
    : [
        { label: 'Mi Bitácora', path: 'bitacora' },
        { label: 'Agenda', path: 'agenda' }, // <-- la nueva pestaña para admins
        { label: 'Documentación Legal', path: 'documentos' },
        { label: 'Info tu Club', path: 'info' },
        { label: 'Gestionar Club', path: 'admin' },
      ];

  // Listener responsive (mueve layout en mobile)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Sincroniza el tabIndex con la URL.
   * - Soporta subrutas: /clubs/miclub/admin/..., /clubs/miclub/info/axiones/...
   * - Si la ruta es una subruta admin (segment[0] === 'admin') marca la pestaña 'admin'.
   * - Si la ruta está bajo info/axiones/... marca la pestaña 'info'.
   */
  useEffect(() => {
    const currentPath = (location.pathname || '').toLowerCase();

    // segmentos relativos a /clubs/miclub
    const rel = currentPath.startsWith(basePrueba)
      ? currentPath.slice(basePrueba.length)
      : currentPath;
    const segments = rel.split('/').filter(Boolean); // ej: ['admin','ingresarsemillas']

    let found = -1;

    // Prioridad por casos especiales
    if (segments[0] === 'info') {
      // /clubs/miclub/info/... -> pestaña 'info'
      found = tabs.findIndex((t) => t.path === 'info');
    } else if (segments[0] === 'admin') {
      // cualquier /clubs/miclub/admin/... -> pestaña 'admin'
      found = tabs.findIndex((t) => t.path === 'admin');
    } else if (segments[0]) {
      // intenta match por primer segmento (ej: /misplantas, /bitacora, /agenda)
      found = tabs.findIndex((t) => t.path === segments[0]);
      // si no se encontró exacto, intentar includes por si hay subrutas
      if (found === -1) {
        found = tabs.findIndex((t) => currentPath.includes(`${basePrueba}/${t.path}`));
      }
    } else {
      // raíz /clubs/miclub -> default 0
      found = 0;
    }

    if (found !== -1) setTabIndex(found);
    else setTabIndex(0);
  }, [location.pathname, tabs]);

  // Esperar Auth0 + datos de roles antes de renderizar
  if (isLoading || !userData) return <p>Cargando...</p>;

  // normalizamos y separamos segmentos para comprobaciones robustas
  const path = (location.pathname || '').toLowerCase();
  const rel = path.startsWith(basePrueba) ? path.slice(basePrueba.length) : path;
  const segments = rel.split('/').filter(Boolean); // ej: ['admin','ingresarsemillas'] o ['misplantas','sembrar', ...]

  // --- Admin subruta checks (acciones internas bajo /admin/...) ---
  const adminAction = segments[0] === 'admin' ? segments[1] : null;
  const adminCode = segments[0] === 'admin' && segments[1] === 'ver' && segments[2] ? segments[2] : null;

  const isAdminIngresarSemillas = adminAction === 'ingresarsemillas';
  const isAdminSembrar = adminAction === 'sembrar';
  const isAdminCosechar = adminAction === 'cosechar';
  const isAdminEsquejear = adminAction === 'esquejear';
  const isAdminEntregar = adminAction === 'entregar';
  const isAdminExcedentes = adminAction === 'excedentes';
  const isAdminVer = adminAction === 'ver' && !!adminCode;

  // --- Mis plantas (usuarios normales) ---
  const isSembrar = segments[0] === 'misplantas' && segments[1] === 'sembrar';
  const codigoPlanta =
    segments[0] === 'misplantas' && segments[1] && segments[1] !== 'sembrar'
      ? segments[1]
      : null;

  // --- Info/axiones para usuarios no-admin (mapea a ClubActions) ---
  const isInfoAxiones = segments[0] === 'info' && segments[1] === 'axiones' && !!segments[2];
  const infoAccion = isInfoAxiones ? segments[2] : null;
  const infoResto = isInfoAxiones ? segments.slice(3).join('/') : null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column-reverse' : 'row',
        padding: '24px',
        gap: '32px',
        flexWrap: 'wrap',
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        paddingBottom: '0px',
        marginBottom: '0px',
      }}
    >
      <div style={{ flex: '1 1 100%', maxWidth: '100%' }}>
        {/* Componente de pestañas. Se le pasa tabs y basePath para que genere links */}
        <Pestanas
          tabs={tabs}
          basePath={basePrueba}
          onTabChange={setTabIndex}
          collapseAt={640}
        />

        <div style={{ width: '100%', overflowX: 'hidden' }}>
          {/* INFO tab (normal). Si es /info/axiones/... renderizamos ClubActions */}
          {tabs[tabIndex]?.path === 'info' && (
            isInfoAxiones ? (
              <ClubActions accion={infoAccion} params={infoResto} user={user} />
            ) : (
              <InfoMiClub />
            )
          )}

          {/* Bitácora (visible para todos según tabs) */}
          {tabs[tabIndex]?.path === 'bitacora' && <Bitacora />}

          {/* AGENDA tab (solo para admins): componente Agenda */}
          {tabs[tabIndex]?.path === 'agenda' && <Agenda user={user} />}

          {/* Documentos legales */}
          {tabs[tabIndex]?.path === 'documentos' && <Documentos />}

          {/* ADMIN tab y sus subrutas internas (sembrar, ingresarsemillas, cosechar, etc.) */}
          {tabs[tabIndex]?.path === 'admin' && (
            isAdminSembrar ? (
              <Sembrar user={user} />
            ) : isAdminIngresarSemillas ? (
              <IngresarSemillas user={user} />
            ) : isAdminCosechar ? (
              <Cosechar user={user} />
            ) : isAdminEsquejear ? (
              <Esquejear user={user} />
            ) : isAdminEntregar ? (
              <Entregar user={user} />
            ) : isAdminExcedentes ? (
              <Excedentes user={user} />
            ) : isAdminVer ? (
              // /clubs/miclub/admin/ver/:codigo -> ver detalle de planta (mismo comportamiento que no-admin)
              <DetallePlanta codigo={adminCode} user={user} />
            ) : (
              // Vista por defecto de Gestión
              <GestionClub />
            )
          )}

          {/* MISPLANTAS tab (solo aparece para no-admins) */}
          {tabs[tabIndex]?.path === 'misplantas' && (
            isSembrar ? (
              <Sembrar user={user} />
            ) : codigoPlanta ? (
              <DetallePlanta codigo={codigoPlanta} user={user} />
            ) : (
              <MisPlantas user={user} />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default MiClub;

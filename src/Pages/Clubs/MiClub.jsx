import Pestanas from '../../components/Pestanas';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useRoles } from '../../Contexts/RolesContext.jsx';

import InfoMiClub from '../../components/Clubs/InfoMiClub.jsx';
import Bitacora from '../../components/Clubs/Bitacora.jsx';
import Documentos from '../../components/Clubs/Documentos.jsx';
import MisPlantas from '../../components/Clubs/MisPlantas/MisPlantas.jsx';
import DetallePlanta from '../../components/Clubs/MisPlantas/DetallePlanta.jsx';
import Sembrar from '../../components/Clubs/ClubActions/Sembrar.jsx';
import IngresarSemillas from '../../components/Clubs/ClubActions/IngresarSemillas.jsx';
import GestionClub from '../../components/Clubs/GestionClub.jsx';
import ChecarPlanta from '../../components/Clubs/ClubActions/ChecarPlanta.jsx';
import EscribirBitacora from './EscribirBitacora.jsx';

// Nuevos componentes que mencionaste
import Cosechar from '../../components/Clubs/ClubActions/Cosechar.jsx';
import Esquejear from '../../components/Clubs/ClubActions/Esquejear.jsx';
import Curar from '../../components/Clubs/Curar.jsx';
import Entregar from '../../components/Clubs/ClubActions/Entregar.jsx';
import Excedentes from '../../components/Clubs/ClubActions/Excedentes.jsx';
import ClubActions from '../../components/Clubs/ClubActions/ClubActions.jsx';
import Agenda from '../../components/Clubs/Agenda.jsx'; 
import SolicitudesAfiliacionClub from '../../components/Clubs/SolicitudesAfiliacionClub.jsx'; 

import AnotarEnAfiliacion from '../../components/Clubs/ClubActions/AnotarEnAfiliacion.jsx';
import AprobarAfiliacion from '../../components/Clubs/ClubActions/AprobarAfiliacion.jsx';
import RechazarAfiliacion from '../../components/Clubs/ClubActions/RechazarAfiliacion.jsx';
import QrScanner from '../../components/Clubs/QrScanner.jsx';

// Componentes para los casos con /:id
import SembrarSemilla from '../../components/Clubs/ClubActions/SembrarSemilla.jsx';


const MiClub = () => {
  const location = useLocation();
  const { user, isLoading } = useAuth0();
  const { isJardinero, userData } = useRoles();

  // Evaluamos el rol directamente (sin useMemo) para que cambie en caliente durante dev
  const jardinero = userData ? isJardinero() : false;

  // estado del tab seleccionado
  const [tabIndex, setTabIndex] = useState(0);

  // responsive
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  const basePrueba = '/clubs/miclub';

  /**
   * Tabs principales.
   * - Usuarios normales: Info, Bitácora, Documentos, Mis Plantas.
   * - Admins (jardineros): Bitácora, Agenda, Documentos, Info, Gestionar Club.
   *   Nota: "Mis Plantas" NO aparece para admins (está en Gestión).
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
        { label: 'Agenda', path: 'agenda' }, // nueva pestaña
        { label: 'Documentación Legal', path: 'documentos' },
        { label: 'Info tu Club', path: 'info' },
        { label: 'Gestionar Club', path: 'admin' },
        { label: 'Afiliaciones', path: 'afiliar' },
      ];

  // Listener responsive
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Sincroniza tabIndex con la URL y con el rol.
   *
   * NOTAS IMPORTANTES:
   * - Este effect se dispara cuando cambia location.pathname, tabs (por cambio de rol)
   *   o jardinero.
   * - No dependemos de tabIndex para evitar loops.
   * - Para actualizar en caliente cuando cambia el rol, tabs cambia y el effect corre.
   */
  useEffect(() => {
    const currentPath = (location.pathname || '').toLowerCase();

    // segmentos relativos a /clubs/miclub
    const rel = currentPath.startsWith(basePrueba)
      ? currentPath.slice(basePrueba.length)
      : currentPath;
    const segments = rel.split('/').filter(Boolean); // ej: ['admin','ingresarsemillas']

    // Detectamos si estamos EXACAMENTE en la raíz /clubs/miclub o con / al final
    const isAtRoot = segments.length === 0;

    let found = -1;

    if (segments[0] === 'info') {
      // /clubs/miclub/info/... -> pestaña 'info'
      found = tabs.findIndex((t) => t.path === 'info');
    } else if (segments[0] === 'admin') {
      // /clubs/miclub/admin/... -> pestaña 'admin'
      found = tabs.findIndex((t) => t.path === 'admin');
    } else if (segments[0]) {
      // Intentamos match directo por primer segmento (misplantas, bitacora, agenda, etc.)
      found = tabs.findIndex((t) => t.path === segments[0]);
      // Si no hay match exacto, probamos includes por si hay subruta (ej: /bitacora/sub)
      if (found === -1) {
        found = tabs.findIndex((t) => currentPath.includes(`${basePrueba}/${t.path}`));
      }
    } else if (isAtRoot) {
      // Caso raíz EXACTA: aplicamos default según rol
      if (jardinero) {
        found = tabs.findIndex((t) => t.path === 'admin'); // Gestionar Club para admin
      } else {
        found = tabs.findIndex((t) => t.path === 'info'); // Info para no-admin
      }
    }

    // Actualizamos solo si found es válido y distinto del actual
    setTabIndex((prev) => {
      if (found !== -1 && found !== prev) return found;
      return prev;
    });

    // DEBUG opcional: si quieres ver qué está pasando descomenta la línea
    // console.log('MiClub.sync', { currentPath, segments, jardinero, tabs, found });
  }, [location.pathname, tabs, jardinero]);

  // Esperar Auth0 + datos de roles antes de renderizar
  if (isLoading || !userData) return <p>Cargando...</p>;

  // Normalizamos y separamos segmentos para las comprobaciones de render
  const path = (location.pathname || '').toLowerCase();
  const rel = path.startsWith(basePrueba) ? path.slice(basePrueba.length) : path;
  const segments = rel.split('/').filter(Boolean); // ej: ['admin','ingresarsemillas'] o ['misplantas','sembrar', ...]

  // --- Admin subruta checks (acciones internas bajo /admin/...) ---
  const adminAction = segments[0] === 'admin' ? segments[1] : null;
  const adminCode = segments[0] === 'admin' && segments[1] === 'ver' && segments[2] ? segments[2] : null;

  const isAdminIngresarSemillas = adminAction === 'ingresarsemillas';
  const isAdminSembrar = adminAction === 'sembrar';
  const isAdminCosechar = adminAction === 'cosechar';
  const isAdminCurar = adminAction === 'curar';
  const isAdminEsquejear = adminAction === 'esquejear';
  const isAdminEntregar = adminAction === 'entregar';
  const isAdminExcedentes = adminAction === 'excedentes';
  const isAdminChecar = adminAction === 'checar';
  const isAdminAnotar = adminAction === 'anotar';
  const isAdminAfiliar = adminAction === 'afiliar';
  const isAdminVer = adminAction === 'ver' && !!adminCode;
  // admin item id (cuando la ruta tiene /admin/<action>/<id>)
  const adminItemId = segments[0] === 'admin' && segments[2] ? segments[2] : null;

  // --- AFILIACION subroute checks (/afiliacion o /afiliar) ---
  const afiliacionRoot =
    segments[0] === 'afiliacion' || segments[0] === 'afiliar'
      ? segments[0]
      : null;

  const afiliacionAction = afiliacionRoot ? segments[1] : null;
  const afiliacionItemId =
    afiliacionRoot && segments[2] ? segments[2] : null;

  const isAfiliacionScan =
    afiliacionAction === 'scan' ||
    afiliacionAction === 'scanner' ||
    afiliacionAction === 'scannear';

  // --- Mis plantas (usuarios normales) ---
  const isSembrar = segments[0] === 'misplantas' && segments[1] === 'sembrar';
  const codigoPlanta =
    segments[0] === 'misplantas' && segments[1] && segments[1] !== 'sembrar'
      ? segments[1]
      : null;

  // semillaId cuando la ruta es /misplantas/sembrar/:id
  const semillaIdEnMisplantas = segments[0] === 'misplantas' && segments[1] === 'sembrar' && segments[2]
    ? segments[2]
    : null;

  // --- Info/axiones para usuarios no-admin (mapea a ClubActions) ---
  const isInfoAxiones = segments[0] === 'info' && segments[1] === 'axiones' && !!segments[2];
  const infoAccion = isInfoAxiones ? segments[2] : null;
  const infoResto = isInfoAxiones ? segments.slice(3).join('/') : null;

  console.log('DEBUG MiClub', {
    pathname: location.pathname,
    jardinero,
    tabs,
    tabIndex
  });

  console.log('ROL DEBUG', {
    userData,
    isJardinero: isJardinero(),
  });

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
              <InfoMiClub jardinero={jardinero} />
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
              // Si la ruta es /admin/sembrar/:id usamos SembrarSemilla
              adminItemId ? (
                <SembrarSemilla idplanta={adminItemId} user={user} />
              ) : (
                <Sembrar user={user} />
              )
            ) : isAdminIngresarSemillas ? (
              // Si la ruta es /admin/ingresarsemillas/:id usamos IngresarSemilla
              adminItemId ? (
                <IngresarSemillas idplanta={adminItemId} user={user} />
              ) : (
                // por compatibilidad se estaba usando Sembrar con tipo 'solicitadas'
                <Sembrar user={user} tipo={'solicitadas'} />
              )
            ) : isAdminCosechar ? (
              <Cosechar user={user} cosechaid={adminItemId} />
            ) : isAdminEsquejear ? (
              <Esquejear user={user} idplanta={adminItemId} />
            ) : isAdminCurar ? (
              <Curar user={user} idplanta={adminItemId} />
            ) : isAdminEntregar ? (
              <Entregar user={user} cosechaid={adminItemId} />
            ) : isAdminExcedentes ? (
              <Excedentes />
            ) : isAdminChecar ? (
              <ChecarPlanta user={user} plantaid={adminItemId} />
            ) : isAdminAnotar ? (
              <EscribirBitacora user={user} />
            ) : isAdminVer ? (
              // /clubs/miclub/admin/ver/:codigo -> ver detalle de planta (mismo comportamiento que no-admin)
              <DetallePlanta codigo={adminCode} user={user} />
            ) : (
              // Vista por defecto de Gestión
              <GestionClub />
            )
          )}

          {/* RUTAS DE AFILIACION (soportamos /afiliacion y /afiliar) */}
          {jardinero && afiliacionRoot && (
            afiliacionAction === 'aprobar' && afiliacionItemId ? (
              <AprobarAfiliacion id={afiliacionItemId} />
            ) : afiliacionAction === 'rechazar' && afiliacionItemId ? (
              <RechazarAfiliacion id={afiliacionItemId} />
            ) : afiliacionAction === 'anotar' && afiliacionItemId ? (
              <AnotarEnAfiliacion id={afiliacionItemId} />
            ) : isAfiliacionScan ? (
              <QrScanner />
            ) : (
              // Si navegan a /afiliacion o /afiliar sin verbo o sin id, mostramos la lista de solicitudes
              <SolicitudesAfiliacionClub />
            )
          )}

         

          {/* MISPLANTAS tab (solo aparece para no-admins) */}
          {tabs[tabIndex]?.path === 'misplantas' && (
            isSembrar ? (
              // si es /misplantas/sembrar/:id usar SembrarSemilla
              semillaIdEnMisplantas ? (
                <SembrarSemilla idplanta={semillaIdEnMisplantas} user={user} />
              ) : (
                <Sembrar user={user} />
              )
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

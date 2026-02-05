import Pestanas from '../../components/Pestanas';
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useRoles } from '../../Contexts/RolesContext.jsx';

import InfoMiClub from '../../components/Clubs/InfoMiClub.jsx';
import Bitacora from '../../components/Clubs/Bitacora.jsx';
import Documentos from '../../components/Clubs/Documentos.jsx';
import MisPlantas from '../../components/Clubs/MisPlantas/MisPlantas.jsx';
import DetallePlanta from '../../components/Clubs/MisPlantas/DetallePlanta.jsx';
import Sembrar from '../../components/Clubs/Sembrar.jsx';
import IngresarSemillas from '../../components/Clubs/IngresarSemillas.jsx';
import GestionClub from '../../components/Clubs/GestionClub.jsx';

const MiClub = () => {
  const location = useLocation();
  const { user, isLoading } = useAuth0();
  const { isJardinero, userData } = useRoles();

const jardinero = useMemo(() => {
  if (!userData) return false;
  return isJardinero();
}, [userData, isJardinero]);

  const [tabIndex, setTabIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  const basePrueba = '/clubs/miclub';

  // Tabs dependen SOLO del rol jardinero
  const tabs = useMemo(() => {
    if (!jardinero) {
      return [
        { label: 'Info tu Club', path: 'info' },
        { label: 'Mi Bitácora', path: 'bitacora' },
        { label: 'Documentación Legal', path: 'documentos' },
        { label: 'Mis Plantas', path: 'misplantas' },
      ];
    }

    return [
      { label: 'Mi Bitácora', path: 'bitacora' },
      { label: 'Documentación Legal', path: 'documentos' },
      { label: 'Mis Plantas', path: 'misplantas' },
      { label: 'Info tu Club', path: 'info' },
      { label: 'Gestionar Club', path: 'admin' },
    ];
  }, [jardinero]);

  // responsive listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // sincroniza tabIndex con la URL
  useEffect(() => {
    const path = (location.pathname || '').toLowerCase();

    if (path.includes(`${basePrueba}/info`)) setTabIndex(jardinero ? 3 : 0);
    else if (path.includes(`${basePrueba}/bitacora`)) setTabIndex(jardinero ? 0 : 1);
    else if (path.includes(`${basePrueba}/documentos`)) setTabIndex(jardinero ? 1 : 2);
    else if (path.includes(`${basePrueba}/misplantas`)) setTabIndex(jardinero ? 2 : 3);
    else if (path.includes(`${basePrueba}/admin`)) setTabIndex(jardinero ? 3 : 4);
    else setTabIndex(0);
  }, [location.pathname, jardinero]);

  // Esperar Auth0 + Strapi
  if (isLoading || !userData) return <p>Cargando...</p>;

  const path = location.pathname || '';

  const isSembrar = path.includes(`${basePrueba}/misplantas/sembrar`);
  const isAdminSembrar = path.includes(`${basePrueba}/admin/sembrar`);
  const isAdminIngresarSemillas = path.includes(
    `${basePrueba}/admin/ingresarsemillas`
  );

  const misPlantasDetalleMatch = path.match(
    new RegExp(`^${basePrueba}/misplantas/([^/]+)$`)
  );

  const codigoPlanta = misPlantasDetalleMatch
    ? misPlantasDetalleMatch[1]
    : null;

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
        <Pestanas
          tabs={tabs}
          basePath={basePrueba}
          onTabChange={setTabIndex}
          collapseAt={640}
        />

        <div style={{ width: '100%', overflowX: 'hidden' }}>
          {tabs[tabIndex]?.path === 'info' && <InfoMiClub />}
          {tabs[tabIndex]?.path === 'bitacora' && <Bitacora />}
          {tabs[tabIndex]?.path === 'documentos' && <Documentos />}

          {tabs[tabIndex]?.path === 'admin' && (
            isAdminSembrar ? (
              <Sembrar user={user} />
            ) : isAdminIngresarSemillas ? (
              <IngresarSemillas user={user} />
            ) : (
              <GestionClub />
            )
          )}

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

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

  // sincroniza tabIndex con la URL — ahora robusto: busca la pestaña dentro de `tabs`
  useEffect(() => {
    const currentPath = (location.pathname || '').toLowerCase();

    // encontrar la pestaña cuyo path coincide con la URL (soporta sub-rutas)
    const foundIndex = tabs.findIndex((t) =>
      currentPath.includes(`${basePrueba}/${t.path}`)
    );

    if (foundIndex !== -1) setTabIndex(foundIndex);
    else setTabIndex(0);
  }, [location.pathname, tabs]);

  // Esperar Auth0 + Strapi
  if (isLoading || !userData) return <p>Cargando...</p>;

  // normalizamos y separamos segmentos para comprobaciones robustas
  const path = (location.pathname || '').toLowerCase();
  const rel = path.startsWith(basePrueba) ? path.slice(basePrueba.length) : path;
  const segments = rel.split('/').filter(Boolean); // ej: ['admin','ingresarsemillas'] o ['misplantas','sembrar', ...]

  const isSembrar = segments[0] === 'misplantas' && segments[1] === 'sembrar';
  const isAdminSembrar = segments[0] === 'admin' && segments[1] === 'sembrar';
  const isAdminIngresarSemillas = segments[0] === 'admin' && segments[1] === 'ingresarsemillas';

  const codigoPlanta =
    segments[0] === 'misplantas' && segments[1] && segments[1] !== 'sembrar'
      ? segments[1]
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

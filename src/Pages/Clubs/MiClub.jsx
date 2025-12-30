import Pestanas from '../../components/Pestanas';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

import InfoMiClub from '../../components/Clubs/InfoMiClub.jsx';
import Bitacora from '../../components/Clubs/Bitacora.jsx';
import Documentos from '../../components/Clubs/Documentos.jsx';
import MisPlantas from '../../components/Clubs/MisPlantas/MisPlantas.jsx';
import DetallePlanta from '../../components/Clubs/MisPlantas/DetallePlanta.jsx';
import Sembrar from '../../components/Clubs/Sembrar.jsx';

const MiClub = () => {
  const jardinero = false;
  const location = useLocation();
  const { user, isLoading } = useAuth0();

  const [tabIndex, setTabIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  const basePrueba = '/clubs/miclub';

  let tabs = [];
  if (!jardinero) {
    tabs = [
      { label: 'Info tu Club', path: 'info' },
      { label: 'Mi Bitácora', path: 'bitacora' },
      { label: 'Documentación Legal', path: 'documentos' },
      { label: 'Mis Plantas', path: 'misplantas' },
    ];
  } else {
    tabs = [
      { label: 'Mi Bitácora', path: 'bitacora' },
      { label: 'Documentación Legal', path: 'documentos' },
      { label: 'Mis Plantas', path: 'misplantas' },
      { label: 'Info tu Club', path: 'info' },
    ];
  }

  // responsive listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // sincroniza tabIndex con la URL
  useEffect(() => {
    const path = (location.pathname || '').toLowerCase();

    if (path.includes(`${basePrueba}/info`)) setTabIndex(0);
    else if (path.includes(`${basePrueba}/bitacora`)) setTabIndex(1);
    else if (path.includes(`${basePrueba}/documentos`)) setTabIndex(2);
    else if (path.includes(`${basePrueba}/misplantas`)) setTabIndex(3);
    else setTabIndex(0);
  }, [location.pathname]);

  if (isLoading) return <p>Cargando...</p>;

  const path = location.pathname || '';

  const isSembrar = path.includes(`${basePrueba}/misplantas/sembrar`);

  // Detecta /clubs/miclub/misplantas/:codigo
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
      {/* Columna principal */}
      <div style={{ flex: '1 1 100%', maxWidth: '100%' }}>
        <Pestanas
          tabs={tabs}
          basePath={basePrueba}
          onTabChange={(index) => setTabIndex(index)}
          collapseAt={640}
        />

        <div style={{ width: '100%', overflowX: 'hidden' }}>
          {tabIndex === 0 && <InfoMiClub />}
          {tabIndex === 1 && <Bitacora />}
          {tabIndex === 2 && <Documentos />}
          {tabIndex === 3 && (
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

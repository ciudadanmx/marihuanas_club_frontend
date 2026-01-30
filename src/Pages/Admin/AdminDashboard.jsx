import Pestanas from '../../components/Pestanas';
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useRoles } from '../../Contexts/RolesContext.jsx';

import InfoMiClub from '../../components/Clubs/InfoMiClub.jsx';
import Bitacora from '../../components/Clubs/Bitacora.jsx';
import Documentos from '../../components/Clubs/Documentos.jsx';
import GestionClub from '../../components/Clubs/GestionClub.jsx';
import PreCargador from '../../components/PreCargador.jsx';

const AdminDashboard = () => {
  const location = useLocation();
  const { user, isLoading } = useAuth0();
  const { isJardinero, isAdmin, userData } = useRoles();

  const jardinero = isAdmin();

  const [tabIndex, setTabIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  const basePrueba = '/admin';

  const tabs = useMemo(() => {
    return [
      { label: 'Clubs', path: 'clubs' },
      { label: 'Trámites COFEPRIS', path: 'tramites' },
      { label: 'Amparos', path: 'amparos' },
      { label: 'Membresías', path: 'membresias' },
      { label: 'Pagos', path: 'pagos' },
      { label: 'Kits', path: 'kits' },
      { label: 'Afiliaciones', path: 'admin' },
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

    if (path.includes(`${basePrueba}/clubs`)) setTabIndex(0);
    else if (path.includes(`${basePrueba}/tramites`)) setTabIndex(1);
    else if (path.includes(`${basePrueba}/amparos`)) setTabIndex(2);
    else if (path.includes(`${basePrueba}/membresias`)) setTabIndex(3);
    else if (path.includes(`${basePrueba}/pagos`)) setTabIndex(4);
    else if (path.includes(`${basePrueba}/kits`)) setTabIndex(5);
    else if (path.includes(`${basePrueba}/afiliaciones`)) setTabIndex(6);
    else setTabIndex(0);
  }, [location.pathname, jardinero]);

  // Esperar Auth0 + Strapi
  if (isLoading || !userData) return <PreCargador text="Cargando Panel de Administración... " />;

  const path = location.pathname || '';

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
          {tabs[tabIndex]?.path === 'clubs' && <InfoMiClub />}
          {tabs[tabIndex]?.path === 'tramites' && <Bitacora />}
          {tabs[tabIndex]?.path === 'amparos' && <Documentos />}
          {tabs[tabIndex]?.path === 'membresias' && <GestionClub />}
          {tabs[tabIndex]?.path === 'pagos' && <GestionClub />}
          {tabs[tabIndex]?.path === 'kits' && <GestionClub />}
          {tabs[tabIndex]?.path === 'afiliaciones' && <GestionClub />}
          
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

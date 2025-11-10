
import Pestanas from '../../components/Pestanas';
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import InfoMiClub from '../../components/Clubs/InfoMiClub.jsx';
import Bitacora from '../../components/Clubs/Bitacora.jsx';
import Documentos from '../../components/Clubs/Documentos.jsx';
import MisPlantas from '../../components/Clubs/MisPlantas/index.jsx';

const MiClub = () => {
  const jardinero = false;
  const location = useLocation();
  const { user, isLoading } = useAuth0();

  const [tabIndex, setTabIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  
  const basePrueba = '/clubs/miclub';

  let tabs = [];
  if (!jardinero){
    tabs = [
        { label: 'Info tu Club', path: 'info' },                     // /clubs/miclub/info
        { label: 'Mi Bitácora', path: 'bitacora' },         // /clubs/miclub/bitacora
        { label: 'Documentación Legal', path: 'documentos' }, // /comunidad/mis-anuncios/historial
        { label: 'Mis Plantas', path: 'misplantas' }      // /comunidad/mis-anuncios/configuracion
    ];
  }
  else {
    tabs = [                   // /clubs/miclub/info
        { label: 'Mi Bitácora', path: 'bitacora' },         // /clubs/miclub/bitacora
        { label: 'Documentación Legal', path: 'documentos' }, // /comunidad/mis-anuncios/historial
        { label: 'Mis Plantas', path: 'misplantas' },      // /comunidad/mis-anuncios/configuracion
        { label: 'Info tu Club', path: 'info' }  
    ];
  }

  
    // responsive listener (solo para la UI local)
    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
  
    // sincroniza tabIndex con la URL de prueba (usa includes para detectar subrutas)
    useEffect(() => {
      console.log('aver',user);
      const path = (location.pathname || '').toLowerCase();
  
      if (path.includes(`${basePrueba}/info`)) setTabIndex(0);
      else if (path.includes(`${basePrueba}/bitacora`)) setTabIndex(1);
      else if (path.includes(`${basePrueba}/documentos`)) setTabIndex(2);
      else if (path.includes(`${basePrueba}/misplantas`)) setTabIndex(3);
      else setTabIndex(0); // por defecto
    }, [location.pathname]);

    if (isLoading) return <p>Cargando...</p>;

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
            overflowX: 'hidden', // 👈 evita el scroll lateral global
            boxSizing: 'border-box',
            paddingBottom: '0px',
            marginBottom: '0px',
          }}
        >
          {/* Columna principal (pestañas + panel) */}
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
              {tabIndex === 3 && <MisPlantas user={user} />}
            </div>
          </div>
        </div>
      );

}

export default MiClub;
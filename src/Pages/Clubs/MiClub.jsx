
import Pestanas from '../../components/Pestanas';
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import InfoMiClub from '../../components/Clubs/InfoMiClub.jsx';
import Bitacora from '../../components/Clubs/Bitacora.jsx';
import Documentos from '../../components/Clubs/Documentos.jsx';
import MisPlantas from '../../components/Clubs/MisPlantas.jsx';

const MiClub = () => {
  const location = useLocation();
  const { isLoading } = useAuth0();

  const [tabIndex, setTabIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  
  const basePrueba = '/clubs/miclub';
  const tabs = [
    { label: 'Info tu Club', path: 'info' },                     // /clubs/miclub/info
    { label: 'Mi Bitácora', path: 'bitacora' },         // /clubs/miclub/bitacora
    { label: 'Documentación Legal', path: 'documentos' }, // /comunidad/mis-anuncios/historial
    { label: 'Mis Plantas', path: 'misplantas' }      // /comunidad/mis-anuncios/configuracion
  ];

  
    // responsive listener (solo para la UI local)
    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
  
    // sincroniza tabIndex con la URL de prueba (usa includes para detectar subrutas)
    useEffect(() => {
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
            flexWrap: 'wrap'
          }}
        >
          {/* Columna principal (pestañas + panel) */}
          <div style={{ flex: '1 1 100%' }}>
            <Pestanas
              tabs={tabs}
              basePath={basePrueba} // <-- todas las rutas de prueba parten de aquí
              onTabChange={(index) => setTabIndex(index)}
              collapseAt={640}
            />
    
            <div>
              {tabIndex === 0 && <InfoMiClub />}
              {tabIndex === 1 && <Bitacora />}
              {tabIndex === 2 && <Documentos />}
              {tabIndex === 3 && <MisPlantas />}
            </div>
          </div>
        </div>
      );

}

export default MiClub;
// src/pages/LegalPage.jsx
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Grid, Card, Box } from '@mui/material';
import { keyframes } from '@emotion/react';
import { useLocation, useNavigate } from 'react-router-dom';

import Pestanas from '../../components/Pestanas';
import { useRoles } from '../../Contexts/RolesContext';

// 👉 NUEVOS COMPONENTES
import Documentos from '../../components/Clubs/Documentos.jsx';
import RutaLegal from '../../components/Clubs/RutaLegal.jsx';

// Imágenes
import derechos from '../../assets/derechos_consumidores_marihuanas_club.png';
import cofepris from '../../assets/generador_automatico_escrito_permiso_cofepris.png';
import amparo from '../../assets/amparo.png';
import activismo from '../../assets/activismo.png';
import tuabogado from '../../assets/tuabogado.png';
import club from '../../assets/club.png';

// === Animaciones ===
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;
const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
`;
const swing = keyframes`
  20% { transform: rotate(15deg); }
  40% { transform: rotate(-10deg); }
  60% { transform: rotate(5deg); }
  80% { transform: rotate(-5deg); }
  100% { transform: rotate(0deg); }
`;

const animationList = [
  { animation: spin, duration: '2s', timing: 'linear', count: 1 },
  { animation: pulse, duration: '1.5s', timing: 'ease-in-out', count: 1 },
  { animation: swing, duration: '2s', timing: 'ease-in-out', count: 1 },
];

// Cards = Herramientas
const cardConfigs = [
  { src: derechos, alt: 'Derechos Consumidores', path: '/wiki/legal', external: true },
  { src: cofepris, alt: 'Generador Cofepris', path: '/legal/generadorlibre' },
  { src: amparo, alt: 'Amparo', path: '/legal/amparo' },
  { src: activismo, alt: 'Activismo', path: '/legal/activismo' },
  { src: tuabogado, alt: 'Tu Abogado', path: '/legal/tuabogado' },
  { src: club, alt: 'Club', path: '/legal/instrucciones-acta' },
];

function AnimatedImage({ src, alt, animConfig }) {
  const ref = useRef();
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !inView) {
          setInView(true);
          observer.unobserve(ref.current);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [inView]);

  return (
    <Box
      ref={ref}
      component="img"
      src={src}
      alt={alt}
      sx={{
        width: '100%',
        height: 'auto',
        animation: inView
          ? `${animConfig.animation} ${animConfig.duration} ${animConfig.timing} ${animConfig.count}`
          : 'none',
      }}
    />
  );
}

export default function LegalPage() {
  const navigate = useNavigate(); // se mantiene intacto
  const location = useLocation();
  const { isActivaMembresia } = useRoles();

  const basePath = '/legal';

  const tabs = useMemo(
    () => [
      { label: 'Herramientas', path: '' },
      { label: 'Ruta Legal', path: 'rutalegal' },
      { label: 'Mis Documentos', path: 'documentos' },
    ],
    []
  );

  const [tabIndex, setTabIndex] = useState(0);

  // sincroniza pestaña activa (se mantiene)
  useEffect(() => {
    const path = location.pathname || '';
    if (path.includes('/rutalegal')) setTabIndex(1);
    else if (path.includes('/documentos')) setTabIndex(2);
    else setTabIndex(0);
  }, [location.pathname]);

  // 👉 YA NO NAVEGA, SOLO CAMBIA TAB
  const handleTabChange = (index) => {
    setTabIndex(index);
  };

  const handleCardClick = (cfg) => () => {
    if (cfg.external) window.open(cfg.path, '_blank');
    else navigate(cfg.path);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        gap: '8px',
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        paddingBottom: '0px',
        marginBottom: '0px',
      }}
    >
      {isActivaMembresia() && (
        <Pestanas
          tabs={tabs}
          basePath={basePath}
          onTabChange={handleTabChange}
          collapseAt={640}
        />
      )}

      {/* ===== HERRAMIENTAS ===== */}
      {tabIndex === 0 && (
        <Box sx={{ pt: 1, px: 2, mt: -1 }}>
          <Grid container spacing={3} justifyContent="center">
            {cardConfigs.map((config, idx) => {
              const animConfig = animationList[idx % animationList.length];
              return (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Card
                    onClick={handleCardClick(config)}
                    sx={{
                      maxWidth: 300,
                      margin: '0 auto',
                      p: 2,
                      cursor: 'pointer',
                      borderRadius: 3,
                      boxShadow: 3,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      },
                    }}
                  >
                    <AnimatedImage
                      src={config.src}
                      alt={config.alt}
                      animConfig={animConfig}
                    />
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* ===== RUTA LEGAL ===== */}
      {tabIndex === 1 && (
        <Box sx={{ pt: 1, px: 2 }}>
          <RutaLegal />
        </Box>
      )}

      {/* ===== MIS DOCUMENTOS ===== */}
      {tabIndex === 2 && (
        <Box sx={{ pt: 1, px: 2 }}>
          <Documentos />
        </Box>
      )}
    </div>
  );
}

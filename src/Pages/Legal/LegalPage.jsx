// src/pages/LegalPage.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Grid, Card, Box } from '@mui/material';
import { keyframes } from '@emotion/react';
import { useNavigate } from 'react-router-dom';

// Importar imágenes
import derechos from '../../assets/derechos_consumidores_marihuanas_club.png';
import cofepris from '../../assets/generador_automatico_escrito_permiso_cofepris.png';
import amparo from '../../assets/amparo.png';
import activismo from '../../assets/activismo.png';
import tuabogado from '../../assets/tuabogado.png';
import club from '../../assets/club.png';

// === Animaciones (una sola vez cada una) ===
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

// Lista de animaciones alternadas (una por imagen)
const animationList = [
  { animation: spin, duration: '2s', timing: 'linear', count: 1 },
  { animation: pulse, duration: '1.5s', timing: 'ease-in-out', count: 1 },
  { animation: swing, duration: '2s', timing: 'ease-in-out', count: 1 },
];

// Configuración de las cards (imagen + destino)
const cardConfigs = [
  { src: derechos, alt: 'Derechos Consumidores', type: 'route', path: '/wiki/legal' },
  { src: cofepris, alt: 'Generador Cofepris', type: 'route', path: '/legal/generadorlibre' },
  { src: amparo, alt: 'Amparo', type: 'route', path: '/legal/amparo' },
  { src: activismo, alt: 'Activismo', type: 'route', path: '/legal/activismo' },
  { src: tuabogado, alt: 'Tu Abogado', type: 'route', path: '/legal/tuabogado' },
  { src: club, alt: 'Club', type: 'route', path: '/legal/instrucciones-acta' },
];

// Componente de imagen animada (con IntersectionObserver)
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
        display: 'block',
        margin: '0 auto',
        animation: inView
          ? `${animConfig.animation} ${animConfig.duration} ${animConfig.timing} ${animConfig.count}`
          : 'none',
        animationFillMode: 'forwards',
        transition: 'transform 0.3s ease',
        '&:hover': {
          transform: 'scale(1.05)',
        },
      }}
    />
  );
}

// === Componente principal ===
export default function LegalPage() {
  const navigate = useNavigate();

  const handleClick = (config) => () => {
    if (config.type === 'external') {
      window.open(config.path, '_blank');
    } else {
      navigate(config.path);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={4} justifyContent="center">
        {cardConfigs.map((config, idx) => {
          const animConfig = animationList[idx % animationList.length];
          return (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card
                onClick={handleClick(config)}
                sx={{
                  position: 'relative',
                  maxWidth: 300,
                  margin: '0 auto',
                  overflow: 'visible',
                  p: 2,
                  cursor: 'pointer',
                  borderRadius: 3,
                  boxShadow: 3,
                  transition: 'transform 0.2s ease',
                  '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 },
                }}
              >
                <AnimatedImage
                  src={config.src}
                  alt={config.alt}
                  animConfig={animConfig}
                />
                <Box
                  component="span"
                  onClick={(e) => { e.stopPropagation(); handleClick(config)(); }}
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    backgroundColor: '#d4f5e1', // verde menta clarito
                    borderRadius: '4px',
                    px: 1.2,
                    py: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    boxShadow: 1,
                    fontSize: '0.9rem',
                  }}
                >
                  abrir&nbsp;
                  <span className="material-icons" style={{ fontSize: '16px' }}>open_in_new</span>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

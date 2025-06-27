import React, { useRef, useState, useEffect } from 'react';
import { Grid, Card, Box } from '@mui/material';
import { keyframes } from '@emotion/react';
import { useNavigate } from 'react-router-dom';

import amparo1 from '../../assets/wiki_lugares_marihuanas_club.png';
import amparo2 from '../../assets/herramientas_legales.png';
import amparo3 from '../../assets/contenidos_marihuanas_club.png';
import amparo4 from '../../assets/asesorias.png';
import amparo5 from '../../assets/test.png';
import amparo6 from '../../assets/juegos.png';
import amparo7 from '../../assets/florateca.png';
import amparo8 from '../../assets/maria.png';

// Definición de animaciones con Emotion keyframes (una sola ejecución)
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;
const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
`;
const swing = keyframes`
  20% { transform: rotate(15deg); }
  40% { transform: rotate(-10deg); }
  60% { transform: rotate(5deg); }
  80% { transform: rotate(-5deg); }
  100% { transform: rotate(0deg); }
`;

// Lista de animaciones disponibles (cada una con un solo ciclo) con duraciones más rápidas
const animationList = [
  { animation: spin, duration: '2s', timing: 'linear', count: 1 },
  { animation: pulse, duration: '1.5s', timing: 'ease-in-out', count: 1 },
  { animation: swing, duration: '2s', timing: 'ease-in-out', count: 1 }
];

// Configuración de cada card con destino
const cardConfigs = [
  { src: amparo1, alt: 'Wiki Lugares', type: 'external', path: 'https://wiki.marihuanas.club' },
  { src: amparo2, alt: 'Legal', type: 'route', path: '/legal' },
  { src: amparo3, alt: 'Contenidos Wiki', type: 'external', path: 'https://wiki.marihuanas.club' },
  { src: amparo4, alt: 'Consultorías', type: 'route', path: '/herramientas/consultorias' },
  { src: amparo5, alt: 'Test Consumo Responsable', type: 'route', path: '/herramientas/test-consumo-responsable' },
  { src: amparo6, alt: 'Juegos', type: 'route', path: '/juegos' },
  { src: amparo7, alt: 'Florateca', type: 'route', path: '/herramientas/florateca' },
  { src: amparo8, alt: 'María', type: 'route', path: '/herramientas/maria' }
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
        display: 'block',
        margin: '0 auto',
        animation: inView
          ? `${animConfig.animation} ${animConfig.duration} ${animConfig.timing} ${animConfig.count}`
          : 'none',
        animationFillMode: 'forwards'
      }}
    />
  );
}

export default function HerramientasPage() {
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
                  cursor: 'pointer'
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
                    px: 1,
                    py: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    boxShadow: 1
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

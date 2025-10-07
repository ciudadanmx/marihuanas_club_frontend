import React, { useRef, useState, useEffect } from 'react';
import { Grid, Card, Box, Button, CircularProgress } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';

import weedclicker from '../../assets/weedclicker.mp4';
import mindseye from '../../assets/mindseye.mp4';
import smokeweedeveryday from '../../assets/smokeweedeveryday.mp4';
import weedcasino from '../../assets/weedcasino.mp4';
import helpsnoop from '../../assets/helpsnoop.mp4';

// Animaciones de entrada distintas
const wiggle1 = keyframes`
  0% { transform: rotate(0deg); }
  25% { transform: rotate(2deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-2deg); }
  100% { transform: rotate(0deg); }
`;
const wiggle2 = keyframes`
  0% { transform: rotate(0deg); }
  20% { transform: rotate(-3deg); }
  40% { transform: rotate(1deg); }
  60% { transform: rotate(-1deg); }
  80% { transform: rotate(3deg); }
  100% { transform: rotate(0deg); }
`;
const wiggle3 = keyframes`
  0% { transform: rotate(0deg); }
  30% { transform: rotate(3deg); }
  60% { transform: rotate(-3deg); }
  100% { transform: rotate(0deg); }
`;
const entryAnims = [wiggle1, wiggle2, wiggle3];

// Card animada con hover y cursor pointer
const CardAnimada = styled(Card)(() => ({
  transition: 'transform 0.4s ease, box-shadow 0.4s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `0 8px 20px rgba(136, 255, 112, 0.35)`,
  },
  backgroundColor: '#252d25',
  color: '#fff',
  border: '2px solid #b8ff57',
  borderRadius: '16px',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  minHeight: 360, // aumentar altura
}));

// Wrapper para animar al entrar en viewport con wiggle aleatorio
function AnimatedCard({ children, index }) {
  const ref = useRef();
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !inView) {
          setInView(true);
          obs.unobserve(ref.current);
        }
      }, { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [inView]);

  const anim = entryAnims[index % entryAnims.length];

  return (
    <Box
      ref={ref}
      sx={{
        animation: inView
          ? `${anim} 0.8s ease-out forwards`
          : 'none',
      }}
    >
      {children}
    </Box>
  );
}

// Componente para video con spinner precarga
function VideoWithLoader({ src, onClick }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <Box sx={{ position: 'relative', width: '100%', height: 240 }} onClick={onClick}>
      {!loaded && (
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <CircularProgress sx={{ color: '#91ff49' }} />
        </Box>
      )}
      <Box
        component="video"
        src={src}
        loop
        muted
        autoPlay
        playsInline
        onLoadedData={() => setLoaded(true)}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: loaded ? 'block' : 'none',
        }}
      />
    </Box>
  );
}

const juegos = [
  { nombre: 'weedclicker', video: weedclicker },
  { nombre: 'mindseye', video: mindseye },
  { nombre: 'smokeweedeveryday', video: smokeweedeveryday },
  { nombre: 'weedcasino', video: weedcasino },
  { nombre: 'helpsnoop', video: helpsnoop },
  { nombre: 'juegodelavida', video: helpsnoop },
  { nombre: 'dilemadelprisionero', video: helpsnoop },
];

export default function Juegos() {
  const navigate = useNavigate();
  const handleNav = (name) => () => navigate(`/juega/${name}`);

  return (
    <Box sx={{ p: 4, backgroundColor: '#1a261a', minHeight: '100vh' }}>
      <Grid container spacing={4} justifyContent="center">
        {juegos.map(({ nombre, video }, idx) => (
          <Grid item xs={12} sm={6} md={4} key={nombre}>
            <AnimatedCard index={idx}>
              <CardAnimada onClick={handleNav(nombre)}>
                <VideoWithLoader src={video} onClick={handleNav(nombre)} />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    bgcolor: 'rgba(0, 0, 0, 0.4)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    p: 2,
                  }}
                  onClick={handleNav(nombre)}
                >
                  <Box component="h3" sx={{ m: 0, textTransform: 'capitalize' }}>
                     {nombre}
                  </Box>
                  <Button
                    onClick={(e) => { e.stopPropagation(); handleNav(nombre)(); }}
                    sx={{
                      mt: 1,
                      backgroundColor: '#91ff49',
                      color: '#1a1a1a',
                      fontWeight: 'bold',
                      '&:hover': { backgroundColor: '#a5ff30' },
                      borderRadius: '12px',
                      px: 3,
                      boxShadow: '0 0 10px #91ff49',
                    }}
                  >
                    ¡Jugar!
                  </Button>
                </Box>
              </CardAnimada>
            </AnimatedCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

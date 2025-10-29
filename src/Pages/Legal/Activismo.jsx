import React, { useRef, useState, useEffect } from 'react';
import { Grid, Card, Box, Button, Typography } from '@mui/material';
import { keyframes } from '@emotion/react';
import { useNavigate } from 'react-router-dom';

import zonas420 from '../../assets/zonas420.png';
import iniciativa from '../../assets/iniciativa.png';
import maria3d from '../../assets/maria3d.png';

// Animaciones suaves y de una sola ejecución
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;
const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;
const swing = keyframes`
  20% { transform: rotate(6deg); }
  40% { transform: rotate(-4deg); }
  60% { transform: rotate(2deg); }
  80% { transform: rotate(-2deg); }
  100% { transform: rotate(0deg); }
`;

const animations = [
  { animation: pulse, duration: '2s', timing: 'ease-in-out' },
  { animation: swing, duration: '1.8s', timing: 'ease-in-out' },
  { animation: spin, duration: '2.2s', timing: 'linear' }
];

export default function Activismo() {
  const navigate = useNavigate();
  const [inView, setInView] = useState([false, false, false]);
  const refs = [useRef(), useRef(), useRef()];

  const wagroup =
    process.env.REACT_APP_FOROASAMBLEA_WAGROUP || 'https://maria3d.org';

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting && !inView[i]) {
            setInView((prev) => {
              const copy = [...prev];
              copy[i] = true;
              return copy;
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    refs.forEach((r) => r.current && observer.observe(r.current));
    return () => observer.disconnect();
  }, [inView]);

  const handleInternal = (path) => navigate(path);
  const handleExternal = (url) => window.open(url, '_blank');

  const cards = [
    {
      id: 1,
      img: zonas420,
      text: '¿Te gustaría gestionar un espacio público con tolerancia al consumo de Cannabis en México?',
      buttons: [
        { label: 'Abrir', action: () => handleInternal('/legal/zonas420') }
      ]
    },
    {
      id: 2,
      img: iniciativa,
      text: `Colabora con la construcción de una iniciativa de ley ciudadana\n\nParticipa todos los domingos a las 4:20 PM a las sesiones por Zoom`,
      buttons: [
        { label: 'Link de la Sesión', action: () => handleInternal('/legal/foroasamblea') },
        { label: 'Grupo WhatsApp', action: () => handleExternal(wagroup) }
      ]
    },
    {
      id: 3,
      img: maria3d,
      text: 'Únete a la comunidad de WhatsApp',
      buttons: [
        { label: 'Abrir', action: () => handleExternal('https://maria3d.org') }
      ]
    }
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={4} justifyContent="center">
        {cards.map((card, i) => {
          const anim = animations[i % animations.length];
          return (
            <Grid item xs={12} sm={6} md={4} key={card.id}>
              <Card
                ref={refs[i]}
                sx={{
                  position: 'relative',
                  height: 350,
                  borderRadius: '20px',
                  overflow: 'hidden',
                  cursor: 'default',
                  backgroundImage: `url(${card.img})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  animation: inView[i]
                    ? `${anim.animation} ${anim.duration} ${anim.timing} 1`
                    : 'none',
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'scale(1.02)' }
                }}
              >
                {/* Overlay translúcido con texto */}
                <Box
                  sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.55)',
                    color: '#fff',
                    p: 3,
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    whiteSpace: 'pre-line',
                    fontSize: '1rem'
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {card.text}
                  </Typography>
                </Box>

                {/* Botones inferiores */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: card.buttons.length === 1 ? 'flex-end' : 'space-around',
                    p: 2,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  {card.buttons.map((btn, idx) => (
                    <Button
                      key={idx}
                      onClick={btn.action}
                      variant="contained"
                      sx={{
                        bgcolor: '#00b37e',
                        color: 'white',
                        fontWeight: 600,
                        borderRadius: '10px',
                        px: 2,
                        py: 0.5,
                        '&:hover': { bgcolor: '#00d08a' }
                      }}
                    >
                      {btn.label}
                    </Button>
                  ))}
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

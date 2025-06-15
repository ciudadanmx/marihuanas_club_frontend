import React from 'react';
import { Grid, Card, CardMedia, Box } from '@mui/material';
import amparo1 from '../../assets/derechos_consumidores_marihuanas_club.png';
import amparo2 from '../../assets/generador_automatico_escrito_permiso_cofepris.png';
import amparo3 from '../../assets/amparo.png';
import amparo4 from '../../assets/activismo.png';
import amparo5 from '../../assets/tuabogado.png';


// Animations definidas con keyframes en sx
const animations = [
  {
    name: 'spin',
    keyframes: {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' }
    },
    duration: '3s',
    timing: 'linear infinite'
  },
  {
    name: 'pulse',
    keyframes: {
      '0%, 100%': { transform: 'scale(1)' },
      '50%': { transform: 'scale(1.2)' }
    },
    duration: '2s',
    timing: 'ease-in-out infinite'
  },
  {
    name: 'swing',
    keyframes: {
      '20%': { transform: 'rotate(15deg)' },
      '40%': { transform: 'rotate(-10deg)' },
      '60%': { transform: 'rotate(5deg)' },
      '80%': { transform: 'rotate(-5deg)' },
      '100%': { transform: 'rotate(0deg)' }
    },
    duration: '2.5s',
    timing: 'ease-in-out infinite'
  },
  {
    name: 'swing',
    keyframes: {
      '20%': { transform: 'rotate(15deg)' },
      '40%': { transform: 'rotate(-10deg)' },
      '60%': { transform: 'rotate(5deg)' },
      '80%': { transform: 'rotate(-5deg)' },
      '100%': { transform: 'rotate(0deg)' }
    },
    duration: '2.5s',
    timing: 'ease-in-out infinite'
  },
  {
    name: 'swing',
    keyframes: {
      '20%': { transform: 'rotate(15deg)' },
      '40%': { transform: 'rotate(-10deg)' },
      '60%': { transform: 'rotate(5deg)' },
      '80%': { transform: 'rotate(-5deg)' },
      '100%': { transform: 'rotate(0deg)' }
    },
    duration: '2.5s',
    timing: 'ease-in-out infinite'
  }
];

// Imágenes de ejemplo
export default function AnimatedImageCards() {
  const images = [amparo1, amparo2, amparo3, amparo4, amparo5];

  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={4} justifyContent="center">
        {images.map((src, idx) => {
          const anim = animations[idx];
          return (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card sx={{ maxWidth: 300, margin: '0 auto', overflow: 'visible', p: 2 }}>
                <Box
                  component="img"
                  src={src}
                  alt="Amparo"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    margin: '0 auto',
                    '@keyframes spin': anim.keyframes,
                    animation: `${anim.name} ${anim.duration} ${anim.timing}`
                  }}
                />
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

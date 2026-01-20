import React, { useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Imágenes (botones)
import img3Interior from '../../assets/membresias/3interior.png';
import img6Interior from '../../assets/membresias/6interior.png';
import img6Exterior from '../../assets/membresias/6exterior.png';

const MotionBox = motion(Box);

const botones = [
  {
    img: img3Interior,
    route: '/membresias/pagar/order/10',
    alt: '3 plantas interior',
  },
  {
    img: img6Interior,
    route: '/membresias/pagar/order/11',
    alt: '6 plantas interior',
  },
  {
    img: img6Exterior,
    route: '/membresias/pagar/order/12',
    alt: '6 plantas exterior',
  },
];

export default function NumeroPlantas() {
  const navigate = useNavigate();
  const [loadingImg, setLoadingImg] = useState({});

  const handleNavigate = (route) => {
    navigate(route);
  };

  return (
    <Box
      sx={{
        width: '100%',
        px: { xs: 1.5, md: 4 },
        py: { xs: 3, md: 5 },
      }}
    >
      {/* Título */}
      <Typography
        component="h1"
        sx={{
          textAlign: 'center',
          mb: 4,
          fontSize: { xs: '1.6rem', md: '2.2rem' },
          fontWeight: 700,
          color: '#39ff6a', // verde neón controlado
          textShadow: '0 0 8px rgba(57,255,106,0.35)',
        }}
      >
        <h1>Selecciona el número de plantas</h1>
      </Typography>

      {/* Contenedor de botones */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)', // SIEMPRE 3 a lo ancho
          gap: { xs: 1.5, md: 3 },
          width: '100%',
        }}
      >
        {botones.map((btn, idx) => (
          <MotionBox
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleNavigate(btn.route)}
            sx={{
                cursor: 'pointer',
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 8px 25px rgba(0,0,0,0.35)',
                backgroundColor: '#f5f1f1cc',
                width: '100%',
            }}
          >
            {/* Spinner mientras carga */}
            {loadingImg[idx] && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(226, 224, 224, 0.69)',
                  zIndex: 2,
                }}
              >
                <CircularProgress />
              </Box>
            )}

            {/* Imagen */}
            <Box
              component="img"
              src={btn.img}
              alt={btn.alt}
              loading="lazy"
              onLoad={() =>
                setLoadingImg((prev) => ({ ...prev, [idx]: false }))
              }
              onError={() =>
                setLoadingImg((prev) => ({ ...prev, [idx]: false }))
              }
              onLoadStart={() =>
                setLoadingImg((prev) => ({ ...prev, [idx]: true }))
              }
              sx={{
                width: '100%',
                height: { xs: 180, sm: 220, md: 280 }, // altura controlada
                objectFit: 'contain',                 // NUNCA recorta
                backgroundColor: '#c2e2b086',            // fondo para que no se vea feo
                display: 'block',
              }}
            />
          </MotionBox>
        ))}
      </Box>
    </Box>
  );
}

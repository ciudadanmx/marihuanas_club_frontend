import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';  // <-- Importa useNavigate
import clubs from '../assets/red_de_clubs_marihuanas_club.png';
import afilia from '../assets/afilia_tu_club.png';
import '../styles/clubs.css';
import MapaClubs from '../components/Clubs/MapaClubs.jsx'

const useOnScreen = (ref, rootMargin = '0px') => {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      { rootMargin }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return isIntersecting;
};

const Clubs = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate(); // <-- Hook useNavigate

  const ref1 = useRef();
  const ref2 = useRef();
  const visible1 = useOnScreen(ref1, '-100px');
  const visible2 = useOnScreen(ref2, '-100px');

  // Función para manejar click y navegar
  const handleAfiliaClick = () => {
    navigate('/clubs/agregar-club');
  };

  return (
    <Box
      className="clubs-wrapper"
      maxWidth="lg"
      mx="auto"
      px={2}
      py={4}
      sx={{
        backgroundColor: '#f4ffe2',
        borderRadius: 4,
        boxShadow: '0 4px 25px rgba(0,0,0,0.1)',
      }}
    >
      <Typography
        variant="h3"
        textAlign="center"
        fontWeight="bold"
        mb={3}
        className="section-title animated-box fade-in-top"
        sx={{
          textShadow: '0 1px 2px rgba(0,0,0,0.2)',
          color: '#2e7d32',
        }}
      >
        🌿 Red de Clubs Cannábicos en México
      </Typography>

      <Box
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
        alignItems="center"
        justifyContent="center"
        gap={4}
        mb={4}
      >
        {/* Imagen 1 */}
        <Box
          ref={ref1}
          className={`animated-box ${visible1 ? 'fade-zoom-left' : ''}`}
          component="img"
          src={clubs}
          alt="Red de Clubs"
          sx={{
            width: { xs: '100%', md: '48%' },
            borderRadius: 3,
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          }}
        />

        {/* Botón solo en móviles */}
        {isMobile && (
          <Button
            variant="contained"
            color="success"
            sx={{
              my: 2,
              backgroundColor: '#66bb6a',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              padding: '12px 24px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
            fullWidth
          >
            Ver el Directorio de Clubs 420
          </Button>
        )}

        {/* Imagen 2 con botón flotante mejorado */}
        <Box
          ref={ref2}
          className={`animated-box ${visible2 ? 'fade-zoom-right' : ''}`}
          sx={{
            width: { xs: '100%', md: '48%' },
            borderRadius: 3,
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            component="img"
            src={afilia}
            alt="Afilia tu Club"
            sx={{
              width: '100%',
              display: 'block',
              borderRadius: 3,
            }}
          />

          {/* Botón con borde y glow */}
          <Button
            onClick={handleAfiliaClick} // <-- Navegación
            variant="contained"
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#43a047',
              color: '#fff',
              fontWeight: 'bold',
              padding: '10px 24px',
              borderRadius: '999px',
              fontSize: '1rem',
              textTransform: 'none',
              zIndex: 2,
              border: '2px solid #fff200',
              boxShadow: '0 0 15px #fff200cc, 0 4px 10px rgba(0,0,0,0.4)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                backgroundColor: '#388e3c',
                boxShadow: '0 0 20px #fff200ee, 0 6px 12px rgba(0,0,0,0.5)',
              },
            }}
          >
            🌱 Afilia gratis tu club
          </Button>
        </Box>
      </Box>

      {/* Título inferior */}
      <Typography
        variant="h4"
        textAlign="center"
        fontWeight="600"
        color="text.secondary"
        className="animated-box fade-in-bottom"
        sx={{ mt: 4 }}
      >
       
            <MapaClubs />

      </Typography>
    </Box>
  );
};

export default Clubs;

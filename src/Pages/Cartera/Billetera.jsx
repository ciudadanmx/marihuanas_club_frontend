import React, { useRef, useState } from 'react';
import { Box, Stack, Typography, IconButton, Fade, Paper } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HomeIcon from '@mui/icons-material/Home';

// 🪙 Importa imágenes (temporalmente todas Labory)
import PesosImg from '../../assets/monedas/mxn.png';
import LaboryImg from '../../assets/monedas/labory.png';
import CiudadanImg from '../../assets/monedas/ciudadan_logo_public.png';
import PubliaImg from '../../assets/monedas/labory.png';
import ObjectImg from '../../assets/monedas/object.png';
import TaskImg from '../../assets/monedas/task.png';
import TodoImg from '../../assets/monedas/todo.png';
import EvaluationImg from '../../assets/monedas/evaluation.png';
import VoteImg from '../../assets/monedas/vote.png';
import IdImg from '../../assets/monedas/idtoken.png';
import SkillImg from '../../assets/monedas/labory.png';
import SocialImg from '../../assets/monedas/social.png';

const Billetera = () => {
  const monedas = [
    { nombre: 'Resumen', icon: <HomeIcon sx={{ color: '#f0c040' }} /> },
    { nombre: 'Pesos MXN', img: PesosImg },
    { nombre: 'Labory', img: LaboryImg },
    { nombre: 'Ciudadan I-Token', img: CiudadanImg },
    { nombre: 'Publia', img: PubliaImg },
    { nombre: 'Object-Token', img: ObjectImg },
    { nombre: 'TaskToken', img: TaskImg },
    { nombre: 'TodoToken', img: TodoImg },
    { nombre: 'Evaluation-Token', img: EvaluationImg },
    { nombre: 'Vote-Token', img: VoteImg },
    { nombre: 'Id-Token', img: IdImg },
    { nombre: 'Skill-Token', img: SkillImg },
    { nombre: 'Social-Token', img: SocialImg },
  ];

  const scrollRef = useRef(null);
  const [selected, setSelected] = useState(monedas[0].nombre);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#003300', // 🌑 Verde más oscuro general
        color: 'white',
      }}
    >
      {/* 🔳 Barra negra con scroll lateral */}
      <Box
        sx={{
          width: '100%',
          bgcolor: 'black',
          display: 'flex',
          alignItems: 'center',
          position: 'sticky',
          top: 64,
          zIndex: 1000,
          borderBottom: '2px solid #222',
          px: 1,
        }}
      >
        {/* Flecha izquierda */}
        <IconButton onClick={() => scroll('left')} sx={{ color: '#f0c040' }}>
          <ChevronLeftIcon />
        </IconButton>

        {/* Contenedor scrollable */}
        <Box
          ref={scrollRef}
          sx={{
            display: 'flex',
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            flex: 1,
            py: 1.2,
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          <Stack direction="row" spacing={4} sx={{ mx: 2 }}>
            {monedas.map((moneda) => {
              const isActive = moneda.nombre === selected;
              return (
                <Stack
                  key={moneda.nombre}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  onClick={() => setSelected(moneda.nombre)}
                  sx={{
                    cursor: 'pointer',
                    pb: 0.3,
                    borderBottom: isActive ? '2px solid #f0c040' : '2px solid transparent',
                    color: isActive ? '#f0c040' : 'white',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: '#f0c040',
                      borderBottom: '2px solid #f0c040',
                    },
                  }}
                >
                  {moneda.icon ? (
                    moneda.icon
                  ) : (
                    <Box
                      component="img"
                      src={moneda.img}
                      alt={moneda.nombre}
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  <Typography sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
                    {moneda.nombre}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        </Box>

        {/* Flecha derecha */}
        <IconButton onClick={() => scroll('right')} sx={{ color: '#f0c040' }}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* 💰 Contenido dinámico de cada moneda */}
      <Fade in={!!selected} timeout={400}>
        <Box
          sx={{
            p: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {selected !== 'Home' && (
            <Paper
              elevation={10}
              sx={{
                bgcolor: '#002200', // 🌑 Fondo más oscuro para card
                p: 4,
                borderRadius: 3,
                maxWidth: 500,
                textAlign: 'center',
                color: 'white',
              }}
            >
              <Box
                component="img"
                src={monedas.find((m) => m.nombre === selected)?.img}
                alt={selected}
                sx={{
                  width: 50,
                  height: 50,
                  mb: 2,
                  borderRadius: '50%',
                }}
              />
              <Typography variant="h5" sx={{ mb: 2, color: '#f0c040', fontWeight: 'bold' }}>
                {selected}
              </Typography>
              <Typography sx={{ opacity: 0.9 }}>
                🔒 <strong>Saldo actual:</strong> [placeholder balance]
              </Typography>
              <Typography sx={{ mt: 1, opacity: 0.9 }}>
                📊 <strong>Historial de transacciones:</strong> [placeholder movimientos]
              </Typography>
              <Typography sx={{ mt: 1, opacity: 0.9 }}>
                💡 <strong>Información adicional:</strong> [placeholder descripción del token]
              </Typography>
            </Paper>
          )}
          {selected === 'Home' && (
            <Paper
              elevation={10}
              sx={{
                bgcolor: '#002200',
                p: 4,
                borderRadius: 3,
                maxWidth: 500,
                textAlign: 'center',
                color: 'white',
              }}
            >
              <Typography variant="h5" sx={{ mb: 2, color: '#f0c040', fontWeight: 'bold' }}>
                Home
              </Typography>
              <Typography sx={{ opacity: 0.9 }}>
                🏠 Bienvenido a tu billetera. Selecciona una moneda para ver detalles.
              </Typography>
            </Paper>
          )}
        </Box>
      </Fade>
    </Box>
  );
};

export default Billetera;

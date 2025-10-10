import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';

// 🌟 Datos de ejemplo (simulan respuesta de API)
const tareas = [
  {
    id: 1,
    titulo: 'Revisar documentación del proyecto',
    tiempoMin: 90,
    labory: 15,
    efectivo: 50,
    fechaEntrega: '2025-10-15',
    imagen: null,
  },
  {
    id: 2,
    titulo: 'Crear mockup de interfaz',
    tiempoMin: 45,
    labory: 10,
    efectivo: 20,
    fechaEntrega: '2025-10-16',
    imagen: null,
  },
  {
    id: 3,
    titulo: 'Programar módulo de autenticación',
    tiempoMin: 120,
    labory: 25,
    efectivo: 100,
    fechaEntrega: '2025-10-18',
    imagen: null,
  },
  {
    id: 4,
    titulo: 'Escribir pruebas unitarias',
    tiempoMin: 30,
    labory: 5,
    efectivo: 15,
    fechaEntrega: '2025-10-19',
    imagen: null,
  },
];

// 🔹 Función para convertir minutos a hh:mm
const minutosAHoras = (min) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}:${m.toString().padStart(2, '0')}`;
};

// 🔹 Componente TareaCard individual
const TareaCard = ({ tarea }) => {
  return (
    <Paper
      elevation={6}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 3,
        bgcolor: '#002200', // card oscuro
        color: 'white',
        width: '100%',
      }}
    >
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between">
        {/* Título y opcional imagen */}
        <Box display="flex" alignItems="center">
          {tarea.imagen && (
            <Box
              component="img"
              src={tarea.imagen}
              alt={tarea.titulo}
              sx={{ width: 60, height: 60, borderRadius: 2, mr: 2 }}
            />
          )}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {tarea.titulo}
          </Typography>
        </Box>

        {/* Info de la tarea */}
        <Box display="flex" flexDirection="column" alignItems={{ xs: 'flex-start', sm: 'flex-end' }} mt={{ xs: 2, sm: 0 }}>
          <Typography>
            ⏱ Tiempo: {tarea.tiempoMin} min ({minutosAHoras(tarea.tiempoMin)} hh:mm)
          </Typography>
          <Typography>💎 Laborys: {tarea.labory}</Typography>
          <Typography>💵 Efectivo: ${tarea.efectivo}</Typography>
          <Typography>📅 Entrega: {tarea.fechaEntrega}</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

// 🔹 Componente principal Tareas
const Tareas = () => {
  return (
    <Box sx={{ p: 3, bgcolor: '#003300', minHeight: '100vh' }}>
      <Grid container spacing={3}>
        {tareas.map((tarea) => (
          <Grid item xs={12} key={tarea.id}>
            <TareaCard tarea={tarea} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Tareas;

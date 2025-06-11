import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Rating,
  Stack,
} from '@mui/material';

const Resenas = ({ resenas }) => {
  // Placeholder para mostrar mientras no llegan reseñas reales
  const placeholderResenas = [
    {
      id: 1,
      usuario: {
        nombre: 'Juan Pérez',
        foto: 'https://randomuser.me/api/portraits/men/32.jpg',
        perfilUrl: '#',
      },
      estrellas: 5,
      fecha: '2025-05-20',
      comentario: 'Excelente producto, muy buena calidad y entrega rápida. ¡Recomendado!',
    },
    {
      id: 2,
      usuario: {
        nombre: 'María Gómez',
        foto: 'https://randomuser.me/api/portraits/women/45.jpg',
        perfilUrl: '#',
      },
      estrellas: 4,
      fecha: '2025-05-18',
      comentario: 'Buen producto, cumple con lo esperado. Volvería a comprar.',
    },
  ];

  // Si resenas es array y tiene elementos, usarlo, si no usar placeholder
  const listaResenas = Array.isArray(resenas) && resenas.length > 0 ? resenas : placeholderResenas;

  // Mapeo guardado en constante para posible futura reutilización o cambio
  const listadoResenas = listaResenas.map((resena) => (
    <Paper
      key={resena.id}
      variant="outlined"
      sx={{ p: 2, mb: 2, borderRadius: 2 }}
    >
      <Stack direction="row" spacing={2} alignItems="center" mb={1}>
        <Avatar
          src={resena.usuario.foto}
          alt={resena.usuario.nombre}
          sx={{ width: 48, height: 48 }}
        />
        <Box>
          <Typography
            component="a"
            href={resena.usuario.perfilUrl}
            variant="subtitle1"
            color="primary"
            sx={{ textDecoration: 'none', cursor: 'pointer' }}
          >
            {resena.usuario.nombre}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(resena.fecha).toLocaleDateString()}
          </Typography>
        </Box>
      </Stack>
      <Rating
        name={`rating-${resena.id}`}
        value={resena.estrellas}
        precision={1}
        readOnly
        size="small"
        sx={{ mb: 1 }}
      />
      <Typography variant="body2">{resena.comentario}</Typography>
    </Paper>
  ));

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Reseñas
      </Typography>

      {/* Si no hay reseñas ni placeholder (por si acaso) */}
      {listaResenas.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No hay reseñas todavía.
        </Typography>
      ) : (
        listadoResenas
      )}
    </Box>
  );
};

export default Resenas;

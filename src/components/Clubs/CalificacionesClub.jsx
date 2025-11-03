// src/components/CalificacionesPlaceholder.jsx
import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

function Stars({ value = 0, max = 5 }) {
  const full = Math.round(value);
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      {Array.from({ length: max }).map((_, i) => (
        i < full ? <StarIcon key={i} sx={{ color: '#f5c518' }} /> : <StarBorderIcon key={i} sx={{ color: '#cfcfcf' }} />
      ))}
    </Stack>
  );
}

export default function CalificacionesClub({ score = 4.2, count = 37 }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>{Number(score).toFixed(1)}</Typography>
        <Box>
          <Stars value={score} />
          <Typography variant="caption" color="text.secondary">{count} reseñas</Typography>
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Placeholder — aquí el desglose por estrellas, formulario para votar y lista de reseñas con filtro.
        </Typography>
      </Box>
    </Box>
  );
}

// src/components/ComentariosPlaceholder.jsx
import React from 'react';
import { Box, Avatar, Typography, Divider, Stack } from '@mui/material';

const mock = [
  { name: 'Ana', date: '2025-10-20', text: 'Muy buen lugar, ambiente chill y buena atención.' },
  { name: 'Luis', date: '2025-09-14', text: 'Recomendado para eventos privados. Precio accesible.' },
  { name: 'María', date: '2025-08-02', text: 'Los horarios no son muy constantes, confirmar antes.' },
];

export default function ComentariosClub() {
  return (
    <Box>
      <Stack spacing={1}>
        {mock.map((c, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Avatar sx={{ width: 40, height: 40 }}>{c.name.charAt(0)}</Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Typography variant="subtitle2">{c.name}</Typography>
                <Typography variant="caption" color="text.secondary">{c.date}</Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 0.5 }}>{c.text}</Typography>
            </Box>
          </Box>
        ))}
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Typography variant="caption" color="text.secondary">
        Placeholder — aquí irá el formulario y la lista real de comentarios.
      </Typography>
    </Box>
  );
}

import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import StarIcon from '@mui/icons-material/Star';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

export default function PromueveMembresias() {
  const beneficios = [
    {
      icon: <StarIcon fontSize="large" sx={{ color: '#2e7d32' }} />,
      title: 'Recompensas Exclusivas',
      description: 'Gana puntos canjeables por beneficios por cada amigo que se registre usando tu enlace.'
    },
    {
      icon: <MonetizationOnIcon fontSize="large" sx={{ color: '#1b5e20' }} />,
      title: 'Gana Dinero',
      description: 'Convierte tus referencias en ingresos extra compartiendo tu enlace único.'
    },
    {
      icon: <ShareIcon fontSize="large" sx={{ color: '#4caf50' }} />,
      title: 'Comparte Fácilmente',
      description: 'Envía tu enlace a través de WhatsApp, email o redes sociales en segundos.'
    },
  ];

  return (
    <Box
      sx={{
        p: 4,
        minHeight: '100vh',
        backgroundImage: `url(/fondo-cannabis.png)`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    >
      <Box sx={{ backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 3, p: 4 }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom textAlign="center" sx={{ color: '#1b5e20' }}>
          Promueve tus Membresías
        </Typography>
        <Typography variant="h6" textAlign="center" sx={{ mb: 6, color: '#2e7d32' }}>
          Invita a tus amigos, gana recompensas y haz crecer la comunidad.
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {beneficios.map((b, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  p: 2,
                  textAlign: 'center',
                  boxShadow: 4,
                  borderRadius: 3,
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'scale(1.05)', boxShadow: 6 },
                }}
              >
                <Box sx={{ mb: 2 }}>{b.icon}</Box>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {b.title}
                  </Typography>
                  <Typography variant="body2">{b.description}</Typography>
                </CardContent>
                <Button
                  variant="contained"
                  sx={{
                    mt: 2,
                    backgroundColor: '#4caf50',
                    '&:hover': { backgroundColor: '#388e3c' },
                  }}
                >
                  Invitar Ahora
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

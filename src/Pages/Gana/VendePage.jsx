import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import EmojiNatureIcon from '@mui/icons-material/EmojiNature';
import { useNavigate } from 'react-router-dom';

export default function VendePage() {
  const navigate = useNavigate();

  const beneficios = [
    {
      icon: <VerifiedUserIcon fontSize="large" sx={{ color: '#2e7d32' }} />,
      title: 'Vende Legalmente',
      description:
        'Cumple con todos los requisitos legales y permisos para vender productos cannábicos de forma segura.',
    },
    {
      icon: <LocalShippingIcon fontSize="large" sx={{ color: '#1b5e20' }} />,
      title: 'Gestión de Pedidos',
      description:
        'Controla tus ventas, envíos y estado de pedidos desde tu dashboard personal.',
    },
    {
      icon: <EmojiNatureIcon fontSize="large" sx={{ color: '#4caf50' }} />,
      title: 'Conecta con la Comunidad',
      description:
        'Tus productos llegarán a clientes conscientes y responsables, fomentando la cultura cannábica.',
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
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <Box
        sx={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: 3,
          p: 4,
          mt: '-23px', // 🔹 ajusta este valor si la navbar es más alta o más baja
          boxShadow: 4,
          width: '100%',
          maxWidth: 1200,
          position: 'relative',
          zIndex: 10,
        }}
      >
        <center>
          <h1>
              Vende tus Productos o Servicios de Industrias Periférico-Cannábicas
          </h1>
        </center>

        <Typography
          variant="h6"
          textAlign="center"
          sx={{ mb: 4, color: '#2e7d32' }}
        >
          Únete a nuestra plataforma legal y segura. Comparte tus productos con
          clientes responsables y gestiona tus ventas fácilmente.
        </Typography>

        <Box
          sx={{
            backgroundColor: '#e8f5e9',
            borderLeft: '6px solid #4caf50',
            p: 2,
            mb: 6,
          }}
        >
          <Typography variant="body1" fontWeight="bold">
            ⚠️ Solo pueden registrarse vendedores con permisos legales vigentes.
            Debes ser mayor de edad según la legislación local.
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {beneficios.map((b, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
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
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box textAlign="center" mt={6}>
          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: '#4caf50',
              '&:hover': { backgroundColor: '#388e3c' },
            }}
            onClick={() => navigate('/registro-vendedor')}
          >
            Regístrate como Vendedor
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

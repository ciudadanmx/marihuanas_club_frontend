import React from 'react';
import { Grid, Card, CardContent, Typography, Button, Box, Chip, Zoom } from '@mui/material';
import '../styles/membresias.css';
import BotonMembresia from '../components/Membresias/BotonMembresia.jsx';

const planes = [
  {
    nombre: 'Mensual',
    precio: '$200',
    beneficios: [
      'Acceso a clubes',
      'Descuentos exclusivos',
      'Contenido premium',
      'Asesoría básica legal',
    ],
    icon: 'paid',
    destacado: false,
    color: '#A3D977',
    stripeButton: true,
    priceId: process.env.REACT_APP_STRIPE_PRICE_ID_MENSUAL,
  },
  {
    nombre: 'Semestral',
    precio: '$420',
    beneficios: [
      'Todo lo anterior',
      'Acceso a red de cultivo solidario',
    ],
    icon: 'eco',
    destacado: false,
    color: '#B388EB',
    stripeButton: true,
    priceId: process.env.REACT_APP_STRIPE_PRICE_ID_SEMESTRAL,
  },
  {
    nombre: 'Anual',
    precio: '$710',
    beneficios: [
      'Todo lo anterior',
      'Permiso COFEPRIS incluido',
    ],
    icon: 'verified',
    destacado: true,
    color: '#D462F1',
    stripeButton: true,
    priceId: process.env.REACT_APP_STRIPE_PRICE_ID_ANUAL,
  }
];

const Membresias = () => {
  return (
    <Box className="membresias-container">
      <Typography variant="h4" align="center" gutterBottom className="membresias-titulo">
          Elige tu Membresía Cannábica
      </Typography>
      <Typography variant="subtitle1" align="center" className="membresias-subtitulo">
        Accede a beneficios únicos, asesoría legal y espacios de autoconsumo.
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {planes.map((plan, index) => (
          <Grid item xs={12} sm={6} md={4} key={plan.nombre}>
            <Zoom in style={{ transitionDelay: `${index * 200}ms` }}>
              <Card
                className="membresia-card"
                style={{
                  background: `linear-gradient(135deg, ${plan.color}33, white)`,
                  border: plan.destacado ? `3px solid ${plan.color}` : '1px solid #ccc',
                  boxShadow: plan.destacado ? `0 0 30px ${plan.color}66` : undefined,
                }}
              >
                {plan.destacado && (
                  <Chip
                    label="Más popular"
                    className="membresia-chip"
                    style={{ backgroundColor: plan.color }}
                  />
                )}
                <CardContent style={{ textAlign: 'center' }}>
                  <span className="material-icons membresia-icono" style={{ color: plan.color }}>
                    {plan.icon}
                  </span>
                  <Typography variant="h5" gutterBottom className="membresia-nombre">
                    {plan.nombre}
                  </Typography>
                  <Typography variant="h4" className="membresia-precio">
                    {plan.precio}
                  </Typography>
                  <ul className="membresia-beneficios">
                    {plan.beneficios.map((beneficio, i) => (
                      <li key={i} className="membresia-beneficio">
                        <span className="material-icons membresia-check-icon" style={{ color: plan.color }}>
                          check_circle
                        </span>
                        {beneficio}
                      </li>
                    ))}
                  </ul>
                  {plan.stripeButton ? (
                    <BotonMembresia priceId={plan.priceId} color={plan.color} />
                  ) : (
                    <Button
                      variant="outlined"
                      className="boton-proximamente"
                      style={{
                        borderColor: plan.color,
                        color: plan.color,
                      }}
                      sx={{
                        '&:hover': {
                          backgroundColor: plan.color,
                          color: '#fff',
                        }
                      }}
                    >
                      Próximamente
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Membresias;

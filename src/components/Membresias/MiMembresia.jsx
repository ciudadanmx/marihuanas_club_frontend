import React from 'react';
import { Box, Typography, Button, List, ListItem, Divider } from '@mui/material';
import { useRoles } from '../../Contexts/RolesContext';
import BotonMembresia from './BotonMembresia'; // tu componente de Stripe

const MiMembresia = () => {
  const { membresia } = useRoles();

  if (!membresia) return null;

  const { plan, monto_pagado, fechaInicio, fechaFin } = membresia;

  // Normalizar el nombre del plan para acceder al objeto beneficios
  const planKey = plan?.charAt(0).toUpperCase() + plan?.slice(1).toLowerCase();

  // Definir siguiente nivel escalable
  const next = {
    Mensual: {
      label: 'Escalar a Semestral',
      priceId: process.env.REACT_APP_STRIPE_PRICE_ID_SEMESTRAL,
    },
    Semestral: {
      label: 'Escalar a Anual',
      priceId: process.env.REACT_APP_STRIPE_PRICE_ID_ANUAL,
    },
  }[planKey];

  const beneficiosPorPlan = {
    Mensual: [
      'Acceso a clubes',
      'Descuentos exclusivos',
      'Contenido premium / secciones exclusivas de la wiki',
      'Asesoría básica legal',
      'Vende en nuestra marketplace',
      'Publica Anuncios/Contenidos/Eventos hasta 10 GB mensual',
      'Gana 15% de comisión por tus referidos',
    ],
    Semestral: [
      'Todo lo anterior',
      'Acceso a red de cultivo solidario',
      'Tramitamos tu permiso COFEPRIS, en caso de negativa',
    ],
    Anual: [
      'Si mantienes tu plan semestral por 2 semestres o contratas la anual, pagas solo $1 500 por tu amparo',
      'Te acompañamos hasta obtención de negativa de COFEPRIS (4–6 meses)',
    ],
  };

  return (
    <Box p={3} maxWidth={600} margin="0 auto">
      <Typography variant="h4" gutterBottom>Tu membresía: {planKey}</Typography>
      <Typography>
        Pagaste <strong>${monto_pagado}</strong> el{' '}
        {new Date(fechaInicio).toLocaleDateString()} —{' '}
        {new Date(fechaFin).toLocaleDateString()}
      </Typography>
      <Divider sx={{ my: 2 }} />

      <Typography variant="h6">Beneficios incluidos</Typography>
      <List dense>
        {beneficiosPorPlan[planKey]?.map((b, i) => (
          <ListItem key={i}>
            <span className="material-icons" style={{ marginRight: 8, color: '#4caf50' }}>
              check_circle
            </span>
            {b}
          </ListItem>
        ))}
      </List>

      <Box mt={4} display="flex" gap={2}>
        {/* Renueva siempre */}
        <BotonMembresia
          priceId={process.env.REACT_APP_STRIPE_PRICE_ID_MENSUAL}
          color="#A3D977"
          label="Renovar"
        />

        {/* Escalar sólo si hay siguiente nivel */}
        {next && (
          <BotonMembresia
            priceId={next.priceId}
            color="#1976d2"
            label={next.label}
          />
        )}
      </Box>
    </Box>
  );
};

export default MiMembresia;

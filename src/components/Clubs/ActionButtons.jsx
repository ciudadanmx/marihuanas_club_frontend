// src/components/ActionButtons.jsx
import React from 'react';
import { Box, Grid, Button, Paper, Typography } from '@mui/material';
import RateReviewIcon from '@mui/icons-material/RateReview';
import StarRateIcon from '@mui/icons-material/StarRate';
import { useNavigate } from 'react-router-dom';

import AddClubButton from './AddClubButton.jsx';
import ComentariosClub from './ComentariosClub.jsx';
import CalificacionesClub from './CalificacionesClub.jsx';

const BRAND_BORDER = '#6d6e71';

export default function ActionButtons({ showComments = true, showRatings = true }) {
  const navigate = useNavigate();

  return (
    <Box sx={{ width: '100%', maxWidth: 1100, mx: 'auto', p: 2 }}>
      <Grid container spacing={2}>
        {/* Botón principal reutilizable */}
        <Grid item xs={12}>
          <AddClubButton />
        </Grid>

        {/* Botones secundarios */}
        <Grid item xs={12} md={6}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<RateReviewIcon />}
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
            sx={{
              borderColor: BRAND_BORDER,
              color: BRAND_BORDER,
              py: 1.2,
              textTransform: 'none',
            }}
            aria-label="Ir a comentarios"
          >
            Ver comentarios
          </Button>
        </Grid>

        <Grid item xs={12} md={6}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<StarRateIcon />}
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
            sx={{
              borderColor: BRAND_BORDER,
              color: BRAND_BORDER,
              py: 1.2,
              textTransform: 'none',
            }}
            aria-label="Ir a calificaciones"
          >
            Ver calificaciones
          </Button>
        </Grid>

        {/* Placeholders — los puedes ocultar con props */}
        {showRatings && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, border: `1px solid ${BRAND_BORDER}` }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Calificaciones</Typography>
              <CalificacionesClub />
            </Paper>
          </Grid>
        )}

        {showComments && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, border: `1px solid ${BRAND_BORDER}` }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Comentarios</Typography>
              <ComentariosClub />
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

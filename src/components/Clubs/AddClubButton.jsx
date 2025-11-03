// src/components/AddClubButton.jsx
import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import { useNavigate } from 'react-router-dom';

const BRAND_YELLOW = '#fff200';
const BRAND_BORDER = '#6d6e71';

export default function AddClubButton({ fullWidth = true, sx = {}, textBelow = true }) {
  const navigate = useNavigate();

  return (
    <Box sx={{ width: '100%', ...sx }}>
      <Button
        variant="contained"
        fullWidth={fullWidth}
        startIcon={<AddBusinessIcon />}
        onClick={() => navigate('/agregar-club')}
        sx={{
          backgroundColor: BRAND_YELLOW,
          color: '#000',
          border: `1px solid ${BRAND_BORDER}`,
          fontWeight: 700,
          py: 1.5,
          textTransform: 'none',
          '&:hover': { filter: 'brightness(0.95)' },
        }}
        aria-label="Agregar club"
      >
        Agregar club
      </Button>

      {textBelow && (
        <Typography
          variant="caption"
          sx={{ display: 'block', mt: 1, color: 'text.secondary', lineHeight: 1.2 }}
        >
          Puedes afiliarte a este club y alojar tus plantas en el mismo con cuidados del jardinero responsable.
        </Typography>
      )}
    </Box>
  );
}

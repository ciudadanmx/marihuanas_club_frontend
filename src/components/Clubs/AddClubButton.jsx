// src/components/Clubs/AddClubButton.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRoles } from '../../Contexts/RolesContext';
import { Box, Button, Typography } from '@mui/material';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';

const BRAND_YELLOW = '#fff200';
const BRAND_BORDER = '#6d6e71';

export default function AddClubButton({ fullWidth = true, sx = {}, textBelow = true }) {
   const navigate = useNavigate();
  const location = useLocation();

  // Extrae el nombre del club de la URL actual
  // Ejemplo: /clubs/Club%20Fundacional → "Club Fundacional"
  const pathParts = location.pathname.split('/');
  const clubName = decodeURIComponent(pathParts[2] || '');
  const { userData } = useRoles();

  // Seguridad: si no hay userData, no renderiza nada
  if (!userData) return null;

  const tipoRaw = userData.membresiatipo ?? userData.attributes?.membresiatipo ?? null;
  const tipo = typeof tipoRaw === 'string' ? tipoRaw.trim().toLowerCase() : null;

      const handleNavigate = () => {
    if (clubName) {
      navigate(`/agregar-club/${encodeURIComponent(clubName)}`);
    } else {
      navigate('/agregar-club');
    }
  };

  // No mostrar nada si es jardinero o no tiene tipo
  if (!tipo || tipo === 'jardinero') return null;

  // Mostrar botón solo si es cultivo o socio
  if (tipo === 'cultivo' || tipo === 'socio') {
    return (
       <Box sx={{ width: '100%', ...sx }}>
      <Button
        variant="contained"
        fullWidth={fullWidth}
        startIcon={<AddBusinessIcon />}
        onClick={handleNavigate}
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




  
  // En cualquier otro caso, mostrar la barra naranja
  return (
    <div
      style={{
        borderRadius: 8,
        padding: '12px 16px',
        margin: '12px 0',
        background: 'linear-gradient(90deg,#ff8a00 0%, #ffb347 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}
    >
      <p
        style={{
          margin: 0,
          fontWeight: 700,
          color: '#2b2b2b',
          textAlign: 'center',
        }}
      >
        Adquiere tu Membresía de Club de Cultivo Solidario para poder afiliarte a un Club
      </p>
    </div>
  );
};
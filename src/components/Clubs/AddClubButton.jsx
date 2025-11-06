// src/components/Clubs/AddClubButton.jsx
import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useRoles } from '../../Contexts/RolesContext';
import { Box, Button, Typography } from '@mui/material';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';

const BRAND_BORDER = '#6d6e71';

export default function AddClubButton({ fullWidth = true, sx = {}, textBelow = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  const clubName = decodeURIComponent(pathParts[2] || '');
  const { userData } = useRoles();

  if (!userData) return null;

  const tipoRaw = userData.membresiatipo ?? userData.attributes?.membresiatipo ?? null;
  const tipo = typeof tipoRaw === 'string' ? tipoRaw.trim().toLowerCase() : null;

  const haveClub =
    userData.haveclub ??
    userData.attributes?.haveclub ??
    false;

  const club =
    userData.club ??
    userData.attributes?.club ??
    null;

  const handleNavigate = () => {
    if (clubName) {
      navigate(`/agregar-club/${encodeURIComponent(clubName)}`);
    } else {
      navigate('/agregar-club');
    }
  };

  const handleGoToClub = () => {
    navigate('/clubs/miclub/info');
  };

  // Si ya tiene club, mostrar la barra morada
  if (haveClub) {
    const clubNombre =
      club?.data?.attributes?.nombre ||
      club?.nombre ||
      'tu Club';

    return (
      <div
        style={{
          borderRadius: 8,
          padding: '12px 16px',
          margin: '12px 0',
          background: 'linear-gradient(90deg,#6a1b9a 0%, #8e24aa 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <p
          style={{
            margin: 0,
            fontWeight: 700,
            color: '#fff',
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          Ya estás afiliado al Club de Cultivo Solidario: {clubNombre}
        </p>

        <Button
          variant="contained"
          onClick={handleGoToClub}
          sx={{
            mt: 1,
            background: 'linear-gradient(90deg,#2e7d32 0%, #66bb6a 100%)',
            color: '#fff',
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: '10px',
            '&:hover': { filter: 'brightness(1.1)' },
          }}
        >
          Afiliarme a este Club de Cultivo
        </Button>
      </div>
    );
  }

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
            background: 'linear-gradient(90deg,#2e7d32 0%, #66bb6a 100%)',
            color: '#fff',
            border: `1px solid ${BRAND_BORDER}`,
            fontWeight: 700,
            py: 1.5,
            textTransform: 'none',
            '&:hover': { filter: 'brightness(1.1)' },
          }}
          aria-label="Agregar club"
        >
          Afiliarme a este Club de Cultivo
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

  // En cualquier otro caso, mostrar la barra naranja con link en "Adquiere tu Membresía"
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
        <Link to="/membresias" style={{ textDecoration: 'underline', color: '#2b2b2b' }}>
          Adquiere tu Membresía
        </Link>{' '}
        de Club de Cultivo Solidario para poder afiliarte a un Club
      </p>
    </div>
  );
}

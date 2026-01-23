import React from 'react'
import {
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
const PreLoader = ({texto = 'Cargando'}) => {
  return (
        <Box
          sx={{
            minHeight: '70vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              animation: 'pulseGlow 1.8s ease-in-out infinite',
              '@keyframes pulseGlow': {
                '0%': {
                  filter: 'drop-shadow(0 0 6px #39ff14)',
                  transform: 'scale(1)',
                },
                '50%': {
                  filter: 'drop-shadow(0 0 22px #39ff14)',
                  transform: 'scale(1.12)',
                },
                '100%': {
                  filter: 'drop-shadow(0 0 6px #39ff14)',
                  transform: 'scale(1)',
                },
              },
            }}
          >
            <CircularProgress
              size={72}
              thickness={4}
              sx={{
                color: '#39ff14', // verde neón 🌿
              }}
            />
          </Box>
    
          <Typography
            variant="h6"
            sx={{
              color: '#1faa00',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            {texto}
          </Typography>
        </Box>
  )
}

export default PreLoader
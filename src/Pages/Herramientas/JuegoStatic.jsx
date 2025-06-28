import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

export default function JuegoStatic() {
  const { nombre } = useParams();
  const url = `${process.env.PUBLIC_URL}/juega/${nombre}/index.html`;

  // opcional: mostrar loader mientras carga
  const [loading, setLoading] = React.useState(true);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100vh', bgcolor: '#000' }}>
      {loading && (
        <Box
          sx={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <iframe
        src={url}
        title={nombre}
        onLoad={() => setLoading(false)}
        style={{
          border: 'none',
          width: '100%',
          height: '100%',
          display: loading ? 'none' : 'block'
        }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-top-navigation-by-user-activation"
      />
    </Box>
  );
}
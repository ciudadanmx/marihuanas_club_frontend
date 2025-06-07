import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  CardMedia,
  Box,
  Button,
  Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import productoImg from '../../assets/producto.png'; // imagen de respaldo si no hay portada

const ContenidoCard = ({
  titulo,
  slug,
  autor,
  resumen,
  portada,
  categoria,
}) => {
  const imagenSrc = portada || productoImg;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        boxShadow: 3,
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.02)',
        },
      }}
    >
      <CardMedia
        component="img"
        height="160"
        image={imagenSrc}
        alt={titulo}
        sx={{ objectFit: 'cover', borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
      />

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h2" gutterBottom noWrap>
          {titulo}
        </Typography>

        <Box mb={1}>
          {categoria && (
            <Chip
              label={categoria}
              size="small"
              color="warning"
              sx={{ backgroundColor: '#fff200', fontWeight: 'bold' }}
            />
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {resumen?.substring(0, 120)}{resumen?.length > 120 ? '...' : ''}
        </Typography>

        {autor && (
          <Typography variant="caption" color="text.secondary">
            Por {autor}
          </Typography>
        )}
      </CardContent>

      <Box textAlign="center" pb={2}>
        <Button
          component={Link}
          to={`/contenido/${slug}`}
          variant="outlined"
          color="warning"
          sx={{
            borderColor: '#fff200',
            color: '#6d6e71',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#fff200',
              color: '#000',
            },
          }}
        >
          Ver más
        </Button>
      </Box>
    </Card>
  );
};

export default ContenidoCard;

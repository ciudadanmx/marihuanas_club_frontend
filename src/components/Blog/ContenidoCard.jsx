import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  CardMedia,
  Box,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import productoImg from '../../assets/producto.png';

const ContenidoCard = ({
  titulo,
  slug,
  autor,
  resumen,
  portada,
  categoria,
  fecha_publicacion,
}) => {
  const navigate = useNavigate();

  console.log('🧩 ContenidoCard props:', {
    titulo,
    slug,
    autor,
    resumen,
    portada,
    categoria,
    fecha_publicacion,
  });

  let imagenUrl = productoImg;

  if (portada) {
    imagenUrl = `${process.env.REACT_APP_STRAPI_URL}${portada}`;
    console.log(`🖼️ Portada válida para "${titulo}":`, imagenUrl);
  } else {
    console.warn(`⚠️ Portada no válida para "${titulo}", usando imagen por defecto`);
  }

  const handleClick = () => {
    navigate(`/contenido/${slug}`);
  };

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 2,
        boxShadow: 3,
        overflow: 'hidden',
      }}
    >
      <CardMedia
        component="img"
        height="180"
        image={imagenUrl}
        alt={titulo}
        sx={{ objectFit: 'cover' }}
      />

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div" gutterBottom>
          {titulo}
        </Typography>

        {autor && (
          <Typography variant="body2" color="text.secondary">
            Por: {autor}
          </Typography>
        )}

        {categoria && (
          <Typography variant="caption" color="primary" display="block">
            Categoría: {categoria}
          </Typography>
        )}

        {resumen && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {resumen.length > 120 ? resumen.substring(0, 120) + '…' : resumen}
          </Typography>
        )}

        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button onClick={handleClick} variant="outlined" size="small">
            Leer más
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ContenidoCard;
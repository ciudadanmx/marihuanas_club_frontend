import React from 'react';
import { Card, CardContent, Typography, CardMedia, Box, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import productoImg from '../../assets/producto.png';

const Star = ({ filled }) => (
  <span className={`estrella ${filled ? 'llena' : 'vacia'}`}>
    {filled ? '★' : '☆'}
  </span>
);

const ProductoCard = ({
  titulo,
  slug,
  descripcion,
  imagenes,
  imagen,
  precio,
  envioAprox,
  localidad,
  estado,
  calificacion,
  numeroCalificaciones,
  vendidos,
  total,
}) => {
  const navigate = useNavigate();

  const imagenValida = imagen && imagen !== `${process.env.REACT_APP_STRAPI_URL}` ? imagen : productoImg;

  const estrellas = [];
  if (numeroCalificaciones > 0 && calificacion) {
    const cal = Math.round(calificacion / numeroCalificaciones);
    for (let i = 1; i <= 5; i++) {
      estrellas.push(<Star key={i} filled={i <= cal} />);
    }
  }

  const handleComprar = (e) => {
    e.stopPropagation();
    navigate('/comprar');
  };

  return (
    <Card
      sx={{
        boxShadow: 6,
        borderRadius: 4,
        transition: '0.3s',
        '&:hover': { transform: 'scale(1.05)' },
        maxWidth: 300,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Enlace a la vista del producto */}
      <Link to={`/market/producto/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <Box>
          <CardMedia
            component="img"
            image={imagenValida}
            alt={titulo || 'Producto'}
            sx={{ height: 180, objectFit: 'cover', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
          />
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
              {titulo || 'Sin título'}
            </Typography>

            <Typography variant="subtitle1" color="primary" fontWeight="bold">
              {total || (precio ? `$${precio.toFixed(2)}` : 'Precio no disponible')}
            </Typography>

            {envioAprox && (
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Envío: {envioAprox}
              </Typography>
            )}

            {numeroCalificaciones > 0 && (
              <Box mt={1} display="flex" alignItems="center" gap={0.5}>
                {estrellas}
                <Typography variant="caption" color="text.secondary" ml={1}>
                  ({numeroCalificaciones})
                </Typography>
              </Box>
            )}

            {(localidad || estado) && (
              <Typography variant="body2" color="text.secondary" mt={1}>
                {localidad}{localidad && estado ? ', ' : ''}{estado}
              </Typography>
            )}

            <Typography variant="body2" color="text.secondary" mt={1}>
              Vendidos: {vendidos || 0}
            </Typography>
          </CardContent>
        </Box>
      </Link>

      {/* Botones debajo, fuera del enlace */}
      <Box display="flex" justifyContent="space-between" px={2} pb={2} gap={1}>
        <Button variant="outlined" color="secondary" fullWidth onClick={handleComprar}>
          Agregar
        </Button>
        <Button variant="contained" color="primary" fullWidth onClick={handleComprar}>
          Comprar
        </Button>
      </Box>
    </Card>
  );
};

export default ProductoCard;

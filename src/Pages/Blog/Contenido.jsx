import React from 'react';
import { useParams } from 'react-router-dom';
import { useContenido } from '../../hooks/useContenido';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Skeleton,
  Paper,
  Box,
} from '@mui/material';

const BASE_URL = process.env.REACT_APP_STRAPI_URL;

export default function Contenido() {
  const { slug } = useParams();
  const { contenidos, loading } = useContenido();

  const contenido = contenidos.find(c => c.slug === slug);

  if (loading) {
    return (
      <Box p={3}>
        <Skeleton variant="rectangular" width="100%" height={300} />
        <Skeleton width="60%" height={40} style={{ marginTop: 16 }} />
        <Skeleton width="100%" height={200} />
      </Box>
    );
  }

  if (!contenido) {
    return (
      <Paper elevation={4} sx={{ padding: 4, margin: 3 }}>
        <Typography variant="h5" color="error">
          Contenido no encontrado
        </Typography>
      </Paper>
    );
  }

  return (
    <Box p={2} display="flex" justifyContent="center">
      <Card sx={{ maxWidth: 800, width: '100%' }} elevation={6}>
        {contenido.portada && (
          <CardMedia
            component="img"
            height="400"
            image={`${BASE_URL}${contenido.portada}`}
            alt={`Portada de ${contenido.titulo}`}
          />
        )}
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            {contenido.titulo}
          </Typography>

          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Por {contenido.autor} | {contenido.fecha_publicacion}
          </Typography>

          {contenido.resumen && (
            <Typography variant="body1" color="textSecondary" sx={{ marginBottom: 2 }}>
              {contenido.resumen}
            </Typography>
          )}

          {contenido.contenido_libre && (
            <div
              dangerouslySetInnerHTML={{ __html: contenido.contenido_libre }}
              style={{ lineHeight: '1.6em' }}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

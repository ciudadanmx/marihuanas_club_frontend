import { useParams } from 'react-router-dom';
import { useContenido } from '../../hooks/useContenido';
import {
  Box,
  Container,
  Paper,
  Typography,
  Chip,
  Grid,
  CardMedia,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useEffect, useState } from 'react';
import FechaCdmx from '../../utils/FechaCdmx';

const ContenidoDetalle = () => {
  const mostrar_restringido = false;
  const { slug } = useParams();
  const { contenidos, loading } = useContenido();
  const [contenido, setContenido] = useState(null);

  useEffect(() => {
    if (contenidos.length) {
      const encontrado = contenidos.find(c => c.slug === slug);
      setContenido(encontrado);
    }
  }, [contenidos, slug]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress color="warning" />
      </Box>
    );
  }

  if (!contenido) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <Typography variant="h6">Contenido no encontrado</Typography>
      </Box>
    );
  }

  const renderGaleria = (imagenes) => (
    <Grid container spacing={2}>
      {imagenes.map((img, i) => (
        <Grid item xs={6} sm={4} key={i}>
          <CardMedia
            component="img"
            image={process.env.REACT_APP_STRAPI_URL + img}
            alt={`imagen-${i}`}
            sx={{ borderRadius: 2 }}
          />
        </Grid>
      ))}
    </Grid>
  );

  const renderVideos = (videos) => (
    <Grid container spacing={2}>
      {videos.map((video, i) => (
        <Grid item xs={12} md={6} key={i}>
          <Box
            component="iframe"
            src={video}
            width="100%"
            height="250"
            style={{ borderRadius: 8, border: 'none' }}
            allowFullScreen
            title={`video-${i}`}
          />
        </Grid>
      ))}
    </Grid>
  );

  const renderHtml = (htmlContent) => (
    <Box
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        backgroundColor: '#f9f9f9',
      }}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        {contenido.portada && (
          <CardMedia
            component="img"
            height="300"
            image={process.env.REACT_APP_STRAPI_URL + contenido.portada}
            alt={contenido.titulo}
            sx={{ borderRadius: 2, mb: 2 }}
          />
        )}

        <Typography variant="h4" gutterBottom color="primary">
          {contenido.titulo}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Publicado por: {contenido.autor}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {FechaCdmx(contenido.fecha_publicacion)}
          </Typography>
        </Box>

        {contenido.tags && (
          <Box sx={{ mb: 2 }}>
            {contenido.tags.split(',').map(tag => (
              <Chip
                key={tag}
                label={`#${tag.trim()}`}
                size="small"
                sx={{ mr: 1, mb: 1 }}
                color="warning"
              />
            ))}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Contenido Libre */}
        {contenido.contenido_libre && (
          <>
            {renderHtml(contenido.contenido_libre)}
          </>
        )}

        {/* Contenido Restringido o llamada a adquirir membresía */}
{contenido.contenido_restringido ? (
  mostrar_restringido ? (
    <>
      <Typography variant="h6" gutterBottom>
        Contenido Restringido
      </Typography>
      {renderHtml(contenido.contenido_restringido)}
    </>
  ) : (
    <Typography variant="h6" gutterBottom>
        <h1><font color="red">Contenido VIP</font></h1>
      </Typography>
  )
) : null}

        {/* Galería Libre */}
        {contenido.galeria_libre.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Galería Libre 
            </Typography>
            {renderGaleria(contenido.galeria_libre)}
          </>
        )}

        {/* Videos Libres */}
        {contenido.videos_libres.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Videos Libres
            </Typography>
            {renderVideos(contenido.videos_libres)}
          </>
        )}

        <Divider sx={{ my: 4 }} />

        

        {/* Galería Restringida */}
        {contenido.galeria_restringida.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Galería Restringida
            </Typography>
            {renderGaleria(contenido.galeria_restringida)}
          </>
        )}

        {/* Videos Restringidos */}
        {contenido.videos_restringidos.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Videos Restringidos
            </Typography>
            {renderVideos(contenido.videos_restringidos)}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default ContenidoDetalle;

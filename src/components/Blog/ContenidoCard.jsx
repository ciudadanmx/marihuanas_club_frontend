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
import BotonEditar from './BotonEditar';
import productoImg from '../../assets/producto.png';
import {
  colorControlSecundario,
  colorControlSecundarioHoover,
  botonEditor,
  botonEditorBorde,
} from '../../styles/ColoresBotones';

const ContenidoCard = ({
  titulo,
  slug,
  autor,
  autor_email,
  resumen,
  portada,
  categoria,
  fecha_publicacion,
}) => {
  const STRAPI_URL = process.env.REACT_APP_STRAPI_URL;
  const navigate = useNavigate();

  console.log('🧩 ContenidoCard props:', {
    titulo,
    slug,
    autor,
    autor_email,
    resumen,
    portada,
    categoria,
    fecha_publicacion,
  });

  // Determinar URL de media
  let mediaUrl = productoImg;
  if (portada) {
    mediaUrl = `${STRAPI_URL}${portada}`;
    console.log(`🖼️ Media válida para "${titulo}":`, mediaUrl);
  } else {
    console.warn(`⚠️ Media no válida para "${titulo}", usando imagen por defecto`);
  }

  // Detectar si es video por extensión
  const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaUrl);

  const handleClick = () => {
    navigate(`/contenido/${slug}`);
  };

  const handleEdit = () => {
    navigate(`/contenidos/editar/${slug}`);
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
      {/* Media: imagen o video responsive */}
      {isVideo ? (
        <Box
          component="video"
          src={mediaUrl}
          controls
          sx={{
            width: '100%',
            height: { xs: 120, sm: 150, md: 180 },
            objectFit: 'cover',
          }}
        />
      ) : (
        <CardMedia
          component="img"
          height="180"
          image={mediaUrl}
          alt={titulo}
          sx={{ objectFit: 'cover' }}
        />
      )}

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

        <Box display="flex" justifyContent="space-between" mt={2}>
          <BotonEditar
            handleEdit={handleEdit}
            autor_email={autor_email}
          />
          <Button
            onClick={handleClick}
            variant="outlined"
            size="small"
            sx={{
              color: botonEditor,
              borderColor: botonEditorBorde,
              '&:hover': {
                color: botonEditorBorde,
                borderColor: botonEditor,
              },
            }}
          >
            <span className="material-icons" style={{ marginRight: 4 }}>chevron_right</span>
            Leer más
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ContenidoCard;

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Chip,
  CircularProgress,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/system';
import { motion } from 'framer-motion';

const StyledCard = styled(Card)(() => ({
  position: 'relative',
  backgroundColor: '#1a1a1a',
  color: '#b8ff57',
  border: '2px solid #b8ff57',
  borderRadius: '20px',
  overflow: 'hidden',
  boxShadow: '0 0 20px #86ff81aa',
}));

export default function Evento() {
  const { slug } = useParams();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery('(max-width:600px)');
  const baseURL = process.env.REACT_APP_STRAPI_URL;

  console.log('🔥 useParams →', slug);
  console.log('🛠️ Base Strapi URL:', baseURL);

  useEffect(() => {
    const fetchEvento = async () => {
      const url = `${baseURL}/api/eventos?filters[slug][$eq]=${slug}&populate=*`;
      console.log('🛰️ Fetch URL:', url);
      try {
        const res = await fetch(url);
        const json = await res.json();
        console.log('🧩 JSON completo:', json);

        if (!json.data?.length) {
          console.warn('⚠️ No existe slug:', slug);
          setEvento(null);
        } else {
          console.log('✅ Evento attributes:', json.data[0].attributes);
          setEvento(json.data[0].attributes);
        }
      } catch (err) {
        console.error('❌ Fetch error:', err);
        setEvento(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchEvento();
    else setLoading(false);
  }, [slug, baseURL]);

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress color="success" />
        <Typography mt={2} color="white">
          Cargando evento...
        </Typography>
      </Box>
    );
  }

  if (!evento) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" color="error">
          Evento no encontrado
        </Typography>
        <Typography mt={1} color="white">
          Verifica que el slug <strong>{slug}</strong> exista.
        </Typography>
      </Box>
    );
  }

  const {
    titulo,
    descripcion,
    portada,
    imagenes,
    ciudad,
    estado,
    fecha_inicio,
    hora_inicio,
    fecha_fin,
    hora_fin,
    de_pago,
    precio,
    fechas_horarios_adicionales,
    colaboradores,
  } = evento;

  let imgs = [];
  const data = imagenes?.data;
  if (Array.isArray(data)) {
    imgs = data.map((m) => ({ id: m.id, url: `${baseURL}${m.attributes.url}` }));
  } else if (data && typeof data === 'object') {
    imgs = [{ id: data.id, url: `${baseURL}${data.attributes.url}` }];
  }
  console.log('✅ imgs normalizadas:', imgs);

  const portadaURL = portada?.data?.attributes?.url
    ? `${baseURL}${portada.data.attributes.url}`
    : null;

  return (
    <Box sx={{ p: isMobile ? 2 : 6 }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <StyledCard>
          {/* Imagen */}
          {portadaURL && (
            <CardMedia
              component="img"
              height="320"
              image={portadaURL}
              alt={titulo}
            />
          )}
          {/* Título sobrepuesto arriba */}
          {portadaURL && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                bgcolor: 'rgba(0, 0, 0, 0.6)',
                py: 1,
                px: 2,
              }}
            >
              <Typography variant="h5" sx={{ color: '#b8ff57', fontWeight: 'bold' }}>
                {titulo}
              </Typography>
            </Box>
          )}

          {/* Contenido abajo de la imagen */}
          <CardContent sx={{ pt: portadaURL ? 1 : 2 }}>
            {/* Ubicación */}
            <Typography variant="body1" sx={{ color: '#ccc', mb: 1 }}>
              {ciudad}, {estado}
            </Typography>

            {/* Precio */}
            {de_pago && (
              <Chip
                label={`$${precio} MXN`}
                sx={{ background: '#7fff8d', color: '#1a1a1a', fontWeight: 'bold', mb: 2 }}
              />
            )}

            {/* Fechas principales */}
            <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
              Fecha: {fecha_inicio} — Hora: {hora_inicio}
            </Typography>
            {fecha_fin && hora_fin && (
              <Typography variant="body2" sx={{ color: '#aaa', mb: 2 }}>
                Finaliza: {fecha_fin} — {hora_fin}
              </Typography>
            )}

            {/* Descripción Rich Text */}
            <Box sx={{ mt: 3 }}>
              {Array.isArray(descripcion) &&
                descripcion.map((block, i) => {
                  const text = block.children.map((c) => c.text).join('');
                  return (
                    <Typography key={i} variant="body1" sx={{ color: '#ddd', mb: 1 }}>
                      {text}
                    </Typography>
                  );
                })}
            </Box>

            {/* Fechas adicionales */}
            {Array.isArray(fechas_horarios_adicionales) && fechas_horarios_adicionales.length > 0 && (
              <Box mt={4}>
                <Typography variant="h6" sx={{ color: '#91ff49' }}>
                  Fechas y horarios adicionales:
                </Typography>
                {fechas_horarios_adicionales.map((f, i) => (
                  <Typography key={i} sx={{ color: '#ccc', fontSize: '0.9rem' }}>
                    {f.fecha} — {f.hora}
                  </Typography>
                ))}
              </Box>
            )}

            {/* Colaboradores */}
            {Array.isArray(colaboradores) && colaboradores.length > 0 && (
              <Box mt={4}>
                <Typography variant="h6" sx={{ color: '#91ff49', mb: 1 }}>
                  Colaboradores:
                </Typography>
                {colaboradores.map((c, i) => (
                  <Chip
                    key={i}
                    label={typeof c === 'string' ? c : c.nombre || 'Sin nombre'}
                    sx={{ background: '#252d25', color: '#b8ff57', mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}

            {/* Imágenes adicionales */}
            {imgs.length > 0 && (
              <Box mt={4}>
                <Typography variant="h6" sx={{ color: '#91ff49', mb: 1 }}>
                  Imágenes del evento:
                </Typography>
                <Box sx={{ display: 'flex', overflowX: 'auto', gap: 1, py: 1 }}>
                  {imgs.map((img) => (
                    <Box key={img.id} sx={{ minWidth: 200 }}>
                      <motion.img
                        src={img.url}
                        alt={`${titulo}`}
                        style={{
                          width: '100%',
                          borderRadius: 12,
                          objectFit: 'cover',
                          boxShadow: '0 0 10px #7fff8d44',
                        }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </StyledCard>
      </motion.div>
    </Box>
  );
}

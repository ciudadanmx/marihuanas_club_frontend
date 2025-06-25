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
  Link as MuiLink,
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

function EventoLocacion({ ciudad, estado }) {
  return (
    <Box mt={4}>
      <Typography variant="h6" sx={{ color: '#91ff49', mb: 1 }}>
        Ubicación del evento:
      </Typography>
      <Box
        sx={{
          width: '100%',
          height: 300,
          bgcolor: '#333',
          borderRadius: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#777',
          border: '1px dashed #555',
        }}
      >
        <Typography>Mapa de {ciudad}, {estado}</Typography>
      </Box>
    </Box>
  );
}

export default function Evento() {
  const { slug } = useParams();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery('(max-width:600px)');
  const baseURL = process.env.REACT_APP_STRAPI_URL;

  useEffect(() => {
    async function fetchEvento() {
      const apiURL = `${baseURL}/api/eventos?filters[slug][$eq]=${slug}&populate=*`;
      try {
        const res = await fetch(apiURL);
        const json = await res.json();
        setEvento(json.data?.[0]?.attributes ?? null);
      } catch {
        setEvento(null);
      } finally {
        setLoading(false);
      }
    }
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
    url,
    creador,
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

  // Normalizar URL (puede ser string o relación)
  const eventURL =
    typeof url === 'string'
      ? url
      : url?.data?.attributes?.url
      ? `${url.data.attributes.url.startsWith('http') ? '' : baseURL}${url.data.attributes.url}`
      : null;

  // Normalizar creador
  const organizerName =
    typeof creador === 'string'
      ? creador
      : creador?.data?.attributes?.nombre
      ? creador.data.attributes.nombre
      : null;

  // Normalizar descripción
  const rawDesc = descripcion?.data ?? descripcion;

  // Normalizar colaboradores (puede venir como objeto single o array)
  let collabs = [];
  const colData = colaboradores?.data ?? [];
  if (Array.isArray(colData)) {
    collabs = colData.map(c => c.attributes?.nombre || 'Desconocido');
  }

  // Normalizar imágenes
  let imgs = [];
  const imgData = imagenes?.data;
  if (Array.isArray(imgData)) {
    imgs = imgData.map(m => ({ id: m.id, url: `${baseURL}${m.attributes.url}` }));
  } else if (imgData?.id) {
    imgs = [{ id: imgData.id, url: `${baseURL}${imgData.attributes.url}` }];
  }

  const portadaURL = portada?.data?.attributes?.url
    ? `${baseURL}${portada.data.attributes.url}`
    : null;

  return (
    <Box sx={{ p: isMobile ? 2 : 6 }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <StyledCard>
          {portadaURL && <CardMedia component="img" height="320" image={portadaURL} alt={titulo} />}
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
          <CardContent sx={{ pt: portadaURL ? 1 : 2 }}>
            {/* Ubicación */}
            <Typography variant="body1" sx={{ color: '#ccc', mb: 1 }}>
              {ciudad}, {estado}
            </Typography>

            {/* Link */}
            <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
              <strong>Link:</strong>{' '}
              {eventURL ? (
                <MuiLink href={eventURL} target="_blank" rel="noopener" sx={{ color: '#7fff8d' }}>
                  {eventURL}
                </MuiLink>
              ) : (
                'Sin enlace'
              )}
            </Typography>

            {/* Organizador */}
            <Typography variant="body2" sx={{ color: '#aaa', mb: 2 }}>
              <strong>Organizador:</strong> {organizerName || 'Sin organizador'}
            </Typography>

            {/* Precio */}
            {de_pago && (
              <Chip label={`$${precio} MXN`} sx={{ background: '#7fff8d', color: '#1a1a1a', fontWeight: 'bold', mb: 2 }} />
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

            {/* Descripción */}
            <Box sx={{ mt: 3 }}>
              {typeof rawDesc === 'string' ? (
                <Typography variant="body1" sx={{ color: '#ddd', mb: 1 }}>
                  {rawDesc}
                </Typography>
              ) : (
                Array.isArray(rawDesc) &&
                rawDesc.map((block, i) => (
                  <Typography key={i} variant="body1" sx={{ color: '#ddd', mb: 1 }}>
                    {block.children.map(c => c.text).join('')}
                  </Typography>
                ))
              )}
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
            {collabs.length > 0 && (
              <Box mt={4}>
                <Typography variant="h6" sx={{ color: '#91ff49', mb: 1 }}>
                  Colaboradores:
                </Typography>
                {collabs.map((name, i) => (
                  <Chip key={i} label={name} sx={{ background: '#252d25', color: '#b8ff57', mr: 1, mb: 1 }} />
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
                  {imgs.map(img => (
                    <Box key={img.id} sx={{ minWidth: 200 }}>
                      <motion.img
                        src={img.url}
                        alt={titulo}
                        style={{ width: '100%', borderRadius: 12, objectFit: 'cover', boxShadow: '0 0 10px #7fff8d44' }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Placeholder para localización */}
            <EventoLocacion ciudad={ciudad} estado={estado} />
          </CardContent>
        </StyledCard>
      </motion.div>
    </Box>
  );
}

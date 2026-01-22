import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Button,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
} from '@mui/material';
import { styled } from '@mui/system';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import RoomIcon from '@mui/icons-material/Room';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import placeholder from '../../assets/placeholders/bitacoraplaceholder.jpg';

const StyledCard = styled(Card)(() => ({
  position: 'relative',
  backgroundColor: '#1a1a1a',
  color: '#b8ff57',
  border: '2px solid #b8ff57',
  borderRadius: '20px',
  overflow: 'hidden',
  boxShadow: '0 0 20px #86ff81aa',
}));

/* ===============================
   helpers de ubicación
================================ */
function parseCoords(val) {
  if (!val) return null;
  try {
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(trimmed)) {
        const [lat, lng] = trimmed.split(',').map(Number);
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) return { lat, lng };
      }
      const parsed = JSON.parse(trimmed);
      if (parsed?.lat && parsed?.lng) {
        const lat = Number(parsed.lat);
        const lng = Number(parsed.lng);
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) return { lat, lng };
      }
    }
    if (typeof val === 'object') {
      const lat = Number(val.lat ?? val.latitude);
      const lng = Number(val.lng ?? val.longitude);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) return { lat, lng };
    }
  } catch {}
  return null;
}

function BitacoraLocacion({ direccion }) {
  if (!direccion) return null;

  const attrs = direccion.attributes ?? direccion;
  const coords = parseCoords(attrs.coords ?? attrs.location);
  if (!coords) return null;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;

  return (
    <Box mt={4}>
      <Typography variant="h6" sx={{ color: '#91ff49', mb: 1 }}>
        Ubicación:
      </Typography>

      <Box
        sx={{
          width: '100%',
          height: { xs: 220, sm: 320 },
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid #444',
        }}
      >
        <iframe
          title="Mapa"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={`https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
        <Typography sx={{ color: '#ccc' }}>
          <RoomIcon sx={{ mr: 0.5 }} />
          {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
        </Typography>

        <Button
          size="small"
          startIcon={<OpenInNewIcon />}
          onClick={() => window.open(mapsUrl, '_blank')}
          sx={{ color: '#b8ff57', borderColor: '#4bff6a' }}
          variant="outlined"
        >
          Abrir Maps
        </Button>
      </Box>
    </Box>
  );
}

/* ===============================
   COMPONENTE PRINCIPAL
================================ */
export default function RegistroBitacora() {
  const { registro } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');
  const baseURL = process.env.REACT_APP_STRAPI_URL;

  const [registroData, setRegistroData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDelete, setOpenDelete] = useState(false);

  useEffect(() => {
    async function fetchRegistro() {
      try {
        const apiURL = `${baseURL}/api/registrosbitacoras?filters[timestamp][$eq]=${decodeURIComponent(
          registro
        )}&populate=*`;

        const res = await fetch(apiURL);
        const json = await res.json();

        if (json.data?.length) {
          setRegistroData({
            id: json.data[0].id,
            ...json.data[0].attributes,
          });
        } else {
          setRegistroData(null);
        }
      } catch {
        setRegistroData(null);
      } finally {
        setLoading(false);
      }
    }

    if (registro) fetchRegistro();
    else setLoading(false);
  }, [registro, baseURL]);

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress color="success" />
        <Typography mt={2} color="white">
          Cargando registro...
        </Typography>
      </Box>
    );
  }

  if (!registroData) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" color="error">
          Registro no encontrado
        </Typography>
      </Box>
    );
  }

  const fecha = new Date(registroData.timestamp);
  const hasImage = Boolean(registroData.media?.data?.[0]?.attributes?.url);

  const mediaURL = hasImage
    ? `${baseURL}${registroData.media.data[0].attributes.url}`
    : placeholder;

  const markdownTexto =
    typeof registroData.texto === 'string'
      ? registroData.texto
      : JSON.stringify(registroData.texto ?? '', null, 2);

  const tipoDic = {
    fotoplanta: 'Foto de Planta',
    registrousuario: 'Anotación de Usuario',
  };

  const tipoLabel = tipoDic[registroData.tipo] ?? registroData.tipo;
  const autorLabel = registroData.registrojardinero ? 'Jardinero' : 'Usuario';

  async function eliminarRegistro() {
    await fetch(`${baseURL}/api/registrosbitacoras/${registroData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { publishedAt: null } }),
    });
    navigate(-1);
  }

  return (
    <Box sx={{ mt: isMobile ? 0 : '-40px', p: isMobile ? 2 : 6, mb: '-60px' }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
        <StyledCard>
          {hasImage ? (
            <CardMedia component="img" height="320" image={mediaURL} />
          ) : (
            <Box sx={{ height: 56 }} />
          )}

          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              bgcolor: 'rgba(0,0,0,.6)',
              px: 2,
              py: 1,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {tipoLabel}
            </Typography>
            <Typography variant="body2">Autor: {autorLabel}</Typography>
          </Box>

          <CardContent>
            <Typography sx={{ color: '#aaa', mb: 2 }}>
              {fecha.toLocaleDateString()} — {fecha.toLocaleTimeString()}
            </Typography>

            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdownTexto}
            </ReactMarkdown>

            {Array.isArray(registroData.documentos?.data) && (
              <Box mt={3}>
                <Typography variant="h6" sx={{ color: '#91ff49' }}>
                  Documentos
                </Typography>
                {registroData.documentos.data.map(doc => (
                  <Link
                    key={doc.id}
                    href={`${baseURL}${doc.attributes.url}`}
                    target="_blank"
                    sx={{ display: 'block', color: '#7fff8d' }}
                  >
                    {doc.attributes.name}
                  </Link>
                ))}
              </Box>
            )}

            {Array.isArray(registroData.plantas?.data) && (
              <Box mt={3}>
                <Typography variant="h6" sx={{ color: '#91ff49' }}>
                  Plantas relacionadas
                </Typography>
                {registroData.plantas.data.map(p => (
                  <Link
                    key={p.id}
                    href={`/clubs/miclub/misplantas/${p.attributes.slug}`}
                    sx={{ display: 'block', color: '#7fff8d' }}
                  >
                    {p.attributes.slug}
                  </Link>
                ))}
              </Box>
            )}

            <BitacoraLocacion direccion={registroData.direccion?.data} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button color="error" onClick={() => setOpenDelete(true)}>
                Eliminar Registro
              </Button>

              <Button
                variant="contained"
                onClick={() =>
                  navigate(
                    `/club/bitacora/editar/${encodeURIComponent(
                      registroData.timestamp
                    )}`
                  )
                }
                sx={{
                  backgroundColor: '#91ff49',
                  color: '#1a1a1a',
                  fontWeight: 'bold',
                }}
              >
                Editar registro
              </Button>
            </Box>
          </CardContent>
        </StyledCard>
      </motion.div>

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Eliminar registro</DialogTitle>
        <DialogContent>
          ¿Seguro que deseas eliminar este registro?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancelar</Button>
          <Button color="error" onClick={eliminarRegistro}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

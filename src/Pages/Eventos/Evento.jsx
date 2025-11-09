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
  Button,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/system';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

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
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);
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
    description,
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

  // Normalizar descripción (ahora la convertimos a Markdown respetando saltos de línea)
  const rawDesc = description?.data ?? description;

  function blocksToMarkdown(blocks) {
    // Strapi rich text suele venir como array de bloques con children
    try {
      if (!Array.isArray(blocks)) return String(blocks ?? '');
      return blocks
        .map(b => {
          if (b.type === 'paragraph') {
            // unir los textos de los children respetando saltos
            const text = (b.children || []).map(c => c.text || '').join('');
            return text;
          }
          // manejar otros tipos sencillos
          if (b.type === 'heading') {
            const text = (b.children || []).map(c => c.text || '').join('');
            return `# ${text}`;
          }
          // fallback: concatenar todo el contenido textual
          return (b.children || []).map(c => c.text || '').join('');
        })
        .join('\n\n');
    } catch (e) {
      return String(blocks ?? '');
    }
  }

  const markdownDesc = typeof rawDesc === 'string' ? rawDesc : blocksToMarkdown(rawDesc);

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

  // --- Funciones para calendarios ---
  const openMenu = (e) => setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  function formatForGoogle(date) {
    // google acepta YYYYMMDDTHHMMSSZ
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  function buildDates() {
    // construir fechas start/end como Date
    const start = fecha_inicio ? new Date(`${fecha_inicio}T${hora_inicio ?? '00:00'}`) : null;
    let end = null;
    if (fecha_fin) {
      end = new Date(`${fecha_fin}T${hora_fin ?? hora_inicio ?? '23:59'}`);
    } else if (start) {
      end = new Date(start.getTime() + 1000 * 60 * 60 * 2); // +2 horas por defecto
    }
    return { start, end };
  }

  function openGoogleCalendar() {
    const { start, end } = buildDates();
    const dates = start && end ? `${formatForGoogle(start)}/${formatForGoogle(end)}` : '';
    const details = markdownDesc || '';
    const location = `${ciudad ?? ''}${estado ? ', ' + estado : ''}`;
    const url = `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(titulo || '')}&dates=${dates}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
    window.open(url, '_blank');
    closeMenu();
  }

  function openOutlookWeb() {
    // Outlook web (Office 365) admite rru=addevent con startdt/enddt en ISO
    const { start, end } = buildDates();
    const startISO = start ? start.toISOString() : '';
    const endISO = end ? end.toISOString() : '';
    const url = `https://outlook.live.com/owa/?rru=addevent&startdt=${encodeURIComponent(startISO)}&enddt=${encodeURIComponent(endISO)}&subject=${encodeURIComponent(titulo || '')}&body=${encodeURIComponent(markdownDesc || '')}&location=${encodeURIComponent(ciudad || '')}`;
    window.open(url, '_blank');
    closeMenu();
  }

  function downloadICS() {
    const { start, end } = buildDates();
    const dtStart = start ? start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' : '';
    const dtEnd = end ? end.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' : '';
    const uid = `${Date.now()}@evento`;
    const description = (markdownDesc || '').replace(/\n/g, '\\n');
    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MiProyecto//Eventos//ES',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `SUMMARY:${titulo || ''}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${ciudad || ''}${estado ? ', ' + estado : ''}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ];
    const icsContent = icsLines.join('\r\n');
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${(titulo || 'evento').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    closeMenu();
  }

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

            {/* Botón para agregar a calendarios */}
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="contained"
                  startIcon={<CalendarTodayIcon />}
                  onClick={openMenu}
                  sx={{
                    background: 'linear-gradient(90deg,#7fff8d,#b8ff57)',
                    color: '#1a1a1a',
                    fontWeight: '700',
                    borderRadius: 3,
                    px: 3,
                    py: 1,
                    boxShadow: '0 6px 18px #7fff8a66',
                  }}
                >
                  Agregar a calendario
                </Button>
              </motion.div>

              <Tooltip title="Abrir Google Calendar">
                <IconButton onClick={openGoogleCalendar} sx={{ bgcolor: '#222', color: '#7fff8d' }}>
                  <OpenInNewIcon />
                </IconButton>
              </Tooltip>

              <Menu anchorEl={anchorEl} open={isMenuOpen} onClose={closeMenu}>
                <MenuItem onClick={openGoogleCalendar}>Google Calendar (abrir)</MenuItem>
                <MenuItem onClick={openOutlookWeb}>Outlook / Office365 (web)</MenuItem>
                <MenuItem onClick={downloadICS}>
                  Descargar archivo .ics <DownloadIcon sx={{ ml: 1 }} />
                </MenuItem>
              </Menu>
            </Box>

            {/* Descripción (ahora respetando markdown y saltos de línea) */}
            <Box sx={{ mt: 3 }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownDesc || ''}</ReactMarkdown>
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

// src/pages/Club.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Avatar,
  Chip,
  Link as MuiLink,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlaceIcon from '@mui/icons-material/Place';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import DescriptionIcon from '@mui/icons-material/Description';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import LanguageIcon from '@mui/icons-material/Language';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import AddClubButton from '../../components/Clubs/AddClubButton.jsx';
import ComentariosClub from '../../components/Clubs/ComentariosClub.jsx';
import CalificacionesClub from '../../components/Clubs/CalificacionesClub.jsx';

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL || '';

/* Helpers */
const safeUrl = (u) => {
  if (!u) return null;
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  return `${STRAPI_URL}${u}`;
};

const extractMediaUrls = (field) => {
  if (!field) return [];
  const data = field.data ?? field;
  if (!data) return [];
  if (Array.isArray(data)) {
    return data
      .map((d) => d?.attributes?.url ?? d?.url)
      .filter(Boolean)
      .map(safeUrl);
  } else {
    const url = data?.attributes?.url ?? data?.url;
    return url ? [safeUrl(url)] : [];
  }
};

const isImage = (u = '') => /\.(jpe?g|png|webp|avif|gif|svg)(\?.*)?$/i.test(u);
const isVideo = (u = '') => /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(u);

const splitDireccion = (d) => {
  // recibe string o objeto; intentamos devolver partes ordenadas: calle, zona, ciudad, estado, pais
  if (!d) return null;
  if (typeof d === 'object') {
    // si ya viene objeto con campos comunes, devolverlo directo
    return d;
  }
  const raw = String(d);
  // quitar llaves si viene JSON en string
  try {
    const maybeJson = JSON.parse(raw);
    if (typeof maybeJson === 'object') return maybeJson;
  } catch { /* no es JSON */ }

  // separar por comas y puntos, limpiar
  const parts = raw
    .replace(/\s+/g, ' ')
    .split(/[,·•\.]+/)
    .map((p) => p.trim())
    .filter(Boolean);

  // asignaciones heurísticas
  const [calleOrPrimera, segunda, ciudad = '', estado = '', pais = ''] = parts;
  return {
    calle: calleOrPrimera || null,
    zona: segunda || null,
    ciudad: ciudad || null,
    estado: estado || null,
    pais: pais || null,
    raw: raw,
  };
};

const formatHorario = (h) => {
  if (!h) return null;
  // h expected object por días
  const daysOrder = ['lunes','martes','miércoles','jueves','viernes','sábado','domingo'];
  return daysOrder.map((d) => {
    const v = h[d] ?? h[d.toLowerCase()];
    if (!v) return { dia: d, text: 'No disponible' };
    // manejar caso "cerrado" como string o booleano
    const cerradoFlag = v.cerrado === true || String(v.abre || v.open).toLowerCase() === 'cerrado' || String(v.cierra || v.close).toLowerCase() === 'cerrado';
    if (cerradoFlag) return { dia: d, text: 'Cerrado' };
    const abre = v.abre || v.open || null;
    const cierra = v.cierra || v.close || null;
    const t = (abre && cierra) ? `${abre} — ${cierra}` : (abre ? `Abre: ${abre}` : (cierra ? `Cierra: ${cierra}` : 'Horario incompleto'));
    return { dia: d, text: t };
  });
};

const joinNonEmpty = (arr) => (arr.filter(Boolean).join(', ') || null);

/* Componente */
export default function Club() {
  const { nombre_club: nombreParam } = useParams();
  const navigate = useNavigate();

  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const safeName = nombreParam ? decodeURIComponent(nombreParam) : null;

  useEffect(() => {
    if (!safeName) {
      setError('Nombre del club no especificado');
      setLoading(false);
      return;
    }
    let mounted = true;

    const fetchClub = async () => {
      setLoading(true);
      try {
        const q = `${STRAPI_URL}/api/clubs?filters[nombre_club][$eq]=${encodeURIComponent(safeName)}&populate=*&pagination[pageSize]=1`;
        const res = await fetch(q);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const item = Array.isArray(json.data) && json.data.length > 0 ? json.data[0] : json.data;
        const attrs = item?.attributes ?? null;
        if (!attrs) {
          if (mounted) {
            setClub(null);
            setError('Club no encontrado');
          }
          return;
        }

        // normalizar medias
        const fotoUrls = extractMediaUrls(attrs.foto_de_perfil);
        const fotos = extractMediaUrls(attrs.fotos);
        const documentos = extractMediaUrls(attrs.documentos);
        const estatutos = extractMediaUrls(attrs.estatutos);
        const acta = extractMediaUrls(attrs.acta);
        const archivos_legal = extractMediaUrls(attrs.archivos_legal);

        // owner simplificado
        let owner = null;
        try {
          const userRel = attrs.users_permissions_user ?? attrs.user ?? null;
          const userData = userRel?.data ?? userRel;
          const userAttrs = userData?.attributes ?? (userData || null);
          if (userAttrs) {
            owner = {
              id: userData?.id ?? null,
              username: userAttrs.username ?? userAttrs.name ?? userAttrs.email ?? null,
              email: userAttrs.email ?? null,
            };
          }
        } catch { /* ignore */ }

        const normalized = {
          ...attrs,
          fotoUrls,
          fotos,
          documentos,
          estatutos,
          acta,
          archivos_legal,
          owner,
        };

        if (mounted) {
          setClub(normalized);
          setError(null);
        }
      } catch (err) {
        if (mounted) setError(err.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchClub();
    return () => { mounted = false; };
  }, [safeName]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 1000, mx: 'auto', p: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Volver</Button>
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography color="error">Error: {error}</Typography>
        </Paper>
      </Box>
    );
  }

  if (!club) {
    return (
      <Box sx={{ maxWidth: 1000, mx: 'auto', p: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Volver</Button>
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography>No se encontró información del club.</Typography>
        </Paper>
      </Box>
    );
  }

  // Valores seguros / transformaciones
  const showField = (v) => v !== null && v !== undefined && v !== '';
  const firstFoto = (club.fotoUrls && club.fotoUrls[0]) || null;
  const fotos = club.fotos || [];
  const documentos = club.documentos || [];
  const estatutos = club.estatutos || [];
  const acta = club.acta || [];
  const archivosLegal = club.archivos_legal || [];
  const direccionParsed = splitDireccion(club.direccion ?? club.direccion?.raw ?? null);

  // --- Horarios: ahora puede traer { consumo: {...}, cultivo: {...} } ---
  const horariosObj = club.horarios ?? club.horarios ?? {};
  const consumoHorario = horariosObj?.consumo ?? null;
  const cultivoHorario = horariosObj?.cultivo ?? null;
  const consumoFormatted = consumoHorario ? formatHorario(consumoHorario) : null;
  const cultivoFormatted = cultivoHorario ? formatHorario(cultivoHorario) : null;
  // ---------------------------------------------------------------

  const integrantes = (club.num_integrantes === null || club.num_integrantes === undefined) ? 0 : club.num_integrantes;
  const lugares = (club.lugares === null || club.lugares === undefined) ? 0 : club.lugares;
  const requiereReservacion = !!club.reservacion;
  const tipoLabel = (club.tipo === 'ambos') ? 'Cultivo y Consumo' : (club.tipo ?? null);

  // whatsapp
  const whatsappRaw = club.whatsapp ?? club.whats ?? null;
  const whatsappNumber = whatsappRaw ? String(whatsappRaw).replace(/\D/g, '') : null;
  const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber}` : null;

  // status legal resumen
  const docsCount = (documentos.length + estatutos.length + acta.length + archivosLegal.length);
  const statusSummaryParts = [];
  if (showField(club.status_legal)) statusSummaryParts.push(club.status_legal);
  statusSummaryParts.push(club.en_revision ? 'En revisión' : 'No en revisión');
  statusSummaryParts.push(club.activo ? 'Activo' : 'Inactivo');
  statusSummaryParts.push(`${docsCount} documento(s) disponibles`);
  const statusSummary = statusSummaryParts.filter(Boolean).join(' · ');

  // documentos table list
  const docsList = [
    { key: 'estatutos', label: 'Estatutos', urls: estatutos },
    { key: 'acta', label: 'Acta Constitutiva', urls: acta },
    { key: 'archivos_legal', label: 'Archivos legales', urls: archivosLegal },
    { key: 'documentos', label: 'Otros documentos', urls: documentos },
  ];

  // mostrar AddClubButton solo si tipo es 'cultivo' o 'ambos' (case-insensitive)
  const tipoRaw = String(club.tipo ?? '').toLowerCase();
  const canShowAdd = tipoRaw === 'cultivo' || tipoRaw === 'ambos';

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', p: 2 }}>
      {/* botón de afiliar solo si aplica */}
      {canShowAdd && (
        <Box sx={{ mb: 2 }}>
          <AddClubButton />
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{club.nombre_club ?? safeName}</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {typeof club.activo !== 'undefined' && (
              <Chip label={club.activo ? 'Activo' : 'Inactivo'} color={club.activo ? 'success' : 'default'} size="small" />
            )}
            {tipoLabel && <Chip label={tipoLabel} size="small" />}
            {/* Aquí unimos integrantes y lugares con la preposición "de" */}
            <Chip label={`${integrantes} integrantes de ${lugares} lugares`} size="small" />
            <Chip label={`Requiere Reservación: ${requiereReservacion ? 'Sí' : 'No'}`} size="small" />
          </Stack>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {/* Left column */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Avatar
                src={firstFoto || undefined}
                alt={club.nombre_club}
                variant="rounded"
                sx={{ width: 180, height: 140 }}
              />
              {!firstFoto && (<Typography variant="caption" color="text.secondary">Sin foto de perfil</Typography>)}

              {showField(club.nombre_titular) && (
                <Typography variant="subtitle1" sx={{ mt: 1 }}>{club.nombre_titular}</Typography>
              )}

              {/* direccion formateada */}
              {direccionParsed ? (
                <Box sx={{ mt: 1, width: '100%', wordBreak: 'break-word' }}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PlaceIcon fontSize="small" /> {joinNonEmpty([direccionParsed.calle, direccionParsed.zona, direccionParsed.ciudad, direccionParsed.estado, direccionParsed.pais]) || direccionParsed.raw}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">Dirección no disponible</Typography>
              )} 

              {/* lat/lng -> Google Maps */}
              {club.lat && club.lng && (
                <Box sx={{ mt: 1, width: '100%' }}>
                  <MuiLink
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${club.lat},${club.lng}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <PlaceIcon fontSize="small" /> Abrir en Google Maps
                  </MuiLink>
                </Box>
              )}

              {/* whatsapp */}
              {whatsappLink && (
                <Box sx={{ mt: 1, width: '100%' }}>
                  <MuiLink href={whatsappLink} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WhatsAppIcon fontSize="small" /> Contactar por WhatsApp
                  </MuiLink>
                </Box>
              )}
            </Box>
          </Paper>

          {/* horarios y estatus legal */}
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle2">Horarios</Typography>
            <Box sx={{ mt: 1 }}>
              {/* Mostramos solo las secciones que existan */}
              {consumoFormatted || cultivoFormatted ? (
                <>
                  {consumoFormatted && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>Consumo</Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableBody>
                            {consumoFormatted.map((row) => (
                              <TableRow key={`consumo-${row.dia}`}>
                                <TableCell sx={{ width: 120, textTransform: 'capitalize', borderBottom: 'none', p: 0.5 }}>{row.dia}</TableCell>
                                <TableCell sx={{ borderBottom: 'none', p: 0.5 }}>{row.text}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}

                  {cultivoFormatted && (
                    <Box sx={{ mb: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>Entrega de cosecha (cultivo)</Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableBody>
                            {cultivoFormatted.map((row) => (
                              <TableRow key={`cultivo-${row.dia}`}>
                                <TableCell sx={{ width: 120, textTransform: 'capitalize', borderBottom: 'none', p: 0.5 }}>{row.dia}</TableCell>
                                <TableCell sx={{ borderBottom: 'none', p: 0.5 }}>{row.text}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">Horarios no disponibles</Typography>
              )}
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Estatus legal</Typography>
              <Typography variant="body2">{statusSummary}</Typography>
            </Box>
          </Paper>

          {/* documentos / tabla */}
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle2">Documentos</Typography>
            <TableContainer sx={{ mt: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Disponible</TableCell>
                    <TableCell>Acción</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {docsList.map((d) => {
                    const has = (d.urls && d.urls.length > 0);
                    return (
                      <TableRow key={d.key}>
                        <TableCell sx={{ borderBottom: 'none' }}>{d.label}</TableCell>
                        <TableCell sx={{ borderBottom: 'none' }}>
                          {has ? <CheckCircleOutlineIcon color="success" /> : <HighlightOffIcon color="error" />}
                        </TableCell>
                        <TableCell sx={{ borderBottom: 'none' }}>
                          {has ? (
                            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                              {d.urls.map((u, i) => (
                                <MuiLink key={i} href={u} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ wordBreak: 'break-all' }}>
                                  {u.split('/').pop() ?? `archivo-${i + 1}`}
                                </MuiLink>
                              ))}
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="text.secondary">No disponible</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Right column */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            {showField(club.descripcion) && (
              <>
                <Typography variant="h6">Descripción</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{club.descripcion}</Typography>
              </>
            )}

            {showField(club.servicios) && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Servicios</Typography>
                <Typography variant="body2">{club.servicios}</Typography>
              </Box>
            )}

            {showField(club.productos) && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Productos</Typography>
                <Typography variant="body2">{club.productos}</Typography>
              </Box>
            )}

            {showField(club.observaciones) && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Observaciones</Typography>
                <Typography variant="body2">{club.observaciones}</Typography>
              </Box>
            )}

            {/* galería: detecta imagen/video */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhotoLibraryIcon fontSize="small" /> Galería
              </Typography>

              {fotos.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No hay fotos o videos disponibles.</Typography>
              ) : (
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  {fotos.map((u, i) => (
                    <Grid item key={`media-${i}`} xs={6} sm={4} md={3}>
                      <Paper
                        elevation={1}
                        sx={{
                          overflow: 'hidden',
                          height: 160,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        {isImage(u) ? (
                          <img src={u} alt={`media-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onClick={() => window.open(u, '_blank')} />
                        ) : isVideo(u) ? (
                          <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                            <video
                              src={u}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              controls={false}
                              preload="metadata"
                            />
                            <IconButton
                              sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.4)', color: '#fff' }}
                              onClick={() => window.open(u, '_blank')}
                            >
                              <PlayCircleOutlineIcon />
                            </IconButton>
                          </Box>
                        ) : (
                          // desconocido: mostrar enlace
                          <MuiLink href={u} target="_blank" rel="noopener noreferrer" sx={{ p: 1, wordBreak: 'break-all' }}>
                            {u.split('/').pop() ?? `media-${i + 1}`}
                          </MuiLink>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>

            {/* metadata */}
            <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {club.fecha_alta && <Chip label={`Alta: ${new Date(club.fecha_alta).toLocaleString()}`} size="small" />}
              {club.fecha_activado && <Chip label={`Activado: ${new Date(club.fecha_activado).toLocaleString()}`} size="small" />}
              {typeof club.en_revision !== 'undefined' && <Chip label={club.en_revision ? 'En revisión' : ''} size="small" />}
              {/* metadata también con "de" */}
              <Chip label={`${integrantes} integrantes de ${lugares} lugares`} size="small" />
              <Chip label={`${lugares - integrantes}  lugares disponibles`} size="small" />
            </Box>

            {/* link externo */}
            {showField(club.auth_name) && (
              <Box sx={{ mt: 2 }}>
                <MuiLink href={club.auth_name} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LanguageIcon fontSize="small" /> {club.auth_name}
                </MuiLink>
              </Box>
            )}

            {/* owner */}
            {club.owner && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption">Responsable</Typography>
                <Typography variant="body2">{club.owner.username ?? club.owner.email}</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Footer placeholders dentro del grid para mantener layout */}
        {canShowAdd && (
          <Grid item xs={12}>
            <AddClubButton />
          </Grid>
        )}

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Calificaciones</Typography>
            <CalificacionesClub />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Comentarios</Typography>
            <ComentariosClub />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

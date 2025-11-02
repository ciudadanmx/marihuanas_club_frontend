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
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlaceIcon from '@mui/icons-material/Place';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import DescriptionIcon from '@mui/icons-material/Description';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import LanguageIcon from '@mui/icons-material/Language';

import guest from '../../assets/guest.png'; // fallback
const STRAPI_URL = process.env.REACT_APP_STRAPI_URL || '';

function safeUrl(u) {
  if (!u) return null;
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  // si viene como ruta relativa de Strapi
  return `${STRAPI_URL}${u}`;
}

function extractMediaUrls(field) {
  // acepta media single o array según cómo venga desde Strapi
  if (!field) return [];
  // si viene con estructura { data: ... }
  const data = field.data ?? field;
  if (!data) return [];
  if (Array.isArray(data)) {
    return data
      .map(d => d?.attributes?.url || d?.url)
      .filter(Boolean)
      .map(safeUrl);
  } else {
    const url = data?.attributes?.url || data?.url;
    return url ? [safeUrl(url)] : [];
  }
}

function formatDatetime(d) {
  if (!d) return null;
  try {
    return new Date(d).toLocaleString();
  } catch {
    return d;
  }
}

export default function Club() {
  const { nombre_club: nombreParam } = useParams();
  const navigate = useNavigate();

  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const safeName = nombreParam ? decodeURIComponent(nombreParam) : null;

  useEffect(() => {
    console.log('🔽🔥🔥🔥iniciando club');
    if (!safeName) {
      setError('Nombre del club no especificado');
      setLoading(false);
      return;
    }

    let mounted = true;
    const fetchClub = async () => {
      setLoading(true);
      try {
        // Filtramos por nombre_club (ajusta a slug si usas slug)
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

        // normalizamos campos de media
        const fotoUrls = extractMediaUrls(attrs.foto_de_perfil);
        const fotos = extractMediaUrls(attrs.fotos);
        const documentos = extractMediaUrls(attrs.documentos);
        const estatutos = extractMediaUrls(attrs.estatutos);
        const acta = extractMediaUrls(attrs.acta);
        const archivos_legal = extractMediaUrls(attrs.archivos_legal);

        // user owner si existe
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
        } catch { /* no hacer nada */ }

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
      <Box sx={{ maxWidth: 960, mx: 'auto', p: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Volver</Button>
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography color="error">Error: {error}</Typography>
        </Paper>
      </Box>
    );
  }

  if (!club) {
    return (
      <Box sx={{ maxWidth: 960, mx: 'auto', p: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Volver</Button>
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography>No se encontró información del club.</Typography>
        </Paper>
      </Box>
    );
  }

  // helpers para mostrar solo si existe
  const showField = (v) => v !== null && v !== undefined && v !== '';
  const firstFoto = (club.fotoUrls && club.fotoUrls[0]) || null;
  const fotos = club.fotos || [];
  const documentos = club.documentos || [];
  const estatutos = club.estatutos || [];
  const acta = club.acta || [];
  const archivosLegal = club.archivos_legal || [];

  // whatsapp format
  const whatsappRaw = club.whatsapp ?? club.whats ?? null;
  const whatsappNumber = whatsappRaw ? String(whatsappRaw).replace(/\D/g, '') : null;
  const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber}` : null;

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', p: 2 }}>
        <h1>Holaaaaaaaaa</h1>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {club.nombre_club ?? safeName}
        </Typography>
        {club.activo !== undefined && (
          <Chip
            label={club.activo ? 'Activo' : 'Inactivo'}
            color={club.activo ? 'success' : 'default'}
            size="small"
            sx={{ ml: 1 }}
          />
        )}
        {club.tipo && <Chip label={club.tipo} size="small" sx={{ ml: 1 }} />}
      </Box>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {/* Left column: foto y datos principales */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Avatar
                src={firstFoto || undefined}
                alt={club.nombre_club}
                variant="rounded"
                sx={{ width: 180, height: 140 }}
              />
              {!firstFoto && (
                <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                  <Typography variant="caption">Sin foto de perfil</Typography>
                </Box>
              )}

              {showField(club.nombre_titular) && (
                <Typography variant="subtitle1" sx={{ mt: 1 }}>{club.nombre_titular}</Typography>
              )}

              {/* direccion */}
              {club.direccion && typeof club.direccion === 'object' && (
                <Box sx={{ mt: 1, width: '100%' }}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PlaceIcon fontSize="small" />{' '}
                    {[
                      club.direccion.calle,
                      club.direccion.num,
                      club.direccion.colonia,
                      club.direccion.ciudad,
                      club.direccion.estado,
                      club.direccion.codigo_postal
                    ].filter(Boolean).join(', ') || JSON.stringify(club.direccion)}
                  </Typography>
                </Box>
              )}

              {/* lat/lng -> link a Google Maps */}
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

          {/* horarios, estatus legal */}
          <Paper sx={{ p: 2, mt: 2 }}>
            {club.horarios ? (
              <>
                <Typography variant="subtitle2">Horarios</Typography>
                <Typography variant="body2">
                  {typeof club.horarios === 'string' ? club.horarios : JSON.stringify(club.horarios)}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">Horarios no disponibles</Typography>
            )}

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Estatus legal</Typography>
              {showField(club.status_legal) ? (
                <Typography variant="body2">{club.status_legal}</Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">No especificado</Typography>
              )}

              {/* archivos legales (enlaces) */}
              {archivosLegal.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DescriptionIcon fontSize="small" /> Archivos legales
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {archivosLegal.map((u, i) => (
                      <MuiLink key={i} href={u} target="_blank" rel="noopener noreferrer" underline="hover">
                        {u.split('/').pop() ?? `archivo-${i + 1}`}
                      </MuiLink>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>

          {/* documentos / estatutos / acta (enlaces) */}
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle2">Documentos</Typography>
            { (documentos.length + estatutos.length + acta.length) === 0 ? (
              <Typography variant="body2" color="text.secondary">No hay documentos publicados.</Typography>
            ) : (
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {estatutos.length > 0 && (
                  <Box>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DescriptionIcon fontSize="small" /> Estatutos
                    </Typography>
                    {estatutos.map((u, i) => (
                      <MuiLink key={`estat-${i}`} href={u} target="_blank" rel="noopener noreferrer" underline="hover" display="block">
                        {u.split('/').pop() ?? `estatuto-${i + 1}`}
                      </MuiLink>
                    ))}
                  </Box>
                )}

                {acta.length > 0 && (
                  <Box>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DescriptionIcon fontSize="small" /> Acta
                    </Typography>
                    {acta.map((u, i) => (
                      <MuiLink key={`acta-${i}`} href={u} target="_blank" rel="noopener noreferrer" display="block">
                        {u.split('/').pop() ?? `acta-${i + 1}`}
                      </MuiLink>
                    ))}
                  </Box>
                )}

                {documentos.length > 0 && (
                  <Box>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DescriptionIcon fontSize="small" /> Otros documentos
                    </Typography>
                    {documentos.map((u, i) => (
                      <MuiLink key={`doc-${i}`} href={u} target="_blank" rel="noopener noreferrer" display="block">
                        {u.split('/').pop() ?? `documento-${i + 1}`}
                      </MuiLink>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right column: descripción, servicios, fotos, metadata */}
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

            {/* fotos galer�a */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhotoLibraryIcon fontSize="small" /> Fotos
              </Typography>
              {fotos.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No hay fotos disponibles.</Typography>
              ) : (
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  {fotos.map((u, i) => (
                    <Grid item key={`foto-${i}`} xs={6} sm={4} md={3}>
                      <Paper
                        elevation={1}
                        sx={{
                          overflow: 'hidden',
                          height: 120,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        onClick={() => window.open(u, '_blank')}
                      >
                        <img src={u} alt={`foto-${i}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }} />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>

            {/* metadata: fecha alta / activado / en_revision / num_integrantes */}
            <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {club.fecha_alta && (
                <Chip label={`Alta: ${formatDatetime(club.fecha_alta)}`} size="small" />
              )}
              {club.fecha_activado && (
                <Chip label={`Activado: ${formatDatetime(club.fecha_activado)}`} size="small" />
              )}
              {club.en_revision !== undefined && (
                <Chip label={club.en_revision ? 'En revisión' : 'No en revisión'} size="small" />
              )}
              {club.num_integrantes !== undefined && (
                <Chip label={`${club.num_integrantes} integrantes`} size="small" />
              )}
            </Box>

            {/* link externo si hay auth_name o sitio */}
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
      </Grid>
    </Box>
  );
}

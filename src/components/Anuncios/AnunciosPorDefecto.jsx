import React, { useEffect, useState } from 'react';
import { useRoles } from '../../Contexts/RolesContext';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  CircularProgress,
  Tooltip,
  Divider,
  Stack,
  Chip
} from '@mui/material';
import { motion } from 'framer-motion';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EditIcon from '@mui/icons-material/Edit';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL;

/**
 * ANUNCIOS DEFAULT – versión chatbot / WhatsApp-like
 * -------------------------------------------------
 * Filosofía UX:
 * - El usuario siente que le está escribiendo a un bot (copy claro, emojis, tips).
 * - El contenido se guarda como Markdown para permitir **negritas**, _itálicas_, links y emojis 🙂🔥
 * - Un anuncio default se publica TODOS los días a la hora elegida
 *   excepto cuando hay un anuncio programado explícitamente para ese día.
 * - 1 anuncio diario máximo (la lógica de publicación vive en backend/scheduler).
 *
 * No se instala nada extra:
 * - Markdown se escribe directo en un TextField (WhatsApp-style).
 * - Duración de video se valida en frontend con metadata nativa del browser (<= 60s).
 */

export default function AnunciosPorDefecto() {
  const { userData, isActivaMembresia } = useRoles();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [defaultAd, setDefaultAd] = useState(null);

  // form
  const [tipo, setTipo] = useState('texto');
  const [cuerpo, setCuerpo] = useState('');
  const [link, setLink] = useState('');
  const [hora, setHora] = useState('12:00');
  const [file, setFile] = useState(null);
  const [fileMeta, setFileMeta] = useState({ duration: null });

  /* ------------------------------------------------------------ */
  /* FETCH DEFAULT AD                                             */
  /* ------------------------------------------------------------ */
  useEffect(() => {
    if (!isActivaMembresia() || !userData?.id) {
      setLoading(false);
      return;
    }

    const fetchDefault = async () => {
      try {
        const url = `${STRAPI_URL}/api/ads?filters[usuario][id][$eq]=${userData.id}&filters[default][$eq]=true&populate=archivo`;
        const res = await fetch(url, { credentials: 'include' });
        const json = await res.json();
        const items = (json.data || []).map(d => ({ id: d.id, ...d.attributes }));
        setDefaultAd(items[0] || null);
      } catch (e) {
        setError('No se pudo cargar tu anuncio default');
      } finally {
        setLoading(false);
      }
    };

    fetchDefault();
  }, [userData, isActivaMembresia]);

  /* ------------------------------------------------------------ */
  /* FILE HANDLING                                                */
  /* ------------------------------------------------------------ */
  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    setFile(f);

    if (f.type.startsWith('video/')) {
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.onloadedmetadata = () => {
        setFileMeta({ duration: v.duration });
      };
      v.src = URL.createObjectURL(f);
    }
  };

  const validate = () => {
    if (!cuerpo && tipo === 'texto') return 'Escribe tu mensaje 🤖';
    if (['imagen', 'texto con imagen', 'audio', 'video'].includes(tipo) && !file)
      return 'Sube el archivo correspondiente';
    if (tipo === 'video' && fileMeta.duration > 60)
      return 'El video debe durar máximo 60 segundos ⏱️';
    return null;
  };

  /* ------------------------------------------------------------ */
  /* SAVE                                                         */
  /* ------------------------------------------------------------ */
  const saveAd = async () => {
    const v = validate();
    if (v) return setError(v);

    setSaving(true);
    setError(null);

    try {
      let archivoId = null;

      if (file) {
        const fd = new FormData();
        fd.append('files', file);
        const up = await fetch(`${STRAPI_URL}/api/upload`, {
          method: 'POST',
          credentials: 'include',
          body: fd
        });
        const upJson = await up.json();
        archivoId = upJson?.[0]?.id;
      }

      const payload = {
        data: {
          tipo,
          cuerpo,
          link,
          hora,
          activo: true,
          status: 'activo',
          default: true,
          fecha_subido: new Date().toISOString(),
          usuario: userData.id,
          ...(archivoId ? { archivo: archivoId } : {})
        }
      };

      const res = await fetch(
        defaultAd?.id
          ? `${STRAPI_URL}/api/ads/${defaultAd.id}`
          : `${STRAPI_URL}/api/ads`,
        {
          method: defaultAd ? 'PUT' : 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      const json = await res.json();
      setDefaultAd({ id: json.data.id, ...json.data.attributes });

      setCuerpo('');
      setFile(null);

    } catch (e) {
      setError('Error guardando el anuncio');
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------------------------------------ */
  /* UI                                                           */
  /* ------------------------------------------------------------ */
  if (!isActivaMembresia()) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">🔒 Anuncios</Typography>
        <Typography sx={{ mt: 1 }}>Necesitas una membresía activa para publicar anuncios.</Typography>
        <Button
          href="/Membresias/ActivaTuMembresia"
          variant="contained"
          sx={{ mt: 2, bgcolor: '#7b1fa2' }}
        >
          Activar membresía
        </Button>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card sx={{ maxWidth: 720, mx: 'auto', p: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center">
            <SmartToyIcon color="secondary" />
            <Typography variant="h5">Anuncio Default</Typography>
            <Chip label="Chatbot" color="secondary" size="small" />
          </Stack>

          <Typography sx={{ mt: 1 }} color="text.secondary">
            Este es el mensaje que el bot publicará automáticamente 🤖📣
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ bgcolor: '#f3e5f5', p: 2, borderRadius: 2 }}>
            <Typography fontWeight="bold">¿Cómo funciona?</Typography>
            <ul style={{ marginTop: 8 }}>
              <li>🗓️ Tienes <b>1 anuncio por día</b>.</li>
              <li>📌 Si hay un anuncio programado, ese tiene prioridad.</li>
              <li>🤖 Si no hay anuncio ese día, el bot publica este anuncio default.</li>
              <li>⏰ Se publica todos los días a la hora que elijas.</li>
            </ul>
          </Box>

          {loading ? (
            <CircularProgress sx={{ mt: 3 }} />
          ) : (
            <>
              {defaultAd && (
                <Box sx={{ mt: 3 }}>
                  <Typography fontWeight="bold">Anuncio activo actualmente</Typography>
                  <Box sx={{ mt: 1, p: 2, bgcolor: '#ede7f6', borderRadius: 2 }}>
                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>{defaultAd.cuerpo}</Typography>
                  </Box>
                </Box>
              )}

              <Box sx={{ mt: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de anuncio</InputLabel>
                  <Select value={tipo} label="Tipo de anuncio" onChange={e => setTipo(e.target.value)}>
                    <MenuItem value="texto">Texto (WhatsApp)</MenuItem>
                    <MenuItem value="imagen">Imagen</MenuItem>
                    <MenuItem value="texto con imagen">Texto + Imagen</MenuItem>
                    <MenuItem value="audio">Audio</MenuItem>
                    <MenuItem value="video">Video (≤ 60s)</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Mensaje del anuncio"
                  multiline
                  minRows={4}
                  fullWidth
                  value={cuerpo}
                  onChange={e => setCuerpo(e.target.value)}
                  sx={{ mt: 2 }}
                  placeholder={`Escribe como WhatsApp 😎\n\nEjemplo:\n**Promo hoy** 🔥\n2x1 en flores 🌿`}
                />

                <Tooltip title="Puedes usar **negritas**, emojis 😍 y links">
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <EmojiEmotionsIcon fontSize="small" />
                    <Typography variant="caption">Markdown simple estilo chat</Typography>
                  </Stack>
                </Tooltip>

                <TextField
                  label="Link (opcional)"
                  fullWidth
                  value={link}
                  onChange={e => setLink(e.target.value)}
                  sx={{ mt: 2 }}
                />

                <TextField
                  label="Hora de publicación diaria"
                  type="time"
                  value={hora}
                  onChange={e => setHora(e.target.value)}
                  sx={{ mt: 2 }}
                  inputProps={{ step: 60 }}
                />

                {tipo !== 'texto' && (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      component="label"
                      variant="contained"
                      startIcon={<CloudUploadIcon />}
                      sx={{ bgcolor: '#7b1fa2' }}
                    >
                      Subir archivo
                      <input hidden type="file" onChange={handleFile} />
                    </Button>
                  </Box>
                )}

                {error && (
                  <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>
                )}

                <Button
                  onClick={saveAd}
                  disabled={saving}
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, bgcolor: '#6a1b9a' }}
                >
                  {defaultAd ? 'Reemplazar anuncio default' : 'Guardar anuncio default'}
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

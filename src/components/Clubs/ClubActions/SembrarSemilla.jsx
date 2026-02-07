import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Avatar,
  CircularProgress,
  Typography,
  IconButton,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion } from 'framer-motion';
import { useRoles } from '../../../Contexts/RolesContext'; // Ajusta la ruta si tu contexto está en otra carpeta

/**
 * SembrarSemilla
 * Props: { idplanta, user }
 * - idplanta: ID de la planta en Strapi
 * - user: auth0 user (opcional, el chequeo se hace con useRoles())
 *
 * Requisitos implementados:
 * - Verifica acceso: isJardinero() && plant.club === userData.club
 * - Formulario para:
 *    - fotos (media)
 *    - observaciones
 *    - fecha y hora (campo `fecha`) (input datetime-local)
 *    - timestamp (se adiciona con la fecha actual al payload)
 *    - toggle `desechar` (default: false)
 *    - toggle `germinada` (default: false) — cuando se activa se marcará planta.viva = true
 * - Al crear registro en `registrosbitacoras` también actualiza la planta con los cambios de status/viva/codigo
 */

const STRAPI = process.env.REACT_APP_STRAPI_URL;
const STRAPI_TOKEN = process.env.REACT_APP_STRAPI_TOKEN || null;

function extractRelId(rel) {
  if (!rel) return null;
  if (typeof rel === 'number') return rel;
  if (rel.id) return rel.id;
  if (rel.data) {
    if (Array.isArray(rel.data)) return rel.data[0]?.id ?? null;
    return rel.data.id ?? null;
  }
  return null;
}

export default function SembrarSemilla({ idplanta, user }) {
  const { userData, isJardinero } = useRoles();
  const [loading, setLoading] = useState(true);
  const [plant, setPlant] = useState(null);
  const [accessError, setAccessError] = useState(null);

  // Form
  const [photoFiles, setPhotoFiles] = useState([]);
  const [observaciones, setObservaciones] = useState('');
  const [fecha, setFecha] = useState(() => {
    // input type datetime-local expects YYYY-MM-DDTHH:mm
    const d = new Date();
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    return local;
  });
  const [desechar, setDesechar] = useState(false);
  const [germinada, setGerminada] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetchPlantAndCheck() {
      try {
        if (!STRAPI) throw new Error('REACT_APP_STRAPI_URL no configurada');
        if (!idplanta) throw new Error('No se recibió idplanta');

        const headers = {};
        if (STRAPI_TOKEN) headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;

        // Traer planta con populate completo (usuario, club, etc.)
        const res = await fetch(`${STRAPI}/api/plantas/${idplanta}?populate=usuario,club`, { headers });
        if (!res.ok) {
          if (res.status === 404) throw new Error('Planta no encontrada');
          throw new Error(`Error al traer planta: ${res.status}`);
        }
        const json = await res.json();
        const data = json?.data;
        if (!data) throw new Error('Planta no encontrada');

        const normalized = { id: data.id, ...(data.attributes || {}) };

        if (!mounted) return;
        setPlant(normalized);

        // Chequeo de permisos
        // 1) isJardinero
        if (typeof isJardinero === 'function' && !isJardinero()) {
          setAccessError('No tienes permiso (no eres jardinero).');
          return;
        }

        // 2) club match
        const userClubId = extractRelId(userData?.club);
        const plantClubId = extractRelId(normalized?.club);
        if (!userClubId) {
          setAccessError('Tu usuario no está asociado a ningún club.');
          return;
        }
        if (!plantClubId || String(userClubId) !== String(plantClubId)) {
          setAccessError('No tienes permiso para ver este recurso (club distinto).');
          return;
        }

        setAccessError(null);
      } catch (err) {
        console.error(err);
        if (mounted) setAccessError(err.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchPlantAndCheck();
    return () => (mounted = false);
  }, [idplanta, userData, isJardinero]);

  function handlePhotoChange(e) {
    const chosen = Array.from(e.target.files || []);
    const next = chosen.map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    setPhotoFiles((prev) => [...prev, ...next]);
  }
  function removePhoto(idx) {
    setPhotoFiles((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[idx].preview);
      copy.splice(idx, 1);
      return copy;
    });
  }

  async function uploadFiles(list) {
    if (!list || list.length === 0) return [];
    const form = new FormData();
    list.forEach((i) => form.append('files', i.file));
    const headers = {};
    if (STRAPI_TOKEN) headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
    const res = await fetch(`${STRAPI}/api/upload`, { method: 'POST', headers, body: form });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Error subiendo archivos: ${res.status} ${txt}`);
    }
    const uploaded = await res.json();
    return Array.isArray(uploaded) ? uploaded.map((u) => u.id) : (uploaded?.data || []).map((u) => u.id);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!plant || !plant.id) throw new Error('Planta no disponible');
      // 1) upload photos
      const photoIds = await uploadFiles(photoFiles);

      // 2) build registro payload
      const nowISO = new Date().toISOString();
      // Fecha del input: convertir a ISO (asumiendo input en local)
      let fechaISO = null;
      if (fecha) {
        // fecha value like YYYY-MM-DDTHH:mm
        const local = new Date(fecha);
        fechaISO = new Date(local.getTime() - local.getTimezoneOffset() * 60000).toISOString();
      }

      const registroPayload = {
        data: {
          media: photoIds,
          observaciones: observaciones || '',
          fecha: fechaISO,
          timestamp: nowISO,
          plantas: [plant.id],
          usuario: extractRelId(plant.usuario) || null,
          usuario_email: plant.usuario_email || plant.usuario_email || (plant.usuario?.email ?? null) || null,
          codigo: plant.codigo || null,
          // añadir campos adicionales si tu modelo los requiere
        },
      };

      const headersCreate = { 'Content-Type': 'application/json' };
      if (STRAPI_TOKEN) headersCreate['Authorization'] = `Bearer ${STRAPI_TOKEN}`;

      const createRes = await fetch(`${STRAPI}/api/registrosbitacoras`, {
        method: 'POST',
        headers: headersCreate,
        body: JSON.stringify(registroPayload),
      });

      if (!createRes.ok) {
        const txt = await createRes.text();
        throw new Error(`Error creando registro: ${createRes.status} ${txt}`);
      }

      const created = await createRes.json();

      // 3) actualizar planta según toggles
      let newStatus = 'germinando';
      const updateObj = { data: {} };

      if (desechar) {
        newStatus = 'semilladescartada';
        updateObj.data.semilla = false;
        // dejar en draft
        updateObj.data.publishedAt = null;
      } else {
        if (germinada) {
          newStatus = 'germinada';
          updateObj.data.viva = true;
        } else {
          newStatus = 'germinando';
        }
      }

      updateObj.data.status = newStatus;

      const headersUpdate = { 'Content-Type': 'application/json' };
      if (STRAPI_TOKEN) headersUpdate['Authorization'] = `Bearer ${STRAPI_TOKEN}`;

      const updRes = await fetch(`${STRAPI}/api/plantas/${plant.id}`, {
        method: 'PUT',
        headers: headersUpdate,
        body: JSON.stringify(updateObj),
      });

      if (!updRes.ok) {
        const txt = await updRes.text();
        console.warn('Warning: fallo al actualizar planta:', updRes.status, txt);
        alert('Registro creado pero falló la actualización de la planta. Revisa logs.');
      } else {
        const updJson = await updRes.json();
        setPlant({ id: updJson.data.id, ...(updJson.data.attributes || {}) });
      }

      // limpiar
      photoFiles.forEach((p) => URL.revokeObjectURL(p.preview));
      setPhotoFiles([]);
      setObservaciones('');
      setDesechar(false);
      setGerminada(false);

      alert('Registro de siembra creado correctamente 🌱');
    } catch (err) {
      console.error(err);
      setError(err.message || String(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress />
    </Box>
  );

  if (accessError) return (
    <Box sx={{ maxWidth: 720, mx: 'auto', p: 4 }}>
      <Typography variant="h6" color="error" sx={{ mb: 2 }}>Acceso denegado</Typography>
      <Typography>{accessError}</Typography>
    </Box>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 720, mx: 'auto', p: 3, boxShadow: 4, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ mb: 1 }}>Sembrar semilla — {plant?.nombre || `Planta ${plant?.id}`}</Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>ID: {plant?.id} {plant.codigo ? `• Código: ${plant.codigo}` : ''}</Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControlLabel control={<Switch checked={desechar} onChange={(e) => setDesechar(e.target.checked)} />} label={desechar ? 'Desechada' : 'Desechar'} />

          <FormControlLabel control={<Switch checked={germinada} onChange={(e) => setGerminada(e.target.checked)} />} label={germinada ? 'Germinada' : 'Germinando'} sx={{ '.MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#00ff6a' } }} />
        </Box>

        <TextField label="Observaciones" multiline minRows={3} fullWidth value={observaciones} onChange={(e) => setObservaciones(e.target.value)} sx={{ mb: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Fecha y hora (actividad)</Typography>
          <TextField type="datetime-local" fullWidth value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Fotos (opcional)</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <label>
              <input accept="image/*" style={{ display: 'none' }} multiple type="file" onChange={handlePhotoChange} />
              <Button component="span" startIcon={<AddPhotoAlternateIcon />} sx={{ bgcolor: '#6a00ff', color: '#fff', '&:hover': { bgcolor: '#5200cc' } }}>Agregar fotos</Button>
            </label>

            {photoFiles.map((p, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar variant="rounded" src={p.preview} sx={{ width: 88, height: 64 }} />
                <IconButton size="small" onClick={() => removePhoto(idx)}><DeleteIcon /></IconButton>
              </Box>
            ))}
          </Box>
        </Box>

        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

        <Button type="submit" fullWidth disabled={submitting} startIcon={<SaveIcon />} sx={{ py: 1.4, bgcolor: '#00ff6a', color: '#003300', fontWeight: 'bold', '&:hover': { bgcolor: '#00e65f' } }}>{submitting ? 'Guardando…' : 'Guardar registro'}</Button>
      </Box>
    </motion.div>
  );
}

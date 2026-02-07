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
import { useRoles } from '../../../Contexts/RolesContext'; // ajusta la ruta si es necesario

const STRAPI = process.env.REACT_APP_STRAPI_URL;
const STRAPI_TOKEN = process.env.REACT_APP_STRAPI_TOKEN || null;

function extractRelId(rel) {
  if (!rel) return null;
  if (typeof rel === 'number') return rel;
  if (rel?.id) return rel.id;
  if (rel?.data) {
    if (Array.isArray(rel.data)) return rel.data[0]?.id ?? null;
    return rel.data.id ?? null;
  }
  return null;
}

function incrementLettersBase26(s) {
  if (!s) return 'a';
  const arr = s.toLowerCase().split('').map((c) => c.charCodeAt(0) - 97);
  let i = arr.length - 1;
  let carry = 1;
  while (i >= 0 && carry) {
    arr[i] += carry;
    if (arr[i] >= 26) {
      arr[i] = 0;
      carry = 1;
    } else {
      carry = 0;
    }
    i -= 1;
  }
  if (carry) arr.unshift(0);
  return arr.map((n) => String.fromCharCode(97 + n)).join('');
}

function parseAndIncCodeSegment(code) {
  // code like: ...-rojo-a01
  if (!code || typeof code !== 'string') return null;
  const parts = code.split('-');
  const last = parts[parts.length - 1];
  // separate trailing two digits
  const match = last.match(/^([a-zA-Z]+)(\d{2})$/);
  if (!match) return null;
  const letters = match[1].toLowerCase();
  const digits = match[2];
  const inc = incrementLettersBase26(letters);
  const newLast = `${inc}${digits}`;
  parts[parts.length - 1] = newLast;
  return parts.join('-');
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

function conjugateToPast(verbo) {
  if (!verbo) return 'esquejado';
  const v = verbo.trim().toLowerCase();
  if (v.endsWith('ar')) return v.slice(0, -2) + 'ada';
  if (v.endsWith('ear')) return v.slice(0, -3) + 'eada';
  // fallback: append 'ada'
  return v + 'ada';
}

export default function Esquejear({ idplanta, verbo = 'esquejeando' }) {
  const { userData, isJardinero } = useRoles();
  const [loading, setLoading] = useState(true);
  const [plant, setPlant] = useState(null);
  const [accessError, setAccessError] = useState(null);

  // form
  const [photoFiles, setPhotoFiles] = useState([]);
  const [observaciones, setObservaciones] = useState('');
  const [vivaFirme, setVivaFirme] = useState(false); // default en proceso (false)
  const [desechar, setDesechar] = useState(false);
  const [fechaInicioVida, setFechaInicioVida] = useState('');

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

        // permissions
        if (typeof isJardinero === 'function' && !isJardinero()) {
          setAccessError('No tienes permiso (no eres jardinero).');
          return;
        }
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

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!plant || !plant.id) throw new Error('Planta no disponible');

      // upload photos
      const photoIds = await uploadFiles(photoFiles);

      // take codigo from plant (if any)
      const codigoOriginal = plant.codigo || '';
      const newCodigo = parseAndIncCodeSegment(codigoOriginal) || `${plant.usuario_email || 'anon'}-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}-a01`;

      // decide statuses
      const nonVivaStatus = verbo || 'esquejeando';
      const vivaStatus = conjugateToPast(verbo || 'esquejar');

      // build registro payload
      const nowISO = new Date().toISOString();
      const registroPayload = {
        data: {
          media: photoIds,
          observaciones: observaciones || '',
          timestamp: nowISO,
          status: vivaFirme ? vivaStatus : nonVivaStatus,
          codigoplanta: newCodigo,
          plantas: [plant.id],
          usuario: extractRelId(plant.usuario) || null,
          usuario_email: plant.usuario_email || plant.usuario?.email || null,
          club: extractRelId(plant.club) || null,
          registroJardinero: true,
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

      // If vivaFirme -> create a new planta entry
      let createdPlant = null;
      if (vivaFirme) {
        const plantPayload = {
          data: {
            codigo: newCodigo,
            origen: 'esqueje',
            media: photoIds,
            fecha_inicia_vidas: fechaInicioVida || null,
            semilla: false,
            status: vivaStatus,
            viva: true,
            usuario: extractRelId(plant.usuario) || null,
            usuario_email: plant.usuario_email || plant.usuario?.email || null,
            club: extractRelId(plant.club) || null,
            galleria: photoIds,
          },
        };

        const createPlantRes = await fetch(`${STRAPI}/api/plantas`, {
          method: 'POST',
          headers: headersCreate,
          body: JSON.stringify(plantPayload),
        });

        if (!createPlantRes.ok) {
          const txt = await createPlantRes.text();
          console.warn('Warning: falló crear nueva planta:', createPlantRes.status, txt);
          // No rethrow: el registro ya fue creado
        } else {
          const cp = await createPlantRes.json();
          createdPlant = cp.data;
        }
      } else {
        // If not vivaFirme, update original plant status to non-vivaStatus
        const updateObj = { data: { status: nonVivaStatus } };
        const updRes = await fetch(`${STRAPI}/api/plantas/${plant.id}`, {
          method: 'PUT',
          headers: headersCreate,
          body: JSON.stringify(updateObj),
        });
        if (!updRes.ok) {
          const txt = await updRes.text();
          console.warn('Warning: fallo actualizar planta:', updRes.status, txt);
        }
      }

      // cleanup
      photoFiles.forEach((p) => URL.revokeObjectURL(p.preview));
      setPhotoFiles([]);
      setObservaciones('');
      setVivaFirme(false);
      setDesechar(false);
      setFechaInicioVida('');

      alert('Esqueje procesado correctamente 🌿');
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
        <Typography variant="h5" sx={{ mb: 1 }}>Esquejear — {plant?.nombre || `Planta ${plant?.id}`}</Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>ID: {plant?.id} {plant.codigo ? `• Código: ${plant.codigo}` : ''}</Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControlLabel control={<Switch checked={desechar} onChange={(e) => setDesechar(e.target.checked)} />} label={desechar ? 'Desechada' : 'Desechar'} />

          <FormControlLabel control={<Switch checked={vivaFirme} onChange={(e) => setVivaFirme(e.target.checked)} />} label={vivaFirme ? 'Viva y firme' : 'En proceso'} sx={{ '.MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#00ff6a' } }} />
        </Box>

        {vivaFirme && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Fecha y hora inicio de vida</Typography>
            <TextField type="datetime-local" fullWidth value={fechaInicioVida} onChange={(e) => setFechaInicioVida(e.target.value)} />
          </Box>
        )}

        <TextField label="Observaciones" multiline minRows={3} fullWidth value={observaciones} onChange={(e) => setObservaciones(e.target.value)} sx={{ mb: 2 }} />

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

        <Button type="submit" fullWidth disabled={submitting} startIcon={<SaveIcon />} sx={{ py: 1.4, bgcolor: '#00ff6a', color: '#003300', fontWeight: 'bold', '&:hover': { bgcolor: '#00e65f' } }}>{submitting ? 'Procesando…' : 'Procesar esqueje'}</Button>
      </Box>
    </motion.div>
  );
}

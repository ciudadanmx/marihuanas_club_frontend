// EditarRegistroBitacora.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/system';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const neon = '#b8ff57';
const neonSoft = '#91ff49';

const Contenedor = styled(Box)({
  background: '#0b140b',
  color: neon,
  padding: '2rem',
  borderRadius: '20px',
  border: `2px solid ${neon}`,
  boxShadow: '0 0 25px #86ff81aa',
  maxWidth: 800,
  margin: 'auto',
});

const TIPOS = {
  fotoplanta: 'Foto de Planta',
  registrousuario: 'Anotación de Usuario',
};

export default function EditarRegistroBitacora() {
  const { registro } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const baseURL = process.env.REACT_APP_STRAPI_URL;

  const [registroData, setRegistroData] = useState(null);
  const [form, setForm] = useState({ tipo: '', texto: '' });
  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [docsNuevos, setDocsNuevos] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    async function fetchRegistro() {
      const res = await fetch(
        `${baseURL}/api/registrosbitacoras?filters[timestamp][$eq]=${decodeURIComponent(
          registro
        )}&populate=*`
      );
      const json = await res.json();
      if (!json.data?.length) return;

      const r = json.data[0];
      setRegistroData({ id: r.id, ...r.attributes });
      setForm({ tipo: r.attributes.tipo || '', texto: r.attributes.texto || '' });

      const img = r.attributes.media?.data?.[0];
      if (img) setImagenPreview(`${baseURL}${img.attributes.url}`);

      setDocumentos(r.attributes.documentos?.data || []);
    }

    fetchRegistro();
  }, [registro, baseURL]);

  if (registroData?.registrojardinero) {
    return (
      <Contenedor>
        <Typography variant="h5" sx={{ color: neon }}>
          No tienes permiso para modificar este registro ya que fue creado por el
          Jardinero del Club
        </Typography>
      </Contenedor>
    );
  }

  if (!registroData) return null;

  const handleInput = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleImagen = (e) => {
    const file = e.target.files[0];
    setImagen(file);
    setImagenPreview(URL.createObjectURL(file));
  };

  const handleDocsAdd = (e) =>
    setDocsNuevos((p) => [...p, ...Array.from(e.target.files || [])]);

  const eliminarDoc = (id) =>
    setDocumentos((p) => p.filter((d) => d.id !== id));

  const eliminarDocNuevo = (idx) =>
    setDocsNuevos((p) => p.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    try {
      const fd = new FormData();

      fd.append(
        'data',
        JSON.stringify({
          tipo: form.tipo,
          texto: form.texto,
          documentos: documentos.map((d) => d.id),
          media: imagen ? null : undefined,
        })
      );

      if (imagen) fd.append('files.media', imagen);
      docsNuevos.forEach((d) => fd.append('files.documentos', d));

      const res = await fetch(
        `${baseURL}/api/registrosbitacoras/${registroData.id}`,
        { method: 'PUT', body: fd }
      );

      if (!res.ok) throw new Error();

      enqueueSnackbar('Registro actualizado', { variant: 'success' });
      navigate(-1);
    } catch {
      enqueueSnackbar('Error al guardar', { variant: 'error' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
      <Contenedor>
        <Typography variant="h4" sx={{ color: neon, mb: 2 }}>
          Editar Registro
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            select
            name="tipo"
            label="Tipo"
            value={form.tipo}
            onChange={handleInput}
            fullWidth
            sx={campo}
          >
            {Object.entries(TIPOS).map(([k, v]) => (
              <MenuItem key={k} value={k} sx={{ color: neon }}>
                {v}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            multiline
            rows={6}
            name="texto"
            label="Contenido"
            value={form.texto}
            onChange={handleInput}
            fullWidth
            sx={campo}
          />

          {/* IMAGEN */}
          <Box my={2}>
            <Button component="label" variant="outlined" sx={btnOutline}>
              Cambiar imagen
              <input hidden type="file" accept="image/*" onChange={handleImagen} />
            </Button>
            {imagenPreview && (
              <Box mt={1}>
                <img src={imagenPreview} alt="" style={{ maxHeight: 140 }} />
              </Box>
            )}
          </Box>

          {/* DOCUMENTOS */}
          <Box my={2}>
            <Typography sx={{ color: neon }}>Documentos</Typography>

            {documentos.map((d) => (
              <Box key={d.id} sx={filaDoc}>
                <Button
                  size="small"
                  startIcon={<OpenInNewIcon />}
                  onClick={() =>
                    window.open(`${baseURL}${d.attributes.url}`, '_blank')
                  }
                  sx={{ color: neon }}
                >
                  {d.attributes.name}
                </Button>
                <IconButton onClick={() => eliminarDoc(d.id)} sx={{ color: neon }}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}

            {docsNuevos.map((d, i) => (
              <Box key={i} sx={filaDoc}>
                <Typography sx={{ color: neonSoft }}>{d.name}</Typography>
                <IconButton onClick={() => eliminarDocNuevo(i)} sx={{ color: neon }}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}

            <Button component="label" variant="outlined" sx={{ ...btnOutline, mt: 1 }}>
              Agregar documentos
              <input hidden type="file" multiple onChange={handleDocsAdd} />
            </Button>
          </Box>

          <Button
            type="submit"
            variant="contained"
            disabled={enviando}
            sx={{
              background: neonSoft,
              color: '#000',
              fontWeight: 'bold',
            }}
          >
            Guardar cambios
          </Button>
        </form>
      </Contenedor>
    </motion.div>
  );
}

/* ===============================
   ESTILOS
================================ */
const campo = {
  my: 2,
  '& label': { color: '#9aff8a' },
  '& input, & textarea': { color: '#b8ff57' },
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: '#b8ff57' },
    '&:hover fieldset': { borderColor: '#91ff49' },
    '&.Mui-focused fieldset': { borderColor: '#91ff49' },
  },
};

const btnOutline = {
  borderColor: '#b8ff57',
  color: '#b8ff57',
  '&:hover': { borderColor: '#91ff49' },
};

const filaDoc = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 1,
};

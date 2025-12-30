import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/system';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import DeleteIcon from '@mui/icons-material/Delete';

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

export default function AgregarRegistroBitacora() {
  const { enqueueSnackbar } = useSnackbar();
  const baseURL = process.env.REACT_APP_STRAPI_URL;

  const [form, setForm] = useState({
    tipo: '',
    texto: '',
    plantasSlug: '',
  });

  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [enviando, setEnviando] = useState(false);

  const handleInput = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleImagen = (e) => {
    const file = e.target.files[0] || null;
    setImagen(file);
    setImagenPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleDocsAdd = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setDocumentos((p) => [...p, ...files]);
  };

  const eliminarDoc = (idx) =>
    setDocumentos((p) => p.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.tipo || !form.texto.trim()) {
      enqueueSnackbar('Completa el tipo y el contenido del registro', {
        variant: 'error',
      });
      return;
    }

    setEnviando(true);

    try {
      const timestamp = new Date().toISOString();

      const data = {
        tipo: form.tipo,
        texto: form.texto,
        timestamp,
        registrojardinero: false,
      };

      if (form.plantasSlug) {
        data.plantas_slug = form.plantasSlug;
      }

      const fd = new FormData();
      fd.append('data', JSON.stringify(data));

      if (imagen) {
        fd.append('files.media', imagen);
      }

      documentos.forEach((doc) => {
        fd.append('files.documentos', doc);
      });

      const res = await fetch(`${baseURL}/api/registrosbitacoras`, {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) throw new Error();

      enqueueSnackbar('Registro agregado a la bitácora', {
        variant: 'success',
      });

      // reset
      setForm({ tipo: '', texto: '', plantasSlug: '' });
      setImagen(null);
      setImagenPreview(null);
      setDocumentos([]);
    } catch {
      enqueueSnackbar('Error al guardar el registro', { variant: 'error' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
      <Contenedor>
        <Typography variant="h4" sx={{ mb: 2, color: neon }}>
          Agregar Registro a Bitácora
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* TIPO */}
          <TextField
            select
            name="tipo"
            label="Tipo de registro"
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

          {/* TEXTO */}
          <TextField
            multiline
            rows={6}
            name="texto"
            label="Contenido del registro"
            value={form.texto}
            onChange={handleInput}
            fullWidth
            sx={campo}
          />

          {/* PLANTA */}
          <TextField
            name="plantasSlug"
            label="Slug de planta (opcional)"
            value={form.plantasSlug}
            onChange={handleInput}
            fullWidth
            sx={campo}
            placeholder="ciudadanmx-gmail.com-2025-09-17-01-00-rojo"
          />

          {/* IMAGEN */}
          <Box my={2}>
            <Button component="label" variant="outlined" sx={btnOutline}>
              Subir imagen
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

            {documentos.map((d, i) => (
              <Box key={i} sx={filaDoc}>
                <Typography sx={{ color: neonSoft }}>{d.name}</Typography>
                <IconButton onClick={() => eliminarDoc(i)} sx={{ color: neon }}>
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
              mt: 3,
              background: neonSoft,
              color: '#000',
              fontWeight: 'bold',
              boxShadow: `0 0 10px ${neonSoft}`,
            }}
          >
            {enviando ? 'Guardando…' : 'Guardar registro'}
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

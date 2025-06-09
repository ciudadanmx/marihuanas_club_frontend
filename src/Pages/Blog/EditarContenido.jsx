import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContenido } from '../../hooks/useContenido';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Stack,
} from '@mui/material';

const EditarContenido = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const {
    contenidos,
    categorias,
    loading,
    editarContenido,
    eliminarContenido,
  } = useContenido();

  const [contenido, setContenido] = useState(null);
  const [form, setForm] = useState({
    titulo: '',
    contenido_libre: '',
    contenido_restringido: '',
    tags: '',
    categoria: '',
  });
  const [media, setMedia] = useState({
    portada: null,
    galeria_libre: [],
    galeria_restringida: [],
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (contenidos.length) {
      const encontrado = contenidos.find((c) => c.slug === slug);
      if (encontrado) {
        setContenido(encontrado);
        setForm({
          titulo: encontrado.titulo || '',
          contenido_libre: encontrado.contenido_libre || '',
          contenido_restringido: encontrado.contenido_restringido || '',
          tags: (encontrado.tags || '').split(',').join(', '),
          categoria: String(encontrado.categoria?.id || ''),
        });
      }
    }
  }, [contenidos, slug]);

  if (loading || !contenido) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'portada') {
      setMedia((m) => ({ ...m, portada: files }));
    } else {
      setMedia((m) => ({ ...m, [name]: Array.from(files) }));
    }
  };

  const handleGuardar = async () => {
    setSaving(true);
    try {
      await editarContenido(contenido.id, form, media);
      navigate(`/contenido/${contenido.slug}`);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelar = () => {
    navigate(-1);
  };

  const handleEliminar = async () => {
    if (window.confirm('¿Seguro que deseas eliminar este contenido?')) {
      setDeleting(true);
      try {
        await eliminarContenido(contenido.id);
        navigate('/contenidos');
      } catch (err) {
        console.error(err);
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Editar Contenido
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <TextField
            label="Título"
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Contenido Libre"
            name="contenido_libre"
            value={form.contenido_libre}
            onChange={handleChange}
            multiline
            rows={4}
            fullWidth
          />
          <TextField
            label="Contenido Restringido"
            name="contenido_restringido"
            value={form.contenido_restringido}
            onChange={handleChange}
            multiline
            rows={4}
            fullWidth
          />
          <TextField
            label="Tags (separados por coma)"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            select
            label="Categoría"
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            fullWidth
          >
            {categorias && categorias.map((cat) => (
              <MenuItem key={cat.id} value={String(cat.id)}>
                {cat.nombre}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            type="file"
            name="portada"
            inputProps={{ accept: 'image/*' }}
            onChange={handleFileChange}
          />
          <TextField
            type="file"
            name="galeria_libre"
            inputProps={{ accept: 'image/*', multiple: true }}
            onChange={handleFileChange}
          />
          <TextField
            type="file"
            name="galeria_restringida"
            inputProps={{ accept: 'image/*', multiple: true }}
            onChange={handleFileChange}
          />
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleGuardar}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button variant="outlined" onClick={handleCancelar}>
              Cancelar
            </Button>
            <Button
              variant="text"
              color="error"
              onClick={handleEliminar}
              disabled={deleting}
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

export default EditarContenido;

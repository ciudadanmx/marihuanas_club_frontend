// src/Pages/Blog/AgregarContenido.jsx

import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  MenuItem,
  FormControlLabel,
  Checkbox,
  InputLabel,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useContenido } from '../../hooks/useContenido';

export default function AgregarContenido() {
  const {
    categorias,
    crearContenido,
    subirMedia,
    loading: loadingHook,
    error: errorHook,
  } = useContenido();

  const {
    handleSubmit,
    register,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      titulo: '',
      resumen: '',
      contenido_libre: '',
      contenido_restringido: '',
      restringido: false,
      status: 'borrador',
      tags: '',
      fecha_publicacion: dayjs(),
      categoria: '',
    },
  });

  const [portadaFiles, setPortadaFiles] = useState([]);
  const [galeriaLibreFiles, setGaleriaLibreFiles] = useState([]);
  const [galeriaRestringidaFiles, setGaleriaRestringidaFiles] = useState([]);
  const [videosLibresFiles, setVideosLibresFiles] = useState([]);
  const [videosRestringidosFiles, setVideosRestringidosFiles] = useState([]);

  const [portadaPreview, setPortadaPreview] = useState([]);
  const [galeriaLibrePreview, setGaleriaLibrePreview] = useState([]);
  const [galeriaRestringidaPreview, setGaleriaRestringidaPreview] = useState([]);
  const [videosLibresPreview, setVideosLibresPreview] = useState([]);
  const [videosRestringidosPreview, setVideosRestringidosPreview] = useState([]);

  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const crearPreviews = (files) =>
    Array.from(files).map((file) => {
      const url = URL.createObjectURL(file);
      return { url, type: file.type };
    });

  const handlePortadaChange = (e) => {
    const files = e.target.files;
    setPortadaFiles(files);
    setPortadaPreview(crearPreviews(files));
  };

  const handleGaleriaLibreChange = (e) => {
    const files = e.target.files;
    setGaleriaLibreFiles(files);
    setGaleriaLibrePreview(crearPreviews(files));
  };

  const handleGaleriaRestringidaChange = (e) => {
    const files = e.target.files;
    setGaleriaRestringidaFiles(files);
    setGaleriaRestringidaPreview(crearPreviews(files));
  };

  const handleVideosLibresChange = (e) => {
    const files = e.target.files;
    setVideosLibresFiles(files);
    setVideosLibresPreview(crearPreviews(files));
  };

  const handleVideosRestringidosChange = (e) => {
    const files = e.target.files;
    setVideosRestringidosFiles(files);
    setVideosRestringidosPreview(crearPreviews(files));
  };

  const onSubmit = async (data) => {
    setMensaje('');
    setSubiendo(true);

    try {
      const media = {};

      if (portadaFiles.length) {
        media.portada = await subirMedia(portadaFiles);
      }
      if (galeriaLibreFiles.length) {
        media.galeria_libre = await subirMedia(galeriaLibreFiles);
      }
      if (galeriaRestringidaFiles.length) {
        media.galeria_restringida = await subirMedia(galeriaRestringidaFiles);
      }
      if (videosLibresFiles.length) {
        media.videos_libres = await subirMedia(videosLibresFiles);
      }
      if (videosRestringidosFiles.length) {
        media.videos_restringidos = await subirMedia(videosRestringidosFiles);
      }

      const payload = {
        titulo: data.titulo,
        resumen: data.resumen,
        contenido_libre: data.contenido_libre,
        contenido_restringido: data.contenido_restringido,
        restringido: data.restringido,
        status: data.status,
        tags: data.tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t),
        fecha_publicacion: data.fecha_publicacion.toISOString(),
        categoria: data.categoria,
      };

      await crearContenido(payload, media);

      setMensaje('Contenido creado correctamente');
      reset({
        titulo: '',
        resumen: '',
        contenido_libre: '',
        contenido_restringido: '',
        restringido: false,
        status: 'borrador',
        tags: '',
        fecha_publicacion: dayjs(),
        categoria: '',
      });
      setPortadaFiles([]);
      setGaleriaLibreFiles([]);
      setGaleriaRestringidaFiles([]);
      setVideosLibresFiles([]);
      setVideosRestringidosFiles([]);
      setPortadaPreview([]);
      setGaleriaLibrePreview([]);
      setGaleriaRestringidaPreview([]);
      setVideosLibresPreview([]);
      setVideosRestringidosPreview([]);
    } catch (err) {
      console.error(err);
      setMensaje(`Error: ${err.message}`);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: 8 }}>
            add_circle
          </span>
          Agregar Contenido
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            {/* Título */}
            <Grid item xs={12}>
              <TextField
                label="Título"
                fullWidth
                {...register('titulo', { required: true })}
                error={!!errors.titulo}
                helperText={errors.titulo && 'Título obligatorio'}
              />
            </Grid>

            {/* Resumen */}
            <Grid item xs={12}>
              <TextField
                label="Resumen"
                fullWidth
                multiline
                rows={2}
                {...register('resumen')}
              />
            </Grid>

            {/* Contenido libre (WYSIWYG) */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Contenido libre (HTML)
              </Typography>
              <Controller
                name="contenido_libre"
                control={control}
                render={({ field }) => (
                  <ReactQuill
                    theme="snow"
                    value={field.value}
                    onChange={field.onChange}
                    style={{ height: '200px', marginBottom: '1rem' }}
                  />
                )}
              />
            </Grid>

            {/* Contenido restringido (WYSIWYG) */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Contenido restringido (HTML)
              </Typography>
              <Controller
                name="contenido_restringido"
                control={control}
                render={({ field }) => (
                  <ReactQuill
                    theme="snow"
                    value={field.value}
                    onChange={field.onChange}
                    readOnly={!watch('restringido')}
                    style={{ height: '200px', marginBottom: '1rem', opacity: watch('restringido') ? 1 : 0.5 }}
                  />
                )}
              />
            </Grid>

            {/* Restringido */}
            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox {...register('restringido')} />}
                label="¿Restringido?"
              />
            </Grid>

            {/* Tags */}
            <Grid item xs={12}>
              <TextField
                label="Tags (separados por coma)"
                fullWidth
                {...register('tags')}
              />
            </Grid>

            {/* Categoría */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Categoría"
                fullWidth
                defaultValue=""
                {...register('categoria', { required: true })}
                error={!!errors.categoria}
                helperText={errors.categoria && 'Selecciona una categoría'}
              >
                {categorias.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Estado */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Estado"
                fullWidth
                defaultValue="borrador"
                {...register('status')}
              >
                <MenuItem value="borrador">Borrador</MenuItem>
                <MenuItem value="publicado">Publicado</MenuItem>
              </TextField>
            </Grid>

            {/* Fecha publicación */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="fecha_publicacion"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Fecha de publicación"
                    {...field}
                    onChange={(date) => field.onChange(date)}
                    slotProps={{
                      textField: { fullWidth: true },
                    }}
                  />
                )}
              />
            </Grid>

            {/* Portada */}
            <Grid item xs={12} sm={6}>
              <InputLabel>Portada (imagen única)</InputLabel>
              <input
                type="file"
                accept="image/*"
                onChange={handlePortadaChange}
                style={{ marginTop: '0.5rem' }}
              />
              {portadaPreview.length > 0 && (
                <Box mt={1}>
                  <img
                    src={portadaPreview[0].url}
                    alt="Portada preview"
                    style={{ maxWidth: '100%', borderRadius: 4 }}
                  />
                </Box>
              )}
            </Grid>

            {/* Galería Libre */}
            <Grid item xs={12} sm={6}>
              <InputLabel>Galería Libre (imágenes/videos)</InputLabel>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleGaleriaLibreChange}
                style={{ marginTop: '0.5rem' }}
              />
              {galeriaLibrePreview.length > 0 && (
                <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                  {galeriaLibrePreview.map((item, index) => (
                    <Box key={index} width={100}>
                      {item.type.startsWith('image') ? (
                        <img
                          src={item.url}
                          alt={`Galería libre ${index}`}
                          style={{ width: '100%', borderRadius: 4 }}
                        />
                      ) : (
                        <video width="100%" controls style={{ borderRadius: 4 }}>
                          <source src={item.url} type={item.type} />
                          Tu navegador no soporta el video.
                        </video>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>

            {/* Galería Restringida */}
            <Grid item xs={12} sm={6}>
              <InputLabel>Galería Restringida (imágenes/videos)</InputLabel>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleGaleriaRestringidaChange}
                disabled={!watch('restringido')}
                style={{ marginTop: '0.5rem' }}
              />
              {galeriaRestringidaPreview.length > 0 && (
                <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                  {galeriaRestringidaPreview.map((item, index) => (
                    <Box key={index} width={100}>
                      {item.type.startsWith('image') ? (
                        <img
                          src={item.url}
                          alt={`Galería restringida ${index}`}
                          style={{ width: '100%', borderRadius: 4 }}
                        />
                      ) : (
                        <video width="100%" controls style={{ borderRadius: 4 }}>
                          <source src={item.url} type={item.type} />
                          Tu navegador no soporta el video.
                        </video>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>

            {/* Videos Libres */}
            <Grid item xs={12} sm={6}>
              <InputLabel>Videos Libres</InputLabel>
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideosLibresChange}
                style={{ marginTop: '0.5rem' }}
              />
              {videosLibresPreview.length > 0 && (
                <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                  {videosLibresPreview.map((item, index) => (
                    <Box key={index} width={120}>
                      <video width="100%" controls style={{ borderRadius: 4 }}>
                        <source src={item.url} type={item.type} />
                        Tu navegador no soporta el video.
                      </video>
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>

            {/* Videos Restringidos */}
            <Grid item xs={12} sm={6}>
              <InputLabel>Videos Restringidos</InputLabel>
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideosRestringidosChange}
                disabled={!watch('restringido')}
                style={{ marginTop: '0.5rem' }}
              />
              {videosRestringidosPreview.length > 0 && (
                <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                  {videosRestringidosPreview.map((item, index) => (
                    <Box key={index} width={120}>
                      <video width="100%" controls style={{ borderRadius: 4 }}>
                        <source src={item.url} type={item.type} />
                        Tu navegador no soporta el video.
                      </video>
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>

            {/* Botón enviar */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                startIcon={<span className="material-icons">save</span>}
                disabled={subiendo || loadingHook}
                fullWidth
              >
                {subiendo ? 'Subiendo...' : 'Crear Contenido'}
              </Button>
            </Grid>

            {/* Mensaje de estado */}
            {mensaje && (
              <Grid item xs={12}>
                <Typography color={mensaje.startsWith('Error') ? 'error' : 'primary'}>
                  {mensaje}
                </Typography>
              </Grid>
            )}

            {/* Cargando categorías / error hook */}
            {loadingHook && (
              <Grid item xs={12}>
                <Typography>Cargando categorías...</Typography>
              </Grid>
            )}
            {errorHook && (
              <Grid item xs={12}>
                <Typography color="error">Error: {errorHook.message}</Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

import React, { useState, useMemo, useRef } from 'react';
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

import '../../quillConfig.js';     // esto que corre la línea de registro

import { DatePicker } from '@mui/x-date-pickers';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useContenido } from '../../hooks/useContenido';
import { useSnackbar } from 'notistack';


const AgregarContenido = () => {
  const { enqueueSnackbar } = useSnackbar();
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
    setError,
    clearErrors,
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
  

  const quillModules = useMemo(() => ({
    toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ size: ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ align: [] }],
    ['blockquote', 'code-block'],
    [{ direction: 'rtl' }],
    ['link', 'image', 'video'],
    ['clean']
    ],
    
  }), []);

  const quillRefLibre = useRef(null);

  const insertLogoLibre = () => {
  const editor = quillRefLibre.current?.getEditor();
  const range = editor?.getSelection();
  if (range) {
    editor.insertEmbed(range.index, 'image', '/logo.png');
  }
};

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

  const [htmlModeRestringido, setHtmlModeRestringido] = useState(false);
  const [htmlModeLibre, setHtmlModeLibre] = useState(false);
  const [contenidoLibre, setContenidoLibre] = useState('');


  const crearPreviews = (files) =>
    Array.from(files).map((file) => {
      const url = URL.createObjectURL(file);
      return { url, type: file.type };
    });

  const handlePortadaChange = (e) => {
    const files = e.target.files;
    setPortadaFiles(files);
    setPortadaPreview(crearPreviews(files));
    if (files.length === 0) {
      setError('portada', { type: 'required', message: 'La portada es obligatoria' });
    } else {
      clearErrors('portada');
    }
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
    if (watch('restringido') && files.length === 0) {
      setError('galeriaRestringida', { type: 'required', message: 'La galería restringida es obligatoria si está restringido' });
    } else {
      clearErrors('galeriaRestringida');
    }
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
    if (watch('restringido') && files.length === 0) {
      setError('videosRestringidos', { type: 'required', message: 'Los videos restringidos son obligatorios si está restringido' });
    } else {
      clearErrors('videosRestringidos');
    }
  };

  // Validación antes de enviar para archivos
  const validarArchivos = () => {
    let valido = true;
    if (portadaFiles.length === 0) {
      setError('portada', { type: 'required', message: 'La portada es obligatoria' });
      valido = false;
    }
    if (watch('restringido')) {
      if (galeriaRestringidaFiles.length === 0) {
        setError('galeriaRestringida', { type: 'required', message: 'La galería restringida es obligatoria si está restringido' });
        valido = false;
      }
      if (videosRestringidosFiles.length === 0) {
        setError('videosRestringidos', { type: 'required', message: 'Los videos restringidos son obligatorios si está restringido' });
        valido = false;
      }
    } else {
      clearErrors(['galeriaRestringida', 'videosRestringidos']);
    }
    return valido;
  };

  const onSubmit = async (data) => {
    setMensaje('');
    clearErrors();
    if (!validarArchivos()) {
        enqueueSnackbar('Por favor corrige los errores en los archivos', { variant: 'error' });
        return;
    }

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
      enqueueSnackbar('Contenido creado correctamente', { variant: 'success' });
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
      enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' });
      setMensaje(`Error: ${err.message}`);
    } finally {
      setSubiendo(false);
    }
  };

  const restringido = watch('restringido');

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
                    {...register('titulo', { required: 'Ingresa un título' })}
                    error={!!errors.titulo}
                    helperText={errors.titulo?.message}
                />
            </Grid>

            {/* Resumen */}
            <Grid item xs={12}>
              <TextField label="Resumen" fullWidth multiline rows={2} {...register('resumen')} />
            </Grid>

            

            {/* Contenido libre (WYSIWYG con HTML editable) */}
            <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                Contenido libre: (HTML)
                </Typography>
                <Controller
  name="contenido_libre"
  control={control}
  defaultValue=""    // <-- Aquí garantizamos un string, nunca undefined
  render={({ field }) => (
    <>
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <Button
          onClick={() => setHtmlModeLibre(!htmlModeLibre)}
          variant="outlined"
          size="small"
        >
          {htmlModeLibre ? 'Editor Visual' : 'Editor HTML'}
        </Button>
        {!htmlModeLibre && (
          <Button
            onClick={insertLogoLibre}
            variant="outlined"
            size="small"
          >
            Insertar Logo
          </Button>
        )}
      </Box>

      {htmlModeLibre ? (
        <TextField
          key="html"
          multiline
          minRows={8}
          fullWidth
          value={field.value}           // field.value siempre es un string
          onChange={e => field.onChange(e.target.value)}
          variant="outlined"
        />
      ) : (
        <ReactQuill
          key="visual"
          ref={quillRefLibre}           // guardamos la ref pero sin el log
          theme="snow"
          value={field.value}           // idem, nunca undefined
          onChange={(content, delta, source, editor) => {
            field.onChange(editor.getHTML());
          }}
          style={{ height: '200px', marginBottom: '1rem' }}
          modules={quillModules}
        />
      )}
    </>
  )}
/>

            </Grid>
            <br /><br />        
            {/* Checkbox para restringido */}
            <Grid item xs={12}>
            <FormControlLabel
                className="restringido"
                control={<Checkbox
                        {...register('restringido')} 
                    />}
                label="¿Contenido restringido?"
            />
            </Grid>

            {/* Contenido restringido (WYSIWYG con HTML editable) */}
            <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                    Contenido restringido (HTML)
                </Typography>
                <Controller
                    name="contenido_restringido"
                    control={control}
                    render={({ field }) => (
                        <>
                            <Button
                                onClick={() => setHtmlModeRestringido(!htmlModeRestringido)}
                                variant="outlined"
                                size="small"
                                sx={{ mb: 1 }}
                                disabled={!restringido}
                            >
                            {htmlModeRestringido ? 'Editor Visual' : 'Editar HTML'}
                            </Button>
                            {htmlModeRestringido ? (
                            <TextField
                                multiline
                                minRows={8}
                                fullWidth
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                variant="outlined"
                                disabled={!restringido}
                            />
                            ) : (
                            <ReactQuill
                                theme="snow"
                                value={field.value}
                                onChange={field.onChange}
                                style={{ height: '200px', marginBottom: '1rem' }}
                                readOnly={!restringido}
                            />
                            )}
                        </>
                    )}
                />
            </Grid>


            {/* Status */}
            <Grid item xs={12} sm={6}>
                <TextField
                    className="restringido"
                    label="Status"
                    select
                    fullWidth
                    defaultValue="borrador"
                    {...register('status')}
                >
                    <MenuItem value="borrador">Borrador</MenuItem>
                    <MenuItem value="publicado">Publicado</MenuItem>
                    <MenuItem value="archivado">Archivado</MenuItem>
                </TextField>
            </Grid>

            {/* Categoría */}
            <Grid item xs={12} sm={6} className="restringido">
                <TextField
                    label="Categoría"
                    select
                    fullWidth
                    {...register('categoria', { required: 'Categoría obligatoria' })}
                    error={!!errors.categoria}
                    helperText={errors.categoria?.message}
                >
                    {categorias.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                            {cat.nombre}
                        </MenuItem>
                    ))}
                </TextField>
            </Grid>

            {/* Fecha de publicación */}
            <Grid item xs={12} sm={6}>
                <Controller
                    control={control}
                    name="fecha_publicacion"
                    render={({ field }) => (
                        <DatePicker
                            label="Fecha de publicación"
                            value={field.value}
                            onChange={(date) => field.onChange(date)}
                            renderInput={(params) => <TextField fullWidth {...params} />}
                        />
                    )}
                />
            </Grid>

            {/* Tags */}
            <Grid item xs={12} sm={6}>
                <TextField
                    label="Tags (separados por coma)"
                    fullWidth
                    {...register('tags')}
                />
            </Grid>

            {/* Portada (archivo único) */}
            <Grid item xs={12}>
                <InputLabel required>Portada (imagen o video)</InputLabel>
                <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handlePortadaChange}
                    multiple={false}
                    style={{ marginTop: 8, marginBottom: 8 }}
                />
                {errors.portada && (
                <Typography color="error" variant="body2">
                    {errors.portada.message}
                </Typography>
                )}
                {portadaPreview.length > 0 &&
                portadaPreview.map((file, index) =>
                    file.type.startsWith('image/') ? (
                    <img
                        key={index}
                        src={file.url}
                        alt={`Portada Preview ${index}`}
                        style={{ maxHeight: 150, marginRight: 10 }}
                    />
                    ) : (
                        <video
                            key={index}
                            src={file.url}
                            controls
                            style={{ maxHeight: 150, marginRight: 10 }}
                        />
                    )
                )}
            </Grid>

            {/* Galería libre (archivos múltiples) */}
            <Grid item xs={12}>
                <InputLabel>Galería libre (imágenes/videos)</InputLabel>
                <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleGaleriaLibreChange}
                    multiple
                    style={{ marginTop: 8, marginBottom: 8 }}
                />
                {galeriaLibrePreview.length > 0 &&
                galeriaLibrePreview.map((file, index) =>
                    file.type.startsWith('image/') ? (
                    <img
                        key={index}
                        src={file.url}
                        alt={`Galería libre ${index}`}
                        style={{ maxHeight: 100, marginRight: 10 }}
                    />
                    ) : (
                    <video
                        key={index}
                        src={file.url}
                        controls
                        style={{ maxHeight: 100, marginRight: 10 }}
                    />
                    )
                )}
            </Grid>

            {/* Galería restringida (archivos múltiples) - solo si restringido */}
            {restringido && (
            <Grid item xs={12}>
                <InputLabel>Galería restringida (imágenes/videos)</InputLabel>
                <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleGaleriaRestringidaChange}
                    multiple
                    style={{ marginTop: 8, marginBottom: 8 }}
                />
                {errors.galeriaRestringida && (
                    <Typography color="error" variant="body2">
                        {errors.galeriaRestringida.message}
                    </Typography>
                )}
                {galeriaRestringidaPreview.length > 0 &&
                    galeriaRestringidaPreview.map((file, index) =>
                    file.type.startsWith('image/') ? (
                        <img
                            key={index}
                            src={file.url}
                            alt={`Galería restringida ${index}`}
                            style={{ maxHeight: 100, marginRight: 10 }}
                        />
                    ) : (
                        <video
                            key={index}
                            src={file.url}
                            controls
                            style={{ maxHeight: 100, marginRight: 10 }}
                        />
                    )
                )}
            </Grid>
            )}

            {/* Videos libres (archivos múltiples) */}
            <Grid item xs={12}>
                <InputLabel>Videos libres</InputLabel>
                <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideosLibresChange}
                    multiple
                    style={{ marginTop: 8, marginBottom: 8 }}
                />
                {videosLibresPreview.length > 0 &&
                videosLibresPreview.map((file, index) => (
                    <video
                    key={index}
                    src={file.url}
                    controls
                    style={{ maxHeight: 100, marginRight: 10 }}
                    />
                ))}
            </Grid>

            {/* Videos restringidos (archivos múltiples) - solo si restringido */}
            {restringido && (
            <Grid item xs={12}>
                <InputLabel>Videos restringidos</InputLabel>
                <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideosRestringidosChange}
                    multiple
                    style={{ marginTop: 8, marginBottom: 8 }}
                />
                {errors.videosRestringidos && (
                    <Typography color="error" variant="body2">
                        {errors.videosRestringidos.message}
                    </Typography>
                )}
                {videosRestringidosPreview.length > 0 &&
                    videosRestringidosPreview.map((file, index) => (
                        <video
                            key={index}
                            src={file.url}
                            controls
                            style={{ maxHeight: 100, marginRight: 10 }}
                        />
                    ))}
            </Grid>
            )}

            {/* Botón guardar */}
            <Grid item xs={12}>
                <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={subiendo || loadingHook}
                    startIcon={
                        subiendo || loadingHook ? (
                        <span className="material-icons">hourglass_top</span>
                        ) : (
                        <span className="material-icons">save</span>
                        )
                    }
                >
                    {subiendo || loadingHook ? 'Subiendo...' : 'Guardar contenido'}
                </Button>
            </Grid>

            {/* Mensaje */}
            {mensaje && (
            <Grid item xs={12}>
                <Typography
                    variant="body1"
                    color={mensaje.toLowerCase().includes('error') ? 'error' : 'primary'}
                >
                    {mensaje}
                </Typography>
            </Grid>
            )}
        </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default AgregarContenido;
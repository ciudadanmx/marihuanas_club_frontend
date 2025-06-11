import React, { useState, useMemo, useRef, useEffect } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
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
    Divider,
} from '@mui/material';

import '../../quillConfig.js';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import { useContenido } from '../../hooks/useContenido';
import { useSnackbar } from 'notistack';

import {
    colorBotonSecundario,
    colorBordeBotonSecundario,
    colorFondoBotonSecundario,
    colorBotonSecundarioHoover,
    colorFondoBotonSecundarioHoover,
    colorControlSecundario,
    colorControlSecundarioHoover,
    degradadoIconos,
} from '../../styles/ColoresBotones';

// Módulos externos
import { CrearPreviews } from '../../utils/CrearPreviews.jsx';
import {
  PortadaUploader,
  GaleriaLibreUploader,
  GaleriaRestringidaUploader,
} from '../../components/FileUploaders';
import { WysiwygEditor } from '../../components/editors/WysiwygEditor.jsx';

const AgregarContenido = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { categorias, crearContenido, subirMedia, loading: loadingHook } = useContenido();

    const {
        handleSubmit,
        register,
        control,
        reset,
        watch,
        setError,
        setValue,
        clearErrors,
        formState: { errors },
    } = useForm({
        defaultValues: {
            titulo: '',
            resumen: '',
            contenido_libre: '',
            contenido_restringido: '',
            restringido: false,
            status: 'publicado',
            tags: '',
            fecha_publicacion: dayjs(),
            categoria: '',
        },
    });

    const categoriaSeleccionada = watch('categoria');
    const restringido = watch('restringido');
    const quillModules = useMemo(() => ({ /* toolbar config */ }), []);
    const quillRefLibre = useRef(null);

    const [portadaFiles, setPortadaFiles] = useState([]);
    const [galeriaLibreFiles, setGaleriaLibreFiles] = useState([]);
    const [galeriaRestringidaFiles, setGaleriaRestringidaFiles] = useState([]);

    const [portadaPreview, setPortadaPreview] = useState([]);
    const [galeriaLibrePreview, setGaleriaLibrePreview] = useState([]);
    const [galeriaRestringidaPreview, setGaleriaRestringidaPreview] = useState([]);

    const [subiendo, setSubiendo] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [htmlModeLibre, setHtmlModeLibre] = useState(false);
    const [htmlModeRestringido, setHtmlModeRestringido] = useState(false);

    // Manejadores de archivos
    const handlePortadaChange = (e) => {
        const files = e.target.files;
        setPortadaFiles(files);
        setPortadaPreview(CrearPreviews(files));
        if (files.length === 0) {
            setError('portada', { type: 'required', message: 'La portada es obligatoria' });
        } else {
            clearErrors('portada');
        }
    };

    const handleGaleriaLibreChange = (e) => {
        const files = e.target.files;
        setGaleriaLibreFiles(files);
        setGaleriaLibrePreview(CrearPreviews(files));
    };

    const handleGaleriaRestringidaChange = (e) => {
        const files = e.target.files;
        setGaleriaRestringidaFiles(files);
        setGaleriaRestringidaPreview(CrearPreviews(files));
        clearErrors('galeriaRestringida');
    };

    const validarArchivos = () => {
        let valido = true;
        if (portadaFiles.length === 0) {
            setError('portada', { type: 'required', message: 'La portada es obligatoria' });
            valido = false;
        }
        clearErrors(['galeriaRestringida']);
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

            if (portadaFiles.length) media.portada = await subirMedia(portadaFiles);
            if (galeriaLibreFiles.length) media.galeria_libre = await subirMedia(galeriaLibreFiles);
            if (galeriaRestringidaFiles.length) media.galeria_restringida = await subirMedia(galeriaRestringidaFiles);

            const payload = {
                titulo: data.titulo,
                resumen: data.resumen,
                contenido_libre: data.contenido_libre,
                contenido_restringido: data.contenido_restringido,
                restringido: data.restringido,
                status: data.status,
                tags: data.tags.split(',').map((t) => t.trim()).filter(Boolean),
                fecha_publicacion: data.fecha_publicacion.toISOString(),
                categoria: data.categoria,
            };

            await crearContenido(payload, media);

            enqueueSnackbar('Contenido creado correctamente', { variant: 'success' });
            setMensaje('Contenido creado correctamente');
            reset({ titulo: '', resumen: '', contenido_libre: '', contenido_restringido: '', restringido: false, status: 'publicado', tags: '', fecha_publicacion: dayjs(), categoria: '' });
            setPortadaFiles([]);
            setGaleriaLibreFiles([]);
            setGaleriaRestringidaFiles([]);
            setPortadaPreview([]);
            setGaleriaLibrePreview([]);
            setGaleriaRestringidaPreview([]);
        } catch (err) {
            enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' });
            setMensaje(`Error: ${err.message}`);
        } finally {
            setSubiendo(false);
        }
    };

    useEffect(() => {
        if (categorias.length > 0) {
            const defaultCat = categorias.find(
                (cat) => cat.slug?.toLowerCase() === 'no-clasificados' || cat.nombre?.toLowerCase() === 'no clasificados'
            );
            if (defaultCat) setValue('categoria', defaultCat.id);
        }
    }, [categorias, setValue]);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, width: 36, height: 36, borderRadius: '50%', background: degradadoIconos, color: '#000', boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)', mr: 1.5, transform: 'rotate(-6deg)' }}>📝</Box>
                    Agregar Contenido
                </Typography>
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        {/* Título */}
                        <Grid item xs={12}>
                            <TextField label="Título" fullWidth {...register('titulo', { required: 'Ingresa un título' })} error={!!errors.titulo} helperText={errors.titulo?.message} />
                        </Grid>

                        {/* Resumen */}
                        <Grid item xs={12}>
                            <TextField label="Resumen" fullWidth multiline rows={2} {...register('resumen')} />
                        </Grid>

                        {/* Contenido libre */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>Contenido libre (HTML)</Typography>
                            <WysiwygEditor
                                name="contenido_libre"
                                control={control}
                                htmlMode={htmlModeLibre}
                                onToggleMode={() => setHtmlModeLibre(!htmlModeLibre)}
                                modules={quillModules}
                                restricted={false}
                                ref={quillRefLibre}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <FormControlLabel
                                control={<Checkbox {...register('restringido')} sx={{ color: colorControlSecundario, '&.Mui-checked': { color: colorControlSecundario } }} />}
                                label="¿Contenido restringido?"
                            />
                        </Grid>

                        {/* Contenido restringido */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>Contenido restringido (HTML)</Typography>
                            <WysiwygEditor
                                name="contenido_restringido"
                                control={control}
                                htmlMode={htmlModeRestringido}
                                onToggleMode={() => setHtmlModeRestringido(!htmlModeRestringido)}
                                modules={quillModules}
                                restricted={!restringido}
                            />
                        </Grid>

                        {/* Status y Categoría */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Status"
                                select
                                fullWidth
                                defaultValue="publicado"
                                {...register('status')}
                                sx={{ /* estilos */ }}
                            >
                                <MenuItem value="borrador">Borrador</MenuItem>
                                <MenuItem value="publicado">Publicado</MenuItem>
                                <MenuItem value="archivado">Archivado</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Categoría"
                                select
                                fullWidth
                                value={categoriaSeleccionada}
                                {...register('categoria', { required: 'Categoría obligatoria' })}
                                error={!!errors.categoria}
                                helperText={errors.categoria?.message}
                                sx={{ /* estilos */ }}
                            >
                                {categorias.map((cat) => <MenuItem key={cat.id} value={cat.id}>{cat.nombre}</MenuItem>)}
                            </TextField>
                        </Grid>

                        {/* Fecha y Tags */}
                        <Grid item xs={12} sm={6}>
                            <Controller control={control} name="fecha_publicacion" render={({ field }) => <DateTimePicker label="Fecha y hora de publicación" value={field.value} onChange={field.onChange} renderInput={(params) => <TextField fullWidth {...params} />} />} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Tags (separados por coma)" fullWidth {...register('tags')} />
                        </Grid>

                        {/* Uploaders */}
                        <Grid item xs={12}>
                            <PortadaUploader files={portadaFiles} previews={portadaPreview} onChange={handlePortadaChange} error={errors.portada} />
                        </Grid>
                        <Grid item xs={12}>
                            <GaleriaLibreUploader files={galeriaLibreFiles} previews={galeriaLibrePreview} onChange={handleGaleriaLibreChange} />
                        </Grid>
                        {restringido && (
                        <Grid item xs={12}>
                            <GaleriaRestringidaUploader files={galeriaRestringidaFiles} previews={galeriaRestringidaPreview} onChange={handleGaleriaRestringidaChange} error={errors.galeriaRestringida} />
                        </Grid>)}

                        {/* Botón guardar y mensaje */}
                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" disabled={subiendo || loadingHook} startIcon={<span className="material-icons">{subiendo || loadingHook ? 'hourglass_top' : 'save'}</span>} sx={{ bgcolor: '#6e862ae0', '&:hover': { bgcolor: '#8CC701' }, transition: 'all 0.3s ease' }}>
                                {subiendo || loadingHook ? 'Subiendo...' : 'Guardar contenido'}
                            </Button>
                        </Grid>
                        {mensaje && (
                        <Grid item xs={12}>
                            <Typography variant="body1" color={mensaje.toLowerCase().includes('error') ? 'error' : 'primary'}>{mensaje}</Typography>
                        </Grid>)}
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
};

export default AgregarContenido;

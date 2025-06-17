import { useParams } from 'react-router-dom';
import { useCurso } from '../../hooks/useCurso';
import BotonEditar from '../../components/Cursos/BotonEditar.jsx';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Chip,
    Grid,
    CardMedia,
    Divider,
    CircularProgress,
} from '@mui/material';
import { useEffect, useState } from 'react';
import FechaCdmx from '../../utils/FechaCdmx';

const CursoDetalle = () => {
    const STRAPI_URL = process.env.REACT_APP_STRAPI_URL;
    const navigate = useNavigate();
    console.warn('****************** entrando a contenido');
    const membresia = true;
    const { slug } = useParams();
    const { cursos, loading } = useCurso();
    const [curso, setCurso] = useState(null);

    const handleEdit = () => {
        navigate(`/cursos/editar/${slug}`);
    };

    useEffect(() => {
        if (cursos.length) {
            const encontrado = cursos.find(c => c.slug === slug);
            setCurso(encontrado);
        }
    }, [cursos, slug]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress color="warning" />
            </Box>
        );
    }

    if (!curso) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <Typography variant="h6">Curso no encontrado</Typography>
            </Box>
        );
    }

    const renderGaleria = (items) => (
        <Grid container spacing={2}>
            {items.map((item, i) => {
                const src = STRAPI_URL + item;
                const isVideo = src.match(/\.(mp4|webm|ogg)$/i);

                return (
                    <Grid item xs={12} sm={6} md={4} key={i}>
                        {isVideo ? (
                            <Box
                                sx={{
                                    position: 'relative',
                                    paddingTop: '56.25%', // 16:9 aspect ratio
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                }}
                            >
                            <Box
                                component="video"
                                src={src}
                                controls
                                muted
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: 2,
                                }}
                            />
                            </Box>
                        ) : (
                            <CardMedia
                                component="img"
                                image={src}
                                alt={`imagen-${i}`}
                                sx={{
                                    borderRadius: 2,
                                    width: '100%',
                                    height: 250,
                                    objectFit: 'cover',
                                }}
                            />
                        )}
                    </Grid>
                );
            })}
        </Grid>
    );


    const renderVideos = (videos) => (
        <Grid container spacing={2}>
        {videos.map((video, i) => (
            <Grid item xs={12} md={6} key={i}>
            <Box
                component="iframe"
                src={video}
                width="100%"
                height="250"
                style={{ borderRadius: 8, border: 'none' }}
                allowFullScreen
                title={`video-${i}`}
            />
            </Grid>
        ))}
        </Grid>
    );

    const renderHtml = (htmlContent) => (
        <Box
        sx={{
            mt: 2,
            p: 2,
            borderRadius: 2,
            border: '1px solid #e0e0e0',
            backgroundColor: '#f9f9f9',
        }}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
    );

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <BotonEditar 
                        handleEdit={handleEdit}
                        maestro_email={curso.maestro_email}
                    />
                </Box>
                {curso.portada && (
                    <CardMedia
                        component="img"
                        height="300"
                        image={STRAPI_URL + curso.portada}
                        alt={curso.titulo}
                        sx={{ borderRadius: 2, mb: 2 }}
                    />
                )}

                <Typography variant="h4" gutterBottom color="primary">
                    {curso.titulo}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Impartido por: {curso.maestro}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                        {FechaCdmx(curso.fecha_publicacion)}
                    </Typography>
                </Box>

                {curso.tags && (
                    <Box sx={{ mb: 2 }}>
                        {curso.tags.split(',').map(tag => (
                            <Chip
                                key={tag}
                                label={`#${tag.trim()}`}
                                size="small"
                                sx={{ mr: 1, mb: 1 }}
                                color="warning"
                            />
                        ))}
                    </Box>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Contenido Libre */}
                {curso.contenido && (
                    <>
                        {renderHtml(curso.contenido)}
                    </>
                )}

                {/* Contenido Restringido o llamada a adquirir membresía */}
                

                {/* Galería Libre */}
                {curso.galeria.length > 0 && (
                <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                        Galería 
                    </Typography>
                    {renderGaleria(curso.galeria)}
                </>
                )}

                {/* Videos Libres */}
                {curso.videos.length > 0 && (
                <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                        Videos
                    </Typography>
                    {renderVideos(curso.videos)}
                </>
                )}

                <Divider sx={{ my: 4 }} />

                

                {/* Galería Restringida */}
                

                {/* Videos Restringidos */}
                
            </Paper>
        </Container>
    );
};
export default CursoDetalle;

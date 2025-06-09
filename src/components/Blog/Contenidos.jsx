import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Container,
  Typography,
  Button,
  TextField,
  Fade,
  Slide,
  useMediaQuery,
  useTheme,
  Stack,
} from '@mui/material';
import CategoriasSlider from '../../components/MarketPlace/CategoriasSlider';
import { useCategorias } from '../../hooks/useCategorias';
import { useContenido } from '../../hooks/useContenido';
import ContenidoCard from '../../components/Blog/ContenidoCard';

const Contenidos = ({ filtros, parametros }) => {
  const STRAPI_URL  = process.env.REACT_APP_STRAPI_URL;
  const { getCategorias } = useCategorias('categorias-contenidos');
  const { contenidos, loading, error, fetchContenidos } = useContenido();

  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [visible, setVisible] = useState({});
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Handlers
  const handleAgregar = () => navigate('/contenidos/agregar-contenido');
  const handleBuscar = () => {
    const slug = busqueda.trim().toLowerCase().replace(/\s+/g, '-');
    navigate(`/contenidos/busqueda/${slug}`);
  };
  const handleMis = () => navigate('/contenidos/mis-contenidos');

  // Fetch categories
  useEffect(() => {
    (async () => {
      const cats = await getCategorias();
      setCategorias(cats);
    })();
  }, []);

  // Fetch contenidos
  useEffect(() => {
    fetchContenidos();
  }, []);

  // Filter logic
  const filtered = (contenidos || []).filter((item) => {
    const data = item.attributes ?? item;
    if (!filtros) return true;
    if (filtros === 'usuario') {
      const authorId = data.author?.data?.id ?? data.author?.id;
      return authorId?.toString() === parametros;
    }
    if (filtros === 'categoria') {
      const slug = data.category?.data?.attributes?.slug ?? data.category?.slug;
      return slug === parametros;
    }
    if (filtros === 'busqueda') {
      const term = parametros?.toLowerCase() || '';
      const titulo = (data.titulo ?? data.nombre ?? '').toLowerCase();
      const libre = (data.contenido_libre ?? '').toLowerCase();
      const restringido = (data.contenido_restringido ?? '').toLowerCase();
      const tagsSource = data.tags?.data ?? data.tags;
      const tagsArr = Array.isArray(tagsSource)
        ? tagsSource.map((t) => (t.attributes?.nombre ?? t.slug ?? t).toLowerCase())
        : [];
      const tagsMatch = tagsArr.some((t) => t.includes(term));
      return titulo.includes(term) || libre.includes(term) || restringido.includes(term) || tagsMatch;
    }
    return true;
  });

  // Default sort if no filtros
  const toRender = !filtros
    ? [...filtered].sort((a, b) => {
        const da = (a.attributes ?? a).fecha_publicacion;
        const db = (b.attributes ?? b).fecha_publicacion;
        return new Date(db) - new Date(da);
      })
    : filtered;

  // IntersectionObserver for animations
  const observer = useRef();
  useEffect(() => {
    observer.current = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const id = e.target.getAttribute('data-id');
          setVisible((v) => ({ ...v, [id]: true }));
          observer.current.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    document.querySelectorAll('.contenido-card').forEach((c) => observer.current.observe(c));
    return () => observer.current.disconnect();
  }, [toRender]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Search & controls */}
      <Slide direction="down" in timeout={400}>
        <Box sx={{ mb: 3, backgroundColor: '#fff', p: 2, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <TextField
              variant="outlined"
              size="small"
              placeholder="Buscar contenido..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              sx={{ flex: 1, minWidth: { xs: '100%', md: '250px' }, backgroundColor: '#f9f9f9', borderRadius: 2 }}
            />
            <Button onClick={handleBuscar} variant="contained" size="small" sx={{ backgroundColor: '#000', color: '#fff200', borderRadius: 2, '&:hover': { backgroundColor: '#222', transform: 'scale(1.05)' } }}>
              <span className="material-icons">search</span>
            </Button>
            <Button onClick={handleMis} variant="outlined" size="small" sx={{ color: '#000', borderColor: '#000', borderRadius: 2, textTransform: 'none', fontWeight: 600, '&:hover': { backgroundColor: '#f0f0f0', transform: 'scale(1.03)' } }}>
              <span className="material-icons" style={{ marginRight: 6 }}>article</span>Mis contenidos
            </Button>
            <Button onClick={handleAgregar} variant="contained" size="small" sx={{ backgroundColor: '#fff200', color: '#000', borderRadius: 2, '&:hover': { backgroundColor: '#e6d900', transform: 'scale(1.05)' } }}>
              <span className="material-icons">add_circle</span>
            </Button>
          </Stack>
        </Box>
      </Slide>
      {/* Categorías */}
      {categorias.length > 0 && (
        <Fade in timeout={400}>
          <Box>
            <Typography variant="h6" align="center" fontWeight={700} sx={{ mb: 2 }}>
              Categorías
            </Typography>
            <CategoriasSlider
              categorias={
                Array.isArray(categorias)
                  ? categorias.map((c) => ({ nombre: c.attributes.nombre, slug: c.attributes.slug, imagen: `${STRAPI_URL}${c.attributes.imagen?.data?.attributes?.url}` }))
                  : []
              }
            />
          </Box>
        </Fade>
      )}
      {/* Contenidos */}
      <Box mt={5}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Contenidos Recientes
        </Typography>
        <Grid container spacing={2}>
          {loading && <Grid item xs={12}><Typography align="center">Cargando contenidos...</Typography></Grid>}
          {error && <Grid item xs={12}><Typography color="error" align="center">Error al cargar contenidos</Typography></Grid>}
          {!loading && toRender.length === 0 && <Grid item xs={12}><Typography align="center">No hay contenidos aún.</Typography></Grid>}
          {toRender.map((item, i) => {
            const data = item.attributes ?? item;
            const isVis = visible[item.id];
            return (
              <Grid
                key={item.id}
                item xs={12} sm={6} md={4}
                data-id={item.id}
                className="contenido-card"
                sx={{ opacity: isVis ? 1 : 0, transform: isVis ? 'translateY(0)' : 'translateY(20px)', transition: `all 0.6s ease ${i * 0.1}s` }}
              >
                <ContenidoCard {...data} id={item.id} />
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Container>
  );
};

export default Contenidos;

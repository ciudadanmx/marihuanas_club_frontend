import { useEffect, useState, useRef } from 'react';
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

const Contenidos = () => {
  const tabla = 'categorias-contenidos';
  const { getCategorias } = useCategorias(tabla);
  const { contenidos, loading: loadingContenidos, error, fetchContenidos } = useContenido();

  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [visibleCards, setVisibleCards] = useState({});

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  useEffect(() => {
    const fetchCategorias = async () => {
      const data = await getCategorias();
      setCategorias(data);
    };
    fetchCategorias();
  }, []);

  useEffect(() => {
    fetchContenidos();
  }, []);

  const handleBuscar = () => {
    console.log('Buscar:', busqueda);
  };

  const observer = useRef(null);

  useEffect(() => {
    const options = {
      threshold: 0.2,
    };

    observer.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('data-id');
          if (id) {
            setVisibleCards((prev) => ({
              ...prev,
              [id]: true,
            }));
            observer.current.unobserve(entry.target);
          }
        }
      });
    }, options);

    const cards = document.querySelectorAll('.contenido-card');
    cards.forEach((card) => {
      observer.current.observe(card);
    });

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [contenidos]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* 🔎 Search y botones en una sola línea en desktop */}
      <Slide direction="down" in timeout={400}>
        <Box
          sx={{
            mb: 3,
            backgroundColor: '#fff',
            p: 2,
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
          >
            <TextField
              variant="outlined"
              size="small"
              placeholder="Buscar contenido..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              sx={{
                flex: 1,
                minWidth: { xs: '100%', md: '250px' },
                backgroundColor: '#f9f9f9',
                borderRadius: 2,
              }}
            />

            <Button
              onClick={handleBuscar}
              variant="contained"
              size="small"
              sx={{
                backgroundColor: '#000',
                color: '#fff200',
                borderRadius: 2,
                minWidth: 40,
                '&:hover': {
                  backgroundColor: '#222',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <span className="material-icons">search</span>
            </Button>

            <Button
              variant="outlined"
              size="small"
              sx={{
                color: '#000',
                borderColor: '#000',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#f0f0f0',
                  transform: 'scale(1.03)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <span className="material-icons" style={{ marginRight: 6 }}>article</span>
              Mis contenidos
            </Button>

            <Button
              variant="contained"
              size="small"
              sx={{
                backgroundColor: '#fff200',
                color: '#000',
                borderRadius: 2,
                minWidth: 40,
                '&:hover': {
                  backgroundColor: '#e6d900',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <span className="material-icons">add_circle</span>
            </Button>
          </Stack>
        </Box>
      </Slide>

      {/* 🧭 Categorías */}
      {categorias.length > 0 && (
        <Fade in timeout={400}>
          <Box>
            <Typography variant="h6" align="center" fontWeight={700} sx={{ mb: 2 }}>
              Categorías
            </Typography>
            <CategoriasSlider
              categorias={categorias.map((cat) => ({
                nombre: cat.attributes.nombre,
                slug: cat.attributes.slug,
                imagen: `${process.env.REACT_APP_STRAPI_URL}${cat.attributes.imagen?.data?.attributes?.url}`,
              }))}
            />
          </Box>
        </Fade>
      )}

      {/* 📦 Contenidos */}
      <Box mt={5}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Contenidos Recientes
        </Typography>

        <Grid container spacing={2}>
          {loadingContenidos && (
            <Grid item xs={12}>
              <Typography align="center">Cargando contenidos...</Typography>
            </Grid>
          )}

          {error && (
            <Grid item xs={12}>
              <Typography color="error" align="center">Error al cargar contenidos</Typography>
            </Grid>
          )}

          {!loadingContenidos && contenidos?.length === 0 && (
            <Grid item xs={12}>
              <Typography align="center">No hay contenidos aún.</Typography>
            </Grid>
          )}

          {contenidos?.length > 0 &&
            contenidos
              .sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion))
              .map((contenido, index) => {
                const isVisible = visibleCards[contenido.id];
                return (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    key={contenido.id}
                    data-id={contenido.id}
                    className="contenido-card"
                    sx={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'translateY(0px)' : 'translateY(20px)',
                      transition: `all 0.6s ease ${index * 0.1}s`,
                    }}
                  >
                    <ContenidoCard {...contenido} />
                  </Grid>
                );
              })}
        </Grid>
      </Box>
    </Container>
  );
};

export default Contenidos;

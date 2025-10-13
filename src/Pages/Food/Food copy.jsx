// src/pages/MarketPlace/Food.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Buscador from '../../components/Food/Buscador';
import ProductoCard from '../../components/MarketPlace/ProductoCard';
import CategoriasSlider from '../../components/MarketPlace/CategoriasSlider';
import { useCategorias } from '../../hooks/useCategorias';
import { useUbicacion } from '../../hooks/useUbicacion';
import useProductos from '../../hooks/useProductos';
import EnviosBanner from '../../components/Food/EnviosBanner.jsx';
import {
  Box,
  Grid,
  Container,
  Typography,
  Button,
  TextField,
  Stack,
  Pagination,
  useMediaQuery,
  useTheme,
  Badge,
  Paper,
  Chip,
} from '@mui/material';

// Iconos
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const Food = ({ filtros = '', parametros = '' }) => {
  // colores y constantes de UI
  const BG_LIGHT = '#fff4e5'; // fondo clarito naranja
  const SEARCH_ORANGE = '#ff6f00'; // botón buscar naranja fuerte
  const SELL_ORANGE = '#ff3300'; // vender - naranja aún más fuerte

  // helpers
  const safeLogError = (ctx, err) => {
    // loguea sin suponer que err es un Error con .stack
    try {
      // intenta lo "normal"
      console.error(ctx, err);
    } catch (e) {
      // si falla, convierte a string
      try {
        console.error(ctx, String(err));
      } catch (e2) {
        // último recurso: mensaje fijo
        console.error(ctx, 'Unknown error (failed to stringify)');
      }
    }
  };

  // hooks / navegacion
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();

  // datos (mantener estructura)
  const { getCategorias, loading: loadingCategorias } = useCategorias();
  const { ubicacion } = useUbicacion();
  const prodHook = useProductos();
  const {
    getProductos,
    precotizarMienvio,
    precotizacionTotal,
    calificacionPromedio,
    obtenerNumeroCalificaciones,
    obtenerImagenProducto,
  } = prodHook;

  // estado local
  const [productos, setProductos] = useState([]);
  const pagHook = useProductos({ paginado: true });
  const {
    productos: productosFiltrados = { data: [] },
    loading: loadingFiltros,
    pagina,
    setPagina,
    porPagina,
    setPorPagina,
    fetchProductos: fetchProductosFiltros,
    totalItems,
  } = pagHook;

  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [visible, setVisible] = useState({});

  // titulo / mostrar categorias
  let titulo = '';
  let mostrarCategorias = true;
  if (filtros === 'busqueda') {
    titulo = `Resultados de Búsqueda «${parametros.charAt(0).toUpperCase() + parametros.slice(1)}»`;
    mostrarCategorias = false;
  } else if (filtros === 'categoria') {
    titulo = `Platillos en «${parametros.charAt(0).toUpperCase() + parametros.slice(1)}»`;
    mostrarCategorias = false;
  } else if (filtros === 'mis-productos') {
    titulo = '»» Tus Productos ««';
    mostrarCategorias = false;
  }

  // handlers
  const handleBuscar = () => {
    const slug = busqueda.trim().toLowerCase().replace(/\s+/g, '-');
    if (!slug) return;
    navigate(`/productos/busqueda/${slug}`);
  };
  const handleCategoriaClick = (slug) => navigate(`/productos/categoria/${slug}`);
  const handleVender = () => navigate('/productos/vender');
  const handleMensajes = () => navigate('/mensajes');
  const handleOfertas = () => navigate('/food-ofertas');

  // cargar categorias (seguro)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cats = await getCategorias();
        if (!mounted) return;
        setCategorias(cats || []);
      } catch (e) {
        safeLogError('Error cargando categorías', e);
        if (mounted) setCategorias([]);
      }
    })();
    return () => { mounted = false; };
  }, [getCategorias]);

  // cargar productos sin filtro (enriquecimiento) — con manejo robusto de errores
  useEffect(() => {
    if (filtros) return;
    let mounted = true;
    const fetchAll = async () => {
      let data = [];
      try {
        // envolver la llamada a getProductos en try/catch robusto
        try {
          const raw = await getProductos();
          // soportar tanto array como objeto { data: [...] }
          if (Array.isArray(raw)) data = raw;
          else if (raw && Array.isArray(raw.data)) data = raw.data;
          else data = Array.isArray(raw) ? raw : raw?.data ?? [];
        } catch (errInner) {
          // si getProductos lanzó (por ejemplo por un error interno que incluso intenta leer err.stack), lo atrapamos aquí
          safeLogError('getProductos falló', errInner);
          data = [];
        }

        if (!data || !Array.isArray(data)) {
          data = [];
        }

        // ahora enriquecemos cada producto, garantizando que no rompa si algo viene null
        const enriched = await Promise.all(
          data.map(async (p) => {
            if (!p) return null;
            const attr = p.attributes || {};
            const cpDestino = ubicacion?.codigoPostal || '11560';
            const cpOrigen = attr.cp || '11590';
            if (!cpOrigen || !cpDestino) return null;
            try {
              const envio = await precotizarMienvio(cpOrigen, cpDestino, attr.largo, attr.ancho, attr.alto, attr.peso);
              const total = await precotizacionTotal(p, cpDestino);
              const img = await obtenerImagenProducto?.(p.id);
              return {
                ...p,
                envio,
                total,
                imagen: img,
                calificacion: calificacionPromedio?.(p),
                numCalificaciones: obtenerNumeroCalificaciones?.(p),
              };
            } catch (errProd) {
              safeLogError(`Error enriqueciendo producto id=${p?.id}`, errProd);
              return null;
            }
          })
        );

        if (!mounted) return;
        setProductos(enriched.filter(Boolean));
      } catch (errOuter) {
        safeLogError('fetchAll general error', errOuter);
        if (mounted) setProductos([]);
      }
    };

    if (ubicacion?.codigoPostal) fetchAll();

    return () => { mounted = false; };
  }, [
    ubicacion,
    filtros,
    getProductos,
    precotizarMienvio,
    precotizacionTotal,
    obtenerImagenProducto,
    calificacionPromedio,
    obtenerNumeroCalificaciones,
  ]);

  // productos filtrados
  useEffect(() => {
    if (!filtros) return;
    try {
      fetchProductosFiltros({ filtros, parametros });
    } catch (e) {
      safeLogError('fetchProductosFiltros falló', e);
    }
  }, [pagina, porPagina, filtros, parametros, fetchProductosFiltros]);

  // observer para animar cards (protegido)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = e.target.getAttribute('data-id');
            if (!id) return;
            setVisible((v) => ({ ...v, [id]: true }));
            try { observer.unobserve(e.target); } catch (e) { /* ignore */ }
          }
        });
      },
      { threshold: 0.18 }
    );
    const lista = filtros ? (productosFiltrados?.data ?? []) : productos;
    if (Array.isArray(lista)) {
      lista.forEach((prod) => {
        try {
          const id = prod?.id;
          if (!id) return;
          const el = document.querySelector(`[data-id='${id}']`);
          if (el) observer.observe(el);
        } catch (e) {
          // cualquier problema al seleccionar/observar un elemento no debe romper todo
          safeLogError('Observer error para producto', e);
        }
      });
    }
    return () => observer.disconnect();
  }, [filtros ? productosFiltrados : productos]);

  const listToRender = filtros ? (productosFiltrados?.data ?? []) : productos;

  return (

    <>
    <EnviosBanner />
    
    <Box sx={{ bgcolor: BG_LIGHT, minHeight: '100vh', pb: 8 }}>
      <Container maxWidth="lg" sx={{ pt: 3 }}>
        {/* TOP: buscador + mensajes + CTA vender */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" mb={2}>
          {/* Buscador */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: '#fff1e0',
              p: 1,
              borderRadius: 2,
              boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Buscador
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onSearch={handleBuscar}
                placeholder="Busca comida, restaurantes o platillos..."
              />
            </Box>

            <Button
              onClick={handleBuscar}
              variant="contained"
              sx={{
                ml: 1,
                bgcolor: SEARCH_ORANGE,
                color: '#fff',
                fontWeight: 700,
                textTransform: 'none',
                px: 3,
                py: 1.05,
                borderRadius: '10px',
                boxShadow: '0 6px 14px rgba(255,111,0,0.18)',
                '&:hover': { bgcolor: '#ff7f24' },
              }}
            >
              Buscar comida
            </Button>
          </Box>

          {/* Mensajes y banner pequeño */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: { xs: 1, sm: 0 } }}>
            <Badge badgeContent={2} color="error">
              <Button
                variant="outlined"
                startIcon={<MailOutlineIcon />}
                onClick={handleMensajes}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  px: 2,
                  backgroundColor: 'white',
                  borderColor: '#ffe0cc',
                  '&:hover': { backgroundColor: '#fff7f0' },
                }}
              >
                Mensajes
              </Button>
            </Badge>

            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1,
                borderRadius: '10px',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.92), rgba(255,250,240,0.9))',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
              }}
            >
              <AccessTimeIcon sx={{ color: SEARCH_ORANGE }} />
              <Box>
                <Typography variant="body2" fontWeight={800}>
                  Envío <span style={{ color: SEARCH_ORANGE }}>&lt;45 min</span>
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: .5 }}>
                  <MonetizationOnIcon sx={{ fontSize: 14 }} /> Pago justo al repartidor
                </Typography>
              </Box>
            </Paper>
          </Stack>

          {/* Botón vender */}
          <Box sx={{ ml: 'auto', mt: { xs: 1, sm: 0 } }}>
            <Button
              onClick={handleVender}
              variant="contained"
              sx={{
                bgcolor: SELL_ORANGE,
                color: '#fff',
                fontWeight: 800,
                px: 3,
                py: 1.05,
                borderRadius: '12px',
                textTransform: 'none',
                boxShadow: '0 10px 24px rgba(255,51,0,0.18)',
                '&:hover': { bgcolor: '#ff4020' },
              }}
            >
              + Vender
            </Button>
          </Box>
        </Stack>

        {/* CATEGORÍAS: PROMO + SLIDER */}
        {(!loadingCategorias && categorias.length > 0 && mostrarCategorias) && (
          <Box sx={{ mb: 3 }}>
            {/* Tarjeta promocional */}
            <Paper elevation={1} sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              background: 'linear-gradient(90deg, rgba(255,242,224,0.95), rgba(255,245,232,0.95))'
            }}>
              <DeliveryDiningIcon sx={{ fontSize: 40, color: SEARCH_ORANGE }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={900} sx={{ color: '#d35400' }}>
                  Tu comida favorita en casa en menos de 45 min
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pago justo para quien te la trae • Opciones rápidas y sin contacto
                </Typography>
              </Box>
              <Button
                onClick={handleOfertas}
                variant="contained"
                sx={{
                  bgcolor: '#ffb74d',
                  color: '#4b2e00',
                  fontWeight: 700,
                  textTransform: 'none',
                }}
              >
                Ver ofertas
              </Button>
            </Paper>

            {/* Chips (etiquetas rápidas) */}
            <Box sx={{ mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="Entrega rápida" icon={<AccessTimeIcon />} sx={{ bgcolor: '#fff7f0', fontWeight: 700 }} />
              <Chip label="Pago justo" icon={<MonetizationOnIcon />} sx={{ bgcolor: '#fff7f0', fontWeight: 700 }} />
              <Chip label="Vegano" sx={{ bgcolor: '#fff7f0', fontWeight: 700 }} />
              <Chip label="Sin contacto" sx={{ bgcolor: '#fff7f0', fontWeight: 700 }} />
            </Box>

            {/* Slider de categorías */}
            <Box sx={{ bgcolor: 'transparent', p: 1, borderRadius: 2 }}>
              <CategoriasSlider
                categorias={categorias.map((c) => ({
                  nombre: c.attributes?.nombre,
                  slug: c.attributes?.slug,
                  imagen: `${process.env.REACT_APP_STRAPI_URL}${c.attributes?.imagen?.data?.attributes?.url || ''}`,
                }))}
                onClick={(slug) => handleCategoriaClick(slug)}
              />
            </Box>
          </Box>
        )}

        {/* TITULO */}
        {titulo && (
          <Typography variant="h6" fontWeight={900} sx={{ mb: 2, color: '#d35400' }}>
            {titulo}
          </Typography>
        )}

        {/* GRID DE PRODUCTOS */}
        <Grid container spacing={3}>
          {Array.isArray(listToRender) && listToRender.length === 0 && (
            <Grid item xs={12}>
              <Typography textAlign="center" color="text.secondary">
                {filtros ? (loadingFiltros ? 'Cargando platillos...' : 'No hay platillos.') : 'Aún no hay platillos publicados.'}
              </Typography>
            </Grid>
          )}

          {Array.isArray(listToRender) &&
            listToRender.map((prod) => (
              <Grid
                key={prod?.id ?? Math.random()}
                item
                xs={12}
                sm={6}
                md={3}
                data-id={prod?.id ?? ''}
                sx={{
                  opacity: visible[prod?.id] ? 1 : 0,
                  transform: visible[prod?.id] ? 'translateY(0)' : 'translateY(18px)',
                  transition: 'all 0.55s cubic-bezier(.2,.9,.3,1)',
                }}
              >
                <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'visible' }}>
                  <Box sx={{
                    position: 'absolute',
                    top: -8,
                    left: -8,
                    zIndex: 3,
                    display: 'flex',
                    gap: 1,
                    alignItems: 'center'
                  }}>
                    <Paper elevation={2} sx={{ display: 'flex', alignItems: 'center', gap: .5, px: 1, py: .4, borderRadius: 1, backgroundColor: '#fff', }}>
                      <AccessTimeIcon sx={{ fontSize: 14, color: SEARCH_ORANGE }} />
                      <Typography variant="caption" fontWeight={700} sx={{ color: '#333' }}>~ 30-45 min</Typography>
                    </Paper>
                    <Paper elevation={2} sx={{ px: 1, py: .4, borderRadius: 1, backgroundColor: '#fff' }}>
                      <Typography variant="caption" fontWeight={700} sx={{ color: '#333' }}>Pago justo</Typography>
                    </Paper>
                  </Box>

                  <ProductoCard
                    titulo={prod?.attributes?.nombre}
                    slug={prod?.attributes?.slug}
                    imagenes={prod?.attributes?.imagenes}
                    descripcion={prod?.attributes?.descripcion}
                    imagen={prod?.imagen}
                    precio={prod?.attributes?.precio}
                    envioAprox={prod?.envio?.costo ? `$${prod.envio.costo} aprox.` : null}
                    localidad={prod?.attributes?.localidad}
                    estado={prod?.attributes?.estado}
                    calificacion={prod?.calificacion}
                    numeroCalificaciones={prod?.numCalificaciones}
                    vendidos={prod?.attributes?.vendidos}
                    total={prod?.total && `$${prod.total}`}
                  />
                </Box>
              </Grid>
            ))}
        </Grid>

        {/* PAGINACIÓN */}
        {filtros && Array.isArray(productosFiltrados?.data) && productosFiltrados.data.length > porPagina && (
          <Box mt={3} display="flex" justifyContent="center" alignItems="center">
            <Pagination
              count={Math.ceil(totalItems / porPagina)}
              page={pagina}
              onChange={(_, v) => setPagina(v)}
              color="primary"
            />
            <TextField
              select
              value={porPagina}
              onChange={(e) => setPorPagina(Number(e.target.value))}
              SelectProps={{ native: true }}
              size="small"
              sx={{ width: 92, ml: 2 }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </TextField>
          </Box>
        )}
      </Container>
    </Box>
    </>
  );
};

export default Food;

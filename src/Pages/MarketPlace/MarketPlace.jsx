import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Buscador from '../../components/MarketPlace/Buscador';
import ProductoCard from '../../components/MarketPlace/ProductoCard';
import BotonVender from '../../components/MarketPlace/BotonVender';
import CategoriasSlider from '../../components/MarketPlace/CategoriasSlider';
import { useCategorias } from '../../hooks/useCategorias';
import { useUbicacion } from '../../hooks/useUbicacion';
import useProductos from '../../hooks/useProductos';
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
  Pagination,
} from '@mui/material';

// 🎨 Iconos Material UI
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import BuildIcon from '@mui/icons-material/Build';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

const MarketPlace = ({ filtros = '', parametros = '' }) => {
  console.log('[MarketPlace] Render start - filtros:', filtros, 'parametros:', parametros);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();
  const location = useLocation();

  // Shared state
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
  const [productos, setProductos] = useState([]);

  // Filters logic
  const pagHook = useProductos({ paginado: true });
  const {
    productos: productosFiltrados = { data: [] },
    loading: loadingFiltros,
    error: errorFiltros,
    pagina,
    setPagina,
    porPagina,
    setPorPagina,
    fetchProductos: fetchProductosFiltros,
    totalItems,
  } = pagHook;

  // UI state
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [visible, setVisible] = useState({});

  // Handlers
  const handleBuscar = () => {
    const slug = busqueda.trim().toLowerCase().replace(/\s+/g, '-');
    if (!slug) return;
    navigate(`/productos/busqueda/${slug}`);
  };
  const handleMis = () => navigate('/productos/mis-productos');
  const handleCategoriaClick = (slug) => navigate(`/productos/categoria/${slug}`);

  // Title logic
  let titulo = '';
  let mostrarCategorias = true;
  if (filtros === 'busqueda') {
    titulo = `Resultados de Búsqueda «${parametros.charAt(0).toUpperCase() + parametros.slice(1)}»`;
    mostrarCategorias = false;
  } else if (filtros === 'categoria') {
    titulo = `Productos en Categoría «${parametros.charAt(0).toUpperCase() + parametros.slice(1)}»`;
    mostrarCategorias = false;
  } else if (filtros === 'mis-productos') {
    titulo = '»» Tus Productos ««';
    mostrarCategorias = false;
  }

  // Fetch categories
  useEffect(() => {
    (async () => {
      const cats = await getCategorias();
      setCategorias(cats || []);
    })();
  }, []);

  // Fetch no-filter products
  useEffect(() => {
    if (filtros) return;
    const fetchAll = async () => {
      const data = await getProductos();
      if (!data) return;
      const enriched = await Promise.all(
        data.map(async p => {
          const attr = p.attributes;
          let cpDestino = ubicacion?.codigoPostal || '11560';
          let cpOrigen = attr.cp || '11590';
          if (!cpOrigen || !cpDestino) return null;
          let envio = null, total = null, img = null;
          try {
            envio = await precotizarMienvio(cpOrigen, cpDestino, attr.largo, attr.ancho, attr.alto, attr.peso);
            total = await precotizacionTotal(p, cpDestino);
            img = await obtenerImagenProducto(p.id);
          } catch (err) { console.error(err); }
          return {
            ...p,
            envio,
            total,
            imagen: img,
            calificacion: calificacionPromedio(p),
            numCalificaciones: obtenerNumeroCalificaciones(p),
          };
        })
      );
      setProductos(enriched.filter(Boolean));
    };
    if (ubicacion?.codigoPostal) fetchAll();
  }, [ubicacion, filtros]);

  // Fetch filtered products
  useEffect(() => {
    if (!filtros) return;
    fetchProductosFiltros({ filtros, parametros });
  }, [pagina, porPagina, filtros, parametros]);

  // Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const id = e.target.getAttribute('data-id');
            setVisible(v => ({ ...v, [id]: true }));
            observer.unobserve(e.target);
          }
        });
      }, { threshold: 0.2 }
    );
    const lista = filtros ? productosFiltrados : productos;
    if (Array.isArray(lista)) {
      lista.forEach(prod => {
        const el = document.querySelector(`[data-id='${prod.id}']`);
        if (el) observer.observe(el);
      });
    }
    return () => observer.disconnect();
  }, [filtros ? productosFiltrados : productos]);

  const listToRender = filtros ? productosFiltrados.data : productos;

  // 🔳 Barra negra tabs con iconos púrpuras
  const tabs = [
    { label: 'Oficiales', icon: <StorefrontIcon sx={{ color: '#b47bff' }} /> },
    { label: 'Productos', icon: <LocalOfferIcon sx={{ color: '#b47bff' }} /> },
    { label: 'Servicios', icon: <BuildIcon sx={{ color: '#b47bff' }} /> },
    { label: 'Trueque', icon: <SwapHorizIcon sx={{ color: '#b47bff' }} /> },
  ];
  const path = location.pathname;

  return (
    <>
      {/* 🔳 Barra negra debajo de la navbar */}
      <Box
        sx={{
          width: '100%',
          bgcolor: 'black',
          color: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 1.2,
          borderBottom: '2px solid #222',
          
          top: 64,
          zIndex: 1000,
        }}
      >
        <Stack
          direction="row"
          spacing={4}
          sx={{
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          {tabs.map(({ label, icon }) => {
            const tabPath = `/${label.toLowerCase()}`;
            const isActive = path.startsWith(tabPath) || (label === 'Productos' && path.startsWith('/productos'));
            return (
              <Stack
                key={label}
                direction="row"
                alignItems="center"
                spacing={1}
                onClick={() => {
                  if (label === 'Oficiales') navigate('/oficiales');
                  else if (label === 'Productos') navigate('/productos');
                  else if (label === 'Servicios') navigate('/servicios');
                  else if (label === 'Trueque') navigate('/trueque');
                }}
                sx={{
                  borderBottom: isActive ? '2px solid #b47bff' : '2px solid transparent',
                  pb: 0.3,
                  transition: 'all 0.3s ease',
                  '&:hover': { color: '#b47bff' },
                }}
              >
                {icon}
                <Typography>{label}</Typography>
              </Stack>
            );
          })}
        </Stack>
      </Box>

      {/* 🛍️ Contenido principal */}
      <Container maxWidth="lg" sx={{ mt: filtros ? 4 : 0, mb: filtros ? 8 : 0 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Box sx={{ flex: 1, mr: 1 }}>
            <Buscador value={busqueda} onChange={e => setBusqueda(e.target.value)} onSearch={handleBuscar} />
          </Box>
        </Box>

        {!loadingCategorias && categorias.length > 0 && mostrarCategorias && (
          <Box mt={4}>
            <CategoriasSlider
              categorias={categorias.map(c => ({
                nombre: c.attributes.nombre,
                slug: c.attributes.slug,
                imagen: `${process.env.REACT_APP_STRAPI_URL}${c.attributes.imagen?.data?.attributes?.url}`,
              }))}
              onClick={(slug) => handleCategoriaClick(slug)}
            />
          </Box>
        )}

        {titulo && (
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            <u className="productos-titulo">{titulo}</u>
          </Typography>
        )}

        <Grid container spacing={3} mt={4}>
          {(Array.isArray(listToRender) && listToRender.length === 0) && (
            <Grid item xs={12}>
              <Typography textAlign="center">
                {filtros
                  ? loadingFiltros ? 'Cargando productos...' : 'No hay productos.'
                  : 'No se encontraron productos disponibles.'}
              </Typography>
            </Grid>
          )}

          {Array.isArray(listToRender) && listToRender.map(prod => (
            <Grid
              key={prod.id}
              item
              xs={12}
              sm={6}
              md={3}
              data-id={prod.id}
              className="producto-card"
              sx={{
                opacity: visible[prod.id] ? 1 : 0,
                transform: visible[prod.id] ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.6s ease',
              }}
            >
              <ProductoCard
                titulo={prod.attributes.nombre}
                slug={prod.attributes.slug}
                imagenes={prod.attributes.imagenes}
                descripcion={prod.attributes.descripcion}
                imagen={prod.imagen}
                precio={prod.attributes.precio}
                envioAprox={prod.envio?.costo ? `$${prod.envio.costo} aprox.` : null}
                localidad={prod.attributes.localidad}
                estado={prod.attributes.estado}
                calificacion={prod.calificacion}
                numeroCalificaciones={prod.numCalificaciones}
                vendidos={prod.attributes.vendidos}
                total={prod.total && `$${prod.total}`}
              />
            </Grid>
          ))}
        </Grid>

        {filtros && Array.isArray(productosFiltrados.data) && productosFiltrados.data.length > porPagina && (
          <Box mt={3} display="flex" justifyContent="center" alignItems="center">
            <Pagination
              count={Math.ceil(totalItems / porPagina)}
              page={pagina}
              onChange={(_, v) => setPagina(v)}
            />
            <TextField
              select
              value={porPagina}
              onChange={e => setPorPagina(Number(e.target.value))}
              SelectProps={{ native: true }}
              size="small"
              sx={{ width: 80, ml: 2 }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </TextField>
          </Box>
        )}
      </Container>
    </>
  );
};

export default MarketPlace;

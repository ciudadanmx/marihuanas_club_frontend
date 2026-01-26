// src/Pages/MarketPlace/MarketPlace.jsx
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Buscador from '../../components/MarketPlace/Buscador';
import ProductoCard from '../../components/MarketPlace/ProductoCard';
import CategoriasSlider from '../../components/MarketPlace/CategoriasSlider';
import PreCargador from '../../components/PreCargador.jsx';

// <-- IMPORTS DE HOOKS: los importo COMO DEFAULT para evitar "no-undef".
// Si tus hooks son named exports cámbialos a:
// import { useCategorias } from '../../hooks/useCategorias';
import { useCategorias } from '../../hooks/useCategorias';
import { useUbicacion } from '../../hooks/useUbicacion';
import useProductos from '../../hooks/useProductos';

import {
  Box,
  Grid,
  Container,
  Typography,
  TextField,
  useMediaQuery,
  useTheme,
  Pagination,
  Skeleton,
  Button,
} from '@mui/material';

const MarketPlace = ({ filtros = '', parametros = '' }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();

  // ---------------------------
  // hooks (llamados siempre, en orden) - NO CONDICIONALES
  // ---------------------------
  const { getCategorias, loading: loadingCategorias } = useCategorias();
  const { ubicacion } = useUbicacion();

  // TWO instances of useProductos (one for streaming, one for paginated filters)
  const prodHook = useProductos();
  const pagHook = useProductos({ paginado: true });

  const {
    getProductos,
    precotizarMienvio,
    precotizacionTotal,
    calificacionPromedio,
    obtenerNumeroCalificaciones,
    obtenerImagenProducto,
  } = prodHook || {};

  const {
    productos: productosFiltrados = { data: [] },
    loading: loadingFiltros,
    error: errorFiltros,
    pagina,
    setPagina,
    porPagina,
    setPorPagina,
    buscarProductos,
    totalItems,
  } = pagHook || {};

  // ---------------------------
  // estado UI
  // ---------------------------
  const [productos, setProductos] = useState([]); // productos enriquecidos (modo sin filtros)
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [visible, setVisible] = useState({}); // para animaciones de entrada
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [errorProductos, setErrorProductos] = useState(null);

  // refs y control de peticiones
  const itemRefs = useRef(new Map()); // id -> element
  const observerRef = useRef(null);
  const requestIdRef = useRef(0);
  const debounceRef = useRef(null);
  const fetchTimeoutRef = useRef(null);

  // ---------------------------
  // títulos / mostrar categorias
  // ---------------------------
  let titulo = '';
  let mostrarCategorias = true;
  if (filtros === 'busqueda') {
    titulo = `Resultados de Búsqueda «${(parametros || '').charAt(0).toUpperCase() + (parametros || '').slice(1)}»`;
    mostrarCategorias = false;
  } else if (filtros === 'categoria') {
    titulo = `Productos en Categoría «${(parametros || '').charAt(0).toUpperCase() + (parametros || '').slice(1)}»`;
    mostrarCategorias = false;
  } else if (filtros === 'mis-productos') {
    titulo = '»» Tus Productos ««';
    mostrarCategorias = false;
  }

  // ---------------------------
  // cargar categorías (una vez)
  // ---------------------------
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cats = typeof getCategorias === 'function' ? await getCategorias() : [];
        if (mounted) setCategorias(cats || []);
      } catch (err) {
        console.error('[MarketPlace] getCategorias error', err);
        if (mounted) setCategorias([]);
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------
  // helper: lista a renderizar y clave estable
  // ---------------------------
  const listToRender = useMemo(() => (filtros ? (productosFiltrados?.data || []) : (productos || [])), [filtros, productosFiltrados, productos]);
  const listIdsKey = useMemo(() => listToRender.map(p => p?.id).join('|'), [listToRender]);

  // ---------------------------
  // navegación y handlers
  // ---------------------------
  const handleBuscar = useCallback(async () => {
    const slug = busqueda.trim().toLowerCase().replace(/\s+/g, '-');
    if (!slug) return;
    navigate(`/productos/busqueda/${slug}`);
    try {
      setLoadingProductos(true);
      setErrorProductos(null);
      if (typeof setPagina === 'function') setPagina(1);
      if (typeof buscarProductos === 'function') {
        await buscarProductos({ filtros: 'busqueda', parametros: slug, pagina: 1, porPagina });
      }
    } catch (err) {
      console.error('[handleBuscar]', err);
      setErrorProductos('Error al buscar productos.');
    } finally {
      setLoadingProductos(false);
    }
  }, [busqueda, buscarProductos, navigate, porPagina, setPagina]);

  const handleMis = useCallback(async () => {
    navigate('/productos/mis-productos');
    try {
      setLoadingProductos(true);
      setErrorProductos(null);
      if (typeof setPagina === 'function') setPagina(1);
      if (typeof buscarProductos === 'function') {
        await buscarProductos({ filtros: 'mis-productos', parametros: '', pagina: 1, porPagina });
      }
    } catch (err) {
      console.error('[handleMis]', err);
      setErrorProductos('Error al cargar tus productos.');
    } finally {
      setLoadingProductos(false);
    }
  }, [buscarProductos, navigate, porPagina, setPagina]);

  const handleCategoriaClick = useCallback(async (slug) => {
    navigate(`/productos/categoria/${slug}`);
    try {
      setLoadingProductos(true);
      setErrorProductos(null);
      if (typeof setPagina === 'function') setPagina(1);
      if (typeof buscarProductos === 'function') {
        await buscarProductos({ filtros: 'categoria', parametros: slug, pagina: 1, porPagina });
      }
    } catch (err) {
      console.error('[handleCategoriaClick]', err);
      setErrorProductos('Error al filtrar por categoría.');
    } finally {
      setLoadingProductos(false);
    }
  }, [buscarProductos, navigate, porPagina, setPagina]);

  // ---------------------------
  // Fetch productos (modo SIN filtros) - streaming/chunks
  // ---------------------------
  useEffect(() => {
    // solo en modo sin filtros ejecutamos getProductos
    if (filtros) return;
    if (typeof getProductos !== 'function') {
      setProductos([]);
      return;
    }
    // necesitamos cp
    if (!ubicacion?.codigoPostal) {
      // no hay cp: dejamos vacio y no intentamos fetch
      setProductos([]);
      setLoadingProductos(false);
      return;
    }

    let mounted = true;
    const currentRequestId = ++requestIdRef.current;
    setLoadingProductos(true);
    setErrorProductos(null);
    setProductos([]); // limpiamos

    // timeout por si queda colgado
    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    fetchTimeoutRef.current = setTimeout(() => {
      if (requestIdRef.current === currentRequestId) {
        setLoadingProductos(false);
        setErrorProductos('Tiempo de espera agotado al cargar productos.');
      }
    }, 20000); // 20s

    (async () => {
      try {
        const seen = new Set();
        await getProductos({
          onChunk: async (p) => {
            if (!mounted) return;
            if (!p || !p.id) return;
            if (seen.has(p.id)) return;
            seen.add(p.id);

            const attr = p.attributes || {};
            const cpDestino = ubicacion?.codigoPostal || '11560';
            const cpOrigen = attr.cp || '11590';

            // enriquecimiento paralelo no bloqueante (capturamos errores)
            let envio = null, total = null, img = null;
            try { envio = await precotizarMienvio(cpOrigen, cpDestino, attr.largo, attr.ancho, attr.alto, attr.peso); } catch(e) {/* ignore */}
            try { total = await precotizacionTotal(p, cpDestino); } catch(e) {/* ignore */}
            try { img = await obtenerImagenProducto(p.id); } catch(e) {/* ignore */}

            const precioNum = Number(attr.precio) || 0;
            const enriched = {
              ...p,
              envio,
              total,
              imagen: img,
              calificacion: typeof calificacionPromedio === 'function' ? calificacionPromedio(p) : null,
              numCalificaciones: typeof obtenerNumeroCalificaciones === 'function' ? obtenerNumeroCalificaciones(p) : 0,
              precio: precioNum,
            };

            setProductos(prev => {
              if (prev.some(x => x.id === enriched.id)) return prev;
              return [...prev, enriched];
            });
          },
          batchSize: 2,
          chunkDelay: 10,
        });

        if (requestIdRef.current === currentRequestId && mounted) {
          setLoadingProductos(false);
        }
      } catch (err) {
        console.error('[MarketPlace] getProductos error', err);
        if (requestIdRef.current === currentRequestId && mounted) {
          setErrorProductos('Error cargando productos.');
          setLoadingProductos(false);
        }
      } finally {
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
          fetchTimeoutRef.current = null;
        }
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ubicacion?.codigoPostal, filtros, getProductos, precotizarMienvio, precotizacionTotal, obtenerImagenProducto, calificacionPromedio, obtenerNumeroCalificaciones]);

  // ---------------------------
  // Fetch productos filtrados (modo CON filtros) - debounce y control de requestId
  // ---------------------------
useEffect(() => {
  if (!filtros) return;
  if (typeof buscarProductos !== 'function') return;

  if (debounceRef.current) clearTimeout(debounceRef.current);
  const currentRequestId = ++requestIdRef.current;

  debounceRef.current = setTimeout(async () => {
    setLoadingProductos(true);
    setErrorProductos(null);

    try {
      const requestParams = { pagina, porPagina, filtros };
      if (parametros) requestParams.parametros = parametros;

      // ✅ PRECIOS DESDE URL
      const searchParams = new URLSearchParams(location.search);
      const precioMin = searchParams.get('precio_min');
      const precioMax = searchParams.get('precio_max');

      if (precioMin !== null) requestParams.precio_min = Number(precioMin);
      if (precioMax !== null) requestParams.precio_max = Number(precioMax);

      await buscarProductos(requestParams);
    } catch (err) {
      console.error('[MarketPlace] buscarProductos error', err);
      if (requestIdRef.current === currentRequestId) {
        setErrorProductos('Error al filtrar productos.');
      }
    } finally {
      if (requestIdRef.current === currentRequestId) {
        setLoadingProductos(false);
      }
    }
  }, 250);

  return () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };
}, [filtros, parametros, pagina, porPagina, buscarProductos, location.search]);


  // ---------------------------
  // Observer para animar cuando entran en viewport
  // ---------------------------
  useEffect(() => {
    // desconectar observer previo
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.getAttribute('data-id');
          if (id) {
            setVisible(v => ({ ...v, [id]: true }));
            try { observer.unobserve(e.target); } catch (_) {}
          }
        }
      });
    }, { threshold: 0.2 });

    observerRef.current = observer;
    // observar los elementos actuales en itemRefs
    itemRefs.current.forEach(el => {
      if (el) observer.observe(el);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [listIdsKey]);

  // ---------------------------
  // Render
  // ---------------------------
  const shouldShowCategorias = mostrarCategorias && categorias.length > 0 && !loadingCategorias;

  return (
    <Container maxWidth="lg" sx={{ mt: filtros ? 4 : 0, mb: filtros ? 8 : 0 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Box sx={{ flex: 1, mr: 1 }}>
          <Buscador value={busqueda} onChange={e => setBusqueda(e.target.value)} onSearch={handleBuscar} />
        </Box>
        <Box>
          <Button variant="text" onClick={handleMis}>Mis productos</Button>
        </Box>
      </Box>

      {shouldShowCategorias && (
        <Box mt={4}>
          <CategoriasSlider
            categorias={categorias.map(c => ({
              nombre: c.attributes?.nombre || c.nombre || '—',
              slug: c.attributes?.slug || c.slug || '—',
              imagen: c.attributes?.imagen?.data?.attributes?.url ? `${process.env.REACT_APP_STRAPI_URL}${c.attributes.imagen.data.attributes.url}` : null,
            }))}
            onClick={handleCategoriaClick}
          />
        </Box>
      )}

      {titulo && (
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          <u className="productos-titulo">{titulo}</u>
        </Typography>
      )}

      {(!ubicacion?.codigoPostal && !filtros) && (
        <Box my={3} textAlign="center">
          <Typography>📍 No hemos detectado tu ubicación. Por favor configura tu ubicación para mostrar productos cercanos.</Typography>
        </Box>
      )}

      {errorProductos && (
        <Box my={2}>
          <Typography color="error">{errorProductos}</Typography>
        </Box>
      )}

      <Grid container spacing={3} mt={4}>
        {/* Skeletons mientras carga (y no hay resultados) */}
        { (loadingProductos && listToRender.length === 0) && Array.from({ length: isDesktop ? 8 : 4 }).map((_, i) => (
          <Grid key={`skel-${i}`} item xs={12} sm={6} md={3}>
            <Skeleton variant="rectangular" height={220} />
            <Skeleton width="60%" sx={{ mt: 1 }} />
            <Skeleton width="40%" />
          </Grid>
        )) }

        {/* Empty state */}
        {(!loadingProductos && listToRender.length === 0) && (
          <Grid item xs={12}>
            <Box display="flex" flexDirection="column" alignItems="center" py={6}>
              <Typography variant="h6">{filtros ? (loadingFiltros ? '' : 'No hay productos.') : 'No se encontraron productos.'}</Typography>
              {loadingFiltros && <PreCargador text="Buscando productos..." />}
            </Box>
          </Grid>
        )}

        {/* Lista */}
        {listToRender.map(prod => {
          const id = prod.id ?? prod.attributes?.id ?? Math.random().toString(36).slice(2,9);
          const tituloProd = prod.attributes?.nombre ?? prod.nombre ?? 'Sin título';
          const slug = prod.attributes?.slug ?? prod.slug ?? '';
          const imagen = prod.imagen ?? (prod.attributes?.imagenes?.data?.[0]?.attributes?.url ? `${process.env.REACT_APP_STRAPI_URL}${prod.attributes.imagenes.data[0].attributes.url}` : null);
          const descripcion = prod.attributes?.descripcion ?? prod.descripcion ?? '';
          const precio = prod.precio ?? Number(prod.attributes?.precio) ?? null;
          const envioAprox = prod.envio?.costo ? `$${prod.envio.costo} aprox.` : null;
          const localidad = prod.attributes?.localidad ?? '';

          return (
            <Grid
              key={id}
              item
              xs={12}
              sm={6}
              md={3}
              data-id={id}
              ref={(el) => {
                if (el) itemRefs.current.set(id, el);
                else itemRefs.current.delete(id);
              }}
              className="producto-card"
              sx={{
                opacity: visible[id] ? 1 : 0,
                transform: visible[id] ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.6s ease'
              }}
            >
              <ProductoCard
                titulo={tituloProd}
                slug={slug}
                imagenes={prod.attributes?.imagenes}
                descripcion={descripcion}
                imagen={imagen}
                precio={precio}
                envioAprox={envioAprox}
                localidad={localidad}
                estado={prod.attributes?.estado}
                calificacion={prod.calificacion}
                numeroCalificaciones={prod.numCalificaciones}
                vendidos={prod.attributes?.vendidos}
                total={prod.total && `$${prod.total}`}
              />
            </Grid>
          );
        })}
      </Grid>

      {/* Paginación (modo filtros) */}
      {filtros && listToRender.length > 0 && (
        <Box mt={3} display="flex" justifyContent="center" alignItems="center">
          <Pagination count={Math.ceil((totalItems || listToRender.length) / (porPagina || 1))} page={pagina} onChange={(_, v) => setPagina(v)} />
          <TextField select value={porPagina} onChange={e => setPorPagina(Number(e.target.value))} SelectProps={{ native: true }} size="small" sx={{ width: 100, ml: 2 }}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </TextField>
        </Box>
      )}
    </Container>
  );
};

export default MarketPlace;

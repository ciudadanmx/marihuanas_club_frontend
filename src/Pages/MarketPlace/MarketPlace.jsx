import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Buscador from '../../components/MarketPlace/Buscador';
import ProductoCard from '../../components/MarketPlace/ProductoCard';
//mport BotonVender from '../../components/MarketPlace/BotonVender';
import { CircularProgress } from '@mui/material';
import CategoriasSlider from '../../components/MarketPlace/CategoriasSlider';
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
} from '@mui/material';

const MarketPlace = ({ filtros = '', parametros = '' }) => {

    const observerRef = useRef(null);


  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();

  // Shared state
  const { getCategorias, loading: loadingCategorias } = useCategorias();
  const { ubicacion } = useUbicacion();

  // No-filters logic
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
  console.log('buscar pagHook keys:', Object.keys(pagHook));
  console.log('buscar pagHook full:', pagHook);
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
  } = pagHook;
  console.log('filtrando búsqueda', productosFiltrados);

  // UI state
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [visible, setVisible] = useState({});

  // Handlers
// Handler de búsqueda — reemplaza el existente
const handleBuscar = async () => {
  console.log('🔥🔎🔥🔎🔥🔎 preiniciando búsqueda');

  
    // calculamos una clave simple basada en los ids para usar en las dependencias
  const lista = filtros ? productosFiltrados?.data || [] : productos || [];
  const listaIdsKey = lista.map(p => p.id).join('|'); // cadena estable si los ids no cambian
  const slug = busqueda.trim().toLowerCase().replace(/\s+/g, '-');
  if (!slug) return;

  // navegamos como antes
  console.log('botón búsqueda');
  navigate(`/productos/busqueda/${slug}`);

  // forzamos la paginación a 1 y pedimos resultados filtrados inmediatamente
  try {
    console.clear();
    console.log('🔥🔥🔥🔎🔎🔎🔎🔎 Iniciando búsqueda');
    setPagina(1);
    await buscarProductos({
      filtros: 'busqueda',
      parametros: slug,
      pagina: 1,
      porPagina,
    });
  } catch (err) {
    console.error('[handleBuscar] fetchProductosFiltros error:', err);
  }
};

// Handler de "mis productos" — reemplaza el existente (solo si quieres que cargue al navegar)
const handleMis = async () => {
  navigate('/productos/mis-productos');

  try {
    setPagina(1);
    await buscarProductos({
      filtros: 'mis-productos',
      parametros: '',
      pagina: 1,
      porPagina,
    });
  } catch (err) {
    console.error('[handleMis] fetchProductosFiltros error:', err);
  }
};

// Handler para click en categoría — reemplaza el existente
const handleCategoriaClick = async (slug) => {
  // navegamos como antes
  navigate(`/productos/categoria/${slug}`);

  // pedimos la lista filtrada por categoria inmediatamente
  try {
    setPagina(1);
    await buscarProductos({
      filtros: 'categoria',
      parametros: slug,
      pagina: 1,
      porPagina,
    });
  } catch (err) {
    console.error('[handleCategoriaClick] fetchProductosFiltros error:', err);
  }
};


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


/* --- Preparar lista y clave estable para observer --- */
// calculamos lista arriba para reutilizar en observer y en otros efectos
const lista = filtros ? (productosFiltrados?.data || []) : (productos || []);
const listaIdsKey = (lista && lista.map(p => p?.id).join('|')) || '';

// Debounce + requestId para evitar respuestas fuera de orden
const debounceRef = useRef(null);
const requestIdRef = useRef(0);

// Fetch no-filter products (versión incremental)
useEffect(() => {
  console.log('búsqueda buscando', filtros);
  if (filtros) return;
  if (!ubicacion?.codigoPostal) return;

  const fetchAll = async () => {
    setProductos([]); // limpiar antes de empezar

    await getProductos({
      onChunk: async (p) => {
        // --- Enriquecimiento por producto ---
        const attr = p.attributes;
        if (!attr || !attr.nombre || !attr.precio) return;

        const cpDestino = ubicacion?.codigoPostal || '11560';
        const cpOrigen = attr.cp || '11590';

        let envio = null, total = null, img = null;
        try {
          envio = await precotizarMienvio(
            cpOrigen,
            cpDestino,
            attr.largo,
            attr.ancho,
            attr.alto,
            attr.peso
          );

          total = await precotizacionTotal(p, cpDestino);
          img = await obtenerImagenProducto(p.id);
        } catch (err) {
          console.error('[fetchAll chunk] error:', err);
        }

        const precioNum = Number(attr.precio) || 0;

        const enriched = {
          ...p,
          envio,
          total,
          imagen: img,
          calificacion: calificacionPromedio(p),
          numCalificaciones: obtenerNumeroCalificaciones(p),
          precio: precioNum,
        };

        // se agrega de inmediato a la UI
        setProductos(prev => [...prev, enriched]);
      },

      batchSize: 1,   // entrega 1 por 1 para render inmediato
      chunkDelay: 0,  // puedes subirlo a 20–50ms si quieres efecto "goteo"
    });
  };

  fetchAll();
}, [ubicacion, filtros]);

// Fetch filtered products — ahora con debounce + requestId para evitar out-of-order
// Fetch filtered products — ahora con debounce + requestId para evitar out-of-order
useEffect(() => {
  if (typeof buscarProductos !== 'function') {
    console.warn('buscarProductos no es función en pagHook');
    return;
  }

  if (debounceRef.current) clearTimeout(debounceRef.current);

  debounceRef.current = setTimeout(async () => {
    const currentRequestId = ++requestIdRef.current;

    try {
      const requestParams = { pagina, porPagina };

      if (filtros) {
        requestParams.filtros = filtros;
        if (parametros) requestParams.parametros = parametros;

        // Intentamos leer precio_min y precio_max del DOM (varios selectores comunes)
        try {
          const minSelectors = [
            'input[name="precio_min"]',
            '#precio_min',
            'input[data-field="precio_min"]',
            '.rango-precio-min input',
            '#rangoPrecioMin'
          ];
          const maxSelectors = [
            'input[name="precio_max"]',
            '#precio_max',
            'input[data-field="precio_max"]',
            '.rango-precio-max input',
            '#rangoPrecioMax'
          ];

          let minVal = null;
          let maxVal = null;

          for (const sel of minSelectors) {
            const el = document.querySelector(sel);
            if (el) { minVal = el.value ?? el.getAttribute('value') ?? null; break; }
          }
          for (const sel of maxSelectors) {
            const el = document.querySelector(sel);
            if (el) { maxVal = el.value ?? el.getAttribute('value') ?? null; break; }
          }

          // Normalizamos y parseamos a número
          const minNum = (minVal !== null && minVal !== '') ? Number(String(minVal).replace(/[^0-9.-]+/g, '')) : NaN;
          const maxNum = (maxVal !== null && maxVal !== '') ? Number(String(maxVal).replace(/[^0-9.-]+/g, '')) : NaN;

          // Solo incluir si ambos son números válidos
          if (!Number.isNaN(minNum) && !Number.isNaN(maxNum)) {
            // adicional: evita enviar rangos vacíos o iguales a 0/0 (si tu backend tiene defaults, ajusta aquí)
            requestParams.precio_min = minNum;
            requestParams.precio_max = maxNum;
            console.log('[buscarProductos] enviando precio_min/precio_max:', minNum, maxNum);
          } else {
            console.log('[buscarProductos] no se envía rango de precios (min/max inválidos o no encontrados)', { minVal, maxVal });
          }
        } catch (err) {
          console.warn('[buscarProductos] error leyendo precio_min/max del DOM:', err);
        }
      } else {
        // Si NO está desplegada la sección de filtros: limpiamos controles de precio del DOM
        try {
          const clearSelectors = [
            'input[name="precio_min"]',
            'input[name="precio_max"]',
            '#precio_min',
            '#precio_max',
            'input[data-field="precio_min"]',
            'input[data-field="precio_max"]',
            '.rango-precio input',
            'input[type="range"]'
          ];
          clearSelectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
              try {
                if ('value' in el) el.value = '';
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
              } catch (e) { /* ignore */ }
            });
          });
          console.log('[buscarProductos] filtros ocultos: limpiados controles de precio en DOM');
        } catch (err) {
          console.warn('[buscarProductos] error limpiando controles de precio en DOM:', err);
        }
      }

      await buscarProductos(requestParams);

      if (currentRequestId !== requestIdRef.current) {
        console.log('Respuesta de buscarProductos ignorada por ser antigua', currentRequestId);
        return;
      }
    } catch (err) {
      console.error('[buscarProductos debounce] error:', err);
    }
  }, 250);

  return () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [filtros, parametros, pagina, porPagina, buscarProductos]);

  // Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const id = e.target.getAttribute('data-id');
            setVisible(v => ({ ...v, [id]: true }));
            try { observer.unobserve(e.target); } catch(_) {}
          }
        });
      }, { threshold: 0.2 }
    );
    // usamos la lista ya calculada arriba y la clave estable listaIdsKey
    lista.forEach(prod => {
      const el = document.querySelector(`[data-id='${prod.id}']`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
    // ahora dependemos de listaIdsKey para que solo re-ejecute cuando cambien los ids
  }, [listaIdsKey.length, filtros]);

  // Render
  const listToRender = filtros ? (productosFiltrados?.data || []) : (productos || []);
  const shouldShowCategorias = mostrarCategorias && categorias.length > 0 && !loadingCategorias;

  return (
    <Container maxWidth="lg" sx={{ mt: filtros ? 4 : 0, mb: filtros ? 8 : 0 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Box sx={{ flex: 1, mr: 1 }}>
          <Buscador value={busqueda} onChange={e => setBusqueda(e.target.value)} onSearch={handleBuscar} />
        </Box>
      </Box>

      {shouldShowCategorias && (
        <Box mt={4}>
          <CategoriasSlider 
            categorias={categorias.map(c => ({ 
              nombre: c.attributes.nombre, 
              slug: c.attributes.slug, 
              imagen: `${process.env.REACT_APP_STRAPI_URL}${c.attributes.imagen?.data?.attributes?.url}` 
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

      <Grid container spacing={3} mt={4}>
        {listToRender.length === 0 && (
          <Grid item xs={12}>
            <Typography textAlign="center">
              {filtros ? (
    loadingFiltros ? (
        'Cargando productos...'
    ) : (
        'No hay productos.'
    )
) : (
    <div
        style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            width: '100%',
        }}
    >
        <CircularProgress size={28} />
        <span style={{ marginTop: '10px' }}>Cargando Productos</span>
    </div>
)}
            </Typography>
          </Grid>
        )}

        {listToRender.map(prod => (
          <Grid key={prod.id} item xs={12} sm={6} md={3} data-id={prod.id} className="producto-card"
            sx={{ opacity: visible[prod.id] ? 1 : 0, transform: visible[prod.id] ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease'}}
          >
            <ProductoCard
              titulo={prod.attributes.nombre}
              slug={prod.attributes.slug}
              imagenes={prod.attributes.imagenes}
              descripcion={prod.attributes.descripcion}
              imagen={prod.imagen}
              precio={prod.precio}
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

      {filtros && listToRender.length > porPagina && (
        <Box mt={3} display="flex" justifyContent="center" alignItems="center">
          <Pagination count={Math.ceil(totalItems / porPagina)} page={pagina} onChange={(_, v) => setPagina(v)} />
          <TextField select value={porPagina} onChange={e => setPorPagina(Number(e.target.value))} SelectProps={{ native: true }} size="small" sx={{ width: 80, ml: 2 }}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </TextField>
        </Box>
      )}
    </Container>
  );
};

export default MarketPlace;

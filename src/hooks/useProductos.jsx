// src/hooks/useProductos.js
import { useState, useCallback, useRef } from 'react';
import axios from 'axios';

const regiones = {
  Norte: ['Chihuahua', 'Sonora', 'Coahuila', 'Nuevo León', 'Durango', 'Tamaulipas'],
  Centro: ['CDMX', 'Estado de México', 'Hidalgo', 'Puebla', 'Tlaxcala', 'Morelos', 'Querétaro'],
  Occidente: ['Jalisco', 'Michoacán', 'Colima', 'Nayarit', 'Zacatecas', 'San Luis Potosí'],
  Sur: ['Oaxaca', 'Chiapas', 'Veracruz', 'Tabasco', 'Guerrero'],
  Sureste: ['Yucatán', 'Campeche', 'Quintana Roo'],
  Bajío: ['Aguascalientes', 'Guanajuato'],
};

const getRegion = (estado) => {
  for (const [region, estados] of Object.entries(regiones)) {
    if (estados.includes(estado)) return region;
  }
  return null;
};

const obtenerEstadoPorCP = async (cp) => {
  const cpp = cp || '11560';
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${cpp}&components=country:MX&key=${process.env.REACT_APP_GEOCODING_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK') return null;

    const resultados = data.results[0]?.address_components;
    if (!resultados) return null;

    const estado = resultados.find(component =>
      component.types.includes('administrative_area_level_1')
    );

    return estado ? estado.long_name : null;
  } catch (err) {
    return null;
  }
};

const obtenerEstadoProducto = async (producto) => {
  return await obtenerEstadoPorCP(producto.cp);
};

const obtenerCPProducto = (producto) => {
  return producto.cp || null;
};

const calcularPesoVolumetrico = (largoCm, anchoCm, altoCm) => {
  return (largoCm * anchoCm * altoCm) / 5000;
};

const calcularPesoCobrado = (pesoReal, pesoVolumetrico) => {
  return Math.max(pesoReal, pesoVolumetrico);
};

const estimarCostoEnvio = (regionOrigen, regionDestino, pesoCobrado) => {
  let base = 0;
  if (regionOrigen && regionDestino) {
    base = regionOrigen === regionDestino ? 70 : 130;
  } else {
    base = 150;
  }
  if (pesoCobrado <= 1) return base;
  const extraPeso = Math.ceil(pesoCobrado - 1);
  return base + extraPeso * 30;
};

const precotizarMienvio = async (cpOrigen, cpDestino, largo, ancho, alto, peso) => {
  const cppOrigen = cpOrigen || '11560';
  const cppDestino = cpDestino || '11560';
  const estadoOrigen = await obtenerEstadoPorCP(cppOrigen);
  const estadoDestino = await obtenerEstadoPorCP(cppDestino);
  if (!estadoOrigen || !estadoDestino) return null;
  const regionOrigen = getRegion(estadoOrigen);
  const regionDestino = getRegion(estadoDestino);
  const pesoVol = calcularPesoVolumetrico(largo, ancho, alto);
  const pesoCobrado = calcularPesoCobrado(peso, pesoVol);
  return estimarCostoEnvio(regionOrigen, regionDestino, pesoCobrado);
};

const precotizarStripe = (precioProducto) => {
  const tarifa = precioProducto < 200 ? 5 : 10;
  const iva = tarifa * 0.16;
  return parseFloat((tarifa + iva).toFixed(2));
};

const precotizacionSuma = async (producto, cpDestino) => {
  const envio = await precotizarMienvio(producto.cp, cpDestino, producto.largo, producto.ancho, producto.alto, producto.peso);
  const comision = precotizarStripe(producto.precio);
  producto.comisionStripe = comision;
  return { envio, comision };
};

const precotizacionTotal = async (producto, cpDestino) => {
  const { envio, comision } = await precotizacionSuma(producto, cpDestino);
  return parseFloat((producto.precio + envio + comision).toFixed(2));
};

/**
 * useProductos
 * @param {Object} options
 * @param {boolean} options.paginado - si true, el hook devolverá productos en forma { data: [], meta: {} }
 */
const useProductos = ({ paginado } = {}) => {
  const isPaginado = Boolean(paginado);
  // estado inicial acorde al modo paginado o no
  const [productos, setProductos] = useState(isPaginado ? { data: [], meta: {} } : []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [producto, setProducto] = useState(null);
  const [totalItems, setTotalItems] = useState(0);

  const API_ROOT = process.env.REACT_APP_STRAPI_URL + '/api';
  const API_URL_PRODUCTOS = `${API_ROOT}/productos`;

  // ref para evitar multiples updates si es necesario
  const mountedRef = useRef(true);
  // cleanup si es necesario (si en el futuro añades useEffect para cancelar peticiones)
  // useEffect(() => () => { mountedRef.current = false; }, []);

  // helper para setear productos respetando el modo paginado
  const setProductosNormalized = useCallback((items = [], meta = {}) => {
    if (isPaginado) {
      setProductos({ data: items, meta: meta || {} });
      setTotalItems(meta?.pagination?.total || (items ? items.length : 0));
    } else {
      setProductos(items);
      setTotalItems(items ? items.length : 0);
    }
  }, [isPaginado]);

  // Legacy simple fetch (arreglado) - envía items y meta cuando aplica
  const fetchProductos = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL_PRODUCTOS}`, {
        credentials: 'include',
      });
      const json = await res.json();
      const items = json?.data || [];
      const meta = json?.meta || {};
      setProductosNormalized(items, meta);
      return { items, meta };
    } catch (err) {
      setError(err);
      console.error('fetchProductos error', err);
      return { items: [], meta: {} };
    } finally {
      setLoading(false);
    }
  }, [API_URL_PRODUCTOS, setProductosNormalized]);

  const createProducto = useCallback(async (nuevoProducto) => {
    try {
      const res = await fetch(`${API_URL_PRODUCTOS}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ data: nuevoProducto }),
      });
      const json = await res.json();
      return json;
    } catch (err) {
      setError(err);
      console.error('createProducto error', err);
      return null;
    }
  }, [API_URL_PRODUCTOS]);

  const updateProducto = useCallback(async (id, datos) => {
    try {
      const res = await fetch(`${API_URL_PRODUCTOS}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ data: datos }),
      });
      const json = await res.json();
      return json;
    } catch (err) {
      setError(err);
      console.error('updateProducto error', err);
      return null;
    }
  }, [API_URL_PRODUCTOS]);

  const deleteProducto = useCallback(async (id) => {
    try {
      const res = await fetch(`${API_URL_PRODUCTOS}/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const json = await res.json();
      return json;
    } catch (err) {
      setError(err);
      console.error('deleteProducto error', err);
      return null;
    }
  }, [API_URL_PRODUCTOS]);

  const calificacionPromedio = useCallback((producto) => {
    if (!producto.calificacion || producto.calificacion === 0 || !producto.numero_calificaciones) return 0;
    return parseFloat((producto.calificacion / (producto.numero_calificaciones * 5)).toFixed(2));
  }, []);

  const obtenerNumeroCalificaciones = useCallback((producto) => {
    return producto.numero_calificaciones || 0;
  }, []);

  const contadorResenas = useCallback(async (productoId) => {
    try {
      const res = await fetch(`${API_ROOT}/resenas?filters[producto][id][$eq]=${productoId}`, {
        credentials: 'include'
      });
      const data = await res.json();
      return data?.meta?.pagination?.total || 0;
    } catch (err) {
      console.error('Error contando reseñas:', err);
      return 0;
    }
  }, [API_ROOT]);

  const obtenerResenas = useCallback(async (productoId) => {
    try {
      const res = await fetch(`${API_ROOT}/resenas?filters[producto][id][$eq]=${productoId}`, {
        credentials: 'include'
      });
      const data = await res.json();
      return data?.data || [];
    } catch (err) {
      console.error('Error obteniendo reseñas:', err);
      return [];
    }
  }, [API_ROOT]);

  // getProductos (incremental / onChunk)
  const getProductos = useCallback(async (params = {}) => {
    const { onChunk, batchSize = 1, chunkDelay = 0, ...axiosParams } = params || {};
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_URL_PRODUCTOS, {
        params: {
          populate: '*',
          'pagination[pageSize]': 150,
          ...axiosParams,
        },
      });

      const items = res?.data?.data || [];
      const meta = res?.data?.meta || {};

      if (typeof onChunk === 'function') {
        if (batchSize <= 1) {
          for (const item of items) {
            try {
              // allow onChunk to be async
              await onChunk(item);
              setProductos(prev => {
                if (isPaginado) {
                  // in paginado mode we keep data array inside object
                  const prevData = (prev && prev.data) ? prev.data : [];
                  const next = { data: [...prevData, item], meta };
                  return next;
                }
                return [...prev, item];
              });
            } catch (err) {
              console.error('Error procesando chunk:', err);
            }
            if (chunkDelay) await new Promise(r => setTimeout(r, chunkDelay));
          }
          // after chunks, normalize total/meta
          setTotalItems(meta?.pagination?.total || items.length);
        } else {
          for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            try {
              batch.forEach(it => onChunk(it));
              setProductos(prev => {
                if (isPaginado) {
                  const prevData = (prev && prev.data) ? prev.data : [];
                  return { data: prevData.concat(batch), meta };
                }
                return prev.concat(batch);
              });
            } catch (err) {
              console.error('Error procesando batch:', err);
            }
            if (chunkDelay) await new Promise(r => setTimeout(r, chunkDelay));
          }
          setTotalItems(meta?.pagination?.total || items.length);
        }
      } else {
        // default behavior
        setProductosNormalized(items, meta);
      }

      return items;
    } catch (err) {
      console.error('❌ Error al obtener productos:', err);
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [API_URL_PRODUCTOS, isPaginado, setProductosNormalized]);

  // getProducto por id
  const getProducto = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL_PRODUCTOS}/${id}`, {
        params: { populate: '*' }
      });
      const item = res.data?.data || null;
      setProducto(item);
      return item;
    } catch (err) {
      setError(err);
      console.error('getProducto error', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [API_URL_PRODUCTOS]);

  // getProductoBySlug
  const getProductoBySlug = useCallback(async (slug) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_URL_PRODUCTOS, {
        params: {
          'filters[slug][$eq]': slug,
          populate: '*',
        },
      });
      const data = res.data?.data?.[0] || null;
      setProducto(data);
      return data;
    } catch (err) {
      setError(err);
      console.error('getProductoBySlug error', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [API_URL_PRODUCTOS]);

  // buscarProductos: acepta string o un objeto { filtros, parametros, pagina, porPagina, ... }
  const buscarProductos = useCallback(async (busqueda) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = API_URL_PRODUCTOS;
      let params = { populate: '*' };

      if (typeof busqueda === 'string') {
        const q = busqueda;
        params = {
          ...params,
          'filters[$or][0][descripcion][$containsi]': q,
          'filters[$or][1][nombre][$containsi]': q,
          'filters[$or][2][marca][$containsi]': q,
        };
      } else if (busqueda && typeof busqueda === 'object') {
        const { filtros, parametros, pagina, porPagina, ...rest } = busqueda;

        if (filtros === 'busqueda' && parametros) {
          params = {
            ...params,
            'filters[$or][0][descripcion][$containsi]': parametros,
            'filters[$or][1][nombre][$containsi]': parametros,
            'filters[$or][2][marca][$containsi]': parametros,
          };
        } else if (filtros === 'categoria' && parametros) {
          // Ajusta según tu modelo de categoría en Strapi (slug vs id)
          params = {
            ...params,
            'filters[categoria][slug][$eq]': parametros,
          };
        } else if (filtros === 'mis-productos') {
          // agregar filtro por owner si es necesario
        }

        if (pagina) params['pagination[page]'] = pagina;
        if (porPagina) params['pagination[pageSize]'] = porPagina;

        Object.assign(params, rest);
      }

      const res = await axios.get(endpoint, { params });
      const items = res?.data?.data || [];
      const meta = res?.data?.meta || {};
      setProductosNormalized(items, meta);
      return items;
    } catch (err) {
      setError(err);
      console.error('buscarProductos error', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [API_URL_PRODUCTOS, setProductosNormalized]);

  const getProductosPorCategoria = useCallback(async (categoriaId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_URL_PRODUCTOS, {
        params: {
          populate: '*',
          'filters[store_category][id][$eq]': categoriaId,
        },
      });
      const items = res.data?.data || [];
      const meta = res.data?.meta || {};
      setProductosNormalized(items, meta);
      return items;
    } catch (err) {
      setError(err);
      console.error('getProductosPorCategoria error', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [API_URL_PRODUCTOS, setProductosNormalized]);

  const getProductosPorTienda = useCallback(async (storeId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_URL_PRODUCTOS, {
        params: {
          populate: '*',
          'filters[store_id][$eq]': storeId,
        },
      });
      const items = res.data?.data || [];
      const meta = res.data?.meta || {};
      setProductosNormalized(items, meta);
      return items;
    } catch (err) {
      setError(err);
      console.error('getProductosPorTienda error', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [API_URL_PRODUCTOS, setProductosNormalized]);

  const agregarResena = useCallback(async (productoId, datosResena) => {
    try {
      const res = await fetch(`${API_ROOT}/resenas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ data: { ...datosResena, producto: productoId } }),
      });
      const json = await res.json();
      return json;
    } catch (err) {
      console.error('Error agregando reseña:', err);
      return null;
    }
  }, [API_ROOT]);

  const obtenerImagenProducto = useCallback(async (productoId) => {
    try {
      const res = await axios.get(`${API_URL_PRODUCTOS}/${productoId}`, {
        params: { populate: 'imagen_predeterminada' }
      });
      const imagen = res.data?.data?.attributes?.imagen_predeterminada?.data?.[0];
      if (!imagen) return null;
      const url = imagen.attributes?.url;
      return `${process.env.REACT_APP_STRAPI_URL}${url}`;
    } catch (err) {
      console.error('Error obteniendo imagen del producto:', err);
      return null;
    }
  }, [API_URL_PRODUCTOS]);

  return {
    productos,
    loading,
    error,
    totalItems,
    fetchProductos,
    createProducto,
    updateProducto,
    deleteProducto,
    obtenerEstadoProducto,
    obtenerCPProducto,
    precotizarMienvio,
    precotizarStripe,
    precotizacionSuma,
    precotizacionTotal,
    calificacionPromedio,
    obtenerNumeroCalificaciones,
    contadorResenas,
    obtenerResenas,
    agregarResena,
    getProductos,
    getProducto,
    getProductoBySlug,
    buscarProductos,
    getProductosPorCategoria,
    getProductosPorTienda,
    obtenerImagenProducto,
  };
};

export default useProductos;

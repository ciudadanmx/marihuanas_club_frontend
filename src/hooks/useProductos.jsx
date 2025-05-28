import { useState, useEffect } from 'react';
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
  try {
    const res = await fetch(`https://api-codigos-postales.herokuapp.com/v2/codigo_postal/${cp}`, {
      credentials: 'include'
    });
    const data = await res.json();
    return data.estado || null;
  } catch (err) {
    console.error(`Error consultando CP ${cp}:`, err);
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
  const estadoOrigen = await obtenerEstadoPorCP(cpOrigen);
  const estadoDestino = await obtenerEstadoPorCP(cpDestino);
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

const useProductos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [producto, setProducto] = useState(null);

  const API_URL = process.env.REACT_APP_STRAPI_URL;

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/productos?populate=deep`, {
        credentials: 'include'
      });
      const data = await res.json();
      setProductos(data.data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const createProducto = async (nuevoProducto) => {
    try {
      const res = await fetch(`${API_URL}/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ data: nuevoProducto }),
      });
      return await res.json();
    } catch (err) {
      setError(err);
    }
  };

  const updateProducto = async (id, datos) => {
    try {
      const res = await fetch(`${API_URL}/productos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ data: datos }),
      });
      return await res.json();
    } catch (err) {
      setError(err);
    }
  };

  const deleteProducto = async (id) => {
    try {
      const res = await fetch(`${API_URL}/productos/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      return await res.json();
    } catch (err) {
      setError(err);
    }
  };

  const calificacionPromedio = (producto) => {
    if (!producto.calificacion || producto.calificacion === 0 || !producto.numero_calificaciones) return 0;
    return parseFloat((producto.calificacion / (producto.numero_calificaciones * 5)).toFixed(2));
  };

  const obtenerNumeroCalificaciones = (producto) => {
    return producto.numero_calificaciones || 0;
  };

  const contadorResenas = async (productoId) => {
    try {
      const res = await fetch(`${API_URL}/resenas?filters[producto][id][$eq]=${productoId}`, {
        credentials: 'include'
      });
      const data = await res.json();
      return data?.meta?.pagination?.total || 0;
    } catch (err) {
      console.error('Error contando reseñas:', err);
      return 0;
    }
  };

  const obtenerResenas = async (productoId) => {
    try {
      const res = await fetch(`${API_URL}/resenas?filters[producto][id][$eq]=${productoId}`, {
        credentials: 'include'
      });
      const data = await res.json();
      return data?.data || [];
    } catch (err) {
      console.error('Error obteniendo reseñas:', err);
      return [];
    }
  };


    // ✅ Obtener todos los productos
  const getProductos = async (params = {}) => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, {
        params: {
          populate: '*',
          ...params,
        },
      });
      setProductos(res.data.data);
      return res.data.data;
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Obtener producto por ID
  const getProducto = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/${id}?populate=*`);
      setProducto(res.data.data);
      return res.data.data;
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Obtener producto por slug (nuevo método)
  const getProductoBySlug = async (slug) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_URL, {
        params: {
          'filters[slug][$eq]': slug,
          populate: '*',
        },
      });
      const data = res.data.data[0] || null;
      setProducto(data);
      return data;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Buscar productos por descripción, nombre o marca
  const buscarProductos = async (busqueda) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_URL, {
        params: {
          populate: '*',
          'filters[$or][0][descripcion][$containsi]': busqueda,
          'filters[$or][1][nombre][$containsi]': busqueda,
          'filters[$or][2][marca][$containsi]': busqueda,
        },
      });
      return res.data.data;
    } catch (err) {
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  };


  // ✅ Obtener productos por categoría
  const getProductosPorCategoria = async (categoriaId) => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, {
        params: {
          populate: '*',
          'filters[store_category][id][$eq]': categoriaId,
        },
      });
      return res.data.data;
    } catch (err) {
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // ✅ Obtener productos por tienda
  const getProductosPorTienda = async (storeId) => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, {
        params: {
          populate: '*',
          'filters[store_id][$eq]': storeId,
        },
      });
      return res.data.data;
    } catch (err) {
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  };


  const agregarResena = async (productoId, datosResena) => {
    try {
      const res = await fetch(`${API_URL}/resenas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ data: { ...datosResena, producto: productoId } }),
      });
      return await res.json();
    } catch (err) {
      console.error('Error agregando reseña:', err);
      return null;
    }
  };



  return {
    productos,
    loading,
    error,
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
    getProductoBySlug,       // <<--- MÉTODO NUEVO
    buscarProductos,
    getProductosPorCategoria,
    getProductosPorTienda,
  };
};

export default useProductos;


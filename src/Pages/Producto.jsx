import React, { useEffect, useState } from 'react';
import { consola } from '@/utils/utilidades';
import { useParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Container,
  CircularProgress,
  Divider,
} from '@mui/material';
//import { Add, Remove } from '@mui/icons-material';
import Resenas from '../components/MarketPlace/Resenas'
import GaleriaImagenesProducto from '../components/MarketPlace/GaleriaImagenesProducto';
import DetalleProducto from '../components/MarketPlace/DetalleProducto';
import useProductos from '../hooks/useProductos';

import productoImg from '../assets/producto.png';
import '../styles/Producto.css';

const Producto = () => {
  const { slug } = useParams();
  const { getProductoBySlug, precotizarMienvio } = useProductos();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagenIndex, setImagenIndex] = useState(0);

  //usamos el useProductos para traernos los productos
  useEffect(() => {
    const fetchProducto = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProductoBySlug(slug);
        const productoData = Array.isArray(data) ? data[0] : data;
        setProducto(productoData);
        setImagenIndex(0);
      } catch (e) {
        setError('No se encontró el producto');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProducto();
  }, [slug]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!producto) return null;

  const {
    nombre,
    descripcion,
    imagenes,
    precio,
    marca,
    stock,
    calificacion,
    calificaciones,
    vendidos,
    localidad,
    estado,
    largo,
    ancho,
    alto,
    peso,
    /* envio, */
    resenas,
    cp,
  } = producto.attributes || {};

  //****** OBTENER EL C.P. 
  const micpDestino = '11560';

  //traemos la función precotizarMienvio para pasársela a detalle producto
  const envio = precotizarMienvio ;

  //traemos las imágenes
  //imagen predeterminada
  const imagenPredeterminadaL =
    producto?.attributes?.imagen_predeterminada?.data?.[0]?.attributes?.formats?.medium?.url ??
    producto?.attributes?.imagen_predeterminada?.data?.[0]?.attributes?.url ??
    null;

  //galeria
  const imagenesData = Array.isArray(imagenes?.data)
    ? imagenes.data.map((img) => `${process.env.REACT_APP_STRAPI_URL}${img.attributes.url}`)
    : [];
  const todasLasImagenes = [
    ...(imagenPredeterminadaL
      ? [`${process.env.REACT_APP_STRAPI_URL}${imagenPredeterminadaL}`]
      : []),
    ...imagenesData,
  ];
  if (todasLasImagenes.length === 0) {
    todasLasImagenes.push(productoImg);
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 4 }}>
        {/* Título */}
        <Typography variant="h4" fontWeight="bold" mb={3}>
          {nombre || 'Sin título'}
        </Typography>
        {/* Imagen Principal y Thumbnails */}
        <GaleriaImagenesProducto
            imagenes={todasLasImagenes}
            nombre={nombre}
            imagenIndex={imagenIndex}
            setImagenIndex={setImagenIndex}
        />
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* Columna 1: Descripción */}
          <Grid item xs={12} md={6}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
              {descripcion || 'Sin descripción disponible.'}
            </Typography>
          </Grid>
          {/* Columna 2: Info detallada y botones */}
          <Grid item xs={12} md={6}>
            <DetalleProducto 
                precio = { precio }
                marca = { marca }
                stock = { stock }
                vendidos = { vendidos }
                localidad = { localidad }
                estado = { estado }
                envio = { envio }
                largo = { largo }
                ancho = {ancho}
                alto = {alto}
                peso = {peso}
                cp = {cp}
            />
          </Grid>
        </Grid>
        <Divider sx={{ mb: 2 }} />
        {/* Reseñas */}
            <Resenas 
                resenas={resenas}
            />
      </Paper>
    </Container>
  );
};
export default Producto;

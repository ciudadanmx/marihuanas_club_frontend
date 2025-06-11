import React, { useEffect, useState } from 'react';
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
import useProductos from '../../hooks/useProductos.jsx';
import Resenas from '../../components/MarketPlace/Resenas.jsx'
import GaleriaImagenesProducto from '../../components/MarketPlace/GaleriaImagenesProducto.jsx';
import productoImg from '../../assets/producto.png';
import '../../styles/Producto.css';
import '../../styles/DetalleProducto.css';
import DetallesProducto from '../../components/MarketPlace/DetalleProducto.jsx';


const Producto = () => {
  const { slug } = useParams();
  const { getProductoBySlug, } = useProductos();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagenIndex, setImagenIndex] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [envioApi, setEnvioApi] = useState(null); // solo para mostrar

  useEffect(() => {
    const fetchProducto = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProductoBySlug(slug);
        const productoData = Array.isArray(data) ? data[0] : data;
        setProducto(productoData);
        console.log(`productooooo ---   ${productoData.attributes}`);
        setImagenIndex(0);

        // Si no hay envío definido, cotizamos desde la API
        const envioStr = productoData.attributes?.envio;
        if (!envioStr || envioStr === '') {
          const origen = productoData.attributes?.cp_origen || '01000';
          const destino = productoData.attributes?.cp_destino || '02000';
          try {
            const response = await fetch('http://localhost:1337/api/shipping/calcular', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                cp_origen: 11560,
                cp_destino: 11560,
                peso: 1,
              }),
            });
            const result = await response.json();
            if (result?.precio) {
              setEnvioApi(`$${result.precio.toFixed(2)}`);
            } else {
              setEnvioApi('No disponible');
            }
          } catch (err) {
            console.error('Error al cotizar envío:', err);
            setEnvioApi('Error al cotizar');
          }
        }
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
    envio,
    resenas,
  } = producto.attributes || {};

  const imagenPredeterminadaL =
    producto?.attributes?.imagen_predeterminada?.data?.[0]?.attributes?.formats?.medium?.url ??
    producto?.attributes?.imagen_predeterminada?.data?.[0]?.attributes?.url ??
    null;

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

  const handleCantidadChange = (newCantidad) => {
    if (newCantidad < 1) return;
    if (stock && newCantidad > stock) return;
    setCantidad(newCantidad);
  };

  return (
    <Container  maxWidth="md" sx={{ mt: 4, mb: 8 }}>
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

        <div className='producto-layout'>
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* Columna 1: Descripción */}
          <Grid item xs={12} md={6}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
              {descripcion || 'Sin descripción disponible.'}
            </Typography>
          </Grid>

          {/* Columna 2: Info detallada y botones */}
          <DetallesProducto
            producto={producto}
            precio={precio}
            marca={marca}
            stock={stock}
            vendidos={vendidos}
            localidad={localidad}
            estado={estado}
            cantidad={cantidad}
            handleCantidadChange={setCantidad}
          />
        </Grid>
        </div>
        

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

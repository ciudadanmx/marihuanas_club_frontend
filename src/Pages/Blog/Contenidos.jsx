import { useEffect, useState } from 'react';
import { Box, Grid, Container, Typography } from '@mui/material';
import Buscador from '../../components/MarketPlace/Buscador';
import ProductoCard from '../../components/MarketPlace/ProductoCard';
import BotonVender from '../../components/MarketPlace/BotonVender';
import CategoriasSlider from '../../components/MarketPlace/CategoriasSlider';
import { useCategorias } from '../../hooks/useCategorias';
import { useUbicacion } from '../../hooks/useUbicacion';
import useProductos from '../../hooks/useProductos';

const Contenidos = () => {
  const tabla = 'categorias-contenidos'
  const { getCategorias, loading: loadingCategorias } = useCategorias(tabla);
  const {
    getProductos,
    precotizarMienvio,
    precotizacionTotal,
    calificacionPromedio,
    obtenerNumeroCalificaciones,
    obtenerImagenProducto,
  } = useProductos();
  const { ubicacion } = useUbicacion();

  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const fetchCategorias = async () => {
      console.log('🌀 Obteniendo categorías...');
      const data = await getCategorias();
      console.log('📂 Categorías:', data);
      setCategorias(data);
    };
    fetchCategorias();
  }, []);

  useEffect(() => {
    const fetchProductos = async () => {
      console.log('🔄 Buscando productos...');

      const data = await getProductos();
      console.log('📦 Productos recibidos:', data);

      if (!data || data.length === 0) {
        console.warn('⚠️ No se recibieron productos');
        return;
      }

      const filtrados = data; // podrías volver a filtrar stock y activo si lo deseas

      const productosConExtras = await Promise.all(
        filtrados.map(async (p) => {
          const attr = p.attributes;
          const cpDestino = ubicacion?.codigoPostal;
          const cpOrigen = attr.cp;

          if (!cpOrigen || !cpDestino || !attr.largo || !attr.ancho || !attr.alto || !attr.peso) {
            console.warn(`⚠️ Producto omitido por falta de datos necesarios para envío:`, p);
            return null;
          }

          let envio = null;
          let total = null;
          let imagen = null;

          try {
            console.log(`cotizando envio de producto`);
            envio = await precotizarMienvio(cpOrigen, cpDestino, attr.largo, attr.ancho, attr.alto, attr.peso);
            total = await precotizacionTotal(p, cpDestino);
            imagen = await obtenerImagenProducto(p.id);
          } catch (err) {
            console.warn('❌ Error al precotizar o al obtener imagen:', err);
          }

          return {
            ...p,
            envio,
            total,
            imagen,
            calificacion: calificacionPromedio(p),
            numCalificaciones: obtenerNumeroCalificaciones(p),
          };
        })
      );

      const final = productosConExtras.filter(Boolean);
      console.log('🎯 Productos con extras precalculados:', final);

      setProductos(final);
    };

    console.log('🗺️ Ubicación detectada:', ubicacion);
    if (ubicacion?.codigoPostal) {
      fetchProductos();
    } else {
      console.log('⌛ Esperando código postal...');
    }
  }, [ubicacion]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <BotonVender />
      </Box>

      <Buscador />

      <h1>A ver</h1>

      {!loadingCategorias && categorias.length > 0 && (
        <Box mt={4}>
          <CategoriasSlider
            categorias={categorias.map((cat) => ({
              nombre: cat.attributes.nombre,
              slug: cat.attributes.slug,
              imagen: `${process.env.REACT_APP_STRAPI_URL}${cat.attributes.imagen?.data?.attributes?.url}`,
            }))}
          />
        </Box>
      )}

      <Grid container spacing={3} mt={4}>
        {productos.length === 0 && (
          <Grid item xs={12}>
            <Typography variant="body1" textAlign="center">
              No se encontraron productos disponibles.
            </Typography>
          </Grid>
        )}

        {productos.map((producto) => {
          const attr = producto.attributes;
          return (
            <Grid item xs={12} sm={6} md={3} key={producto.id}>
              <ProductoCard
                titulo={attr.nombre}
                slug={attr.slug}
                imagenes={attr.imagenes}
                descripcion={attr.descripcion}
                imagen={producto.imagen || ''}
                precio={attr.precio}
                envioAprox={producto.envio?.costo ? `$${producto.envio.costo} aprox.` : null}
                localidad={attr.localidad || null}
                estado={attr.estado || null}
                calificacion={attr.calificaciones > 0 ? attr.calificacion : null}
                //calificacion='5'
                numeroCalificaciones={attr.calificaciones}
                //numeroCalificaciones='1'
                vendidos={attr.vendidos || 0}
                total={producto.total ? `$${producto.total}` : null}
              />
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

export default Contenidos;

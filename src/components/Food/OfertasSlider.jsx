// src/components/MarketPlace/OfertasSlider.jsx
import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import  useProductos from '../../hooks/useProductos';
import { useUbicacion } from '../../hooks/useUbicacion';


const OfertasSlider = () => {
  const { getProductos } = useProductos();
  const { ubicacion } = useUbicacion();
  const [ofertas, setOfertas] = useState([]);

  useEffect(() => {
    const fetchOfertas = async () => {
      try {
        // 🔥 Obtiene todos los productos
        const productos = await getProductos();

        // 🔥 Filtra solo los que estén marcados como oferta o tengan descuento
        
        const filtradas = productos.filter(
          (p) =>
            p.attributes?.oferta === true ||
            (p.attributes?.precio_original && p.attributes.precio < p.attributes.precio_original)
        );

        // 🔥 Mapea al formato que usa el slider
        const lista = filtradas.map((p) => ({
          nombre: p.attributes.nombre,
          slug: p.attributes.slug,
          imagen: `${process.env.REACT_APP_STRAPI_URL}${p.attributes.imagenes?.data?.[0]?.attributes?.url || ''}`,
        }));

        setOfertas(lista);
      } catch (err) {
        console.error('Error cargando ofertas:', err);
      }
    };

    fetchOfertas();
  }, [ubicacion]);

  return (
    <Box mt={4}>
      <Typography
        variant="h6"
        fontWeight={700}
        textAlign="center"
        sx={{
          mb: 2,
          color: '#000',
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        OFERTAS
      </Typography>

      
    </Box>
  );
};

export default OfertasSlider;

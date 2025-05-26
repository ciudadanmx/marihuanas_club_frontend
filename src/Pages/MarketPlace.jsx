import { useEffect, useState } from 'react';
import { Box, Grid, Container } from '@mui/material';
import Buscador from '../components/MarketPlace/Buscador';
import ProductoCard from '../components/MarketPlace/ProductoCard';
import BotonVender from '../components/MarketPlace/BotonVender';
import CategoriasSlider from '../components/MarketPlace/CategoriasSlider';
import { useCategorias } from '../hooks/useCategorias';

const MarketPlace = () => {
  const { getCategorias, loading } = useCategorias();
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const fetchCategorias = async () => {
      const data = await getCategorias();
      setCategorias(data);
    };
    fetchCategorias();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <BotonVender />
      </Box>

      <Buscador />

      {!loading && categorias.length > 0 && (
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
        {[1, 2, 3, 4].map((_, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <ProductoCard />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default MarketPlace;

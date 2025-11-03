import { useEffect, useState } from 'react';
import { Box, Container } from '@mui/material';
import Buscador from '../src/components/Blog/Buscador';
import CategoriasSlider from '../src/components/MarketPlace/CategoriasSlider';

import { useCategorias } from '../src/hooks/useCategorias';

const Cursos = () => {
  const tabla = 'categorias-cursos';
  const { getCategorias, loading: loadingCategorias } = useCategorias(tabla);

  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const fetchCategorias = async () => {
      console.warn('🌀 --------------------------Obteniendo categorías...');
      const data = await getCategorias();
      console.log('📂 Categorías:', data);
      setCategorias(data);
    };
    fetchCategorias();
  }, []);

  const forma = 'cuadrado';

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Buscador />
      <h3><center>Áreas de Cursos:</center></h3>

      {!loadingCategorias && categorias && categorias.length > 0 && (
        <Box mt={4}>
          <CategoriasSlider
          forma = {forma}
            categorias={categorias.map((cat) => ({
              nombre: cat.attributes.nombre,
              slug: cat.attributes.slug,
              forma: {forma},
              imagen: `${process.env.REACT_APP_STRAPI_URL}${cat.attributes.imagen?.data?.attributes?.url}`,
            }))}
          />
        </Box>
      )}

    </Container>
  );
};

export default Cursos;
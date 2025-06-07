import { useEffect, useState } from 'react';
import { Box, Grid, Container, Typography } from '@mui/material';
import Buscador from '../../components/Blog/Buscador';
import CategoriasSlider from '../../components/MarketPlace/CategoriasSlider';

import { useCategorias } from '../../hooks/useCategorias';
import { useContenido } from '../../hooks/useContenido';

import ContenidoCard from '../../components/Blog/ContenidoCard'; // Asegúrate de que existe

const Contenidos = () => {
  const tabla = 'categorias-contenidos';
  const { getCategorias, loading: loadingCategorias } = useCategorias(tabla);
  const { contenidos, loading: loadingContenidos, error } = useContenido();

  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const fetchCategorias = async () => {
      console.log('🌀 Obteniendo categorías...');
      const data = await getCategorias();
      console.log('📂 Categorías:', data);
      setCategorias(data);
    };
    fetchCategorias();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Buscador />
      <h3><center>Categorías</center></h3>

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
        {loadingContenidos && (
          <Grid item xs={12}>
            <Typography variant="body1" textAlign="center">
              Cargando contenidos...
            </Typography>
          </Grid>
        )}

        {error && (
          <Grid item xs={12}>
            <Typography variant="body1" textAlign="center" color="error">
              Error al cargar contenidos
            </Typography>
          </Grid>
        )}

        {!loadingContenidos && contenidos?.length === 0 && (
          <Grid item xs={12}>
            <Typography variant="body1" textAlign="center">
              No hay contenidos disponibles.
            </Typography>
          </Grid>
        )}

        {contenidos?.length > 0 &&
          contenidos
            .sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion))
            .map((contenido) => (
              <Grid item xs={12} sm={6} md={4} key={contenido.id}>
                <ContenidoCard
                  titulo={contenido.titulo}
                  slug={contenido.slug}
                  autor={contenido.autor}
                  resumen={contenido.resumen}
                  portada={contenido.portada}
                  categoria={contenido.categoria}
                  fecha_publicacion={contenido.fecha_publicacion}
                />
              </Grid>
            ))}
      </Grid>
    </Container>
  );
};

export default Contenidos;

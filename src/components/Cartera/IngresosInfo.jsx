import { Typography, Box, Divider } from '@mui/material';
import ImagenInteractiva from './ImagenInteractiva'; // 👈 Importamos el nuevo componente

const IngresosInfo = () => {
  return (
    <Box sx={{ color: 'white', p: 1 }}>

        {/* 🖼️ Imagen interactiva debajo del texto */}
      <Box sx={{ mt: 4 }}>
        <ImagenInteractiva />
      </Box>

       {/* Separador */}
      <Divider
        sx={{
          my: 4,
          width: "8%",
          marginX: "auto",
        }}
      />


      <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
        Para generar ingresos en efectivo dentro de la plataforma existen varias opciones. 
        Una de ellas es <strong>promoviendo las membresías de Ciudadan.org</strong>, lo que 
        te permite obtener ganancias recurrentes mensualmente por cada nuevo miembro que 
        se integre gracias a tu recomendación.
      </Typography>

      <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
        Otra opción es <strong>adquirir Ciudadan Investment Tokens con rendimientos mixtos 
        fijos y variables mensuales</strong>, una forma sencilla de hacer que tu participación 
        en la comunidad también te genere ingresos.
      </Typography>

      <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
        Finalmente, puedes <strong>convertirte en Socio Activo</strong> de alguna de las 
        <strong> Agencias Cooperativas</strong> dentro de la plataforma, colaborando en proyectos 
        productivos, servicios digitales o iniciativas locales, sin importar si eres programador 
        o quieres aprender a serlo, eres profesor o profesional de algún área, hay lugar para ti 
        en nuestras <strong>Agencias Cooperativas 6.0</strong>. De esta manera no solo generas 
        ingresos, sino que también participas directamente en el crecimiento del ecosistema 
        cooperativo.
      </Typography>

      
    </Box>
  );
};

export default IngresosInfo;

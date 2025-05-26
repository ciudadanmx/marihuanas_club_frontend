import { Card, CardContent, Typography, CardMedia, Box } from '@mui/material';
import productoImg from '../../assets/producto.png';

const ProductoCard = () => (
  <Card sx={{ boxShadow: 6, borderRadius: 4, transition: '0.3s', '&:hover': { transform: 'scale(1.05)' } }}>
    <CardMedia component="img" image={productoImg} alt="Producto" sx={{ height: 140 }} />
    <CardContent>
      <Typography variant="subtitle1" fontWeight="bold">Producto Genérico</Typography>
      <Typography color="text.secondary">$99.99</Typography>
      <Box mt={1}>⭐⭐⭐⭐⭐ (120)</Box>
    </CardContent>
  </Card>
);

export default ProductoCard;

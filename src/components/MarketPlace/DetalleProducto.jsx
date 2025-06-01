import React, { useEffect, useState } from 'react';
import {
  Typography,
  Grid,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
  Divider,
  Box
} from '@mui/material';
import { useCart } from '../../Contexts/CartContext'; // Asegúrate de que esté bien la ruta
import '../../styles/DetalleProducto.css';

const DetalleProducto = ({
  producto,
  precio,
  marca,
  stock,
  vendidos,
  localidad,
  estado,
  cantidad,
  handleCantidadChange
}) => {
  const [costoEnvio, setCostoEnvio] = useState('Calculando...');
  const { addToCart } = useCart();

  const calcularEnvio = async () => {
    try {
      const cp_origen = producto?.attributes?.cp_origen || '01000';
      const cp_destino = producto?.attributes?.cp_destino || '02800';

      const response = await fetch(`${process.env.REACT_APP_STRAPI_URL}/api/shipping/calcular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cp_origen, cp_destino, cantidad })
      });

      if (response.ok) {
        const res = await response.json();
        setCostoEnvio(`$${res.costo}`);
      } else {
        setCostoEnvio('No disponible');
      }
    } catch (e) {
      console.error('[ENVÍO] Error:', e);
      setCostoEnvio('No disponible');
    }
  };

  useEffect(() => {
    calcularEnvio();
  }, [cantidad]);

  const handleAddToCart = () => {
    if (!producto?.id || !producto?.attributes) return;

    addToCart({
      id: producto.id,
      nombre: producto.attributes.nombre,
      marca: producto.attributes.marca,
      precio: producto.attributes.precio,
      imagen_predeterminada: producto.attributes.imagen_predeterminada?.data?.attributes,
      cantidad
    });
  };

  return (
    <div className="mt-6 z-10 producto-layout">
      <Card className="producto-card" elevation={10}>
        <CardContent>
          <Typography variant="h3" className="producto-precio">
            ${precio?.toFixed(2) || '0.00'}
          </Typography>

          <Divider sx={{ my: 3, borderColor: '#A5D6A7' }} />

          <Box className="producto-detalle">
            <Typography variant="body1"><strong>🌿 Marca:</strong> {marca || 'Desconocida'}</Typography>
            <Typography variant="body1"><strong>📦 Stock:</strong> {stock ?? 'N/A'}</Typography>
            <Typography variant="body1"><strong>🔥 Vendidos:</strong> {vendidos ?? 0}</Typography>
            <Typography variant="body1"><strong>📍 Localidad:</strong> {localidad ?? 'N/A'}, {estado ?? ''}</Typography>
            <Typography variant="body1"><strong>🚚 Envío:</strong> {costoEnvio}</Typography>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" className="cantidad-stack">
            <Button className="icon-button" onClick={() => handleCantidadChange(Math.max(1, cantidad - 1))}>
              <span className="material-icons">remove</span>
            </Button>
            <TextField
              value={cantidad}
              onChange={(e) => handleCantidadChange(Number(e.target.value))}
              type="number"
              inputProps={{ min: 1, max: stock }}
              size="small"
              className="cantidad-input"
            />
            <Button className="icon-button" onClick={() => handleCantidadChange(Math.min(stock, cantidad + 1))}>
              <span className="material-icons">add</span>
            </Button>
          </Stack>

          <Button className="agregar-boton" onClick={handleAddToCart}>
            <span className="material-icons" style={{ marginRight: '8px' }}>shopping_cart</span>
            Agregar al carrito
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DetalleProducto;

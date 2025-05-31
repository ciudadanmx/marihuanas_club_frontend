import React, { useState } from 'react';
import { consola } from '../../utils/utilidades';
//quitar.
import {
  Typography,
  Button,
  TextField,
  Stack,
} from '@mui/material';

const DetalleProducto = ({ precio, marca, stock, vendidos, localidad, estado, envio }) => {
    consola.log('iniciando');
  const [cantidad, setCantidad] = useState(1);

  const handleCantidadChange = (newCantidad) => {
    if (newCantidad < 1) return;
    if (stock && newCantidad > stock) return;
    setCantidad(newCantidad);
  };

  return (
    <>
      <Typography variant="h5" color="primary" fontWeight="bold">
        ${precio?.toFixed(2) || '0.00'}
      </Typography>

      <Typography sx={{ mt: 1 }}>Marca: {marca || 'Desconocida'}</Typography>
      <Typography>Stock: {stock ?? 'N/A'}</Typography>
      <Typography>Vendidos: {vendidos ?? 0}</Typography>
      <Typography>Localidad: {localidad ?? 'N/A'}, {estado ?? ''}</Typography>

      <Typography sx={{ mb: 2 }}>
        Envío: {envio ? `$${parseFloat(envio).toFixed(2)}` : 'Calculando...'}
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          onClick={() => handleCantidadChange(cantidad - 1)}
        >
          -
        </Button>
        <TextField
          value={cantidad}
          onChange={(e) => handleCantidadChange(Number(e.target.value))}
          type="number"
          inputProps={{ min: 1, max: stock }}
          size="small"
          sx={{ width: 60 }}
        />
        <Button
          variant="outlined"
          onClick={() => handleCantidadChange(cantidad + 1)}
        >
          +
        </Button>
      </Stack>

      <Button
        variant="contained"
        fullWidth
        sx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#333' } }}
      >
        Agregar al carrito
      </Button>
    </>
  );
};

export default DetalleProducto;

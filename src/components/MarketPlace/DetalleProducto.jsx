// src/components/MarketPlace/DetallesProducto.jsx
import React from 'react';
import {
  Typography,
  Grid,
  TextField,
  Button,
  Stack
} from '@mui/material';

const DetallesProducto = ({
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
  return (
    <Grid item xs={12} md={6}>
      <Typography variant="h5" color="primary" fontWeight="bold">
        ${precio?.toFixed(2) || '0.00'}
      </Typography>

      <Typography sx={{ mt: 1 }}>Marca: {marca || 'Desconocida'}</Typography>
      <Typography>Stock: {stock ?? 'N/A'}</Typography>
      <Typography>Vendidos: {vendidos ?? 0}</Typography>
      <Typography>Localidad: {localidad ?? 'N/A'}, {estado ?? ''}</Typography>

      <Typography sx={{ mb: 2 }}>
        Envío: {
          (() => {
            try {
              const cp_origen = producto?.attributes?.cp_origen || '01000';
              const cp_destino = producto?.attributes?.cp_destino || '02800';
              const xhr = new XMLHttpRequest();
              xhr.open('POST', `${process.env.REACT_APP_STRAPI_URL}/api/shipping/calcular`, false);
              xhr.setRequestHeader('Content-Type', 'application/json');
              xhr.send(JSON.stringify({ cp_origen, cp_destino }));

              if (xhr.status === 200) {
                const res = JSON.parse(xhr.responseText);
                return `$${res.costo}`;
              } else {
                return 'No disponible';
              }
            } catch (e) {
              return 'No disponible';
            }
          })()
        }
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={() => handleCantidadChange(cantidad - 1)}>
          <span className="material-icons">-</span>
        </Button>
        <TextField
          value={cantidad}
          onChange={(e) => handleCantidadChange(Number(e.target.value))}
          type="number"
          inputProps={{ min: 1, max: stock }}
          size="small"
          sx={{ width: 60 }}
        />
        <Button variant="outlined" onClick={() => handleCantidadChange(cantidad + 1)}>
          <span className="material-icons">+</span>
        </Button>
      </Stack>

      <Button
        variant="contained"
        fullWidth
        sx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#333' } }}
      >
        Agregar al carrito
      </Button>
    </Grid>
  );
};

export default DetallesProducto;

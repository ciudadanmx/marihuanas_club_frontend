import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Grid,
  Divider,
  Chip,
} from '@mui/material';
import productoImg from '../../assets/producto.png';

// Configuración de estados con iconos de Material Icons vía CDN
const statusConfig = {
  enviar:    { label: 'Por enviar',  color: 'warning', icon: <i className="material-icons">send</i> },
  encamino:  { label: 'En camino',  color: 'info',    icon: <i className="material-icons">local_shipping</i> },
};

const PedidosPendientes = () => {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const STRAPI_URL = process.env.REACT_APP_STRAPI_URL;

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const url = `${STRAPI_URL}/api/pedidos?populate[item][populate]=imagen_predeterminada`;
        const res = await fetch(url);
        const { data } = await res.json();
        if (!Array.isArray(data)) { setPedidos([]); return; }

        setPedidos(data);
      } catch (err) {
        console.error('❌ Error cargando pedidos:', err);
      } finally {
        setCargando(false);
      }
    };
    fetchPedidos();
  }, [STRAPI_URL]);

  if (cargando) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Separar pedidos por estado
  const pendientes = pedidos.filter(({ attributes }) => attributes.status === 'enviar');
  const enCamino = pedidos.filter(({ attributes }) => attributes.status === 'encamino');

  const renderPedidoList = (list) => (
    list.map(({ id, attributes }) => {
      const itemList = Array.isArray(attributes.item) ? attributes.item : [];
      return (
        <Box key={id} mb={4}>
          <Box display="flex" alignItems="center" mb={1}>
            <Typography variant="h5" fontWeight="bold">Pedido #{id}</Typography>
          </Box>
          <Typography variant="subtitle2" color="text.secondary" mb={1}>
            Creado: {new Date(attributes.timestamp_creacion).toLocaleString()}
          </Typography>
          <Grid container spacing={2}>
            {itemList.map((item, idx) => {
              const {
                nombre,
                precio_unitario,
                cantidad,
                subtotal,
                envio,
                total,
                imagen_predeterminada,
              } = item;
              const imgUrl = imagen_predeterminada?.data?.attributes?.url
                ? STRAPI_URL + imagen_predeterminada.data.attributes.url
                : productoImg;

              return (
                <Grid item xs={12} key={idx}>
                  <Card sx={{ display: 'flex', borderRadius: 2, boxShadow: 2 }}>
                    <CardMedia
                      component="img"
                      image={imgUrl}
                      alt={nombre || 'Producto'}
                      sx={{ width: 140, height: 140, objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="medium">{nombre || '— Sin nombre —'}</Typography>
                      <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
                        <Typography variant="body2">Precio unidad: ${precio_unitario?.toFixed(2) || '-'}</Typography>
                        <Typography variant="body2">Cantidad: {cantidad ?? '-'}</Typography>
                        <Typography variant="body2">Subtotal: ${subtotal?.toFixed(2) || '-'}</Typography>
                        <Typography variant="body2">Envío: ${envio?.toFixed(2) || '-'}</Typography>
                        <Typography variant="body2" fontWeight="bold">Total: ${total?.toFixed(2) || '-'}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
          {attributes.guia && (
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              Guía: {attributes.guia}
            </Typography>
          )}
          <Divider sx={{ my: 2 }} />
        </Box>
      )
    })
  );

  return (
    <Box width="100%" p={0} m={0}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Pedidos pendientes
      </Typography>
      {pendientes.length === 0 ? (
        <Typography>No hay pedidos para enviar.</Typography>
      ) : renderPedidoList(pendientes)}

      {enCamino.length > 0 && (
        <>
          <Typography variant="h4" fontWeight="bold" gutterBottom mt={4}>
            Pedidos en camino
          </Typography>
          {renderPedidoList(enCamino)}
        </>
      )}
    </Box>
  );
};

export default PedidosPendientes;

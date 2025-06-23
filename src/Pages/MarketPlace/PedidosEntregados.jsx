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
  recibido:  { label: 'Entregado',  color: 'success', icon: <i className="material-icons">check_circle</i> },
  cancelado: { label: 'Cancelado',  color: 'error',   icon: <i className="material-icons">cancel</i> },
  devuelto:  { label: 'Devuelto',   color: 'warning', icon: <i className="material-icons">undo</i> },
};

const PedidosEntregados = () => {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const STRAPI_URL = process.env.REACT_APP_STRAPI_URL;

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const url = `${STRAPI_URL}/api/pedidos?populate[item][populate]=imagen_predeterminada`;
        const res = await fetch(url);
        const { data } = await res.json();
        setPedidos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('❌ Error cargando pedidos:', err);
        setPedidos([]);
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
  const entregados = pedidos.filter(({ attributes }) => attributes.status === 'recibido');
  const cancelados = pedidos.filter(({ attributes }) => ['cancelado', 'devuelto'].includes(attributes.status));

  const renderSection = (list, title) => (
    <Box width="100%" mb={6}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {title}
      </Typography>
      {list.length === 0 ? (
        <Typography>No hay pedidos.</Typography>
      ) : (
        list.map(({ id, attributes }) => {
          const { item = [], timestamp_creacion, fecha_entrega, updatedAt, guia, status } = attributes;
          const cfg = statusConfig[status];
          return (
            <Box key={id} width="100%" mb={4}>
              <Box display="flex" alignItems="center" mb={1} gap={1}>
                {cfg && <Chip icon={cfg.icon} label={cfg.label} color={cfg.color} size="small" />}
                <Typography variant="h5" fontWeight="bold">
                  Pedido #{id}
                </Typography>
              </Box>
              <Typography variant="subtitle2" color="text.secondary" mb={2}>
                Creado: {new Date(timestamp_creacion).toLocaleString()}
              </Typography>

              {item.map((prod, idx) => {
                const {
                  nombre,
                  precio_unitario,
                  cantidad,
                  subtotal,
                  envio,
                  total,
                  imagen_predeterminada,
                } = prod;
                const imgUrl = imagen_predeterminada?.data?.attributes?.url
                  ? STRAPI_URL + imagen_predeterminada.data.attributes.url
                  : productoImg;

                return (
                  <Card key={idx} sx={{ display: 'flex', borderRadius: 2, boxShadow: 2, mb: 2 }}>
                    <CardMedia
                      component="img"
                      image={imgUrl}
                      alt={nombre || 'Producto'}
                      sx={{ width: 140, height: 140, objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flex: 1 }}>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2">
                            <strong>Artículo:</strong> {nombre || '-'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3} md={2}>
                          <Typography variant="body2">
                            <strong>Cant.:</strong> {cantidad ?? '-'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3} md={2}>
                          <Typography variant="body2">
                            <strong>Precio:</strong> ${precio_unitario?.toFixed(2) || '-'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3} md={2}>
                          <Typography variant="body2">
                            <strong>Total:</strong> ${total?.toFixed(2) || '-'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                );
              })}

              {/** Fecha de entrega o cancelación */}
              <Typography variant="caption" color="text.secondary" display="block">
                {status === 'recibido'
                  ? `Entregado: ${new Date(fecha_entrega).toLocaleString()}`
                  : status === 'cancelado'
                    ? `Cancelado: ${new Date(updatedAt).toLocaleString()}`
                    : `Devuelto: ${new Date(updatedAt).toLocaleString()}`
                }
              </Typography>

              {guia && (
                <Typography variant="caption" color="text.secondary" display="block">
                  Guía: {guia}
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />
            </Box>
          );
        })
      )}
    </Box>
  );

  return (
    <Box width="100%" p={0} m={0}>
      {renderSection(entregados, 'Pedidos entregados')}
      {renderSection(cancelados, 'Pedidos cancelados')}
    </Box>
  );
};

export default PedidosEntregados;

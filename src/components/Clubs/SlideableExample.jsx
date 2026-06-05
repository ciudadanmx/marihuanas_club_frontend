import React from 'react';
import Slideable from './slideable';
import { Box, Typography, Button, Card, CardContent, Stack, Chip } from '@mui/material';
import { LocationOn, AccessTime, Person } from '@mui/icons-material';

// Ejemplo de uso del componente Slideable
export default function SlideableExample() {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Ejemplo del Componente Slideable
      </Typography>

      <Typography variant="body1" sx={{ mb: 4 }}>
        Este componente se comporta como los de Didi, Uber o Facebook.
        Inicialmente muestra una barra pequeña, pero se puede deslizar hacia arriba para expandir.
      </Typography>

      {/* El componente Slideable se renderiza al final */}
      <Slideable
        collapsedContent={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn sx={{ color: 'primary.main' }} />
            <Typography variant="body2">
              📍 Tu ubicación actual - Toca para ver más opciones
            </Typography>
          </Box>
        }
        expandedHeight={500}
        onExpand={() => console.log('Panel expandido')}
        onCollapse={() => console.log('Panel colapsado')}
      >
        {/* Contenido que se muestra cuando está expandido */}
        <Stack spacing={3}>
          <Typography variant="h6" gutterBottom>
            🚗 Servicios Disponibles
          </Typography>

          {/* Opción 1 */}
          <Card sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 40, height: 40, bgcolor: 'primary.main', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    🚕
                  </Box>
                  <Box>
                    <Typography variant="subtitle1">Taxi Estándar</Typography>
                    <Typography variant="body2" color="textSecondary">2-3 min • 4.2 ⭐</Typography>
                  </Box>
                </Box>
                <Typography variant="h6" color="primary">$45.00</Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Opción 2 */}
          <Card sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 40, height: 40, bgcolor: 'secondary.main', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    🚗
                  </Box>
                  <Box>
                    <Typography variant="subtitle1">Auto Ejecutivo</Typography>
                    <Typography variant="body2" color="textSecondary">5-7 min • 4.8 ⭐</Typography>
                  </Box>
                </Box>
                <Typography variant="h6" color="primary">$78.00</Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Opción 3 */}
          <Card sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 40, height: 40, bgcolor: 'success.main', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    🛵
                  </Box>
                  <Box>
                    <Typography variant="subtitle1">Moto Rápida</Typography>
                    <Typography variant="body2" color="textSecondary">3-5 min • 4.5 ⭐</Typography>
                  </Box>
                </Box>
                <Typography variant="h6" color="primary">$25.00</Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Información adicional */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              📋 Detalles del viaje
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <Chip icon={<AccessTime />} label="Tiempo estimado: 12 min" size="small" />
              <Chip icon={<LocationOn />} label="Distancia: 8.5 km" size="small" />
            </Stack>
            <Typography variant="body2" color="textSecondary">
              El precio puede variar según el tráfico y la demanda actual.
            </Typography>
          </Box>

          {/* Botones de acción */}
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" fullWidth>
              Cancelar
            </Button>
            <Button variant="contained" fullWidth>
              Confirmar Viaje
            </Button>
          </Stack>
        </Stack>
      </Slideable>
    </Box>
  );
}
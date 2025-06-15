import React from 'react';
import EventosPage from '../../components/Eventos/index.jsx'
import {
  Box,
  Grid,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  useMediaQuery,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { styled } from '@mui/system';
import placeholder from '../../assets/placeholder.jpg'

// Animación psicodélica ligera
const CardAnimada = styled(Card)(({ theme }) => ({
  transition: 'transform 0.4s ease, box-shadow 0.4s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `0 8px 16px rgba(255, 242, 0, 0.4)`,
  },
  backgroundColor: '#1f1f1f',
  color: '#fff',
  border: '2px solid #fff200',
  borderRadius: '16px',
}));

export default function EventosGrid({ eventos }) {
  const isMobile = useMediaQuery('(max-width:600px)');

  // Agrupar eventos por día de la semana (0-6)
  const eventosPorDia = Array.from({ length: 7 }, (_, i) =>
    eventos.filter((ev) => new Date(ev.fecha_inicio).getDay() === i)
  );

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <Box sx={{ px: 2, py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#fff200', textAlign: 'center' }}>
        Agenda de Eventos
      </Typography>

      <Grid container spacing={2}>
        {diasSemana.map((dia, i) => (
          <Grid
            key={dia}
            item
            xs={12}
            sm={6}
            md={1.7}
            sx={{ minWidth: 150, flexGrow: 1 }}
          >
            <Typography
              variant="h6"
              align="center"
              sx={{ color: '#fff200', mb: 1, borderBottom: '1px solid #fff200' }}
            >
              {dia}
            </Typography>

            {eventosPorDia[i].map((evento) => (
              <CardAnimada key={evento.slug} sx={{ mb: 2 }}>
                <CardMedia
                  component="img"
                  height="120"
                  image={evento.portada?.url || placeholder}
                  alt={evento.titulo}
                  sx={{
                    objectFit: 'cover',
                    borderTopLeftRadius: '14px',
                    borderTopRightRadius: '14px',
                  }}
                />
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {evento.titulo}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    {evento.ciudad} • {evento.estado}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                    {evento.hora_inicio} hrs
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    component={Link}
                    to={`/evento/${evento.slug}`}
                    sx={{
                      mt: 1,
                      color: '#fff200',
                      borderColor: '#fff200',
                      '&:hover': {
                        backgroundColor: '#fff20022',
                      },
                    }}
                  >
                    Ver más
                  </Button>
                </CardContent>
              </CardAnimada>
            ))}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

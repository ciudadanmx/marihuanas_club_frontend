import React, { useContext } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  useMediaQuery,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { styled } from '@mui/system';
import placeholder from '../../assets/placeholder.jpg';
import { useRoles } from '../../Contexts/RolesContext';

const CardAnimada = styled(Card)(({ theme }) => ({
  transition: 'transform 0.4s ease, box-shadow 0.4s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `0 8px 20px rgba(136, 255, 112, 0.35)`,
  },
  backgroundColor: '#252d25',
  color: '#fff',
  border: '2px solid #b8ff57',
  borderRadius: '16px',
}));

export default function EventosGrid({ eventos }) {
  const isMobile = useMediaQuery('(max-width:600px)');
  const { isEditor } = useRoles();

  const eventosPorDia = Array.from({ length: 7 }, (_, i) =>
    eventos.filter((ev) => new Date(ev.fecha_inicio).getDay() === i)
  );
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <Box sx={{ px: 2, py: 4 }}>
      {/* Título + botón + select */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: '#b8ff57',
            textAlign: isMobile ? 'left' : 'center',
            flexGrow: 1,
          }}
        >
          Agenda de Eventos
        </Typography>

        {isEditor && (
          <Button
            variant="contained"
            component={Link}
            to="/admin/crear-evento"
            sx={{
              backgroundColor: '#91ff49',
              color: '#1a1a1a',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#a5ff30',
              },
              borderRadius: '12px',
              px: 3,
              boxShadow: '0 0 10px #91ff49',
            }}
          >
            + Agregar evento
          </Button>
        )}

        <FormControl
          sx={{
            minWidth: 150,
            borderRadius: '12px',
            background: '#101b10',
            boxShadow: '0 0 8px #7fff8d66',
            '& .MuiInputLabel-root': { color: '#7fff8d' },
            '& .MuiOutlinedInput-root': {
              color: '#b8ff57',
              borderColor: '#7fff8d',
              '& fieldset': {
                borderColor: '#7fff8d',
              },
              '&:hover fieldset': {
                borderColor: '#91ff49',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#b8ff57',
              },
            },
          }}
        >
          <InputLabel id="categoria-label">Categoría</InputLabel>
          <Select
            labelId="categoria-label"
            id="categoria"
            defaultValue="todos"
            label="Categoría"
          >
            <MenuItem value="todos">Todos</MenuItem>
            <MenuItem value="musicales">Musicales</MenuItem>
            <MenuItem value="cursos">Cursos</MenuItem>
            <MenuItem value="politicos">Políticos</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Grid de eventos */}
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
              sx={{
                color: '#b8ff57',
                mb: 1,
                borderBottom: '1px solid #b8ff57',
              }}
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
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 'bold', color: '#a5ff30' }}
                  >
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
                      color: '#b8ff57',
                      borderColor: '#b8ff57',
                      '&:hover': {
                        backgroundColor: '#b8ff5710',
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

import React, { useState, useEffect } from 'react';
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
  CircularProgress,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { styled } from '@mui/system';
import placeholder from '../../assets/placeholders/bitacoraplaceholder.jpg';
import { useRoles } from '../../Contexts/RolesContext';

const CardAnimada = styled(Card)(() => ({
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

export default function Bitacora() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mesSelected, setMesSelected] = useState(new Date().getMonth());
  const [yearSelected, setYearSelected] = useState(new Date().getFullYear());
  const [tipoSelected, setTipoSelected] = useState('');
  const [yearsDisponibles, setYearsDisponibles] = useState([]);
  const isMobile = useMediaQuery('(max-width:600px)');
  const { roles, membresia } = useRoles();
  const baseURL = process.env.REACT_APP_STRAPI_URL;

  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const diasSemana = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

  const years = [];
  for (let y = new Date().getFullYear(); y >= 2020; y--) years.push(y);

  useEffect(() => {
    const fetchYearsDisponibles = async () => {
      console.group('[BITACORA] fetchYearsDisponibles');

      const url = `${baseURL}/api/registrosbitacoras?fields[0]=timestamp&pagination[pageSize]=1000`;

      console.log('[BITACORA] URL años:', url);

      try {
        const res = await fetch(url);
        const json = await res.json();

        console.log('[BITACORA] respuesta años cruda:', json);

        const setAnios = new Set();

        json.data.forEach(r => {
          const y = new Date(r.attributes.timestamp).getFullYear();
          setAnios.add(y);
        });

        const ordenados = Array.from(setAnios).sort((a, b) => a - b);

        console.log('[BITACORA] años detectados:', ordenados);

        setYearsDisponibles(ordenados);
      } catch (err) {
        console.error('[BITACORA] error años:', err);
        setYearsDisponibles([]);
      } finally {
        console.groupEnd();
      }
    };

    fetchYearsDisponibles();
  }, [baseURL]);

  const yearsDisponiblesFinales = (() => {
    const resultado = [...yearsDisponibles];

    if (mesSelected === 11 && resultado.length > 0) {
      const max = Math.max(...resultado);
      resultado.push(max + 1);
    }

    return Array.from(new Set(resultado)).sort((a, b) => a - b);
  })();

  useEffect(() => {
    const fetchRegistros = async () => {
      console.group('[BITACORA] fetchRegistros');

      console.log('[BITACORA] mesSelected:', mesSelected, meses[mesSelected]);
      console.log('[BITACORA] yearSelected:', yearSelected);
      console.log('[BITACORA] tipoSelected:', tipoSelected || '(todos)');

      const start = new Date(yearSelected, mesSelected, 1);
      const end = new Date(yearSelected, mesSelected + 1, 0);

      console.log('[BITACORA] start local:', start);
      console.log('[BITACORA] end local:', end);

      const startISO = start.toISOString();
      const endISO = end.toISOString();

      console.log('[BITACORA] startISO:', startISO);
      console.log('[BITACORA] endISO:', endISO);

      let url = `${baseURL}/api/registrosbitacoras?filters[timestamp][$gte]=${startISO}&filters[timestamp][$lte]=${endISO}&populate=*`;

      if (tipoSelected) {
        url += `&filters[tipo][$eq]=${tipoSelected}`;
      }

      console.log('[BITACORA] URL:', url);

      try {
        const res = await fetch(url);
        const json = await res.json();

        console.log('[BITACORA] respuesta cruda:', json);

        const items = Array.isArray(json.data)
          ? json.data.map(r => ({ id: r.id, ...r.attributes }))
          : [];

        console.log('[BITACORA] total registros:', items.length);

        items.forEach((r, i) => {
          console.log(`[BITACORA] registro ${i + 1}`, {
            timestamp: r.timestamp,
            dateObj: new Date(r.timestamp),
            tipo: r.tipo,
          });
        });

        setRegistros(items);
      } catch (err) {
        console.error('[BITACORA] error fetch:', err);
        setRegistros([]);
      } finally {
        setLoading(false);
        console.groupEnd();
      }
    };

    console.log('[BITACORA] useEffect triggered');
    setLoading(true);
    fetchRegistros();
  }, [baseURL, mesSelected, yearSelected, tipoSelected]);

  if (loading) {
    console.log('[BITACORA] loading true');
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress color="success" />
        <Typography mt={2} color="white">
          Cargando Bitácora...
        </Typography>
      </Box>
    );
  }

  const totalDiasMes = new Date(yearSelected, mesSelected + 1, 0).getDate();
  console.log('[BITACORA] totalDiasMes:', totalDiasMes);

  const diasDelMes = [];

  for (let d = 1; d <= totalDiasMes; d++) {
    const fecha = new Date(yearSelected, mesSelected, d);
    diasDelMes.push({
      dia: d,
      fecha,
      diaSemana: fecha.getDay(),
    });
  }

  const registrosPorFecha = {};
  registros.forEach(reg => {
    const fechaStr = new Date(reg.timestamp).toISOString().split('T')[0];
    if (!registrosPorFecha[fechaStr]) registrosPorFecha[fechaStr] = [];
    registrosPorFecha[fechaStr].push(reg);
  });

  console.log('[BITACORA] registrosPorFecha:', registrosPorFecha);

  const tipos = Array.from(new Set(registros.map(r => r.tipo).filter(Boolean)));

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#101b10', px: 2, pt: 1, pb: 0 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: 2,
          mb: 2,
        }}
      >
        <Typography variant="h4" sx={{ color: '#b8ff57', flexGrow: 1 }}>
          Bitácora {meses[mesSelected]} {yearSelected}
        </Typography>

        <Button
          variant="contained"
          component={Link}
          to="/club/bitacora/escribir"
          sx={{
            backgroundColor: '#91ff49',
            color: '#1a1a1a',
            fontWeight: 'bold',
            borderRadius: '12px',
            px: 3,
            boxShadow: '0 0 10px #91ff49',
            '&:hover': { backgroundColor: '#a5ff30' },
          }}
        >
          + Hacer Anotación
        </Button>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: 2,
          mb: 3,
        }}
      >
        <FormControl>
          <InputLabel sx={{ color: '#7fff8d' }}>Mes</InputLabel>
          <Select value={mesSelected} onChange={(e) => setMesSelected(e.target.value)} sx={{ color: '#b8ff57' }}>
            {meses.map((m, i) => (
              <MenuItem key={i} value={i}>{m}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel sx={{ color: '#7fff8d' }}>Año</InputLabel>
          <Select value={yearSelected} onChange={(e) => setYearSelected(e.target.value)} sx={{ color: '#b8ff57' }}>
            {yearsDisponiblesFinales.map(y => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel sx={{ color: '#7fff8d' }}>Tipo</InputLabel>
          <Select value={tipoSelected} onChange={(e) => setTipoSelected(e.target.value)} sx={{ color: '#b8ff57' }}>
            <MenuItem value="">Todos</MenuItem>
            {tipos.map(t => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={2} sx={{ mb: 0 }}>
        {diasDelMes.map(({ dia, fecha, diaSemana }) => {
          const fechaStr = fecha.toISOString().split('T')[0];
          const registrosDia = registrosPorFecha[fechaStr] || [];

          if (registrosDia.length > 0) {
            console.log(`[BITACORA] ${fechaStr} → ${registrosDia.length} registros`);
          }

          return (
            <Grid key={fechaStr} item xs={12} sm={6} md={1.7} sx={{ minWidth: 150, flexGrow: 1 }}>
              <Typography
                variant="h6"
                align="center"
                sx={{ color: '#b8ff57', mb: 1, borderBottom: '1px solid #b8ff57' }}
              >
                {diasSemana[diaSemana]} {dia}
              </Typography>

              {registrosDia.map(reg => (
                <Link
                  key={reg.timestamp}
                  to={`/club/bitacoras/${encodeURIComponent(reg.timestamp)}`}
                  style={{ textDecoration: 'none' }}
                >
                  <CardAnimada sx={{ mb: 2 }}>
                    <CardMedia
                      component="img"
                      height="120"
                      image={
                        reg.media?.data?.[0]?.attributes?.url
                          ? `${baseURL}${reg.media.data[0].attributes.url}`
                          : placeholder
                      }
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent>
                      <Typography sx={{ color: '#a5ff30', fontWeight: 'bold' }}>
                        {reg.tipo}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {reg.texto}
                      </Typography>
                    </CardContent>
                  </CardAnimada>
                </Link>
              ))}
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

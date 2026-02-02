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

/**
 * =====================================================
 * CARD ANIMADA
 * =====================================================
 * Tarjeta con hover + se usa dentro de <Link>
 */
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

/**
 * =====================================================
 * COMPONENTE CALENDARIOS
 * =====================================================
 */
export default function Bitacora({
  coleccion = 'registrosbitacoras',
  titulo,
  parametro,
  parametro_valor,
  mostrarboton = true,
  botontitulo = '+ Hacer Anotación',
  botonaccion,
  mostrarTipos = true, // 👈 NUEVA PROP (default TRUE)
}) {
  /**
   * =========================
   * ESTADOS
   * =========================
   */
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mesSelected, setMesSelected] = useState(new Date().getMonth());
  const [yearSelected, setYearSelected] = useState(new Date().getFullYear());
  const [tipoSelected, setTipoSelected] = useState('');
  const [yearsDisponibles, setYearsDisponibles] = useState([]);

  const isMobile = useMediaQuery('(max-width:600px)');
  const { roles, membresia } = useRoles();
  const baseURL = process.env.REACT_APP_STRAPI_URL;

  /**
   * =========================
   * CONSTANTES
   * =========================
   */
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const diasSemana = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

  /**
   * =========================
   * FETCH AÑOS DISPONIBLES
   * =========================
   */
  useEffect(() => {
    const fetchYearsDisponibles = async () => {
      try {
        let url = `${baseURL}/api/${coleccion}?fields[0]=timestamp&pagination[pageSize]=1000`;

        if (parametro && parametro_valor !== undefined && parametro_valor !== null) {
          url += `&filters[${parametro}][$eq]=${parametro_valor}`;
        }

        const res = await fetch(url);
        const json = await res.json();

        const setAnios = new Set();
        json.data.forEach(r => {
          setAnios.add(new Date(r.attributes.timestamp).getFullYear());
        });

        setYearsDisponibles([...setAnios].sort((a, b) => a - b));
      } catch {
        setYearsDisponibles([]);
      }
    };

    fetchYearsDisponibles();
  }, [baseURL, coleccion, parametro, parametro_valor]);

  /**
   * =========================
   * AÑOS FINALES
   * =========================
   */
  const yearsDisponiblesFinales = (() => {
    const resultado = [...yearsDisponibles];
    if (mesSelected === 11 && resultado.length) {
      resultado.push(Math.max(...resultado) + 1);
    }
    return [...new Set(resultado)].sort((a, b) => a - b);
  })();

  /**
   * =========================
   * FETCH REGISTROS
   * =========================
   */
  useEffect(() => {
    const fetchRegistros = async () => {
      setLoading(true);

      const startISO = new Date(yearSelected, mesSelected, 1).toISOString();
      const endISO = new Date(yearSelected, mesSelected + 1, 0).toISOString();

      let url = `${baseURL}/api/${coleccion}?populate=*`;
      url += `&filters[timestamp][$gte]=${startISO}`;
      url += `&filters[timestamp][$lte]=${endISO}`;

      if (tipoSelected) {
        url += `&filters[tipo][$eq]=${tipoSelected}`;
      }

      if (parametro && parametro_valor !== undefined && parametro_valor !== null) {
        url += `&filters[${parametro}][$eq]=${parametro_valor}`;
      }

      try {
        const res = await fetch(url);
        const json = await res.json();

        setRegistros(
          Array.isArray(json.data)
            ? json.data.map(r => ({ id: r.id, ...r.attributes }))
            : []
        );
      } catch {
        setRegistros([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistros();
  }, [baseURL, coleccion, mesSelected, yearSelected, tipoSelected, parametro, parametro_valor]);

  /**
   * =========================
   * LOADING
   * =========================
   */
  if (loading) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', px:0, m:0 }}>
        <CircularProgress color="success" />
        <Typography mt={2} color="white">Cargando...</Typography>
      </Box>
    );
  }

  /**
   * =========================
   * CALENDARIO
   * =========================
   */
  const totalDiasMes = new Date(yearSelected, mesSelected + 1, 0).getDate();

  const diasDelMes = Array.from({ length: totalDiasMes }, (_, i) => {
    const fecha = new Date(yearSelected, mesSelected, i + 1);
    return { dia: i + 1, fecha, diaSemana: fecha.getDay() };
  });

  const registrosPorFecha = {};
  registros.forEach(reg => {
    const key = new Date(reg.timestamp).toISOString().split('T')[0];
    if (!registrosPorFecha[key]) registrosPorFecha[key] = [];
    registrosPorFecha[key].push(reg);
  });

  const tipos = Array.from(new Set(registros.map(r => r.tipo).filter(Boolean)));

  const botonLink = botonaccion
    ? `/${String(botonaccion).replace(/^\/+/, '')}/agregar`
    : '/club/bitacora/escribir';

  /**
   * =========================
   * RENDER
   * =========================
   */
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#101b10', px: 2, pt: 1, my:0, mx:0 }}>
      {/* HEADER */}
      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, mb: 2 }}>
        <Typography variant="h4" sx={{ color: '#b8ff57', flexGrow: 1 }}>
          {titulo || `Bitácora ${meses[mesSelected]} ${yearSelected}`}
        </Typography>

        {mostrarboton && (
          <Button
            component={Link}
            to={botonLink}
            sx={{
              backgroundColor: '#91ff49',
              color: '#1a1a1a',
              fontWeight: 'bold',
              borderRadius: '12px',
              px: 3,
              boxShadow: '0 0 10px #91ff49',
            }}
          >
            {botontitulo}
          </Button>
        )}
      </Box>

      {/* FILTROS */}
      <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 2, mb: 3 }}>
        {/* MES */}
        <FormControl>
          <InputLabel sx={{ color: '#7fff8d' }}>Mes</InputLabel>
          <Select
            value={mesSelected}
            onChange={(e) => setMesSelected(e.target.value)}
            sx={{
              color: '#b8ff57',
              '.MuiOutlinedInput-notchedOutline': { borderColor: '#7fff8d' },
              '.MuiSvgIcon-root': { color: '#7fff8d' },
            }}
          >
            {meses.map((m, i) => <MenuItem key={i} value={i}>{m}</MenuItem>)}
          </Select>
        </FormControl>

        {/* AÑO */}
        <FormControl>
          <InputLabel sx={{ color: '#7fff8d' }}>Año</InputLabel>
          <Select
            value={yearSelected}
            onChange={(e) => setYearSelected(e.target.value)}
            sx={{
              color: '#b8ff57',
              '.MuiOutlinedInput-notchedOutline': { borderColor: '#7fff8d' },
              '.MuiSvgIcon-root': { color: '#7fff8d' },
            }}
          >
            {yearsDisponiblesFinales.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </Select>
        </FormControl>

        {/* TIPO (CONDICIONAL POR PROP) */}
        {mostrarTipos && (
          <FormControl>
            <InputLabel sx={{ color: '#7fff8d' }}>Tipo</InputLabel>
            <Select
              value={tipoSelected}
              onChange={(e) => setTipoSelected(e.target.value)}
              sx={{
                color: '#b8ff57',
                '.MuiOutlinedInput-notchedOutline': { borderColor: '#7fff8d' },
                '.MuiSvgIcon-root': { color: '#7fff8d' },
              }}
            >
              <MenuItem value="">Todos</MenuItem>
              {tipos.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Select>
          </FormControl>
        )}
      </Box>

      {/* GRID CALENDARIO */}
      <Grid container spacing={2}>
        {diasDelMes.map(({ dia, fecha, diaSemana }) => {
          const key = fecha.toISOString().split('T')[0];
          const regs = registrosPorFecha[key] || [];

          return (
            <Grid key={key} item xs={12} sm={6} md={1.7} sx={{ minWidth: 150 }}>
              <Typography align="center" sx={{ color: '#b8ff57', mb: 1, borderBottom: '1px solid #b8ff57' }}>
                {diasSemana[diaSemana]} {dia}
              </Typography>

              {regs.map(reg => (
                <Link key={reg.timestamp} to={`/club/bitacoras/${encodeURIComponent(reg.timestamp)}`} style={{ textDecoration: 'none' }}>
                  <CardAnimada sx={{ mb: 2 }}>
                    <CardMedia
                      component="img"
                      height="120"
                      image={
                        reg.media?.data?.[0]?.attributes?.url
                          ? `${baseURL}${reg.media.data[0].attributes.url}`
                          : placeholder
                      }
                    />
                    <CardContent>
                      <Typography sx={{ color: '#a5ff30', fontWeight: 'bold' }}>{reg.tipo}</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>{reg.texto}</Typography>
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

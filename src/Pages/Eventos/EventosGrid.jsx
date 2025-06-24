import React, { useState, useEffect, useRef } from 'react';
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
  TextField,
  Autocomplete,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { styled } from '@mui/system';
import { useJsApiLoader } from '@react-google-maps/api';
import placeholder from '../../assets/placeholder.jpg';
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

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function EventosGrid() {
  const [eventos, setEventos] = useState([]);
  const [loadingEventos, setLoadingEventos] = useState(true);
  const [mesSelected, setMesSelected] = useState(new Date().getMonth());
  const [yearSelected, setYearSelected] = useState(new Date().getFullYear());
  const [years, setYears] = useState([]);
  const [cityInput, setCityInput] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [cityOptions, setCityOptions] = useState([]);
  const isMobile = useMediaQuery('(max-width:600px)');
  const { isEditor } = useRoles();
  const baseURL = process.env.REACT_APP_STRAPI_URL;
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const serviceRef = useRef(null);
  const debouncedCityInput = useDebounce(cityInput, 500);

  useEffect(() => {
    if (isLoaded && !serviceRef.current) {
      serviceRef.current = new window.google.maps.places.AutocompleteService();
    }
  }, [isLoaded]);

  useEffect(() => {
    if (serviceRef.current && debouncedCityInput) {
      serviceRef.current.getPlacePredictions(
        { input: debouncedCityInput, types: ['(cities)'], componentRestrictions: { country: 'mx' } },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setCityOptions(predictions.map(p => ({ description: p.description, placeId: p.place_id })));
          } else {
            setCityOptions([]);
          }
        }
      );
    } else {
      setCityOptions([]);
    }
  }, [debouncedCityInput]);

  const handleCityInputChange = (_, value) => setCityInput(value);
  const handleCityBlur = () => { if (!selectedCity) setCityInput(''); };

  // Cuando el usuario selecciona una opción, extraemos solo el nombre de la ciudad antes de buscar
  const handleCitySelect = (_, value) => {
    if (value) {
      const { description } = value;
      // Desestructuramos la respuesta: tomamos la parte hasta la primera coma
      const ciudad = description.split(',')[0].trim();
      setSelectedCity(ciudad);
      setCityInput(description);
    } else {
      setSelectedCity(null);
      setCityInput('');
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${baseURL}/api/eventos?pagination[page]=1&pagination[pageSize]=1000&fields=fecha_inicio`);
        const json = await res.json();
        const yrs = Array.from(new Set(json.data.map(e => new Date(e.attributes.fecha_inicio).getFullYear())))
          .sort((a,b) => b-a);
        setYears(yrs);
        if (!yrs.includes(yearSelected)) setYearSelected(yrs[0]);
      } catch (e) { console.error(e); }
    })();
  }, [baseURL, yearSelected]);

  useEffect(() => {
    (async () => {
      setLoadingEventos(true);
      try {
        const start = new Date(yearSelected, mesSelected, 1).toISOString().split('T')[0];
        const end = new Date(yearSelected, mesSelected+1, 0).toISOString().split('T')[0];
        let url = `${baseURL}/api/eventos?filters[fecha_inicio][$gte]=${start}&filters[fecha_inicio][$lte]=${end}&populate=portada`;
        if (selectedCity) url += `&filters[ciudad][$eq]=${encodeURIComponent(selectedCity)}`;
        const res = await fetch(url);
        const json = await res.json();
        setEventos(json.data.map(e => e.attributes));
      } catch (err) {
        console.error(err);
        setEventos([]);
      } finally {
        setLoadingEventos(false);
      }
    })();
  }, [baseURL, mesSelected, yearSelected, selectedCity]);

  if (loadError) return <Typography color="error">Error al cargar Google Maps.</Typography>;
  if (!isLoaded) return (
    <Box sx={{ p:4, textAlign:'center' }}>
      <CircularProgress color="success" />
      <Typography mt={2} color="white">Cargando sugerencias...</Typography>
    </Box>
  );

  if (loadingEventos) {
    return (
      <Box sx={{ p:4, textAlign:'center' }}>
        <CircularProgress color="success" />
        <Typography mt={2} color="white">Cargando eventos...</Typography>
      </Box>
    );
  }

  const totalDiasMes = new Date(yearSelected, mesSelected+1, 0).getDate();
  const diasDelMes = Array.from({ length: totalDiasMes }, (_, i) => {
    const fecha = new Date(yearSelected, mesSelected, i+1);
    return { dia: i+1, fecha, diaSemana: fecha.getDay() };
  });

  const eventosPorFecha = {};
  eventos.forEach(ev => {
    const fechaStr = new Date(ev.fecha_inicio).toISOString().split('T')[0];
    (eventosPorFecha[fechaStr] = eventosPorFecha[fechaStr]||[]).push(ev);
  });

  return (
    <Box sx={{ px:2, py:4 }}>
      <Box sx={{ mb:3, display:'flex', flexDirection: isMobile? 'column':'row', alignItems: isMobile?'flex-start':'center', justifyContent:'space-between', gap:2 }}>
        <Typography variant="h4" sx={{ color:'#b8ff57', textAlign: isMobile?'left':'center', flexGrow:1 }}>
          Agenda de {meses[mesSelected]} {yearSelected}
        </Typography>

        {isEditor && (
          <Button
            variant="contained"
            component={Link}
            to="/eventos/crear-evento"
            sx={{
              backgroundColor: '#91ff49',
              color: '#1a1a1a',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#a5ff30' },
              borderRadius: '12px',
              px: 3,
              boxShadow: '0 0 10px #91ff49',
            }}
          >
            + Agregar evento
          </Button>
        )}

        <FormControl sx={{ minWidth:120, background:'#101b10', boxShadow:'0 0 8px #7fff8d66', borderRadius:'12px' }}>
          <InputLabel id="year-label" sx={{ color:'#7fff8d' }}>Año</InputLabel>
          <Select
            labelId="year-label"
            value={yearSelected}
            label="Año"
            onChange={e => setYearSelected(e.target.value)}
            sx={{ color:'#b8ff57' }}
          >
            {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth:120, background:'#101b10', boxShadow:'0 0 8px #7fff8d66', borderRadius:'12px' }}>
          <InputLabel id="mes-label" sx={{ color:'#7fff8d' }}>Mes</InputLabel>
          <Select
            labelId="mes-label"
            value={mesSelected}
            label="Mes"
            onChange={e => setMesSelected(e.target.value)}
            sx={{ color:'#b8ff57' }}
          >
            {meses.map((m, idx) => <MenuItem key={idx} value={idx}>{m}</MenuItem>)}
          </Select>
        </FormControl>

        <Box sx={{ position: 'relative', display: 'inline-block' }}>
  <Autocomplete
    options={cityOptions}
    getOptionLabel={opt => opt.description}
    inputValue={cityInput}
    onInputChange={handleCityInputChange}
    onChange={handleCitySelect}
    onBlur={handleCityBlur}
    loading={debouncedCityInput.length > 0 && cityOptions.length === 0}
    renderInput={params => (
      <TextField
        {...params}
        label="Ciudad"
        variant="outlined"
        sx={{ minWidth:200, background:'#101b10', borderRadius:'12px' }}
        InputProps={{
          ...params.InputProps,
          endAdornment: (
            <>
              {debouncedCityInput && <CircularProgress size={20} />}
              {params.InputProps.endAdornment}
            </>
          ),
        }}
      />
    )}
    noOptionsText="Sin resultados"
  />

  {selectedCity && (
    <span
      className="material-icons"
      onClick={() => {
        setSelectedCity(null);
        setCityInput('');
      }}
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        cursor: 'pointer',
        fontSize: 20,
        color: '#b8ff57',
        backgroundColor: 'rgba(16,27,16,0.8)',
        borderRadius: '50%',
        padding: '2px',
      }}
    >
      close
    </span>
  )}
</Box>

        
      </Box>

      <Grid container spacing={2}>
        {diasDelMes.map(({ dia, fecha, diaSemana }) => {
          const fechaStr = fecha.toISOString().split('T')[0];
          const eventosDelDia = eventosPorFecha[fechaStr] || [];
          return (
            <Grid key={fechaStr} item xs={12} sm={6} md={1.7} sx={{ minWidth:150, flexGrow:1 }}>
              <Typography variant="h6" align="center" sx={{ color:'#b8ff57', mb:1, borderBottom:'1px solid #b8ff57' }}>
                {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][diaSemana]} {dia}
              </Typography>

              {eventosDelDia.map(ev => (
                <Link key={ev.slug} to={`/evento/${ev.slug}`} style={{ textDecoration:'none' }}>
                  <CardAnimada sx={{ mb:2, cursor:'pointer' }}>
                    <CardMedia
                      component="img"
                      height="120"
                      image={ev.portada?.data?.attributes?.url ? `${baseURL}${ev.portada.data.attributes.url}` : placeholder}
                      alt={ev.titulo}
                      sx={{ objectFit:'cover', borderTopLeftRadius:'14px', borderTopRightRadius:'14px' }}
                    />
                    <CardContent sx={{ p:2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight:'bold', color:'#a5ff30' }}>
                        {ev.titulo}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity:0.7 }}>
                        {ev.ciudad} • {ev.estado}
                      </Typography>
                      <Typography variant="caption" sx={{ display:'block', mt:1 }}>
                        {ev.hora_inicio} hrs
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

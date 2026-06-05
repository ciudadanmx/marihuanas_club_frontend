// src/components/DirectorioClubs.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Box, TextField, MenuItem, FormControl, InputLabel, Select, CircularProgress, 
  Typography, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  InputAdornment 
} from '@mui/material';
import { StandaloneSearchBox } from '@react-google-maps/api';
import SearchIcon from '@mui/icons-material/Search';

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL || '';

export default function DirectorioClubs({ onlyPromocion = false }) {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterCity, setFilterCity] = useState('');
  const [filterTipo, setFilterTipo] = useState(''); // cultivo, consumo, ambos

  const searchBoxRef = useRef(null);

  const fetchClubs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${STRAPI_URL}/api/clubs?populate=*&pagination[pageSize]=1000`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const itemsRaw = json.data || [];

      const items = itemsRaw.map(item => {
        const a = item.attributes || {};
        const fotoData = a.foto_de_perfil?.data?.attributes || null;
        let fotoUrl = null;
        if (fotoData && fotoData.url) {
          fotoUrl = fotoData.url.startsWith('http') ? fotoData.url : `${STRAPI_URL}${fotoData.url}`;
        }
        return {
          ...a,
          fotoUrl,
        };
      });

      setClubs(items);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClubs(); }, [fetchClubs]);

  const handlePlacesChanged = () => {
    const sb = searchBoxRef.current;
    if (!sb) return;
    const places = sb.getPlaces ? sb.getPlaces() : [];
    if (!places || places.length === 0) return;
    const place = places[0];
    if (place && place.formatted_address) {
      setFilterCity(place.formatted_address);
    }
  };

  const handleSearchLoad = (ref) => { searchBoxRef.current = ref; };

  // Filtramos clubs según dirección y tipo
  const filteredClubs = clubs.filter(club => {
    const integrantes = Number(club.num_integrantes ?? 0);
    const isPromocion = integrantes === 0;

    if (onlyPromocion && !isPromocion) return false;

    let matchCity = true;
    let matchTipo = true;

    if (filterCity) {
      const direccionTexto = (club.direccion?.direccion || '').toLowerCase();
      matchCity = direccionTexto.includes(filterCity.toLowerCase());
    }

    if (filterTipo) {
      const tipo = (club.tipo || '').toLowerCase();
      if (filterTipo === 'consumo') matchTipo = tipo === 'consumo';
      else if (filterTipo === 'cultivo') matchTipo = tipo === 'cultivo';
      else if (filterTipo === 'ambos') matchTipo = tipo === 'ambas' || tipo === 'ambos' || (tipo.includes('consumo') && tipo.includes('cultivo'));
    }

    return matchCity && matchTipo;
  });

  if (loading) return (
    <Box sx={{ textAlign: 'center', my: 4 }}>
      <CircularProgress />
      <Typography>Cargando clubes...</Typography>
    </Box>
  );
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <Box sx={{ width: '95%', mx: 'auto', mt: 2 }}>
      {onlyPromocion && (
        <Box
          sx={{
            mb: 2,
            px: 2,
            py: 1.25,
            borderRadius: 3,
            border: '2px solid #fff200',
            background: 'linear-gradient(90deg, #43a047 0%, #66bb6a 100%)',
            boxShadow: '0 0 16px rgba(255, 242, 0, 0.6)',
            display: 'inline-block',
          }}
        >
          <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: { xs: '0.92rem', sm: '1rem' } }}>
            En promoción: solo clubs con 0 integrantes
          </Typography>
        </Box>
      )}

      {/* FILTROS */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        {/* Autocomplete de Google Places para ciudades */}
        <StandaloneSearchBox
          onLoad={handleSearchLoad}
          onPlacesChanged={handlePlacesChanged}
          options={{ types: ['(cities)'], componentRestrictions: { country: 'mx' } }}
        >
          <TextField
            size="small"
            variant="outlined"
            placeholder="Buscar ciudad..."
            sx={{ minWidth: 220 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </StandaloneSearchBox>

        {/* Select de Tipo */}
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Tipo</InputLabel>
          <Select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            label="Tipo"
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="consumo">Consumo</MenuItem>
            <MenuItem value="cultivo">Cultivo</MenuItem>
            <MenuItem value="ambos">Ambos</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* DIRECTORIO / TABLA */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Dirección</TableCell>
              <TableCell>Integrantes</TableCell>
              <TableCell>Lugares</TableCell>
              <TableCell>Productos / Servicios</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClubs.map((club, idx) => (
              <TableRow key={idx}>
                <TableCell>{club.nombre_club || 'Sin nombre'}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={club.tipo === 'consumo' ? 'Consumo' : club.tipo === 'cultivo' ? 'Cultivo' : 'Ambos'}
                    sx={{ fontWeight: 700 }}
                  />
                </TableCell>
                <TableCell>{club.direccion?.direccion || '-'}</TableCell>
                <TableCell>{club.num_integrantes || 0}</TableCell>
                <TableCell>{club.lugares || '-'}</TableCell>
                <TableCell>
                  {Array.isArray(club.productos) ? club.productos.slice(0,3).join(', ') : ''}
                  {Array.isArray(club.servicios) && club.servicios.length > 0 ? (club.productos?.length ? ', ' : '') + club.servicios.slice(0,3).join(', ') : ''}
                  {((club.productos?.length || 0) + (club.servicios?.length || 0)) > 3 ? '...' : ''}
                </TableCell>
              </TableRow>
            ))}
            {filteredClubs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">No se encontraron clubes</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

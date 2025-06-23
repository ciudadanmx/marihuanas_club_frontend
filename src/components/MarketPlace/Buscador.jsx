import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button, Box, TextField, Accordion, AccordionSummary, AccordionDetails,
  Typography, Slider, MenuItem, FormControl, InputLabel, Select
} from '@mui/material';
import '../../styles/BuscadorTienda.css';
import BotonVender from './BotonVender';

const Buscador = () => {
  const [busqueda, setBusqueda] = useState('');
  const navigate = useNavigate();
  const [precio, setPrecio] = useState([10, 100]);

  const handleBuscar = () => {
    const slug = busqueda.trim().toLowerCase().replace(/\s+/g, '-');
    if (!slug) return;
    navigate(`/productos/busqueda/${slug}`);
  };

  return (
    <Box mt={3} textAlign="center">
      {/* 🔧 Flex para alinearlos horizontalmente */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ gap: 1, maxWidth: '100%', mx: 'auto', px: 2 }}
      >
        <Box sx={{ display: 'flex', flex: '0 1 520px' }}>
          <TextField
            onChange={(e) => setBusqueda(e.target.value)}
            value={busqueda}
            variant="outlined"
            placeholder="Buscar productos en MarketPlace 4:20..."
            fullWidth
            sx={{
              boxShadow: 3,
              borderRadius: 2,
              height: '100%',
              '& .MuiOutlinedInput-root': { height: '56px' }
            }}
          />
          <Button
            onClick={handleBuscar}
            variant="contained"
            sx={{
              backgroundColor: '#000',
              color: '#fff200',
              borderRadius: 2,
              fontWeight: 'bold',
              textTransform: 'none',
              height: '56px',
              minWidth: '56px',
              ml: 1,
              '&:hover': {
                backgroundColor: '#222',
                transform: 'scale(1.05)'
              }
            }}
          >
            <span className="material-icons">search</span>
          </Button>
        </Box>

        {/* Espacio de al menos 100px entre botón buscar y vender */}
        <Box sx={{ ml: '100px' }}>
          <BotonVender />
        </Box>
      </Box>

      {/* Filtros avanzados */}
      <Box mt={4} sx={{ maxWidth: 700, mx: 'auto' }}>
        <Accordion elevation={3}>
          <AccordionSummary expandIcon={<span className="material-icons">expand_more</span>}>
            <Typography>Filtros avanzados</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box display="grid" gap={2}>
              <Box>
                <Typography gutterBottom>Rango de Precio ($)</Typography>
                <Slider
                  value={precio}                     
                  onChange={(e, newValue) => {
                    // newValue puede ser number | number[], por eso forzamos array
                    setPrecio(Array.isArray(newValue) ? newValue : [newValue, precio[1]]);
                  }}
                  min={0}
                  max={500}
                  valueLabelDisplay="auto"
                  sx={{
                    color: 'rgb(0, 200, 0)', // ✅ verde vibrante
                    '& .MuiSlider-thumb': {
                      backgroundColor: '#fff',
                      border: '2px solid rgb(0, 200, 0)',
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: 'rgb(0, 200, 0)',
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: '#ccc',
                    }
                  }}
                />
              </Box>
              <FormControl fullWidth>
                <InputLabel>Marca</InputLabel>
                <Select defaultValue="">
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="marca1">Marca 1</MenuItem>
                  <MenuItem value="marca2">Marca 2</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Tienda</InputLabel>
                <Select defaultValue="">
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="tienda1">Tienda 1</MenuItem>
                  <MenuItem value="tienda2">Tienda 2</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default Buscador;
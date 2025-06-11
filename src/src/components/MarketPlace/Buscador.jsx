import { Box, TextField, Accordion, AccordionSummary, AccordionDetails, Typography, Slider, MenuItem, FormControl, InputLabel, Select } from '@mui/material';

const Buscador = () => (
  <Box mt={2} textAlign="center">
    <TextField
      variant="outlined"
      placeholder="Buscar productos..."
      fullWidth
      sx={{ maxWidth: 500, mx: 'auto', boxShadow: 3, borderRadius: 2 }}
    />

    <Box mt={2} sx={{ maxWidth: 700, mx: 'auto' }}>
      <Accordion elevation={3}>
        <AccordionSummary
          expandIcon={<span className="material-icons">expand_more</span>}
        >
          <Typography>Filtros avanzados</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box display="grid" gap={2}>
            <Box>
              <Typography gutterBottom>Rango de Precio ($)</Typography>
              <Slider value={[10, 100]} min={0} max={500} valueLabelDisplay="auto" />
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

export default Buscador;

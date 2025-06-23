import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Alert,
  Paper,
} from '@mui/material';

// Preguntas con dimensiones psicológicas
const preguntas = [
  {
    id: 'freq_alcohol',
    texto: '¿Con qué frecuencia consumes bebidas alcohólicas? 🎉',
    dimension: 'Frecuencia de Consumo',
    opciones: [
      { label: 'Nunca', value: 0 },
      { label: 'Menos de una vez al mes', value: 1 },
      { label: '1-3 veces al mes', value: 2 },
      { label: '1 vez a la semana', value: 3 },
      { label: '2-4 veces a la semana', value: 4 },
      { label: 'Casi todos los días', value: 5 },
    ],
  },
  {
    id: 'freq_cannabis',
    texto: '¿Con qué frecuencia consumes cannabis? 🍃',
    dimension: 'Frecuencia de Consumo',
    opciones: [
      { label: 'Nunca', value: 0 },
      { label: 'Menos de una vez al mes', value: 1 },
      { label: '1-3 veces al mes', value: 2 },
      { label: '1 vez a la semana', value: 3 },
      { label: '2-4 veces a la semana', value: 4 },
      { label: 'Casi todos los días', value: 5 },
    ],
  },
  {
    id: 'urge_consumo',
    texto: '¿Sientes urgencia de consumir? 🔥',
    dimension: 'Dependencia Psicológica',
    opciones: [
      { label: 'Nunca', value: 0 },
      { label: 'Rara vez', value: 1 },
      { label: 'A veces', value: 2 },
      { label: 'Con frecuencia', value: 3 },
      { label: 'Casi siempre', value: 4 },
      { label: 'Siempre', value: 5 },
    ],
  },
  {
    id: 'control_consumo',
    texto: '¿Te cuesta controlar la cantidad? 🎯',
    dimension: 'Dependencia Psicológica',
    opciones: [
      { label: 'Nunca', value: 0 },
      { label: 'Rara vez', value: 1 },
      { label: 'A veces', value: 2 },
      { label: 'Con frecuencia', value: 3 },
      { label: 'Casi siempre', value: 4 },
      { label: 'Siempre', value: 5 },
    ],
  },
  {
    id: 'cantidad_aumento',
    texto: '¿Necesitas más para el mismo efecto? ⚖️',
    dimension: 'Tolerancia Física',
    opciones: [
      { label: 'Nunca', value: 0 },
      { label: 'Rara vez', value: 1 },
      { label: 'A veces', value: 2 },
      { label: 'Con frecuencia', value: 3 },
      { label: 'Casi siempre', value: 4 },
      { label: 'Siempre', value: 5 },
    ],
  },
  {
    id: 'problemas_sociales',
    texto: '¿Has tenido problemas sociales o legales? ⚠️',
    dimension: 'Consecuencias',
    opciones: [
      { label: 'Nunca', value: 0 },
      { label: 'Rara vez', value: 1 },
      { label: 'A veces', value: 2 },
      { label: 'Con frecuencia', value: 3 },
      { label: 'Siempre', value: 4 },
    ],
  },
  {
    id: 'uso_otras_drogas',
    texto: '¿Has usado otras drogas? 💊',
    dimension: 'Consecuencias',
    opciones: [
      { label: 'No', value: 0 },
      { label: '1-2 veces', value: 1 },
      { label: '3-5 veces', value: 2 },
      { label: 'Más de 5 veces', value: 3 },
    ],
  },
];

const niveles = ['Bajo', 'Moderado', 'Alto'];

// Calcula nivel en base al puntaje
const calcularNivel = (puntaje) => {
  if (puntaje <= 3) return niveles[0];
  if (puntaje <= 7) return niveles[1];
  return niveles[2];
};

const TestConsumoResponsable = () => {
  const [respuestas, setRespuestas] = useState({});
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState(null);

  const handleChange = (id, value) => {
    setRespuestas(prev => ({ ...prev, [id]: Number(value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    // Validar que todas estén respondidas
    if (Object.keys(respuestas).length !== preguntas.length) {
      setError('Por favor, responde todas las preguntas.');
      return;
    }
    // Sumar por dimensión
    const dims = {};
    preguntas.forEach(p => {
      dims[p.dimension] = (dims[p.dimension] || 0) + respuestas[p.id];
    });
    // Construir resultado
    const detalles = Object.entries(dims).map(([dim, score]) => ({ dim, score, nivel: calcularNivel(score) }));
    setResultado(detalles);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Test de Consumo Responsable
      </Typography>
      <form onSubmit={handleSubmit}>
        {preguntas.map(q => (
          <FormControl key={q.id} component="fieldset" sx={{ mb: 2 }}>
            <FormLabel component="legend">{q.texto}</FormLabel>
            <RadioGroup
              name={q.id}
              value={respuestas[q.id]?.toString() || ''}
              onChange={e => handleChange(q.id, e.target.value)}
            >
              {q.opciones.map((o, i) => (
                <FormControlLabel key={i} value={o.value.toString()} control={<Radio />} label={o.label} />
              ))}
            </RadioGroup>
          </FormControl>
        ))}
        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
        <Box textAlign="center">
          <Button type="submit" variant="contained">Evaluar</Button>
        </Box>
      </form>

      {resultado && (
        <Box mt={3}>
          <Typography variant="h5">Resultados:</Typography>
          {resultado.map((r, idx) => (
            <Typography key={idx} sx={{ mt: 1 }}>
              <strong>{r.dim}:</strong> {r.score} puntos - Nivel {r.nivel}
            </Typography>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default TestConsumoResponsable;

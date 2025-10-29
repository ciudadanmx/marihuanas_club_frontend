import React, { useMemo, useState } from 'react';
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
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Divider,
  Stack,
  IconButton,
} from '@mui/material';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import SpaIcon from '@mui/icons-material/Spa';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import GavelIcon from '@mui/icons-material/Gavel';
import MedicationIcon from '@mui/icons-material/Medication';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { motion } from 'framer-motion';

// Preguntas enriquecidas (texto ampliado para contexto)
const preguntas = [
  {
    id: 'freq_alcohol',
    texto: '¿Con qué frecuencia consumes bebidas alcohólicas? 🎉 (Describe tu patrón: social, por rutina, para dormir, etc.)',
    dimension: 'Frecuencia de Consumo',
    icon: <LocalBarIcon />,
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
    texto: '¿Con qué frecuencia consumes cannabis? 🍃 (¿Uso recreativo, medicinal, ritual?)',
    dimension: 'Frecuencia de Consumo',
    icon: <SpaIcon />,
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
    texto: '¿Sientes urgencia de consumir? 🔥 (Pensamientos constantes, planificación o impulsos difíciles de ignorar)',
    dimension: 'Dependencia Psicológica',
    icon: <WhatshotIcon />,
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
    texto: '¿Te cuesta controlar la cantidad que consumes? 🎯 (Ej. quieres parar y no puedes, o terminas consumiendo más de lo planeado)',
    dimension: 'Dependencia Psicológica',
    icon: <TrackChangesIcon />,
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
    texto: '¿Necesitas cada vez más para lograr el mismo efecto? ⚖️ (Señal de tolerancia física)',
    dimension: 'Tolerancia Física',
    icon: <TrackChangesIcon />,
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
    texto: '¿Has tenido problemas sociales, familiares o legales por consumo? ⚠️',
    dimension: 'Consecuencias',
    icon: <GavelIcon />,
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
    texto: '¿Has usado otras drogas (no alcohol/cannabis)? 💊',
    dimension: 'Consecuencias',
    icon: <MedicationIcon />,
    opciones: [
      { label: 'No', value: 0 },
      { label: '1-2 veces', value: 1 },
      { label: '3-5 veces', value: 2 },
      { label: 'Más de 5 veces', value: 3 },
    ],
  },
];

// Niveles dinámicos según porcentaje
const niveles = ['Bajo', 'Moderado', 'Alto'];

const calcularNivelPorcentaje = (score, maxScore) => {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  if (pct < 35) return niveles[0];
  if (pct < 70) return niveles[1];
  return niveles[2];
};

// Consejos y sugerencias extensas por dimensión y nivel
const recomendaciones = {
  'Frecuencia de Consumo': {
    Bajo: `Resumen y significado:
Tu patrón muestra consumo esporádico o nulo. Esto suele implicar bajo riesgo inmediato.

Consejos prácticos:
- Mantén límites claros: define reglas personales (por ejemplo, \"solo en reuniones sociales\").
- Reflexiona sobre motivos: anota cuándo y por qué consumes; distinguir 'placer' de 'evitar emociones' ayuda.
- Estrategias de reemplazo: desarrolla rituales alternativos (actividad física corta, infusiones, llamadas).

Si quieres ampliar (una cuartilla):
- Explora cómo el entorno social influye: escribe una página con situaciones que disparan consumo y planifica respuestas concretas.
- Practica reducción gradual: si decides bajar aún más, define metas semanales y registra progreso.
- Recursos: grupos de apoyo, lecturas sobre consumo responsable y cursos en línea para autocontrol.
`,
    Moderado: `Resumen y significado:
Tu consumo es regular y existe un potencial de riesgo progresivo si las circunstancias cambian.

Consejos prácticos y plan de acción (detallado):
- Registro exhaustivo: durante 30 días anota cantidad, contexto emocional, hora y compañía. Esto revela patrones ocultos.
- Reglas firmes y sanciones suaves: por ejemplo, máximo X ocasiones por semana y no combinar con conductor/medicación.
- Técnicas conductuales: usar la técnica STOP (detener, respirar, observar, proceder) cuando aparezca la urgencia.
- Actividades sustitutivas: deporte breve, meditación guiada de 5-10 minutos, hobby creativo.

Intervención preventiva (cuartilla):
- Escribe una página analizando beneficios de reducir el consumo y obstáculos esperados. Define 5 acciones concretas para la primera semana (ej.: reducir un día a la semana).
- Considera apoyo profesional si notas aumento de tolerancia o dependencia emocional.
- Si convives con otras personas, comunica límites y acuerdos para evitar presión social.
`,
    Alto: `Resumen y significado:
El patrón indica consumo frecuente que puede afectar salud física, emocional, laboral o legal. Hay mayor probabilidad de dependencia.

Consejos urgentes y plan en 3 fases (muy detallado):
Fase 1 — Evaluación inmediata:
- Registro intensivo: 14 días documentando cantidad, efectos y consecuencias.
- Evitar situaciones de alto riesgo (conducción, mezcla con otras sustancias).
- Priorizar seguridad: si hay riesgo de sobredosis o reacciones, busca atención de urgencia.

Fase 2 — Intervención y reducción:
- Buscar apoyo: médico de familia, clínica de adicciones o terapeuta especializado.
- Terapias basadas en evidencia: TCC (terapia cognitivo-conductual), terapia de contingencias, programas ambulatorios.
- Red de apoyo: informa a una o dos personas de confianza y acuerda señales y límites.

Fase 3 — Mantenimiento y prevención de recaídas:
- Plan de manejo de recaídas: identifica detonantes, crea respuesta alternativa y lista de contactos de apoyo.
- Establece metas de vida (salud, trabajo, relaciones) y monitorea su progreso cada 30 días.

Recursos: servicios de salud mental, líneas de ayuda nacionales, grupos de autoayuda. Si es posible, realiza una consulta médica para evaluar daño hepático (si aplica) o interacción con medicación.
`,
  },
  'Dependencia Psicológica': {
    Bajo: `Resumen:
No hay señales fuertes de dependencia psicológica. Mantener vigilancia y autocuidado.

Consejos prácticos:
- Observa pensamientos recurrentes: lleva una breve nota cuando aparezcan pensamientos de consumo.
- Mindfulness y anclajes: sesiones cortas diarias (5-10 min) para mejorar tolerancia a la incomodidad.
- Fortalece redes sociales no ligadas al consumo.

Profundización (cuartilla):
- Escribe sobre emociones incómodas que sueles evitar con sustancias. Desarrolla alternativas concretas (contactar a un amigo, respiración, salir a caminar).
`,
    Moderado: `Resumen:
Existe tendencia a recurrir al consumo como respuesta emocional o hábito. Riesgo de escalar si no se interviene.

Consejos y ejercicios extensos:
- Terapia breve: considera sesiones con terapeuta para trabajar mecanismos de afrontamiento.
- Técnica ABC: Antecedente - creencia - consecuencia; reestructura creencias que empujan al consumo.
- Plan de pausas: días sin consumo, y registros antes/después para ver impacto.

Cuartilla de trabajo personal:
- Describe 5 emociones que te impulsan a consumir; para cada una escribe 3 alternativas concretas y realiza una prueba por semana.
`,
    Alto: `Resumen:
Hay señales importantes de dependencia psicológica: pensamientos persistentes, pérdida de control en situaciones. Es prioritario actuar.

Intervención recomendada (detallada):
- Consulta con profesional en salud mental especializado en adicciones. La TCC y terapias motivacionales tienen buen respaldo.
- Entrenamiento en habilidades: manejo de impulsos, tolerancia a la angustia, solución de problemas y regulación emocional.
- Posible grupo terapéutico o programa estructurado (ambulatorio/internamiento según gravedad).

Plan de 4 semanas (acción concreta):
Semana 1: registro y reducción de situaciones de alto riesgo.
Semana 2: iniciar terapia semanal y aprender técnicas de distracción/relajación.
Semana 3: consolidar apoyo social y practicar respuestas alternativas.
Semana 4: diseñar plan de mantenimiento y prevención de recaídas con contactos de emergencia.

Si tienes pensamientos de daño o riesgos legales, busca atención inmediata.
`,
  },
  'Tolerancia Física': {
    Bajo: `Resumen:
Sin signos claros de tolerancia. Seguimiento y práctica de límites.

Acciones prácticas:
- Alterna días sin consumo para evitar aumento de tolerancia.
- Mantén registros de dosis/efectos para detectar cambios.

Cuartilla:
- Documenta expectativas sobre efectos y cómo estas cambian con el tiempo. Si notas pérdida de efecto, consulta a profesional.
`,
    Moderado: `Resumen:
Hay indicios de tolerancia en aumento. Esto puede llevar a consumir más y a riesgos físicos.

Consejos detallados:
- Estratégia de \"tolerancia off\": periodos planificados de abstinencia para restablecer sensibilidad.
- Control médico si hay preocupaciones físicas.
- Reducción gradual bajo supervisión si procede.

Cuartilla de planificación:
- Planifica un ciclo de 2-4 semanas con metas y revisión médica si usas medicamentos concomitantes.
`,
    Alto: `Resumen:
Tolerancia alta: necesitar más cantidad para efecto puede llevar a consumo peligroso y problemas de salud.

Intervención urgente:
- Evaluación médica: chequeo general, riesgo de interacciones, y posibles pruebas según sustancias.
- Programas de deshabituación o reducción supervisada.
- Educación detallada sobre daños esperables y estrategias para reducir consumo.

Plan de acción (varias cuartillas):
- Registro médico: historial, examen, pruebas básicas.
- Intervención multidisciplinaria: médico, terapeuta, y grupo de apoyo.
- Seguimiento mensual y plan de reinserción social/profesional si fuera necesario.
`,
  },
  Consecuencias: {
    Bajo: `Resumen:
Pocas consecuencias reportadas. Buen indicador, pero mantener límites y cuidado.

Consejos prácticos:
- Revisa decisiones que puedan generar problemas (manejo de dinero, relaciones, trabajo).
- Mantén comunicación abierta con personas cercanas si surge conflicto.

Cuartilla:
- Haz una lista de situaciones donde el consumo podría generar consecuencias y planea respuestas concretas.
`,
    Moderado: `Resumen:
Han ocurrido consecuencias ocasionales. Importante reducir riesgo y reparar daños menores.

Consejos y plan de reparación:
- Identifica daños (económicos, laborales, familiares) y prioriza repararlos.
- Terapia breve para trabajar habilidades sociales y resolución de conflictos.
- Limita acceso a situaciones de riesgo (dinero, transporte).

Cuartilla de reparación:
- Escribe un plan para reparar daño específico (por ejemplo, disculpa y plan de acción con jefe o familiar).
`,
    Alto: `Resumen:
Consecuencias importantes o repetidas (legales, pérdida de empleo, rupturas). Requiere intervención urgente y multifacética.

Intervención recomendada:
- Asesoría legal si hay problemas judiciales.
- Apoyo social y familiar para reparar relaciones o recuperar empleo.
- Programas de tratamiento intensivos y seguimiento prolongado.

Plan amplio (cuartillas):
- Evaluación integral: legal, médica, psicosocial.
- Diseño de plan de reinserción: formación, terapia familiar, redes de apoyo.
- Monitoreo y ajustes continuos; incluir indicadores de éxito (empleo, relaciones, abstinencia).
`,
  },
};

const TestConsumoResponsable = () => {
  const [respuestas, setRespuestas] = useState({});
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState(null);

  const handleChange = (id, value) => {
    setRespuestas(prev => {
      const next = { ...prev, [id]: Number(value) };
      // If user selects '0' (Nunca) we still keep it as answered; to remove answer, they must reset
      return next;
    });
  };

  const reset = () => {
    setRespuestas({});
    setResultado(null);
    setError('');
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    setError('');

    // If there are no answered items, show error
    if (Object.keys(respuestas).length === 0) {
      setError('Por favor, responde al menos una pregunta para obtener resultados.');
      return;
    }

    // Agrupar por dimensión y calcular puntajes solo con las preguntas respondidas
    const dims = {};
    const maxByDim = {};

    preguntas.forEach(p => {
      if (respuestas.hasOwnProperty(p.id)) {
        dims[p.dimension] = (dims[p.dimension] || 0) + respuestas[p.id];
        // sumar el máximo de la pregunta respondida (no todas las preguntas de la dimensión)
        maxByDim[p.dimension] = (maxByDim[p.dimension] || 0) + Math.max(...p.opciones.map(o => o.value));
      }
    });

    // Construir detalles solo para dimensiones con al menos una respuesta
    const detalles = Object.entries(dims).map(([dim, score]) => {
      const maxScore = maxByDim[dim] || 0;
      const nivel = calcularNivelPorcentaje(score, maxScore);
      return { dim, score, maxScore, nivel };
    });

    const withRecs = detalles.map(d => ({ ...d, recomendacion: (recomendaciones[d.dim] && recomendaciones[d.dim][d.nivel]) || 'Sin recomendación disponible.' }));

    setResultado(withRecs);
  };

  const progreso = useMemo(() => {
    const answered = Object.keys(respuestas).length;
    return Math.round((answered / preguntas.length) * 100);
  }, [respuestas]);

  return (
    <Paper elevation={6} sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto', mt: 4, borderRadius: 3, background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(245,247,250,0.9))' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>Test de Consumo Responsable</Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>Autoevaluación — muestra **solo** resultados de las dimensiones que respondiste.</Typography>
          </Box>
          <Box textAlign="right">
            <Chip label={`${progreso}% completado`} color="primary" />
            <IconButton onClick={reset} aria-label="reset" title="Reiniciar prueba">
              <RestartAltIcon />
            </IconButton>
          </Box>
        </Box>

        <LinearProgress variant="determinate" value={progreso} sx={{ height: 8, borderRadius: 8, mb: 2 }} />

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {preguntas.map((q, idx) => (
              <motion.div key={q.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.995 }} transition={{ duration: 0.15 }}>
                <Card variant="outlined" sx={{ p: 1, borderRadius: 2 }}> 
                  <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box sx={{ width: 56, height: 56, display: 'grid', placeItems: 'center', borderRadius: 2, background: 'linear-gradient(135deg, rgba(0,0,0,0.04), rgba(0,0,0,0.02))' }}>
                      {q.icon}
                    </Box>

                    <Box flex={1}>
                      <FormControl component="fieldset" sx={{ width: '100%' }}>
                        <FormLabel component="legend">
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{q.texto}</Typography>
                        </FormLabel>
                        <RadioGroup
                          name={q.id}
                          value={respuestas[q.id]?.toString() || ''}
                          onChange={e => handleChange(q.id, e.target.value)}
                          row
                          sx={{ mt: 1, flexWrap: 'wrap' }}
                        >
                          {q.opciones.map((o, i) => (
                            <FormControlLabel key={i} value={o.value.toString()} control={<Radio />} label={o.label} sx={{ mr: 1, mb: 0.5 }} />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {error && <Alert severity="warning">{error}</Alert>}

            <Box display="flex" gap={2} justifyContent="center" mt={1}>
              <Button type="submit" variant="contained" size="large">Evaluar</Button>
              <Button variant="outlined" size="large" onClick={() => { setResultado(null); setError(''); }}>Limpiar resultados</Button>
            </Box>
          </Stack>
        </form>

        {resultado && (
          <Box mt={4}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Resultados (solo dimensiones respondidas)</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>Interpretación y recomendaciones detalladas para cada dimensión que contestaste.</Typography>

            <Stack spacing={2}>
              {resultado.map((r, i) => (
                <motion.div key={r.dim} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card sx={{ borderLeft: '6px solid', borderLeftColor: r.nivel === 'Alto' ? 'error.main' : r.nivel === 'Moderado' ? 'warning.main' : 'success.main' }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>{r.dim} • {r.nivel}</Typography>
                          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>{r.score} / {r.maxScore} puntos</Typography>
                        </Box>
                        <Chip label={r.nivel} color={r.nivel === 'Alto' ? 'error' : r.nivel === 'Moderado' ? 'warning' : 'success'} />
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 2 }}>{r.recomendacion}</Typography>

                     {/*  <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                        <Button size="small" variant="outlined" href="#" onClick={(e) => { e.preventDefault(); alert('Ejercicio descargado (simulado)'); }}>Ejercicios prácticos</Button>
                        <Button size="small" variant="outlined" href="#" onClick={(e) => { e.preventDefault(); alert('Recursos y lecturas (simulado)'); }}>Recursos</Button>
                        <Button size="small" variant="contained" onClick={() => navigator.clipboard?.writeText(`Mi resultado: ${r.dim} - ${r.nivel} (${r.score}/${r.maxScore})`)}>Copiar resumen</Button>
                      </Box> */}


                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Stack>

            <Box mt={3}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Siguiente paso recomendado</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1 }}>
                Si algún dominio aparece en nivel Alto o si te preocupa tu consumo, prioriza una evaluación profesional. Si todo está en niveles bajos o moderados, usa las estrategias preventivas y revisa tu progreso en 30 días.
              </Typography>
            </Box>

          </Box>
        )}
      </motion.div>
    </Paper>
  );
};

export default TestConsumoResponsable;

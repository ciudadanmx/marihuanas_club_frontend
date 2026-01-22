// src/components/InstruccionesActa.jsx
// Componente: InstruccionesActa
// Propósito: mostrar instrucciones claras paso a paso (para dummys) sobre cómo llenar el Generador de Acta y Estatutos
// - Material UI
// - Framer Motion para micro-interacciones
// - Emojis para facilitar lectura y retención
// - Texto en español, estilo profesional

import React from 'react';
import {
  Container, Grid, Paper, Typography, Box, List, ListItem, ListItemIcon, ListItemText,
  Accordion, AccordionSummary, AccordionDetails, Button, Divider, Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PlaceIcon from '@mui/icons-material/Place';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PersonIcon from '@mui/icons-material/Person';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { motion } from 'framer-motion';

export default function InstruccionesActa() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <Typography variant="h4" gutterBottom>📝 Instrucciones para generar el Acta Constitutiva y Estatutos (para dummys)</Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>Aquí tienes todo el paso a paso, qué datos pedir, dónde obtenerlos, qué documentos llevar y qué esperar al llevar tu acta al notario o al registro. 👇</Typography>
      </motion.div>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <motion.div whileHover={{ scale: 1.01 }}>
            <Paper sx={{ p: 2 }} elevation={3}>
              <Typography variant="h6">✅ Antes de empezar (Checklist rápido)</Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="success"/></ListItemIcon>
                  <ListItemText primary="Decidan el nombre de la sociedad (razón social)" secondary="(2-3 opciones por si el nombre está ocupado)" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><PersonIcon color="primary"/></ListItemIcon>
                  <ListItemText primary="Reúnan datos de los socios: nombre completo, RFC, CURP, domicilio, aportación" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><AccountBalanceIcon color="primary"/></ListItemIcon>
                  <ListItemText primary="Definan capital social y forma de aportación (dinero / especie)" secondary="Indicar montos y porcentajes" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><DescriptionIcon color="primary"/></ListItemIcon>
                  <ListItemText primary="Tengan listo un comprobante de domicilio y ID oficial de cada socio" secondary="INE, pasaporte, recibo de luz" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><SupportAgentIcon color="warning"/></ListItemIcon>
                  <ListItemText primary="Definan quién será el notario (si van a protocolizar)" secondary="Pregunten disponibilidad y tarifas" />
                </ListItem>
              </List>

              <Divider sx={{ my: 1 }} />

              <Typography variant="subtitle2">⏱️ Tiempo estimado</Typography>
              <Typography variant="body2">Preparación de datos: 1–3 días. Firma y protocolización ante notario: 1 día (según agenda). Inscripción en el RPC: 3–10 días hábiles.</Typography>
            </Paper>
          </motion.div>

          <motion.div whileHover={{ scale: 1.01 }}>
            <Paper sx={{ p: 2, mt: 2 }} elevation={3}>
              <Typography variant="h6">📁 Documentos que necesitas</Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><AssignmentIndIcon/></ListItemIcon>
                  <ListItemText primary="Identificación oficial de cada socio" secondary="INE o pasaporte" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><DescriptionIcon/></ListItemIcon>
                  <ListItemText primary="RFC de cada socio" secondary="Si no lo tienen, tramitar en el SAT" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><PlaceIcon/></ListItemIcon>
                  <ListItemText primary="Comprobante de domicilio reciente (3 meses)" secondary="Recibo de luz, agua o estado de cuenta" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><FileUploadIcon/></ListItemIcon>
                  <ListItemText primary="Documentos que prueben aportaciones en especie (si aplica)" secondary="Fotos, facturas o inventario" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CalendarTodayIcon/></ListItemIcon>
                  <ListItemText primary="Fechas tentativas: constitución, firma notarial" secondary="Coordinar con notario" />
                </ListItem>
              </List>
            </Paper>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }} elevation={3}>
            <Typography variant="h6">🔎 Guía campo por campo — ¿Qué escribir y cómo obtenerlo?</Typography>

            <Box sx={{ mt: 1 }}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                  <Typography variant="subtitle1">📝 Razón social / Nombre</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>Qué poner: el nombre legal de la sociedad (ej.: "Marihuanas Club A.C.") 💡</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>Cómo conseguirlo: propongan 2–3 nombres y busquen disponibilidad en el Registro Público de Comercio o con el notario. Eviten nombres genéricos que ya existan.</Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>Tip pro: tener alternativas y añadir el tipo social (A.C., S. de R.L., S.A.S.).</Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                  <Typography variant="subtitle1">🏷️ Tipo de sociedad</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>Qué poner: el tipo jurídico (ej.: Asociación Civil, Sociedad Civil, S. de R.L., S.A.S.)</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>Cómo elegir: consulta rápida con un notario o asesor jurídico. Para proyectos sin ánimo de lucro, A.C. es lo usual; si van a operar comercialmente, consideren S. de R.L. o S.A.S.</Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                  <Typography variant="subtitle1">📅 Fecha de constitución</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>Qué poner: la fecha en que firman el acta constitutiva (día/mes/año).</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>Cómo acordarla: coordinen con todos los socios y el notario; en plataformas internas pongan una fecha tentativa que luego el notario confirmará.</Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                  <Typography variant="subtitle1">📚 Objeto social</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>Qué poner: descripción clara y amplia de las actividades que realizará la sociedad (eviten lenguaje excesivamente restringido).</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>Cómo redactarlo: piensen en un párrafo que incluya las principales actividades y la posibilidad de actividades complementarias (ej.: "Comercialización, importación, distribución y asesoría relacionada con ...").</Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                  <Typography variant="subtitle1">💰 Capital social y aportaciones</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>Qué poner: monto total del capital social, desglose por socio y forma de aportación (dinero o en especie).</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>Cómo calcularlo: definan cuánto aporta cada socio y el porcentaje correspondiente. Si hay aportaciones en especie, documenten con facturas o inventario (fotos + evidencia).</Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                  <Typography variant="subtitle1">🏠 Domicilio social</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>Qué poner: la dirección completa donde estará legalmente domiciliada la sociedad.</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>Cómo comprobarla: el notario normalmente requiere un comprobante de domicilio del representante o de la sociedad (recibo de luz, agua o estado de cuenta a nombre de un socio o la propia sociedad).</Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                  <Typography variant="subtitle1">🧾 Datos de socios (por cada socio)</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    <ListItem>
                      <ListItemIcon><PersonIcon/></ListItemIcon>
                      <ListItemText primary="Nombre completo" secondary="Tal como aparece en identificación oficial" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><AssignmentIndIcon/></ListItemIcon>
                      <ListItemText primary="RFC" secondary="Si no lo tienen, tramitar en SAT; es necesario para registrar aportaciones" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><DescriptionIcon/></ListItemIcon>
                      <ListItemText primary="CURP" secondary="Útil para trámites y constancias" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><PlaceIcon/></ListItemIcon>
                      <ListItemText primary="Domicilio" secondary="Comprobante reciente (recibo)" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><AccountBalanceIcon/></ListItemIcon>
                      <ListItemText primary="Aportación y porcentaje" secondary="Ejemplo: $50,000 (40%)" />
                    </ListItem>
                  </List>

                  <Typography variant="body2" sx={{ mt: 1 }}>Dónde conseguirlos: cada socio trae su identificación (INE/pasaporte), RFC —si no lo tiene, el notario puede orientar cómo tramitarlo— y comprobante de domicilio.</Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                  <Typography variant="subtitle1">📜 Estatutos internos / Cláusulas</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>Qué poner: las cláusulas que regulan la operación interna (ej.: administración, nombramientos, quórum, voto, transmisión de participaciones, disolución).</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>Cómo redactarlas: si no saben, dejen cláusulas estándar y el notario o asesor las adaptará. Aquí pueden añadir cláusulas opcionales para facultades específicas.</Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                  <Typography variant="subtitle1">🧭 Órganos, quórum y toma de decisiones</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>Qué poner: describir órganos (Asamblea, Consejo, Presidente, etc.) y reglas de votación (mayoría simple, dos tercios, unanimidad).</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>Cómo acordarlo: piensen en funciones y en cómo tomarán decisiones importantes (eg. aumentos de capital, venta de activos, cambios estatutarios).</Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                  <Typography variant="subtitle1">🖋️ Notario y protocolización</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>Qué poner: nombre del notario (si ya lo contrataron) y fecha tentativa de protocolización.</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>Qué hace el notario: da fe pública, protocoliza el acta y la envía al Registro Público de Comercio para su inscripción. Pregunten costos y requisitos específicos con el notario elegido.</Typography>
                </AccordionDetails>
              </Accordion>

            </Box>
          </Paper>

          <Box sx={{ mt: 2 }}>
            <Paper sx={{ p: 2 }} elevation={2}>
              <Typography variant="h6">📍 Dónde llevarlo y próximos pasos</Typography>
              <List>
                <ListItem>
                  <ListItemIcon><AccountBalanceIcon/></ListItemIcon>
                  <ListItemText primary="1) Notario público" secondary="Firmas ante notario y protocolización (si desean acta notariada)." />
                </ListItem>
                <ListItem>
                  <ListItemIcon><DescriptionIcon/></ListItemIcon>
                  <ListItemText primary="2) Registro Público de Comercio" secondary="Inscripción de la sociedad (obligatoria para efectos frente a terceros)." />
                </ListItem>
                <ListItem>
                  <ListItemIcon><AssignmentIndIcon/></ListItemIcon>
                  <ListItemText primary="3) SAT" secondary="Registro ante SAT para obtener RFC y régimen fiscal de la sociedad." />
                </ListItem>
                <ListItem>
                  <ListItemIcon><SupportAgentIcon/></ListItemIcon>
                  <ListItemText primary="4) Otros trámites" secondary="IMSS, certificados, licencias según actividad." />
                </ListItem>
              </List>

              <Divider sx={{ my: 1 }} />

              <Typography variant="subtitle1">💡 Consejo práctico</Typography>
              <Typography variant="body2">Lleven copias impresas de todo y, si pueden, archivos digitales (PDF). Mantengan una carpeta con los documentos originales listos para firmar. Pregunten tarifas y tiempos al notario antes de agendar.</Typography>
            </Paper>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Paper sx={{ p: 2 }} elevation={2}>
              <Typography variant="h6">❓ Preguntas frecuentes (FAQ) — Rápido</Typography>
              <List>
                <ListItem>
                  <ListItemIcon><InfoIcon/></ListItemIcon>
                  <ListItemText primary="¿Puedo cambiar el objeto social después?" secondary="Sí, mediante una reforma estatutaria y su inscripción en el RPC." />
                </ListItem>
                <ListItem>
                  <ListItemIcon><WarningIcon color="warning"/></ListItemIcon>
                  <ListItemText primary="¿Qué pasa si no inscribo la sociedad?" secondary="No tendrás la protección frente a terceros y podrían surgir problemas legales/comerciales." />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="success"/></ListItemIcon>
                  <ListItemText primary="¿Necesito un contador?" secondary="Sí, te recomendamos tener asesoría fiscal desde el inicio para elegir régimen y obligaciones fiscales." />
                </ListItem>
              </List>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label="🧾 Identificaciones" />
                <Chip label="🏠 Comprobante de domicilio" />
                <Chip label="💳 Datos bancarios (si aportan dinero)" />
                <Chip label="📑 Contratos y comprobantes en especie" />
              </Box>
            </Paper>
          </Box>

        </Grid>

      </Grid>

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button variant="contained">🔗 Ir al Generador (abrir componente Acta y Estatutos)</Button>
        <Button variant="outlined">📥 Descargar checklist (PDF)</Button>
      </Box>

    </Container>
  );
}

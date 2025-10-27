// src/components/GeneradorAmparoMaterial.jsx
import React, { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';
import { motion } from 'framer-motion';
import {
  TextField,
  Grid,
  Button,
  Paper,
  Typography,
  Box,
  Divider,
  Container,
  Stack,
} from '@mui/material';

// Register a PDF font (optional)
Font.register({ family: 'Times-Roman' });

// PDF styles
const pdfStyles = StyleSheet.create({
  page: { fontFamily: 'Times-Roman', padding: 28, fontSize: 11, lineHeight: 1.45 },
  title: { fontSize: 12, textAlign: 'center', marginBottom: 8, fontWeight: 'bold' },
  heading: { fontSize: 11, marginTop: 8, marginBottom: 4, fontWeight: 'bold' },
  paragraph: { marginBottom: 6, textAlign: 'justify' },
  footer: { position: 'absolute', fontSize: 9, left: 28, right: 28, bottom: 20, textAlign: 'center' }
});

// Build structured sections (easy to render in preview + PDF)
function buildSections(data) {
  const t = {
    NOMBRE: data.nombre || '____________________',
    DIRECCION: data.direccion || '____________________',
    FOLIO: data.folio || '____________________',
    FECHA_INGRESO: data.fechaIngreso || '____________________',
    FECHA_NEGATIVA: data.fechaNegativa || '____________________',
    EMAIL: data.email || '____________________',
    TELEFONO: data.telefono || '____________________',
    RFC: data.rfc || '____________________',
    CURP: data.curp || '____________________',
    CIUDAD: data.ciudad || '____________________',
    FECHA_DOC: data.fechaDocumento || '____________________'
  };

  return [
    { type: 'title', text: 'C. JUEZ DE DISTRITO EN MATERIA ADMINISTRATIVA QUE CORRESPONDA\nPRESENTE' },
    { heading: '', paragraphs: [`${t.NOMBRE}, por mi propio derecho, con domicilio para oír y recibir notificaciones en ${t.DIRECCION}, correo electrónico ${t.EMAIL} y teléfono ${t.TELEFONO}, comparezco y expongo:`] },

    { heading: 'I. AUTORIDAD RESPONSABLE Y ACTO RECLAMADO', paragraphs: [
      `Autoridad responsable: Comisión Federal para la Protección contra Riesgos Sanitarios (COFEPRIS) y los servidores públicos competentes.`,
      `Acto reclamado: La resolución negativa expresa dictada por COFEPRIS en relación con mi solicitud de permiso para uso personal de cannabis; folio: ${t.FOLIO}, ingresada el ${t.FECHA_INGRESO} y resuelta con negativa expresa el ${t.FECHA_NEGATIVA}.`
    ]},

    { heading: 'II. ANTECEDENTES', paragraphs: [
      '1. El día indicado presenté ante COFEPRIS solicitud de autorización para uso personal, no comercial, de cannabis con fines recreativos/autoconsumo, bajo el folio referido en el encabezado.',
      '2. Transcurrido el término procedente, la autoridad resolvió negativamente mi petición mediante oficio de fecha indicada en el encabezado, sin adoptar las medidas mínimas de ponderación exigidas por la Constitución y la jurisprudencia de la Suprema Corte.',
      '3. Con independencia de la motivación formal del oficio de negativa, dicho acto me priva injustificadamente del ejercicio de derechos fundamentales reconocidos en la Constitución.'
    ]},

    { heading: 'III. CONCEPTOS DE VIOLACIÓN', paragraphs: [
      '1) Violación al derecho al libre desarrollo de la personalidad (arts. 1º y 4º): la negativa impide al quejoso decidir sobre su proyecto de vida respecto al consumo responsable de sustancias para uso personal.',
      '2) Violación al principio de proporcionalidad y a la protección de la salud (art. 4º): la prohibición absoluta que impide emitir permisos de uso personal se contrapone con el estándar de proporcionalidad.',
      '3) Violación a la seguridad jurídica y legalidad (arts. 14 y 16): la autoridad funda su decisión en porciones normativas cuya aplicación debe interpretarse conforme a la Constitución.',
      '4) Violación al deber de motivación: la resolución administrativa no cuantifica ni pondera los factores relevantes.'
    ]},

    { heading: 'IV. FUNDAMENTOS DE DERECHO', paragraphs: [
      'Artículos 1º, 4º, 14, 16, 103 y 107 de la Constitución Política de los Estados Unidos Mexicanos; principios de máxima protección de derechos humanos y precedentes de la SCJN.'
    ]},

    { heading: 'V. PRUEBAS', paragraphs: [
      '1. Prueba documental: copia simple de la solicitud presentada ante COFEPRIS, oficio de negativa, identificación oficial, RFC, CURP y demás documentos probatorios.',
      '2. Prueba pericial en materia de salud pública (si procede).'
    ]},

    { heading: 'VI. PUNTOS PETITORIOS', paragraphs: [
      'PRIMERO: Se admita la presente demanda de amparo indirecto en materia administrativa.',
      'SEGUNDO: Se declare fundada la demanda y se deje sin efectos la resolución negativa dictada por COFEPRIS respecto al folio indicado.',
      'TERCERO: Se ordene a la autoridad responsable emitir autorización para uso personal y no comercial de cannabis por parte del quejoso, en términos compatibles con la protección de terceros.',
      'CUARTO: Se ordene la restitución de derechos y, en su caso, la reparación de la afectación.'
    ]},

    { paragraphs: [
      `Protesto lo necesario.\n\n${t.CIUDAD}, a ${t.FECHA_DOC}.\n\n____________________________________\n${t.NOMBRE}\nRFC: ${t.RFC} · CURP: ${t.CURP}\nDomicilio para oír y recibir notificaciones: ${t.DIRECCION}\nCorreo: ${t.EMAIL} · Teléfono: ${t.TELEFONO}`
    ] }
  ];
}

// PDF component
const PdfDocument = ({ data }) => {
  const sections = useMemo(() => buildSections(data), [data]);

  return (
    <Document>
      <Page size="LETTER" style={pdfStyles.page} wrap>
        {sections.map((s, idx) => (
          <View key={idx} style={{ marginBottom: 6 }}>
            {s.type === 'title' && <Text style={{ ...pdfStyles.title, marginBottom: 10 }}>{s.text}</Text>}
            {s.heading && <Text style={pdfStyles.heading}>{s.heading}</Text>}
            {s.paragraphs && s.paragraphs.map((p, i) => <Text key={i} style={pdfStyles.paragraph}>{p}</Text>)}
          </View>
        ))}
        <Text style={pdfStyles.footer}>Demanda de amparo por negativa expresa de permiso para uso personal de cannabis — Documento generado automáticamente</Text>
      </Page>
    </Document>
  );
};

// Main React component
export default function GeneradorAmparoMaterial() {
  const defaultValues = {
    nombre: '',
    direccion: '',
    folio: '',
    fechaIngreso: '',
    fechaNegativa: '',
    email: '',
    telefono: '',
    rfc: '',
    curp: '',
    ciudad: '',
    fechaDocumento: ''
  };

  const { control, handleSubmit, formState: { errors }, reset } = useForm({ defaultValues });
  const [data, setData] = useState(defaultValues);
  const [ready, setReady] = useState(false);
  const sections = useMemo(() => buildSections(data), [data]);

  // submit => set data and enable download / preview
  const onSubmit = (values) => {
    setData(values);
    setReady(true);
    // smooth scroll to preview
    const el = document.getElementById('amparo-preview');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Option: open PDF in a new tab (generate blob then open)
  const handleOpenPdf = async () => {
    const doc = <PdfDocument data={data} />;
    const asPdf = pdf([]);
    asPdf.updateContainer(doc);
    const blob = await asPdf.toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Pretty preview renderer
  function Preview() {
    return (
      <Paper elevation={2} sx={{ p: 2, bgcolor: '#fafafa' }}>
        {sections.map((s, i) => (
          <Box key={i} sx={{ mb: 1 }}>
            {s.type === 'title' && (
              <Typography variant="subtitle2" align="center" sx={{ fontWeight: 700, mb: 1 }}>
                {s.text}
              </Typography>
            )}
            {s.heading && <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>{s.heading}</Typography>}
            {s.paragraphs && s.paragraphs.map((p, j) => (
              <Typography key={j} variant="body2" sx={{ mt: 0.6, whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{p}</Typography>
            ))}
          </Box>
        ))}
      </Paper>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
        <Typography variant="h4" gutterBottom>Generador de Amparo — Negativa expresa COFEPRIS</Typography>
      </motion.div>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>Formulario</Typography>

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Controller name="nombre" control={control}
                    rules={{ required: 'Nombre requerido' }}
                    render={({ field }) => <TextField {...field} label="Nombre completo" fullWidth error={!!errors.nombre} helperText={errors.nombre?.message} />} />
                </Grid>

                <Grid item xs={12}>
                  <Controller name="direccion" control={control}
                    rules={{ required: 'Dirección requerida' }}
                    render={({ field }) => <TextField {...field} label="Dirección completa" fullWidth error={!!errors.direccion} helperText={errors.direccion?.message} />} />
                </Grid>

                <Grid item xs={6}>
                  <Controller name="folio" control={control}
                    rules={{ required: 'Folio requerido' }}
                    render={({ field }) => <TextField {...field} label="Folio COFEPRIS" fullWidth error={!!errors.folio} helperText={errors.folio?.message} />} />
                </Grid>

                <Grid item xs={6}>
                  <Controller name="fechaIngreso" control={control}
                    rules={{ required: 'Fecha de ingreso requerida' }}
                    render={({ field }) => <TextField {...field} label="Fecha de ingreso" type="date" fullWidth InputLabelProps={{ shrink: true }} error={!!errors.fechaIngreso} helperText={errors.fechaIngreso?.message} />} />
                </Grid>

                <Grid item xs={6}>
                  <Controller name="fechaNegativa" control={control}
                    rules={{ required: 'Fecha de negativa requerida' }}
                    render={({ field }) => <TextField {...field} label="Fecha de negativa" type="date" fullWidth InputLabelProps={{ shrink: true }} error={!!errors.fechaNegativa} helperText={errors.fechaNegativa?.message} />} />
                </Grid>

                <Grid item xs={6}>
                  <Controller name="ciudad" control={control}
                    render={({ field }) => <TextField {...field} label="Ciudad (firma)" fullWidth />} />
                </Grid>

                <Grid item xs={12}>
                  <Controller name="email" control={control}
                    rules={{ required: 'Email requerido', pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' } }}
                    render={({ field }) => <TextField {...field} label="Correo electrónico" fullWidth error={!!errors.email} helperText={errors.email?.message} />} />
                </Grid>

                <Grid item xs={6}>
                  <Controller name="telefono" control={control}
                    rules={{ required: 'Teléfono requerido' }}
                    render={({ field }) => <TextField {...field} label="Teléfono celular" fullWidth error={!!errors.telefono} helperText={errors.telefono?.message} />} />
                </Grid>

                <Grid item xs={6}>
                  <Controller name="fechaDocumento" control={control}
                    rules={{ required: 'Fecha del documento requerida' }}
                    render={({ field }) => <TextField {...field} label="Fecha del documento" type="date" fullWidth InputLabelProps={{ shrink: true }} error={!!errors.fechaDocumento} helperText={errors.fechaDocumento?.message} />} />
                </Grid>

                <Grid item xs={6}>
                  <Controller name="rfc" control={control}
                    render={({ field }) => <TextField {...field} label="RFC" fullWidth />} />
                </Grid>

                <Grid item xs={6}>
                  <Controller name="curp" control={control}
                    render={({ field }) => <TextField {...field} label="CURP" fullWidth />} />
                </Grid>

                <Grid item xs={12}>
                  <Stack direction="row" spacing={2}>
                    <motion.div whileHover={{ y: -4 }}>
                      <Button type="submit" variant="contained" color="success">Generar Amparo</Button>
                    </motion.div>

                    <Button onClick={() => { reset(defaultValues); setReady(false); setData(defaultValues); }} variant="outlined">Limpiar</Button>

                    <Button onClick={() => { /* optional: save draft to DB */ }} variant="text">Guardar (pro)</Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6">Previsualización</Typography>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={() => { setReady(false); setData(defaultValues); }}>Reset preview</Button>
                <Button variant="contained" onClick={handleOpenPdf} disabled={!ready}>Abrir PDF</Button>
              </Stack>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Preview />

            <Box mt={2} display="flex" gap={2}>
              {ready ? (
                <PDFDownloadLink document={<PdfDocument data={data} />} fileName={`Demanda_Amparo_${(data.nombre||'sin_nombre').replace(/\s+/g,'_')}.pdf`} style={{ textDecoration: 'none' }}>
                  {({ loading }) => (
                    <Button variant="contained" color="primary">{loading ? 'Generando...' : 'Descargar PDF'}</Button>
                  )}
                </PDFDownloadLink>
              ) : (
                <Button variant="contained" disabled>Generar para descargar</Button>
              )}

              <Button variant="outlined" onClick={() => window.print()}>Imprimir vista</Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box mt={3} textAlign="center">
        <Typography variant="caption" color="text.secondary">
          Plantilla automática. Revisa y valida con un abogado antes de presentar. Puedes separar en módulos: AmparoForm.jsx, amparoTemplate.js, PdfDocument.jsx.
        </Typography>
      </Box>
    </Container>
  );
}

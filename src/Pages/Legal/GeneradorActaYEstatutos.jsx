// src/components/GeneradorActaYEstatutos.jsx
// Generador completo de Acta Constitutiva y Estatutos Internos
// - Formulario dinámico para datos de la sociedad, socios, capital, órganos, cláusulas
// - Previsualización en pantalla
// - Generación de PDF (react-pdf)
// - Descarga / impresión
// - Opcional: subir a Strapi (configurar REACT_APP_STRAPI_URL y REACT_APP_STRAPI_TOKEN)

import React, { useState, useMemo } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { pdf, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import {
  Container, Grid, Paper, Typography, Box, TextField, Button, Stack, Alert, Divider, IconButton
} from '@mui/material';
import { Add, Delete, Save, PictureAsPdf } from '@mui/icons-material';
import { motion } from 'framer-motion';

Font.register({ family: 'Times-Roman' });

const pdfStyles = StyleSheet.create({
  page: { fontFamily: 'Times-Roman', padding: 28, fontSize: 11, lineHeight: 1.45 },
  title: { fontSize: 13, textAlign: 'center', marginBottom: 8, fontWeight: 'bold' },
  heading: { fontSize: 11, marginTop: 8, marginBottom: 4, fontWeight: 'bold' },
  paragraph: { marginBottom: 6, textAlign: 'justify' },
  tableRow: { flexDirection: 'row', marginBottom: 4 },
  tableCell: { flex: 1 },
  footer: { position: 'absolute', fontSize: 9, left: 28, right: 28, bottom: 20, textAlign: 'center' }
});

function formatDate(dateStr) {
  if (!dateStr) return '____/____/______';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-MX');
  } catch (e) { return dateStr; }
}

// Genera secciones PDF para acta/estatutos
function buildActaSections(data) {
  const sociedadNombre = data.razonSocial || 'NOMBRE DE LA SOCIEDAD';
  const tipo = data.tipoSociedad || 'Asociación Civil';
  const domicilio = `${data.calle || ''} ${data.numext || ''} ${data.numint || ''} ${data.colonia || ''} ${data.municipio || ''} ${data.estado || ''}`.trim() || 'DOMICILIO COMPLETO';
  const fecha = formatDate(data.fechaConstitucion);

  const socios = data.socios || [];
  const obj = data.objetoSocial || 'Objeto social no especificado.';
  const capital = data.capitalSocial || 'Capital social no especificado.';

  const sections = [];

  sections.push({ type: 'title', text: `ACTA CONSTITUTIVA DE ${sociedadNombre.toUpperCase()}` });
  sections.push({ paragraphs: [`En la ciudad de ${data.ciudadFirma || '________'}, a los ${fecha}, comparecieron ante mí (o reunidos) las personas que al final suscriben, quienes manifiestan ser los fundadores de la ${tipo} que en lo sucesivo se denominará "${sociedadNombre}" y exponen:`] });

  sections.push({ heading: 'I. DENOMINACIÓN, TIPO Y DOMICILIO', paragraphs: [`La sociedad se denominará: ${sociedadNombre}. Tipo social: ${tipo}. Domicilio social: ${domicilio}.` ] });

  sections.push({ heading: 'II. OBJETO SOCIAL', paragraphs: [obj] });

  sections.push({ heading: 'III. CAPITAL SOCIAL Y PARTICIPACIONES', paragraphs: [capital] });

  sections.push({ heading: 'IV. SOCIOS FUNDADORES', paragraphs: socios.map((s, i) => `${i+1}. ${s.nombre || 'NOMBRE'} - ${s.rfc || ''} - Domicilio: ${s.direccion || ''} - Aportación: ${s.aportacion || ''} (${s.porcentaje || ''}%)`) });

  sections.push({ heading: 'V. ÓRGANOS DE GOBIERNO', paragraphs: [
    data.organos || 'Asamblea General de Socios; Consejo (o Junta) Directivo; Director General o Presidente; Comisario (si aplica).',
    `Quórum y reglas de votación: ${data.quorum || 'Según estatutos.'}`
  ]});

  // Añadir cláusulas/estatutos internos
  const estatutos = data.estatutos || [];
  if (estatutos.length) {
    sections.push({ heading: 'ESTATUTOS INTERNOS', paragraphs: ['A continuación se incorporan los estatutos internos propuestos:'] });
    estatutos.forEach((cl, idx) => {
      sections.push({ heading: `Cláusula ${idx+1}: ${cl.titulo || 'Sin título'}`, paragraphs: [cl.texto || 'Texto no proporcionado.'] });
    });
  } else {
    sections.push({ heading: 'ESTATUTOS INTERNOS', paragraphs: ['No se definieron estatutos específicos en este formulario.'] });
  }

  sections.push({ paragraphs: [`Leída que fue el acta, la misma se ratifica y firma por los comparecientes.`] });

  sections.push({ heading: 'FIRMAS', paragraphs: socios.map((s) => `${s.nombre || 'NOMBRE'} — ____________________`) });

  sections.push({ paragraphs: [`Protocolización: ${data.notario || 'Notario (si procede)'} - Fecha de protocolización: ${formatDate(data.fechaNotario)}`] });

  sections.push({ paragraphs: [`Documento generado automáticamente el ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}`] });

  return sections;
}

// PDF Document
const ActaPdf = ({ data }) => {
  const sections = useMemo(() => buildActaSections(data), [data]);
  return (
    <Document>
      <Page size="LETTER" style={pdfStyles.page} wrap>
        {sections.map((s, idx) => (
          <View key={idx} style={{ marginBottom: 6 }}>
            {s.type === 'title' && <Text style={{ ...pdfStyles.title }}>{s.text}</Text>}
            {s.heading && <Text style={pdfStyles.heading}>{s.heading}</Text>}
            {s.paragraphs && s.paragraphs.map((p, i) => <Text key={i} style={pdfStyles.paragraph}>{p}</Text>)}
          </View>
        ))}
        <Text style={pdfStyles.footer}>Acta y estatutos generados — Ciudadan.org</Text>
      </Page>
    </Document>
  );
};

async function generatePdfBlob(data, filename = 'Acta_Estatutos.pdf') {
  const doc = <ActaPdf data={data} />;
  const asPdf = pdf([]);
  asPdf.updateContainer(doc);
  const blob = await asPdf.toBlob();
  return { blob, filename };
}

// Strapi helpers (opcional)
async function uploadFileToStrapi(strapiUrl, blob, filename, token = null) {
  const uploadUrl = `${strapiUrl.replace(/\/$/, '')}/api/upload`;
  const fd = new FormData();
  fd.append('files', blob, filename);
  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd
  });
  const json = await res.json().catch(() => null);
  let fileId = null;
  if (Array.isArray(json) && json.length) fileId = json[0].id || json[0].attributes?.id;
  else if (json?.data?.length) fileId = json.data[0].id || json.data[0].attributes?.id;
  else if (json && json.id) fileId = json.id;
  return { raw: json, fileId };
}

// Main component
export default function GeneradorActaYEstatutos() {
  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      razonSocial: '', tipoSociedad: 'Asociación Civil', objetoSocial: '', capitalSocial: '',
      calle: '', numext: '', numint: '', colonia: '', municipio: '', estado: '', cp: '', ciudadFirma: '',
      fechaConstitucion: '', notario: '', fechaNotario: '', quorum: '', organos: '',
      socios: [ { nombre: '', rfc: '', curp: '', direccion: '', aportacion: '', porcentaje: '' } ],
      estatutos: [ { titulo: 'Objeto Social', texto: '' } ],
      pasos: [ { step: 'Reunión de fundadores', detalle: 'Convocatoria y acuerdo para constituir la sociedad.' } ]
    }
  });

  const { fields: sociosFields, append: appendSocio, remove: removeSocio } = useFieldArray({ control, name: 'socios' });
  const { fields: estatutosFields, append: appendEstatuto, remove: removeEstatuto } = useFieldArray({ control, name: 'estatutos' });
  const { fields: pasosFields, append: appendPaso, remove: removePaso } = useFieldArray({ control, name: 'pasos' });

  const [formData, setFormData] = useState(null);
  const [previewReady, setPreviewReady] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loadingSave, setLoadingSave] = useState(false);

  const watchAll = watch();

  const onSubmitPreview = data => {
    setFormData(data);
    setPreviewReady(true);
    setAlert(null);
    const el = document.getElementById('acta-preview'); if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenPdf = async () => {
    try {
      setAlert({ type: 'info', msg: 'Generando PDF...' });
      const filename = `Acta_Estatutos_${(formData?.razonSocial || 'Sociedad').replace(/\s+/g, '_')}.pdf`;
      const { blob } = await generatePdfBlob(formData || watchAll, filename);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setAlert(null);
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', msg: 'Error generando PDF' });
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const data = formData || watchAll;
      const filename = `Acta_Estatutos_${(data?.razonSocial || 'Sociedad').replace(/\s+/g, '_')}.pdf`;
      const { blob } = await generatePdfBlob(data, filename);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    } catch (err) {
      console.error(err); setAlert({ type: 'error', msg: 'Error descargando PDF' });
    }
  };

  const handleSaveToStrapi = async () => {
    try {
      setLoadingSave(true);
      setAlert({ type: 'info', msg: 'Generando PDF y subiendo a Strapi...' });
      const data = formData || watchAll;
      const filename = `Acta_Estatutos_${(data?.razonSocial || 'Sociedad').replace(/\s+/g, '_')}.pdf`;
      const { blob } = await generatePdfBlob(data, filename);
      const STRAPI_URL = process.env.REACT_APP_STRAPI_URL; const STRAPI_TOKEN = process.env.REACT_APP_STRAPI_TOKEN || null;
      if (!STRAPI_URL) throw new Error('REACT_APP_STRAPI_URL no definido');
      const upload = await uploadFileToStrapi(STRAPI_URL, blob, filename, STRAPI_TOKEN);
      if (!upload.fileId) throw new Error('No se obtuvo fileId al subir. Ver consola.');
      // Opcional: actualizar usuario o colección — aquí dejamos la respuesta en alert
      setAlert({ type: 'success', msg: `Archivo subido a Strapi con id ${upload.fileId}` });
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', msg: String(err.message || err) });
    } finally { setLoadingSave(false); }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <Typography variant="h4" gutterBottom>Generador de Acta Constitutiva y Estatutos Internos</Typography>
        <Typography variant="body2" color="textSecondary">Rellena los datos obligatorios, agrega socios, cláusulas y pasos. Genera PDF listo para protocolo o revisión.</Typography>
      </motion.div>

      {alert && <Box my={2}><Alert severity={alert.type === 'error' ? 'error' : (alert.type === 'info' ? 'info' : 'success')}>{alert.msg}</Alert></Box>}

      <form onSubmit={handleSubmit(onSubmitPreview)}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }} elevation={3}>
              <Typography variant="h6" mb={2}>Datos generales</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Controller name="razonSocial" control={control} render={({ field }) => <TextField {...field} label="Razón social / Nombre" fullWidth required />} />
                </Grid>
                <Grid item xs={6}>
                  <Controller name="tipoSociedad" control={control} render={({ field }) => <TextField {...field} label="Tipo de sociedad" fullWidth helperText="Ej: Asociación Civil, S. de R.L., S.A.S." />} />
                </Grid>
                <Grid item xs={6}>
                  <Controller name="fechaConstitucion" control={control} render={({ field }) => <TextField {...field} label="Fecha de constitución" type="date" InputLabelProps={{ shrink: true }} fullWidth />} />
                </Grid>
                <Grid item xs={12}>
                  <Controller name="objetoSocial" control={control} render={({ field }) => <TextField {...field} label="Objeto social (descripción)" fullWidth multiline minRows={3} />} />
                </Grid>
                <Grid item xs={12}>
                  <Controller name="capitalSocial" control={control} render={({ field }) => <TextField {...field} label="Capital social / Aportaciones" fullWidth multiline minRows={2} helperText="Describa el capital y la forma de aportación (dinero, especie)" />} />
                </Grid>

                <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

                <Grid item xs={12}><Typography variant="subtitle1">Domicilio social</Typography></Grid>
                <Grid item xs={8}><Controller name="calle" control={control} render={({ field }) => <TextField {...field} label="Calle" fullWidth />} /></Grid>
                <Grid item xs={2}><Controller name="numext" control={control} render={({ field }) => <TextField {...field} label="No. ext" fullWidth />} /></Grid>
                <Grid item xs={2}><Controller name="numint" control={control} render={({ field }) => <TextField {...field} label="No. int" fullWidth />} /></Grid>
                <Grid item xs={6}><Controller name="colonia" control={control} render={({ field }) => <TextField {...field} label="Colonia" fullWidth />} /></Grid>
                <Grid item xs={6}><Controller name="municipio" control={control} render={({ field }) => <TextField {...field} label="Municipio/Alcaldía" fullWidth />} /></Grid>
                <Grid item xs={6}><Controller name="estado" control={control} render={({ field }) => <TextField {...field} label="Estado" fullWidth />} /></Grid>
                <Grid item xs={6}><Controller name="cp" control={control} render={({ field }) => <TextField {...field} label="C.P." fullWidth />} /></Grid>

                <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

                <Grid item xs={12}><Typography variant="subtitle1">Órganos y reglas</Typography></Grid>
                <Grid item xs={12}><Controller name="organos" control={control} render={({ field }) => <TextField {...field} label="Órganos de gobierno" fullWidth helperText="Ej: Asamblea General, Consejo Directivo, Comisario, Secretario" />} /></Grid>
                <Grid item xs={12}><Controller name="quorum" control={control} render={({ field }) => <TextField {...field} label="Quórum y reglas de votación" fullWidth helperText="Ej: mayoría simple, dos tercios, unanimidad" />} /></Grid>

                <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

                <Grid item xs={12}><Typography variant="subtitle1">Notario / Protocolización</Typography></Grid>
                <Grid item xs={6}><Controller name="notario" control={control} render={({ field }) => <TextField {...field} label="Notario público (si aplica)" fullWidth />} /></Grid>
                <Grid item xs={6}><Controller name="fechaNotario" control={control} render={({ field }) => <TextField {...field} label="Fecha de protocolización" type="date" InputLabelProps={{ shrink: true }} fullWidth />} /></Grid>

                <Grid item xs={12}>
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <Button type="submit" variant="contained" startIcon={<PictureAsPdf />}>Generar Previsualización</Button>
                    <Button type="button" variant="outlined" onClick={() => { reset(); setFormData(null); setPreviewReady(false); setAlert(null); }}>Limpiar formulario</Button>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 2, mt: 2 }} elevation={1}>
              <Typography variant="h6">Socios fundadores</Typography>
              {sociosFields.map((s, idx) => (
                <Box key={s.id} sx={{ border: '1px solid #eee', p: 1, my: 1, borderRadius: 1 }}>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={11}>
                      <Grid container spacing={1}>
                        <Grid item xs={12}><Controller name={`socios.${idx}.nombre`} control={control} render={({ field }) => <TextField {...field} label={`Nombre socio #${idx+1}`} fullWidth />} /></Grid>
                        <Grid item xs={6}><Controller name={`socios.${idx}.rfc`} control={control} render={({ field }) => <TextField {...field} label="RFC" fullWidth />} /></Grid>
                        <Grid item xs={6}><Controller name={`socios.${idx}.curp`} control={control} render={({ field }) => <TextField {...field} label="CURP" fullWidth />} /></Grid>
                        <Grid item xs={8}><Controller name={`socios.${idx}.direccion`} control={control} render={({ field }) => <TextField {...field} label="Domicilio" fullWidth />} /></Grid>
                        <Grid item xs={2}><Controller name={`socios.${idx}.aportacion`} control={control} render={({ field }) => <TextField {...field} label="Aportación" fullWidth />} /></Grid>
                        <Grid item xs={2}><Controller name={`socios.${idx}.porcentaje`} control={control} render={({ field }) => <TextField {...field} label="%" fullWidth />} /></Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={1}>
                      <IconButton size="small" onClick={() => removeSocio(idx)} disabled={sociosFields.length === 1}><Delete /></IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
              <Button startIcon={<Add />} onClick={() => appendSocio({ nombre: '', rfc: '', curp: '', direccion: '', aportacion: '', porcentaje: '' })}>Agregar socio</Button>
            </Paper>

          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }} elevation={3}>
              <Typography variant="h6">Estatutos internos (cláusulas)</Typography>

              {estatutosFields.map((e, idx) => (
                <Box key={e.id} sx={{ border: '1px solid #eee', p: 1, my: 1, borderRadius: 1 }}>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={11}>
                      <Controller name={`estatutos.${idx}.titulo`} control={control} render={({ field }) => <TextField {...field} label={`Título cláusula ${idx+1}`} fullWidth />} />
                      <Controller name={`estatutos.${idx}.texto`} control={control} render={({ field }) => <TextField {...field} label={`Texto de la cláusula ${idx+1}`} fullWidth multiline minRows={3} sx={{ mt: 1 }} />} />
                    </Grid>
                    <Grid item xs={1}><IconButton size="small" onClick={() => removeEstatuto(idx)} disabled={estatutosFields.length === 1}><Delete /></IconButton></Grid>
                  </Grid>
                </Box>
              ))}

              <Button startIcon={<Add />} onClick={() => appendEstatuto({ titulo: `Cláusula ${estatutosFields.length+1}`, texto: '' })}>Agregar cláusula</Button>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6">Pasos y flujo de constitución</Typography>

              {pasosFields.map((p, idx) => (
                <Box key={p.id} sx={{ border: '1px dashed #eee', p: 1, my: 1, borderRadius: 1 }}>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={11}>
                      <Controller name={`pasos.${idx}.step`} control={control} render={({ field }) => <TextField {...field} label={`Paso ${idx+1}`} fullWidth />} />
                      <Controller name={`pasos.${idx}.detalle`} control={control} render={({ field }) => <TextField {...field} label={`Detalle paso ${idx+1}`} fullWidth multiline minRows={2} sx={{ mt: 1 }} />} />
                    </Grid>
                    <Grid item xs={1}><IconButton size="small" onClick={() => removePaso(idx)} disabled={pasosFields.length === 1}><Delete /></IconButton></Grid>
                  </Grid>
                </Box>
              ))}

              <Button startIcon={<Add />} onClick={() => appendPaso({ step: `Paso ${pasosFields.length+1}`, detalle: '' })}>Agregar paso</Button>

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={handleOpenPdf} startIcon={<PictureAsPdf />} disabled={!previewReady}>Abrir PDF</Button>
                <Button variant="outlined" onClick={handleDownloadPdf} disabled={!previewReady}>Descargar PDF</Button>
                <Button variant="contained" color="success" startIcon={<Save />} onClick={handleSaveToStrapi} disabled={loadingSave}>{loadingSave ? 'Subiendo...' : 'Subir a Strapi (opcional)'}</Button>
              </Stack>

            </Paper>

            <Paper sx={{ p: 2, mt: 2 }} elevation={1} id="acta-preview">
              <Typography variant="h6">Previsualización Rápida</Typography>
              {!previewReady && <Typography variant="body2" color="textSecondary">Genera la previsualización pulsando el botón "Generar Previsualización".</Typography>}
              {previewReady && formData && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{formData.razonSocial}</Typography>
                  <Typography variant="body2">Tipo: {formData.tipoSociedad} · Fecha: {formatDate(formData.fechaConstitucion)}</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2">Objeto social</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{formData.objetoSocial}</Typography>

                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2">Socios</Typography>
                  {formData.socios?.map((s, i) => (
                    <Typography key={i} variant="body2">{i+1}. {s.nombre} — Aportación: {s.aportacion} ({s.porcentaje}%)</Typography>
                  ))}

                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2">Estatutos (resumen)</Typography>
                  {formData.estatutos?.map((e, i) => (
                    <Typography key={i} variant="body2">{i+1}. {e.titulo} — {e.texto.substring(0, 120)}{e.texto.length>120? '...':''}</Typography>
                  ))}

                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2">Pasos</Typography>
                  {formData.pasos?.map((p, i) => (
                    <Typography key={i} variant="body2">{i+1}. {p.step} — {p.detalle}</Typography>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}

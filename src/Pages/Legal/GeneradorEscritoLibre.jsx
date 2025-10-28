// src/components/GeneradorEscritoLibre.jsx
import React, { useState, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useForm, Controller } from 'react-hook-form';
import { pdf, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import {
  Container, Grid, Paper, Typography, Box, TextField, Button, Stack, Alert, Divider
} from '@mui/material';
import { motion } from 'framer-motion';

// Registrar fuente para PDF (opcional)
Font.register({ family: 'Times-Roman' });

// ---------- Estilos PDF ----------
const pdfStyles = StyleSheet.create({
  page: { fontFamily: 'Times-Roman', padding: 28, fontSize: 11, lineHeight: 1.45 },
  title: { fontSize: 12, textAlign: 'center', marginBottom: 8, fontWeight: 'bold' },
  heading: { fontSize: 11, marginTop: 8, marginBottom: 4, fontWeight: 'bold' },
  paragraph: { marginBottom: 6, textAlign: 'justify' },
  footer: { position: 'absolute', fontSize: 9, left: 28, right: 28, bottom: 20, textAlign: 'center' },
  destinatario: { marginBottom: 8, fontSize: 10 }
});

// ---------- Helpers ----------
const joinFullName = ({ nombres = '', apellidoP = '', apellidoM = '' }) => {
  const parts = [];
  if (nombres) parts.push(nombres.trim());
  if (apellidoP) parts.push(apellidoP.trim());
  if (apellidoM) parts.push(apellidoM.trim());
  return parts.join(' ') || '____________________';
};

const joinAddress = ({ calle = '', numext = '', numint = '', colonia = '', municipio = '', estado = '', cp = '' }) => {
  const parts = [];
  if (calle) parts.push(calle.trim());
  if (numext) parts.push(`No. ${numext.trim()}`);
  if (numint) parts.push(`Int. ${numint.trim()}`);
  if (colonia) parts.push(`Col. ${colonia.trim()}`);
  if (municipio) parts.push(municipio.trim());
  if (estado) parts.push(estado.trim());
  if (cp) parts.push(`C.P. ${cp.trim()}`);
  return parts.join(', ') || '____________________';
};

function isValidRFC(rfc) {
  if (!rfc) return true; // opcional
  const re = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i;
  return re.test(rfc.trim());
}
function isValidCURP(curp) {
  if (!curp) return true;
  const re = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/i;
  return re.test(curp.trim());
}

function formatDateTimeNow() {
  const d = new Date();
  return d.toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });
}

// ---------- Plantilla / Secciones (para preview + PDF) ----------
function buildSections(form) {
  const NOMBRE = joinFullName(form);
  const DIRECCION = joinAddress(form);
  const destinatarioNombre = form.destinatarioNombre?.trim() || 'Titular';
  const destinatarioCargo = form.destinatarioCargo?.trim() || 'Titular';
  const destinatarioDependencia = form.destinatarioDependencia?.trim() || 'Comisión Federal para la Protección contra Riesgos Sanitarios (COFEPRIS)';
  const asunto = form.asunto?.trim() || 'Asunto: Presentación de escrito libre para revisión administrativa';

  const t = {
    NOMBRE,
    DIRECCION,
    EMAIL: form.email || '____________________',
    TELEFONO: form.telefono || '____________________',
    RFC: form.rfc || '____________________',
    CURP: form.curp || '____________________',
    CIUDAD: form.ciudad || '____________________',
    FECHA_DOC: form.fechaDocumento || '____________________',
    DEST_NOMBRE: destinatarioNombre,
    DEST_CARGO: destinatarioCargo,
    DEST_DEP: destinatarioDependencia,
    ASUNTO: asunto,
  };

  return [
    { type: 'title', text: `ESCRITO LIBRE` },
    { type: 'destinatario', text: `${t.DEST_DEP}\n${t.DEST_CARGO} ${t.DEST_NOMBRE}\nPRESENTE` },
    { paragraphs: [
      `${t.CIUDAD}, a ${t.FECHA_DOC}`,
      ``,
      `${t.ASUNTO}`
    ] },

    { paragraphs: [
      `${t.NOMBRE}, por mi propio derecho, con domicilio para oír y recibir notificaciones en ${t.DIRECCION}, correo electrónico ${t.EMAIL} y teléfono ${t.TELEFONO}, por medio del presente escrito libre comparezco y expongo:`
    ] },

    { heading: 'I. ANTECEDENTES', paragraphs: [
      '1. En su momento presenté ante esa autoridad la solicitud o trámite correspondiente y obran en el expediente las constancias respectivas.',
      '2. Considero que existen elementos y/o circunstancias que ameritan la revisión o aclaración del expediente administrativo, a efecto de garantizar la legalidad y la debida protección de mis derechos.'
    ]},

    { heading: 'II. HECHOS', paragraphs: [
      '1. (Describir aquí los hechos relevantes, de forma concisa y ordenada).',
      '2. (Indicar fechas, documentos y actos administrativos que se estimen relevantes para la revisión).'
    ]},

    { heading: 'III. FUNDAMENTOS', paragraphs: [
      'Fundamento la presente en las disposiciones constitucionales y administrativas aplicables, en especial en el respeto a los derechos humanos, el principio de legalidad, el debido proceso y, en su caso, en la normativa sectorial aplicable al presente trámite ante COFEPRIS.'
    ] },

    { heading: 'IV. PETICIÓN', paragraphs: [
      'Por lo expuesto, y con fundamento en las disposiciones aplicables, respetuosamente solicito:',
      'PRIMERO. Se tenga por presentado el presente escrito libre y se agregue al expediente administrativo correspondiente.',
      'SEGUNDO. Se practique la revisión exhaustiva del expediente, con atención a los documentos y hechos aquí referidos.',
      'TERCERO. Se emita, en su caso, la resolución o providencia que proceda, garantizando el respeto a los preceptos legales y a mis derechos.',
      'CUARTO. Se me notifique la determinación adoptada al correo y domicilio señalados en este escrito.'
    ] },

    { heading: 'V. DOCUMENTACIÓN ANEXA', paragraphs: [
      '1. Copia simple de la solicitud/trámite original (si aplica).',
      '2. Identificación oficial.',
      '3. Documentos que acrediten los hechos referidos en el presente escrito.'
    ] },

    { paragraphs: [
      `Por lo anterior, solicito a esa autoridad se surta el trámite correspondiente y se me notifique conforme a derecho.\n\n____________________________________\n${t.NOMBRE}\nRFC: ${t.RFC} · CURP: ${t.CURP}\nDomicilio para oír y recibir notificaciones: ${t.DIRECCION}\nCorreo: ${t.EMAIL} · Teléfono: ${t.TELEFONO}`
    ] }
  ];
}

// ---------- Componente PDF ----------
const PdfDocument = ({ data }) => {
  const sections = useMemo(() => buildSections(data), [data]);
  const genDate = formatDateTimeNow();
  return (
    <Document>
      <Page size="LETTER" style={pdfStyles.page} wrap>
        {sections.map((s, idx) => (
          <View key={idx} style={{ marginBottom: 6 }}>
            {s.type === 'title' && <Text style={{ ...pdfStyles.title, marginBottom: 8 }}>{s.text}</Text>}
            {s.type === 'destinatario' && <Text style={pdfStyles.destinatario}>{s.text}</Text>}
            {s.heading && <Text style={pdfStyles.heading}>{s.heading}</Text>}
            {s.paragraphs && s.paragraphs.map((p, i) => <Text key={i} style={pdfStyles.paragraph}>{p}</Text>)}
          </View>
        ))}
        <Text style={pdfStyles.footer}>Documento generado automáticamente — {genDate}</Text>
      </Page>
    </Document>
  );
};

// ---------- Generar blob del PDF ----------
async function generatePdfBlob(data, filename = 'Escrito_Cofepris.pdf') {
  const doc = <PdfDocument data={data} />;
  const asPdf = pdf([]);
  asPdf.updateContainer(doc);
  const blob = await asPdf.toBlob();
  return { blob, filename };
}

// ---------- Funciones Strapi: buscar usuario por email, subir archivo, actualizar user ----------
async function findStrapiUserByEmail(strapiUrl, email, token = null) {
  console.log('[Strapi] Buscar usuario por email:', email);
  const base = strapiUrl.replace(/\/$/, '');
  const url = `${base}/api/users?filters[email][$eq]=${encodeURIComponent(email)}`;
  console.log('[Strapi] GET ->', url);
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  console.log('[Strapi] findUser response status:', res.status);
  const json = await res.json().catch(e => {
    console.error('[Strapi] findUser response no JSON', e);
    return null;
  });
  console.log('[Strapi] findUser raw response:', json);

  if (!json) return { found: false, raw: json };

  let arr = null;
  if (Array.isArray(json)) {
    arr = json;
  } else if (Array.isArray(json.data)) {
    arr = json.data;
  } else if (json.data && typeof json.data === 'object') {
    arr = [json.data];
  } else if (Array.isArray(json.result)) {
    arr = json.result;
  } else {
    const possibleArrays = Object.values(json).filter(v => Array.isArray(v) && v.length > 0);
    if (possibleArrays.length) {
      arr = possibleArrays[0];
    }
  }

  if (!arr || arr.length === 0) {
    console.warn('[Strapi] No users array found or empty. raw response:', json);
    return { found: false, raw: json };
  }

  const first = arr[0];
  let id = null;
  if (first != null) {
    id = first.id || (first.attributes && first.attributes.id) || first._id || first.ID || (first.data && first.data.id);
    if (!id) {
      const keys = Object.keys(first);
      for (const k of keys) {
        if (k.toLowerCase() === 'id' && first[k]) { id = first[k]; break; }
      }
    }
  }

  console.log('[Strapi] parsed first user object:', first, ' -> extracted id:', id);
  if (!id) {
    return { found: true, id: null, raw: json, first };
  }

  return { found: true, id, raw: json, first };
}

async function uploadFileToStrapi(strapiUrl, blob, filename, token = null) {
  console.log('[Strapi] Subiendo archivo:', filename, 'size', blob.size);
  const uploadUrl = `${strapiUrl.replace(/\/$/, '')}/api/upload`;
  const fd = new FormData();
  fd.append('files', blob, filename);
  console.log('[Strapi] POST ->', uploadUrl, 'FormData keys:', Array.from(fd.keys()));
  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd
  });
  console.log('[Strapi] upload response status:', res.status);
  const json = await res.json().catch(e => {
    console.error('[Strapi] upload response no JSON', e);
    return null;
  });
  console.log('[Strapi] upload response json:', json);
  let fileId = null;
  if (Array.isArray(json) && json.length) {
    fileId = json[0].id || json[0].id_strapi || json[0].attributes?.id;
  } else if (Array.isArray(json?.data) && json.data.length) {
    const f = json.data[0];
    fileId = f.id || f.attributes?.id;
  } else if (json && json[0] && json[0].id) {
    fileId = json[0].id;
  } else if (json && json.id) {
    fileId = json.id;
  }
  console.log('[Strapi] extracted fileId:', fileId);
  return { raw: json, fileId };
}

async function updateStrapiUserForCofepris(strapiUrl, userId, fileId, token = null) {
  console.log('[Strapi] Actualizando usuario', userId, 'con fileId (escrito COFEPRIS)', fileId);
  const url = `${strapiUrl.replace(/\/$/, '')}/api/users/${userId}`;
  const body = {
    escritolibrecofepris: fileId,
    esperandocofepris: true,
    statusamparo: 'escritogenerado'
  };
  console.log('[Strapi] PUT ->', url, 'body:', JSON.stringify(body));
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  console.log('[Strapi] update response status:', res.status);
  const json = await res.json().catch(e => {
    console.error('[Strapi] update response no JSON', e);
    return null;
  });
  console.log('[Strapi] update response json:', json);
  return json;
}

// ---------- Componente principal ----------
export default function GeneradorEscritoLibre() {
  const { user, isAuthenticated } = useAuth0();
  const defaultValues = {
    nombres: '',
    apellidoP: '',
    apellidoM: '',
    calle: '', numext: '', numint: '', colonia: '', municipio: '', estado: '', cp: '',
    ciudad: '', fechaDocumento: '',
    email: '', telefono: '', rfc: '', curp: '', strapiUserId: '',
    // campos nuevos para destinatario/profesionalizar encabezado
    destinatarioNombre: 'A quien corresponda',
    destinatarioCargo: '',
    destinatarioDependencia: 'Comisión Federal para la Protección contra Riesgos Sanitarios (COFEPRIS)',
    asunto: 'Presentación de escrito libre para su atención y revisión administrativa'
  };

  const { control, handleSubmit, reset, watch, setValue } = useForm({ defaultValues });
  const [formData, setFormData] = useState(defaultValues);
  const [previewReady, setPreviewReady] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loadingSave, setLoadingSave] = useState('nothing');

  React.useEffect(() => {
    if (isAuthenticated && user && user.email) {
      console.log('[Auth0] usuario autenticado:', user);
      setValue('email', user.email);
    }
  }, [isAuthenticated, user, setValue]);

  const sections = useMemo(() => buildSections(formData), [formData]);

  const onSubmitPreview = (values) => {
    console.log('[UI] onSubmitPreview values:', values);
    if (!isValidRFC(values.rfc)) {
      setAlert({ type: 'error', msg: 'Formato RFC inválido (verifica).' });
      return;
    }
    if (!isValidCURP(values.curp)) {
      setAlert({ type: 'error', msg: 'Formato CURP inválido (verifica).' });
      return;
    }

    setAlert(null);
    setFormData(values);
    setPreviewReady(true);

    console.log("Iniciando previsualización de escrito COFEPRIS (más profesional)");
    const el = document.getElementById('escrito-preview');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenPdf = async () => {
    try {
      setAlert({ type: 'info', msg: 'Generando PDF...' });
      const filename = `Escrito_Cofepris_${joinFullName(formData).replace(/\s+/g, '_')}.pdf`;
      const { blob } = await generatePdfBlob(formData, filename);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setAlert(null);
    } catch (err) {
      console.error('Error generando PDF', err);
      setAlert({ type: 'error', msg: 'Error generando PDF: ' + (err.message || err) });
    }
  };

  const handleSaveToStrapi = async () => {
    console.log("Iniciando envío escrito libre a Strapi (COFEPRIS)");
    try {
      setAlert({ type: 'info', msg: 'Generando PDF...' });
      setLoadingSave('saving');

      const STRAPI_URL = process.env.REACT_APP_STRAPI_URL;
      const STRAPI_TOKEN = process.env.REACT_APP_STRAPI_TOKEN || null;
      if (!STRAPI_URL) throw new Error('REACT_APP_STRAPI_URL no definido');

      const filename = `Escrito_Cofepris_${joinFullName(formData).replace(/\s+/g, '_')}.pdf`;
      const { blob } = await generatePdfBlob(formData, filename);
      console.log('[Save] PDF generado, size:', blob.size);

      const emailToUse = (isAuthenticated && user && user.email) ? user.email : (formData.email || '');
      console.log('[Save] Email usado para buscar usuario en Strapi:', emailToUse);

      let userId = formData.strapiUserId && formData.strapiUserId.trim() ? formData.strapiUserId.trim() : null;

      if (!userId) {
        if (!emailToUse) throw new Error('No se encontró email para buscar usuario en Strapi. Ingresa Strapi user ID o autentícate con Auth0.');
        const found = await findStrapiUserByEmail(STRAPI_URL, emailToUse, STRAPI_TOKEN);
        console.log('[Save] Resultado busqueda usuario:', found);
        if (!found.found) throw new Error('No se encontró usuario en Strapi con ese email.');
        if (!found.id) {
          console.warn('[Save] Usuario encontrado pero no se pudo extraer id automáticamente. Revisa `found.first` en consola para estructura. found:', found);
          throw new Error('Usuario encontrado pero no se pudo extraer su id. Revisa logs en consola (found.first).');
        }
        userId = found.id;
      }

      if (!userId) throw new Error('No se pudo obtener userId de Strapi.');

      setAlert({ type: 'info', msg: 'Subiendo PDF a Strapi...' });
      const uploadRes = await uploadFileToStrapi(STRAPI_URL, blob, filename, STRAPI_TOKEN);
      console.log('[Save] uploadRes:', uploadRes);
      if (!uploadRes.fileId) throw new Error('No se obtuvo fileId después de subir el archivo a Strapi. Verifica la respuesta en consola.');

      setAlert({ type: 'info', msg: 'Actualizando usuario en Strapi (marcando espera COFEPRIS)...' });
      const updated = await updateStrapiUserForCofepris(STRAPI_URL, userId, uploadRes.fileId, STRAPI_TOKEN);
      console.log('[Save] Usuario actualizado:', updated);

      setAlert({ type: 'success', msg: 'Escrito subido y usuario actualizado correctamente (esperando COFEPRIS).' });
    } catch (err) {
      console.error('[Save] Error completo:', err);
      setAlert({ type: 'error', msg: String(err.message || err) });
    } finally {
      setLoadingSave('ready');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <Typography variant="h4" gutterBottom>Generador de Escrito Libre — COFEPRIS (Profesional)</Typography>
        <Typography variant="body2" color="textSecondary">Encabezado personalizable: destinatario, cargo y dependencia para un aspecto profesional.</Typography>
      </motion.div>

      {alert && <Box my={2}><Alert severity={alert.type === 'error' ? 'error' : (alert.type === 'info' ? 'info' : 'success')}>{alert.msg}</Alert></Box>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }} elevation={3}>
            <Typography variant="h6" mb={2}>Formulario</Typography>

            <Box component="form" onSubmit={handleSubmit(onSubmitPreview)} noValidate>
              <Grid container spacing={2}>

                {/* DESTINATARIO */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Destinatario (encabezado profesional)</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Controller name="destinatarioDependencia" control={control}
                    render={({ field }) => <TextField {...field} label="Dependencia / Unidad" fullWidth helperText="Ej: Comisión Federal para la Protección contra Riesgos Sanitarios (COFEPRIS)" />} />
                </Grid>

                <Grid item xs={8}>
                  <Controller name="destinatarioCargo" control={control}
                    render={({ field }) => <TextField {...field} label="Cargo del destinatario" fullWidth helperText="Ej: Titular de la Unidad de Autorizaciones" />} />
                </Grid>
                <Grid item xs={4}>
                  <Controller name="destinatarioNombre" control={control}
                    render={({ field }) => <TextField {...field} label="Nombre del titular" fullWidth helperText="Si lo conoces, escribe el nombre; si no, usa 'A quien corresponda'." />} />
                </Grid>

                <Grid item xs={12}>
                  <Controller name="asunto" control={control}
                    render={({ field }) => <TextField {...field} label="Asunto" fullWidth helperText="Ej: Presentación de escrito libre para revisión administrativa" />} />
                </Grid>

                {/* DATOS PERSONALES */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Datos del solicitante</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Controller name="nombres" control={control}
                    rules={{ required: 'Nombres requerido' }}
                    render={({ field }) => <TextField {...field} label="Nombres(s)" fullWidth />} />
                </Grid>

                <Grid item xs={6}>
                  <Controller name="apellidoP" control={control}
                    rules={{ required: 'Apellido paterno requerido' }}
                    render={({ field }) => <TextField {...field} label="Apellido paterno" fullWidth />} />
                </Grid>

                <Grid item xs={6}>
                  <Controller name="apellidoM" control={control} render={({ field }) => <TextField {...field} label="Apellido materno" fullWidth />} />
                </Grid>

                {/* Dirección separada */}
                <Grid item xs={8}>
                  <Controller name="calle" control={control} render={({ field }) => <TextField {...field} label="Calle" fullWidth />} />
                </Grid>
                <Grid item xs={2}>
                  <Controller name="numext" control={control} render={({ field }) => <TextField {...field} label="No. ext" fullWidth />} />
                </Grid>
                <Grid item xs={2}>
                  <Controller name="numint" control={control} render={({ field }) => <TextField {...field} label="No. int" fullWidth />} />
                </Grid>

                <Grid item xs={6}>
                  <Controller name="colonia" control={control} render={({ field }) => <TextField {...field} label="Colonia" fullWidth />} />
                </Grid>
                <Grid item xs={6}>
                  <Controller name="municipio" control={control} render={({ field }) => <TextField {...field} label="Municipio/Alcaldía" fullWidth />} />
                </Grid>

                <Grid item xs={6}>
                  <Controller name="estado" control={control} render={({ field }) => <TextField {...field} label="Estado" fullWidth />} />
                </Grid>
                <Grid item xs={6}>
                  <Controller name="cp" control={control} render={({ field }) => <TextField {...field} label="C.P." fullWidth />} />
                </Grid>

                {/* Fecha del escrito */}
                <Grid item xs={6}>
                  <Controller name="ciudad" control={control} render={({ field }) => <TextField {...field} label="Ciudad (firma)" fullWidth />} />
                </Grid>
                <Grid item xs={6}>
                  <Controller name="fechaDocumento" control={control} render={({ field }) => <TextField {...field} label="Fecha del escrito" type="date" InputLabelProps={{ shrink: true }} fullWidth {...field} />} />
                </Grid>

                {/* Contacto y RFC/CURP */}
                <Grid item xs={12}>
                  <Controller name="email" control={control}
                    rules={{ required: 'Email requerido', pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' } }}
                    render={({ field }) => <TextField {...field} label="Correo electrónico" fullWidth />} />
                </Grid>

                <Grid item xs={6}>
                  <Controller name="telefono" control={control} render={({ field }) => <TextField {...field} label="Teléfono celular" fullWidth />} />
                </Grid>

                <Grid item xs={6}>
                  <Controller name="rfc" control={control} render={({ field }) => <TextField {...field} label="RFC" fullWidth helperText="Formato: 4 letras (persona moral) o 3 (física) + 6 dígitos + 3 homoclaves" />} />
                </Grid>

                <Grid item xs={12}>
                  <Controller name="curp" control={control} render={({ field }) => <TextField {...field} label="CURP" fullWidth helperText="Formato CURP (18 caracteres)" />} />
                </Grid>

                {/* Strapi ID opcional */}
                <Grid item xs={12}>
                  <Controller name="strapiUserId" control={control} render={({ field }) => <TextField {...field} label="Strapi user ID (opcional)" fullWidth helperText="Si ya tienes el ID puedes insertarlo; si no, se buscará por email." />} />
                </Grid>

                <Grid item xs={12}>
                  <Stack direction="row" spacing={2}>
                    <motion.div whileHover={{ y: -3 }}>
                      <Button type="submit" variant="contained" color="success">Generar Previsualización</Button>
                    </motion.div>
                    <Button onClick={() => { reset(defaultValues); setFormData(defaultValues); setPreviewReady(false); setAlert(null); }} variant="outlined">Limpiar</Button>
                    <Button onClick={() => { /* placeholder save draft */ }} variant="text">Guardar borrador</Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Preview / acciones */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }} elevation={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6">Previsualización</Typography>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={() => { setPreviewReady(false); setFormData(defaultValues); }}>Reset preview</Button>
                <Button variant="contained" onClick={handleOpenPdf} disabled={!previewReady}>Abrir PDF</Button>
              </Stack>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fafafa', maxHeight: 420, overflow: 'auto' }} id="escrito-preview">
              {sections.map((s, i) => (
                <Box key={i} sx={{ mb: 1 }}>
                  {s.type === 'title' && <Typography align="center" sx={{ fontWeight: 700, mb: 1 }}>{s.text}</Typography>}
                  {s.type === 'destinatario' && <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontStyle: 'italic', mb: 1 }}>{s.text}</Typography>}
                  {s.heading && <Typography sx={{ fontWeight: 700, mt: 1 }}>{s.heading}</Typography>}
                  {s.paragraphs && s.paragraphs.map((p, j) => <Typography key={j} variant="body2" sx={{ mt: 0.6, whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{p}</Typography>)}
                </Box>
              ))}
            </Paper>

            <Box mt={2} display="flex" gap={2}>
              <Button variant="contained" disabled={!previewReady} onClick={async () => {
                try {
                  const filename = `Escrito_Cofepris_${joinFullName(formData).replace(/\s+/g, '_')}.pdf`;
                  const { blob } = await generatePdfBlob(formData, filename);
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = filename;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                } catch (err) {
                  console.error('Error descarga directa:', err);
                  setAlert({ type: 'error', msg: 'Error descargando PDF: ' + (err.message || err) });
                }
              }}>Descargar PDF</Button>

              <Button variant="outlined" onClick={() => window.print()}>Imprimir vista</Button>

              <Button
                variant="contained"
                color={loadingSave === "ready" ? "success" : "secondary"}
                onClick={handleSaveToStrapi}
                disabled={!previewReady || loadingSave === "saving"}
              >
                {loadingSave === "saving"
                  ? "Guardando en tu cuenta..."
                  : loadingSave === "ready"
                  ? "Guardado ✅"
                  : "Guardar en tu cuenta"}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

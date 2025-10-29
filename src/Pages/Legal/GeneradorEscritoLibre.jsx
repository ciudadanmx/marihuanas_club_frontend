// src/components/GeneradorEscritoLibre.jsx
import React, { useState, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useForm, Controller } from 'react-hook-form';
import { pdf, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import {
  Container, Grid, Paper, Typography, Box, TextField, Button, Stack, Alert, Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

// Registrar fuente para PDF (opcional)
Font.register({ family: 'Times-Roman' });

// ---------- Estilos PDF ----------
const pdfStyles = StyleSheet.create({
  page: {
    fontFamily: 'Times-Roman',
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontSize: 11,
    lineHeight: 1.45,
  },
  title: { fontSize: 13, textAlign: 'center', marginBottom: 8, fontWeight: 'bold' },
  heading: { fontSize: 12, marginTop: 8, marginBottom: 4, fontWeight: 'bold' },
  paragraph: { marginBottom: 6, textAlign: 'justify', fontSize: 11 },
  bold: { fontWeight: 'bold' },
  footer: { position: 'absolute', fontSize: 9, left: 40, right: 40, bottom: 20, textAlign: 'center', color: '#666' },
  destinatario: { marginBottom: 8, fontSize: 10, whiteSpace: 'pre-wrap' },
  signatureBlock: { marginTop: 28, alignItems: 'center' },
  signatureLine: { width: '62%', borderTopWidth: 1, borderTopColor: '#000', marginTop: 20, marginBottom: 6 },
  signatureName: { fontWeight: 'bold', fontSize: 11 },
  signatureSmall: { fontSize: 10, color: '#333' }
});

// ---------- Helpers ----------
function formatFechaFormal(inputDate) {
  // inputDate puede ser: '' | undefined | '2025-09-25' | '2025-09-25T00:00:00' | Date
  const d = inputDate ? new Date(inputDate) : new Date();
  if (isNaN(d)) return String(inputDate || '').trim();

  const day = d.getDate(); // sin 0 delante
  const monthName = d.toLocaleString('es-MX', { month: 'long' }); // 'septiembre'
  const monthCap = monthName.charAt(0).toUpperCase() + monthName.slice(1); // 'Septiembre'
  const year = d.getFullYear();

  return `${day} de ${monthCap} del ${year}`;
}
// Helpers de normalización / capitalización
function capitalizePart(part) {
  // maneja null/empty, respeta acentos usando toLocaleUpperCase
  if (!part) return '';
  return part.charAt(0).toLocaleUpperCase('es-MX') + part.slice(1);
}

function titleCase(value) {
  if (typeof value !== 'string') return '';
  // normaliza espacios, pone en minúsculas primero
  return value
    .trim()
    .toLowerCase()
    .split(/\s+/) // separa por espacios
    .map(word =>
      // mantener y respetar separadores '-' y ' (guion y apóstrofe)
      word
        .split(/([-'])/) // conserva el separador en el array
        .map(part => (part === '-' || part === "'" ? part : capitalizePart(part)))
        .join('')
    )
    .join(' ');
}

// Normalizadores para RFC / CURP (mayúsculas)
const normalizeRFC = (rfc) => {
  if (!rfc && rfc !== '') return rfc;
  return String(rfc || '').trim().toUpperCase();
};
const normalizeCURP = (curp) => {
  if (!curp && curp !== '') return curp;
  return String(curp || '').trim().toUpperCase();
};

// Reemplazo de joinFullName usando titleCase
const joinFullName = ({ nombres = '', apellidoP = '', apellidoM = '' }) => {
  const parts = [];
  if (nombres) parts.push(titleCase(nombres));
  if (apellidoP) parts.push(titleCase(apellidoP));
  if (apellidoM) parts.push(titleCase(apellidoM));
  return parts.join(' ') || '____________________';
};

// Reemplazo de joinAddress aplicando titleCase a las piezas textuales
const joinAddress = ({ calle = '', numext = '', numint = '', colonia = '', municipio = '', estado = '', cp = '' }) => {
  const parts = [];
  if (calle) parts.push(titleCase(calle));
  if (numext) parts.push(`No. ${String(numext).trim()}`);
  if (numint) parts.push(`Int. ${String(numint).trim()}`);
  if (colonia) parts.push(`Col. ${titleCase(colonia)}`);
  if (municipio) parts.push(titleCase(municipio));
  if (estado) parts.push(titleCase(estado));
  if (cp) parts.push(`C.P. ${String(cp).trim()}`);
  return parts.join(', ') || '____________________';
};

// Validaciones actualizadas (RFC y CURP en mayúsculas)
function isValidRFC(rfc) {
  if (!rfc) return true; // opcional: cambiar a false si quieres requerir RFC
  const s = normalizeRFC(rfc);
  const re = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/; // ahora en mayúsculas
  return re.test(s);
}

function isValidCURP(curp) {
  if (!curp) return true;
  const s = normalizeCURP(curp);
  const re = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/; // mayúsculas
  return re.test(s);
}


function formatDateTimeNow() {
  const d = new Date();
  return d.toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City', day: '2-digit', month: 'long', year: 'numeric' });
}

// Helper para crear segmentos fáciles
const seg = (text, bold = false) => ({ text: String(text || ''), bold });

// ---------- Plantilla / Secciones (para preview + PDF) ----------
function buildSections(form) {
  const NOMBRE = joinFullName(form);
  const DIRECCION = joinAddress(form);
  const destinatarioNombre = form.destinatarioNombre?.trim() || 'Armida Zúñiga Estrada';
  const destinatarioCargo = form.destinatarioCargo?.trim() || 'Titular';
  const destinatarioDependencia = form.destinatarioDependencia?.trim() || 'Comisión Federal para la Protección contra Riesgos Sanitarios (COFEPRIS)';
  const asunto = form.asunto?.trim() || 'Presentación de escrito libre para su atención y revisión administrativa';

  const t = {
    NOMBRE,
    DIRECCION,
    EMAIL: form.email || '____________________',
    TELEFONO: form.telefono || '____________________',
    RFC: normalizeRFC(form.rfc) || '____________________',
    CURP: normalizeCURP(form.curp) || '____________________',
    CIUDAD: titleCase(form.ciudad) || '____________________',
    FECHA_DOC: formatFechaFormal(form.fechaDocumento) || formatFechaFormal(formatDateTimeNow()),
    DEST_NOMBRE: destinatarioNombre,
    DEST_CARGO: destinatarioCargo,
    DEST_DEP: destinatarioDependencia,
    ASUNTO: asunto,
  };

  return [
    // Fecha alineada a la derecha
    {
      paragraphs: [
        [ seg(`${t.CIUDAD}, a ${t.FECHA_DOC}`) ]
      ],
      align: 'right'
    },

    // Destinatario encabezado (limpio y profesional)
    {
      type: 'destinatario',
      textLines: [
        seg(t.DEST_NOMBRE, true),
        seg(t.DEST_CARGO + (t.DEST_DEP ? ` — ${t.DEST_DEP}` : '')),
        seg('PRESENTE', true)
      ]
    },

    // Asunto (destacado)
    {
      paragraphs: [
        [ seg(t.ASUNTO, true) ]
      ]
    },

    // Primer párrafo (datos del solicitante) con negritas en puntos clave
    {
      paragraphs: [
        [
          seg(t.NOMBRE, true),
          seg(', mexicano/a y mayor de edad, con CURP '),
          seg(t.CURP, true),
          seg(' y RFC '),
          seg(t.RFC, true),
          seg(', señalando como domicilio para oír y recibir notificaciones el ubicado en '),
          seg(t.DIRECCION, true),
          seg(', correo electrónico '),
          seg(t.EMAIL, true),
          seg(' y teléfono '),
          seg(t.TELEFONO, true),
          seg('. Con fundamento en el artículo 8 de la Constitución Política de los Estados Unidos Mexicanos, comparezco y expongo lo siguiente:')
        ],
        [ seg('') ],
        [
          seg('En el entendido de que la '),
          seg('Constitución Política de los Estados Unidos Mexicanos', true),
          seg(' me confiere los derechos de '),
          seg('libertad individual, autonomía, dignidad, salud y libre desarrollo de la personalidad', true),
          seg(', y de que, de acuerdo con el artículo 1 de la misma, todas las autoridades tienen la obligación de promover, respetar, proteger y garantizar los derechos humanos, solicito que esta '),
          seg('Comisión Federal para la Protección Contra Riesgos Sanitarios (COFEPRIS)', true),
          seg(' otorgue a mi favor una autorización para el consumo personal de '),
          seg('cannabis', true),
          seg(', identificado en la '),
          seg('Ley General de Salud', true),
          seg(' como '),
          seg('TETRAHIDROCANNABINOL', true),
          seg(', con los isómeros: '),
          seg('∆6a (10a), ∆6a (7), ∆7, ∆8, ∆9, ∆10, ∆9 (11) y sus variantes estereoquímicas.', true)
        ]
      ]
    },

    // Referencia jurisprudencial y Declaratoria General (introducción)
    {
      paragraphs: [
        [
          seg('La presente solicitud se realiza toda vez que la '),
          seg('Suprema Corte de Justicia de la Nación', true),
          seg(' determinó, mediante la '),
          seg('Declaratoria General de Inconstitucionalidad No. 1/2018', true),
          seg(', la eliminación de ciertos párrafos de la '),
          seg('Ley General de Salud', true),
          seg('. En virtud de lo anterior, y conforme a las jurisprudencias que dieron origen a la Declaratoria, se presentan las siguientes referencias:'),
        ]
      ]
    },

    // Listado de registros relevantes — números en negrita
    {
      paragraphs: [
        [ seg('1. '), seg('Registro No. 2 019 365', true), seg(' — INCONSTITUCIONALIDAD DE LA PROHIBICIÓN ABSOLUTA AL CONSUMO LÚDICO O RECREATIVO DE MARIHUANA PREVISTA POR LA LEY GENERAL DE SALUD.') ],
        [ seg('2. '), seg('Registro No. 2 019 511', true), seg(' — PROHIBICIÓN ABSOLUTA DEL CONSUMO LÚDICO DE MARIHUANA. NO ES UNA MEDIDA NECESARIA PARA PROTEGER LA SALUD Y EL ORDEN PÚBLICO.') ],
        [ seg('3. '), seg('Registro No. 2 019 356', true), seg(' — DERECHO AL LIBRE DESARROLLO DE LA PERSONALIDAD. LA PROHIBICIÓN PARA EL AUTOCONSUMO DE MARIHUANA INCIDE PRIMA FACIE EN DICHO DERECHO FUNDAMENTAL.') ],
        [ seg('4. '), seg('Registro No. 2 019 382', true), seg(' — PROHIBICIÓN ABSOLUTA DEL CONSUMO LÚDICO DE MARIHUANA. NO ES UNA MEDIDA PROPORCIONAL PARA PROTEGER LA SALUD Y EL ORDEN PÚBLICO.') ],
      ]
    },

    // Petición (énfasis en ÚNICO)
    {
      paragraphs: [
        [ seg('Por lo tanto, con base en lo anterior, se solicita respetuosamente:') ],
        [ seg('') ],
        [ seg('ÚNICO. ', true), seg('Que se tenga por presentado el presente escrito y se otorgue la citada autorización.') ]
      ]
    },

    // Firma: espacio para firma profesional (sin repetir datos redundantes)
    {
      signature: true,
      name: t.NOMBRE,
      rfc: t.RFC,
      curp: t.CURP
    }
  ];
}

// ---------- Componente PDF ----------
const PdfDocument = ({ data }) => {
  const sections = useMemo(() => buildSections(data), [data]);
  const genDate = formatDateTimeNow();
  return (
    <Document>
      <Page size="LETTER" style={pdfStyles.page} wrap>
        {sections.map((s, idx) => {
          // destinatario special render (array of lines)
          if (s.type === 'destinatario') {
            return (
              <View key={idx} style={{ marginBottom: 8 }}>
                <Text style={pdfStyles.destinatario}>
                  {s.textLines.map((ln, i) => (
                    <Text key={i} style={ln.bold ? pdfStyles.bold : {}}>
                      {ln.text}
                      {i < s.textLines.length - 1 ? '\n' : ''}
                    </Text>
                  ))}
                </Text>
              </View>
            );
          }

          // signature block
          if (s.signature) {
            return (
              <View key={idx} style={pdfStyles.signatureBlock}>
                <View style={pdfStyles.signatureLine} />
                <Text style={pdfStyles.signatureName}>{s.name || '____________________'}</Text><br /><br />
                {(s.rfc || s.curp) && (
                  <Text style={pdfStyles.signatureSmall}>
                    {s.rfc ? `RFC: ${s.rfc}` : ''}{s.rfc && s.curp ? ' · ' : ''}{s.curp ? `CURP: ${s.curp}` : ''}
                  </Text>
                )}
              </View>
            );
          }

          return (
            <View key={idx} style={{ marginBottom: 6 }}>
              {s.heading && <Text style={pdfStyles.heading}>{s.heading}</Text>}
              {s.paragraphs && s.paragraphs.map((p, i) => {
                // p is array of segments: [{text, bold}]
                if (Array.isArray(p)) {
                  const paragraphStyle = s.align === 'right'
                    ? { ...pdfStyles.paragraph, textAlign: 'right' }
                    : pdfStyles.paragraph;
                  return (
                    <Text key={i} style={paragraphStyle}>
                      {p.map((segm, k) => (
                        <Text key={k} style={segm.bold ? pdfStyles.bold : {}}>
                          {segm.text}
                        </Text>
                      ))}
                    </Text>
                  );
                }
                // fallback: string
                return <Text key={i} style={pdfStyles.paragraph}>{String(p)}</Text>;
              })}
            </View>
          );
        })}
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

// ---------- Funciones Strapi: (sin cambios) ----------
async function findStrapiUserByEmail(strapiUrl, email, token = null) {
  console.log('[Strapi] Buscar usuario por email:', email);
  const base = strapiUrl.replace(/\/$/, '');
  const url = `${base}/api/users?filters[email][$eq]=${encodeURIComponent(email)}`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  const json = await res.json().catch(e => { console.error('[Strapi] findUser response no JSON', e); return null; });
  if (!json) return { found: false, raw: json };

  let arr = null;
  if (Array.isArray(json)) arr = json;
  else if (Array.isArray(json.data)) arr = json.data;
  else if (json.data && typeof json.data === 'object') arr = [json.data];
  else {
    const possibleArrays = Object.values(json).filter(v => Array.isArray(v) && v.length > 0);
    if (possibleArrays.length) arr = possibleArrays[0];
  }

  if (!arr || arr.length === 0) return { found: false, raw: json };
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
  if (!id) return { found: true, id: null, raw: json, first };
  return { found: true, id, raw: json, first };
}

async function uploadFileToStrapi(strapiUrl, blob, filename, token = null) {
  console.log('[Strapi] Subiendo archivo:', filename, 'size', blob.size);
  const uploadUrl = `${strapiUrl.replace(/\/$/, '')}/api/upload`;
  const fd = new FormData();
  fd.append('files', blob, filename);
  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd
  });
  const json = await res.json().catch(e => { console.error('[Strapi] upload response no JSON', e); return null; });
  let fileId = null;
  if (Array.isArray(json) && json.length) fileId = json[0].id;
  else if (Array.isArray(json?.data) && json.data.length) fileId = json.data[0].id;
  else if (json && json.id) fileId = json.id;
  return { raw: json, fileId };
}

async function updateStrapiUserForCofepris(strapiUrl, userId, fileId, token = null) {
  const url = `${strapiUrl.replace(/\/$/, '')}/api/users/${userId}`;
  const body = {
    escritolibrecofepris: fileId,
    esperandocofepris: true,
    statusamparo: 'escritogenerado'
  };
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body)
  });
  const json = await res.json().catch(e => { console.error('[Strapi] update response no JSON', e); return null; });
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
    destinatarioNombre: 'Armida Zúñiga Estrada',
    destinatarioCargo: 'Titular',
    destinatarioDependencia: 'Comisión Federal para la Protección contra Riesgos Sanitarios (COFEPRIS)',
    asunto: 'Presentación de escrito libre para su atención y revisión administrativa'
  };

  const { control, handleSubmit, reset, setValue } = useForm({ defaultValues });
  const [formData, setFormData] = useState(defaultValues);
  const [previewReady, setPreviewReady] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loadingSave, setLoadingSave] = useState('nothing');

  React.useEffect(() => {
    if (isAuthenticated && user && user.email) {
      setValue('email', user.email);
    }
  }, [isAuthenticated, user, setValue]);

  const sections = useMemo(() => buildSections(formData), [formData]);

  const onSubmitPreview = (values) => {
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
    try {
      setAlert({ type: 'info', msg: 'Generando PDF...' });
      setLoadingSave('saving');

      const STRAPI_URL = process.env.REACT_APP_STRAPI_URL;
      const STRAPI_TOKEN = process.env.REACT_APP_STRAPI_TOKEN || null;
      if (!STRAPI_URL) throw new Error('REACT_APP_STRAPI_URL no definido');

      const filename = `Escrito_Cofepris_${joinFullName(formData).replace(/\s+/g, '_')}.pdf`;
      const { blob } = await generatePdfBlob(formData, filename);

      const emailToUse = (isAuthenticated && user && user.email) ? user.email : (formData.email || '');
      let userId = formData.strapiUserId && formData.strapiUserId.trim() ? formData.strapiUserId.trim() : null;

      if (!userId) {
        if (!emailToUse) throw new Error('No se encontró email para buscar usuario en Strapi. Ingresa Strapi user ID o autentícate con Auth0.');
        const found = await findStrapiUserByEmail(STRAPI_URL, emailToUse, STRAPI_TOKEN);
        if (!found.found) throw new Error('No se encontró usuario en Strapi con ese email.');
        if (!found.id) throw new Error('Usuario encontrado pero no se pudo extraer su id (ver consola).');
        userId = found.id;
      }

      const uploadRes = await uploadFileToStrapi(STRAPI_URL, blob, filename, STRAPI_TOKEN);
      if (!uploadRes.fileId) throw new Error('No se obtuvo fileId después de subir el archivo a Strapi.');

      await updateStrapiUserForCofepris(STRAPI_URL, userId, uploadRes.fileId, STRAPI_TOKEN);
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
        <Typography variant="h4" gutterBottom>Generador de Escrito Libre — COFEPRIS 📝✨</Typography>
      </motion.div>

      {alert && <Box my={2}><Alert severity={alert.type === 'error' ? 'error' : (alert.type === 'info' ? 'info' : 'success')}>{alert.msg}</Alert></Box>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }} elevation={3}>
            {/* He eliminado el título "Formulario" como pediste */}
            <Box component="form" onSubmit={handleSubmit(onSubmitPreview)} noValidate>
              <Grid container spacing={2}>
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

                <Grid item xs={6}>
                  <Controller name="ciudad" control={control} render={({ field }) => <TextField {...field} label="Ciudad (firma)" fullWidth />} />
                </Grid>
                <Grid item xs={6}>
                  <Controller name="fechaDocumento" control={control} render={({ field }) => <TextField {...field} label="Fecha del escrito" type="date" InputLabelProps={{ shrink: true }} fullWidth {...field} />} />
                </Grid>

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

                <Grid item xs={12}>
                  <Stack direction="row" spacing={2}>
                    <motion.div whileHover={{ y: -3 }}>
                      <Button type="submit" variant="contained" color="success">👁️‍🗨️ Generar Previsualización</Button>
                    </motion.div>
                    <Button onClick={() => { reset(defaultValues); setFormData(defaultValues); setPreviewReady(false); setAlert(null); }} variant="outlined">❌ Limpiar</Button>
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
                <Button variant="outlined" onClick={() => { setPreviewReady(false); setFormData(defaultValues); }}>❌ Limpiar Previsualización</Button>
                
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: '#4CAF50', // verde base
                        color: 'white',
                        fontWeight: 'bold',
                        '&:hover': {
                        backgroundColor: '#388E3C', // más oscuro al pasar el mouse
                        boxShadow: '0 0 10px #66bb6a',
                        },
                        boxShadow: '0 0 5px #81c784',
                    }}
                    onClick={handleOpenPdf}
                    disabled={!previewReady}
                    >
                    🔎 Abrir PDF
                </Button>
              </Stack>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fafafa', maxHeight: 460, overflow: 'auto' }} id="escrito-preview">
              {sections.map((s, i) => (
                <Box key={i} sx={{ mb: 1 }}>
                  {/* destinatario special */}
                  {s.type === 'destinatario' && (
                    <Box sx={{ whiteSpace: 'pre-wrap', fontStyle: 'normal', mb: 1 }}>
                      {s.textLines.map((ln, idxLn) => (
                        <Typography key={idxLn} variant="body2" sx={{ fontWeight: ln.bold ? 700 : 400 }}>
                          {ln.text}
                        </Typography>
                      ))}
                    </Box>
                  )}

                  {/* asunto/heading (if any) */}
                  {s.heading && <Typography sx={{ fontWeight: 700, mt: 1 }}>{s.heading}</Typography>}

                  {s.paragraphs && s.paragraphs.map((p, j) => {
                    // p is array of segments
                    if (Array.isArray(p)) {
                      return (
                        <Typography
                          key={j}
                          variant="body2"
                          sx={{
                            mt: 0.6,
                            whiteSpace: 'pre-wrap',
                            textAlign: s.align === 'right' ? 'right' : 'justify'
                          }}
                        >
                          {p.map((sg, k) => (
                            <Box component="span" key={k} sx={{ fontWeight: sg.bold ? 700 : 400 }}>
                              {sg.text}
                            </Box>
                          ))}
                        </Typography>
                      );
                    }
                    return (
                      <Typography
                        key={j}
                        variant="body2"
                        sx={{
                          mt: 0.6,
                          whiteSpace: 'pre-wrap',
                          textAlign: s.align === 'right' ? 'right' : 'justify'
                        }}
                      >
                        {p}
                      </Typography>
                    );
                  })}

                  {/* signature preview */}
                  {s.signature && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 3 }}>
                      <Box sx={{ width: '62%', borderTop: '1px solid #111', height: 1 }} />
                      <Typography sx={{ fontWeight: 700, mt: 1 }}>{s.name || '____________________'}</Typography>
                      {(s.rfc || s.curp) && (
                        <Typography sx={{ fontSize: 12, color: '#444' }}>
                          {s.rfc ? `RFC: ${s.rfc}` : ''}{s.rfc && s.curp ? ' · ' : ''}{s.curp ? `CURP: ${s.curp}` : ''}
                        </Typography>
                      )}
                    </Box>
                  )}
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
              }}>🔽 Descargar PDF</Button>

              <Button variant="outlined" onClick={() => window.print()}>🖨️ Imprimir vista</Button>

              <Button
                variant="contained"
                color={loadingSave === "ready" ? "success" : "secondary"}
                onClick={handleSaveToStrapi}
                disabled={!previewReady || loadingSave === "saving"}
              >
                {loadingSave === "saving"
                  ? "💾 Guardando en tu cuenta..."
                  : loadingSave === "ready"
                  ? "Guardado ✅"
                  : "💾 Guardar en tu cuenta"}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

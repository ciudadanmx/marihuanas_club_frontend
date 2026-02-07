import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Autocomplete,
  Chip,
  Button,
  FormLabel,
  Grid,
  Switch,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion } from 'framer-motion';
import { useRoles } from '../../../Contexts/RolesContext';

/**
 * ChecarPlanta
 * Props: { user }
 * - permite seleccionar entre 3 vistas: Diario / Semanal / Especial
 * - etiqueta plantas del usuario (multi-select)
 * - guarda un registro en registrosbitacoras con:
 *    - media (imagenes)
 *    - observaciones
 *    - timestamp
 *    - tipo: diario|semanal|especial
 *    - texto: (resumen/JSON)
 *    - metadatos: objeto JSON con todos los campos útiles
 * - si el usuario marca que una o varias plantas se "desechan" se actualizan las plantas usando helper (status, viva=false, curado=false, secado=false, gramos_* = 0)
 * - Busca plantas del usuario en Strapi y las muestra para etiquetar
 *
 * Nota: si tu Strapi NO tiene el campo "metadatos" en registrosbitacoras, el componente igualmente
 * enviará el objeto bajo la propiedad "metadatos" y también serializará en "texto" como respaldo.
 */

const STRAPI = process.env.REACT_APP_STRAPI_URL;
const STRAPI_TOKEN = process.env.REACT_APP_STRAPI_TOKEN || null;

async function uploadFiles(list) {
  if (!list || list.length === 0) return [];
  const form = new FormData();
  list.forEach((i) => form.append('files', i.file));
  const headers = {};
  if (STRAPI_TOKEN) headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
  const res = await fetch(`${STRAPI}/api/upload`, { method: 'POST', headers, body: form });
  if (!res.ok) throw new Error('Error subiendo archivos');
  const json = await res.json();
  // Strapi devuelve array de objetos o data
  const ids = Array.isArray(json) ? json.map((u) => u.id) : (json?.data || []).map((u) => u.id);
  return ids;
}

async function marcarDesechadas(plantaIds) {
  if (!plantaIds || plantaIds.length === 0) return;
  const headers = { 'Content-Type': 'application/json' };
  if (STRAPI_TOKEN) headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;

  // Para cada planta hacemos update (podrías optimizar con batch si Strapi lo soporta)
  await Promise.all(
    plantaIds.map(async (pid) => {
      const payload = {
        data: {
          status: 'desechada',
          viva: false,
          curado: false,
          secado: false,
          gramos_cosechados: 0,
          gramos_curados: 0,
          gramos_en_existencia: 0,
        },
      };
      try {
        await fetch(`${STRAPI}/api/plantas/${pid}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.warn('No se pudo marcar desechada planta', pid, err);
      }
    })
  );
}

export default function ChecarPlanta({ user }) {
  const { userData, isJardinero } = useRoles();

  const [loading, setLoading] = useState(true);
  const [plantsOptions, setPlantsOptions] = useState([]);
  const [selectedPlants, setSelectedPlants] = useState([]);

  const [view, setView] = useState('diario'); // diario | semanal | especial

  // common
  const [mediaFiles, setMediaFiles] = useState([]);
  const [observaciones, setObservaciones] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Diario specifics
  const [etapa, setEtapa] = useState('vegetativo');
  const [diaCultivo, setDiaCultivo] = useState(null);
  const [fotoCompleta, setFotoCompleta] = useState(null);
  const [fotoHojaBaja, setFotoHojaBaja] = useState(null);
  const [fotoHojaSuperior, setFotoHojaSuperior] = useState(null);
  const [fotoHojaAfectada, setFotoHojaAfectada] = useState(null);
  const [colorGeneral, setColorGeneral] = useState('verde_sano');
  const [turgencia, setTurgencia] = useState('normal');
  const [temperatura, setTemperatura] = useState('');
  const [humedad, setHumedad] = useState('');
  const [condensacion, setCondensacion] = useState('no');
  const [movimientoHojas, setMovimientoHojas] = useState('ligero');
  const [olorAcumulado, setOlorAcumulado] = useState('no');
  const [riegoHoy, setRiegoHoy] = useState(false);
  const [cantidadRiego, setCantidadRiego] = useState('');
  const [tipoAgua, setTipoAgua] = useState('osmosis');
  const [observacionesRapidas, setObservacionesRapidas] = useState('');
  const [resultadoIA, setResultadoIA] = useState({estado: 'estable', recomendacion: 'mantener'});
  const [marcarDesechar, setMarcarDesechar] = useState(false);

  // Semanal specifics
  const [altura, setAltura] = useState('');
  const [ancho, setAncho] = useState('');
  const [distanciaInternodal, setDistanciaInternodal] = useState('');
  const [tempPromedioDia, setTempPromedioDia] = useState('');
  const [tempPromedioNoche, setTempPromedioNoche] = useState('');
  const [humPromedio, setHumPromedio] = useState('');
  const [hojasHumedas, setHojasHumedas] = useState('nunca');
  const [aireEstancado, setAireEstancado] = useState('no');
  const [tiempoDrenaje, setTiempoDrenaje] = useState('');
  const [porcentajeDrenaje, setPorcentajeDrenaje] = useState('');
  const [olorSustrato, setOlorSustrato] = useState('neutro');
  const [phRiego, setPhRiego] = useState('');
  const [ecRiego, setEcRiego] = useState('');
  const [phDrenaje, setPhDrenaje] = useState('');
  const [ecDrenaje, setEcDrenaje] = useState('');
  const [fertilizantes, setFertilizantes] = useState('');
  const [dosisReal, setDosisReal] = useState('');
  const [frecuenciaSemanal, setFrecuenciaSemanal] = useState('');
  const [tipoLuz, setTipoLuz] = useState('LED');
  const [horasLuz, setHorasLuz] = useState('');
  const [distanciaLuz, setDistanciaLuz] = useState('');

  // Especial specifics
  const [tipoEvento, setTipoEvento] = useState('problema_visual');
  const [fotoMacro, setFotoMacro] = useState(null);
  const [sintomas, setSintomas] = useState([]);
  const [contextoReciente, setContextoReciente] = useState('');
  const [drenajeRaices, setDrenajeRaices] = useState('');
  const [diagnosticoIA, setDiagnosticoIA] = useState('');
  const [nivelCerteza, setNivelCerteza] = useState('medio');

  useEffect(() => {
    let mounted = true;
    async function fetchPlants() {
      try {
        if (!STRAPI) throw new Error('REACT_APP_STRAPI_URL no configurada');
        if (!userData) return;
        const headers = {};
        if (STRAPI_TOKEN) headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
        // traer plantas del usuario
        const uId = userData.id;
        const res = await fetch(`${STRAPI}/api/plantas?filters[usuario][id][$eq]=${uId}&populate=galeria,club`, { headers });
        const json = await res.json();
        const items = (json.data || []).map((p) => ({ id: p.id, ...p.attributes }));
        if (!mounted) return;
        setPlantsOptions(items);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchPlants();
    return () => (mounted = false);
  }, [userData]);

  function handleMediaChange(e) {
    const chosen = Array.from(e.target.files || []);
    const next = chosen.map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    setMediaFiles((prev) => [...prev, ...next]);
  }
  function removeMedia(index) {
    setMediaFiles((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      return copy;
    });
  }

  function handleSpecificPhotoSetter(setter) {
    return (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      setter({ file: f, preview: URL.createObjectURL(f) });
    };
  }

  function buildMetadatos() {
    const base = {
      vista: view,
      usuario: { id: userData?.id, email: userData?.email || user?.email },
      timestamp: new Date().toISOString(),
    };

    if (view === 'diario') {
      return {
        ...base,
        etiqueta_plantas: selectedPlants.map((p) => ({ id: p.id, nombre: p.nombre || p.name || null })),
        identificacion: { etapa, diaCultivo },
        fotos_detalle: {
          foto_completa: fotoCompleta ? fotoCompleta.file?.name || null : null,
          foto_hoja_baja: fotoHojaBaja ? fotoHojaBaja.file?.name || null : null,
          foto_hoja_superior: fotoHojaSuperior ? fotoHojaSuperior.file?.name || null : null,
          foto_hoja_afectada: fotoHojaAfectada ? fotoHojaAfectada.file?.name || null : null,
        },
        estado_visual: { colorGeneral, turgencia },
        ambiente: { temperatura, humedad, condensacion },
        ventilacion: { movimientoHojas, olorAcumulado },
        riego: { regadoHoy: riegoHoy, cantidad: cantidadRiego, tipoAgua },
        observaciones_rapidas: observacionesRapidas,
        resultadoIA,
        marcarDesechar,
      };
    }

    if (view === 'semanal') {
      return {
        ...base,
        etiqueta_plantas: selectedPlants.map((p) => ({ id: p.id, nombre: p.nombre || p.name || null })),
        fotos_comparativas: 'subidas en media',
        crecimiento: { altura, ancho, distanciaInternodal },
        ambiente_semanal: { tempPromedioDia, tempPromedioNoche, humPromedio },
        ventilacion_ext: { hojasHumedas, aireEstancado },
        sustrato_drenaje: { tiempoDrenaje, porcentajeDrenaje, olorSustrato },
        agua_quimica: { phRiego, ecRiego, phDrenaje, ecDrenaje },
        nutricion: { fertilizantes, dosisReal, frecuenciaSemanal },
        luz: { tipoLuz, horasLuz, distanciaLuz },
      };
    }

    // especial
    return {
      ...base,
      etiqueta_plantas: selectedPlants.map((p) => ({ id: p.id, nombre: p.nombre || p.name || null })),
      tipoEvento,
      fotos_dirigidas: { fotoMacro: fotoMacro ? fotoMacro.file?.name : null },
      sintomas,
      contextoReciente,
      drenajeRaices,
      diagnosticoIA: { diagnosticoIA, nivelCerteza },
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!isJardinero || typeof isJardinero === 'function' ? !isJardinero() : false) {
        throw new Error('No tienes permiso (debes ser jardinero)');
      }

      if (!selectedPlants || selectedPlants.length === 0) {
        throw new Error('Debes etiquetar al menos 1 planta de tu lista');
      }

      // subir media general + fotos específicas
      const allFiles = [...mediaFiles];
      [fotoCompleta, fotoHojaBaja, fotoHojaSuperior, fotoHojaAfectada, fotoMacro].forEach((f) => {
        if (f && f.file) allFiles.push(f);
      });

      const uploadIds = await uploadFiles(allFiles);

      const metadatos = buildMetadatos();

      // si marcó desechadas (en diario) -> actualizar plantas
      const plantasIds = selectedPlants.map((p) => p.id);

      // crear registro
      const payload = {
        data: {
          usuario_email: userData?.email || user?.email,
          club: extractClubIdFromSelected(selectedPlants[0]) || null,
          timestamp: new Date().toISOString(),
          observaciones: observaciones || '',
          media: uploadIds,
          status: 'merma'
        }
      };

      // Prepare payload more fully
      const tipo = view;
      payload.data.tipo = tipo;
      payload.data.registrojardinero = true;
      payload.data.plantas = plantasIds;
      // Add metadatos both as object (if Strapi supports) and textual backup
      payload.data.metadatos = metadatos;
      payload.data.texto = JSON.stringify(metadatos, null, 2);

      // if diario and marcarDesechar true -> update plants
      if (view === 'diario' && marcardeselectionFlag(selectedPlants, metadatos)) {
        await marcarDesechadas(plantasIds);
      }

      const headers = { 'Content-Type': 'application/json' };
      if (STRAPI_TOKEN) headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;

      const createRes = await fetch(`${STRAPI}/api/registrosbitacoras`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!createRes.ok) {
        const txt = await createRes.text();
        throw new Error('Error creando registro: ' + txt);
      }

      // reset
      setObservaciones('');
      setMediaFiles([]);
      setFotoCompleta(null);
      setFotoHojaBaja(null);
      setFotoHojaSuperior(null);
      setFotoHojaAfectada(null);
      setFotoMacro(null);
      setSelectedPlants([]);

      alert('Registro guardado correctamente 🌱');
    } catch (err) {
      console.error(err);
      setError(err.message || String(err));
    } finally {
      setSubmitting(false);
    }
  }

  function extractClubIdFromSelected(p) {
    return p?.club?.data?.id ?? null;
  }

  function marcardeselectionFlag(selected, metadatos) {
    // decide si hay que marcar desechadas: si metadatos.vista==='diario' y metadatos.marcarDesechar===true
    if (!selected || selected.length === 0) return false;
    if (metadatos?.vista === 'diario' && metadatos?.marcarDesechar) return true;
    return false;
  }

  // helpers for media inputs
  function specificInput(label, setter) {
    return (
      <Box>
        <Button component="label" startIcon={<AddPhotoAlternateIcon />} sx={{ bgcolor: '#6a00ff', color: '#fff' }}>
          {label}
          <input hidden accept="image/*" type="file" onChange={handleSpecificPhotoSetter(setter)} />
        </Button>
        {setter && (
          <Button onClick={() => setter(null)} sx={{ ml: 1 }} startIcon={<DeleteIcon />}>Quitar</Button>
        )}
      </Box>
    );
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Box sx={{ maxWidth: 920, mx: 'auto', p: 3, boxShadow: 4, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Checar Planta — Asesor de Cultivo</Typography>

        <FormLabel component="legend">Tipo de registro</FormLabel>
        <RadioGroup row value={view} onChange={(e) => setView(e.target.value)} sx={{ mb: 2 }}>
          <FormControlLabel value="diario" control={<Radio />} label="Registro Diario" />
          <FormControlLabel value="semanal" control={<Radio />} label="Registro Semanal Completo" />
          <FormControlLabel value="especial" control={<Radio />} label="Registro Especial" />
        </RadioGroup>

        <Autocomplete
          multiple
          options={plantsOptions}
          getOptionLabel={(o) => o.nombre || o.name || String(o.id)}
          value={selectedPlants}
          onChange={(e, v) => setSelectedPlants(v)}
          renderTags={(value, getTagProps) => value.map((option, index) => (
            <Chip label={option.nombre || option.name || option.id} {...getTagProps({ index })} />
          ))}
          renderInput={(params) => <TextField {...params} label="Etiquetar plantas (tu lista)" placeholder="Selecciona plantas..." />}
          sx={{ mb: 2 }}
        />

        {/* Vistas condicionales */}
        {view === 'diario' && (
          <Box>
            <Typography variant="subtitle1">Chequeo Diario</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Etapa (sugerida)" value={etapa} onChange={(e) => setEtapa(e.target.value)} sx={{ mb: 1 }} />
                <TextField fullWidth label="Día de cultivo (opcional)" value={diaCultivo || ''} onChange={(e) => setDiaCultivo(e.target.value)} sx={{ mb: 1 }} />

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                  {specificInput('Foto planta completa', setFotoCompleta)}
                  {specificInput('Foto hoja baja', setFotoHojaBaja)}
                  {specificInput('Foto hoja superior', setFotoHojaSuperior)}
                  {specificInput('Foto hoja afectada (opcional)', setFotoHojaAfectada)}
                </Box>

                <TextField fullWidth label="Observaciones rápidas" value={observacionesRapidas} onChange={(e) => setObservacionesRapidas(e.target.value)} sx={{ mb: 1 }} />

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Marcar como desechar</Typography>
                  <Switch checked={marcarDesechar} onChange={(e) => setMarcarDesechar(e.target.checked)} />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Color general" value={colorGeneral} onChange={(e) => setColorGeneral(e.target.value)} sx={{ mb: 1 }} />
                <TextField fullWidth label="Turgencia" value={turgencia} onChange={(e) => setTurgencia(e.target.value)} sx={{ mb: 1 }} />
                <TextField fullWidth label="Temperatura (°C)" value={temperatura} onChange={(e) => setTemperatura(e.target.value)} sx={{ mb: 1 }} />
                <TextField fullWidth label="Humedad relativa (%)" value={humedad} onChange={(e) => setHumedad(e.target.value)} sx={{ mb: 1 }} />
                <TextField fullWidth label="Condensación nocturna (no/ligera/cierta)" value={condensacion} onChange={(e) => setCondensacion(e.target.value)} sx={{ mb: 1 }} />
                <TextField fullWidth label="Movimiento de hojas" value={movimientoHojas} onChange={(e) => setMovimientoHojas(e.target.value)} sx={{ mb: 1 }} />
                <TextField fullWidth label="Olor acumulado" value={olorAcumulado} onChange={(e) => setOlorAcumulado(e.target.value)} sx={{ mb: 1 }} />

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Typography variant="body2">¿Se regó hoy?</Typography>
                  <Switch checked={riegoHoy} onChange={(e) => setRiegoHoy(e.target.checked)} />
                </Box>
                {riegoHoy && (
                  <>
                    <TextField fullWidth label="Cantidad (ml o L)" value={cantidadRiego} onChange={(e) => setCantidadRiego(e.target.value)} sx={{ mb: 1 }} />
                    <TextField fullWidth label="Tipo de agua" value={tipoAgua} onChange={(e) => setTipoAgua(e.target.value)} sx={{ mb: 1 }} />
                  </>
                )}

                <TextField fullWidth label="Resultado IA (estado)" value={resultadoIA.estado} onChange={(e) => setResultadoIA((s) => ({ ...s, estado: e.target.value }))} sx={{ mb: 1 }} />
                <TextField fullWidth label="Resultado IA (recomendación)" value={resultadoIA.recomendacion} onChange={(e) => setResultadoIA((s) => ({ ...s, recomendacion: e.target.value }))} sx={{ mb: 1 }} />
              </Grid>
            </Grid>
          </Box>
        )}

        {view === 'semanal' && (
          <Box>
            <Typography variant="subtitle1">Chequeo Semanal Completo</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Altura (cm)" value={altura} onChange={(e) => setAltura(e.target.value)} sx={{ mb: 1 }} />
                <TextField fullWidth label="Ancho (cm)" value={ancho} onChange={(e) => setAncho(e.target.value)} sx={{ mb: 1 }} />
                <TextField fullWidth label="Distancia internodal (cm)" value={distanciaInternodal} onChange={(e) => setDistanciaInternodal(e.target.value)} sx={{ mb: 1 }} />

                <TextField fullWidth label="Tiempo de drenaje" value={tiempoDrenaje} onChange={(e) => setTiempoDrenaje(e.target.value)} sx={{ mb: 1 }} />
                <TextField fullWidth label="Porcentaje drenaje" value={porcentajeDrenaje} onChange={(e) => setPorcentajeDrenaje(e.target.value)} sx={{ mb: 1 }} />
                <TextField fullWidth label="Olor del sustrato" value={olorSustrato} onChange={(e) => setOlorSustrato(e.target.value)} sx={{ mb: 1 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Temp promedio día" value={tempPromedioDia} onChange={(e) => setTempPromedioDia(e.target.value)} sx={{ mb: 1 }} />
                <TextField fullWidth label="Temp promedio noche" value={tempPromedioNoche} onChange={(e) => setTempPromedioNoche(e.target.value)} sx={{ mb: 1 }} />
                <TextField fullWidth label="Humedad promedio" value={humPromedio} onChange={(e) => setHumPromedio(e.target.value)} sx={{ mb: 1 }} />

                <TextField fullWidth label="pH riego" value={phRiego} onChange={(e) => setPhRiego(e.target.value)} sx={{ mb: 1 }} />
                <TextField fullWidth label="EC riego" value={ecRiego} onChange={(e) => setEcRiego(e.target.value)} sx={{ mb: 1 }} />
                <TextField fullWidth label="Fertilizantes usados" value={fertilizantes} onChange={(e) => setFertilizantes(e.target.value)} sx={{ mb: 1 }} />
                <TextField fullWidth label="Dosis real aplicada" value={dosisReal} onChange={(e) => setDosisReal(e.target.value)} sx={{ mb: 1 }} />
              </Grid>
            </Grid>
          </Box>
        )}

        {view === 'especial' && (
          <Box>
            <Typography variant="subtitle1">Chequeo Especial</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Tipo de evento" value={tipoEvento} onChange={(e) => setTipoEvento(e.target.value)} sx={{ mb: 1 }} />
                <Button component="label" startIcon={<AddPhotoAlternateIcon />} sx={{ bgcolor: '#6a00ff', color: '#fff' }}>
                  Foto macro
                  <input hidden accept="image/*" type="file" onChange={handleSpecificPhotoSetter(setFotoMacro)} />
                </Button>
                <TextField fullWidth label="Contexto reciente" value={contextoReciente} onChange={(e) => setContextoReciente(e.target.value)} sx={{ mb: 1 }} />
                <TextField fullWidth label="Drenaje y raíces" value={drenajeRaices} onChange={(e) => setDrenajeRaices(e.target.value)} sx={{ mb: 1 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Síntomas (comma-separated)" value={sintomas.join(', ')} onChange={(e) => setSintomas(e.target.value.split(',').map(s => s.trim()))} sx={{ mb: 1 }} />
                <TextField fullWidth label="Diagnóstico IA" value={diagnosticoIA} onChange={(e) => setDiagnosticoIA(e.target.value)} sx={{ mb: 1 }} />
                <TextField fullWidth label="Nivel de certeza" value={nivelCerteza} onChange={(e) => setNivelCerteza(e.target.value)} sx={{ mb: 1 }} />
              </Grid>
            </Grid>
          </Box>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">Media adicional</Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button component="label" startIcon={<AddPhotoAlternateIcon />} sx={{ bgcolor: '#6a00ff', color: '#fff' }}>
              Agregar fotos
              <input hidden accept="image/*" type="file" multiple onChange={handleMediaChange} />
            </Button>

            {mediaFiles.map((m, idx) => (
              <Chip key={idx} label={m.file.name} onDelete={() => removeMedia(idx)} />
            ))}
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <TextField fullWidth multiline minRows={3} label="Observaciones generales" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
        </Box>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSubmit} disabled={submitting} sx={{ bgcolor: '#00ff6a', color: '#003300' }}>{submitting ? 'Guardando…' : 'Guardar registro'}</Button>
        </Box>
      </Box>
    </motion.div>
  );
}

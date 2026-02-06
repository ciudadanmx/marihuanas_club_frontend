// components/Clubs/ClubActions.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Avatar,
  Chip,
  Button,
  Divider,
  TextField,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { CloudUpload, Refresh, Clear } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useRoles } from "../../Contexts/RolesContext.jsx";
import { useNavigate } from "react-router-dom";
import { generarCodigoPlanta } from '../../utils/CodigosPlantas.js';

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL || "";
const MotionPaper = motion(Paper);

const DIAS_SEMANA = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const COLORS = ["rojo", "amarillo", "verde", "azul", "rosa", "plata"];
const DEFAULT_NUM_PLANTAS_FALLBACK = 6;

/* Helpers */
const renderHorarios = (horarios) => {
  const horariosNormalizados =
    horarios && Object.keys(horarios).length > 0
      ? horarios
      : DIAS_SEMANA.reduce((acc, dia) => {
          acc[dia] = {
            abierto: false,
            apertura: "-",
            cierre: "-",
          };
          return acc;
        }, {});
  return Object.entries(horariosNormalizados).map(([dia, horas]) => {
    const abierto = horas?.abierto === true;
    const apertura = abierto ? horas?.apertura || "-" : "-";
    const cierre = abierto ? horas?.cierre || "-" : "-";
    return (
      <Typography key={dia} variant="body2" sx={{ ml: 1 }}>
        <strong>{dia}:</strong> {abierto ? "Abierto" : "Cerrado"} ({apertura} - {cierre})
      </Typography>
    );
  });
};

const formatForCodigo = (isoDate) => {
  if (!isoDate) return "noFecha";
  const d = new Date(isoDate);
  const YYYY = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, "0");
  const DD = String(d.getDate()).padStart(2, "0");
  const HH = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${YYYY}-${MM}-${DD}-${HH}-${mm}`;
};

const safeEmailForCode = (email) =>
  String(email || "anon").replace("@", "-").replace(/\s+/g, "").toLowerCase();

const getStrapiFileId = (fileObj) => {
  if (!fileObj) return null;
  return fileObj.id || (fileObj.data && fileObj.data.id) || null;
};

export default function ClubActions({ accion = "ingresarsemillas", params = "", user = null }) {
  const { userData, fetchRolesYMembresia } = useRoles();
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  // club state
  const [club, setClub] = useState(null);
  const [clubLoading, setClubLoading] = useState(false);
  const [clubError, setClubError] = useState(null);

  // form state
  const [fechaSolicitada, setFechaSolicitada] = useState("");
  const [numSemillas, setNumSemillas] = useState(1);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [acepto, setAcepto] = useState(false);
  const [sending, setSending] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  // plant checks
  const [existingPlantCount, setExistingPlantCount] = useState(null); // cuántas plantas tiene ya
  const allowedPlants = Number(userData?.plantas ?? null); // cupo que tiene derecho el usuario (int)
  const remainingPlants = useMemo(() => {
    if (allowedPlants == null || existingPlantCount == null) return null;
    return Math.max(0, allowedPlants - existingPlantCount);
  }, [allowedPlants, existingPlantCount]);

  // solicitud abierta?
  const [hasOpenSolicitud, setHasOpenSolicitud] = useState(false);

  const fetchingClubRef = useRef(false);

  // raw club from userData (normalize common shapes)
  const rawClub = useMemo(() => userData?.club ?? null, [userData]);

  // fetch club by id (populate deep)
  const fetchClubById = async (id) => {
    if (!id) return null;
    try {
      fetchingClubRef.current = true;
      setClubLoading(true);
      setClubError(null);
      const res = await fetch(`${STRAPI_URL}/api/clubs/${id}?populate=deep`, { credentials: "include" });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status} ${txt}`);
      }
      const json = await res.json();
      const entry = json?.data || json;
      if (!entry) throw new Error("Club no encontrado en respuesta.");
      const normalized = entry?.attributes ? { id: entry.id || entry?.data?.id, ...entry.attributes } : entry;
      return normalized;
    } catch (err) {
      console.error("fetchClubById error:", err);
      setClubError(String(err.message || err));
      return null;
    } finally {
      fetchingClubRef.current = false;
      setClubLoading(false);
    }
  };

  // normalize / obtain club from userData
  useEffect(() => {
    let mounted = true;
    (async () => {
      setClubError(null);
      if (!userData) {
        if (mounted) setClub(null);
        return;
      }
      if (!rawClub) {
        if (mounted) setClub(null);
        return;
      }

      // array shape
      if (Array.isArray(rawClub)) {
        const first = rawClub[0];
        if (first && (first.attributes || first.id)) {
          const normalized = first.attributes ? { id: first.id, ...first.attributes } : first;
          if (mounted) setClub(normalized);
          return;
        }
      }

      // data shape (populated or not)
      if (rawClub?.data) {
        const dat = rawClub.data;
        if (dat?.attributes) {
          const normalized = { id: dat.id, ...dat.attributes };
          if (mounted) setClub(normalized);
          return;
        } else if (dat?.id) {
          const fetched = await fetchClubById(dat.id);
          if (mounted) setClub(fetched);
          return;
        }
      }

      // top-level attributes
      if (rawClub?.id && (rawClub?.nombre_club || rawClub?.attributes)) {
        const normalized = rawClub.attributes ? { id: rawClub.id, ...rawClub.attributes } : rawClub;
        if (mounted) setClub(normalized);
        return;
      }

      // id string/number
      if (typeof rawClub === "string" || typeof rawClub === "number") {
        const fetched = await fetchClubById(rawClub);
        if (mounted) setClub(fetched);
        return;
      }

      if (mounted) setClub(rawClub);
    })();
    return () => { mounted = false; };
  }, [rawClub]);

  // previews
  useEffect(() => {
    if (!files || files.length === 0) { setPreviews([]); return; }
    const urls = [];
    let mounted = true;
    let completed = 0;
    files.forEach((f, idx) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        completed++;
        urls[idx] = e.target.result;
        if (mounted && completed === files.length) setPreviews(urls);
      };
      reader.readAsDataURL(f);
    });
    return () => { mounted = false; };
  }, [files]);

  // helper: ensure usuario id from Strapi
  const ensureUsuarioId = async () => {
    const email = (user && user.email) || userData?.email;
    let usuarioId = userData?.id || null;
    if (!usuarioId && email) {
      try {
        const res = await fetch(`${STRAPI_URL}/api/users?filters[email][$eq]=${encodeURIComponent(email)}`, { credentials: "include" });
        if (!res.ok) return usuarioId;
        const json = await res.json();
        const found = (json?.data || [])[0];
        usuarioId = found?.id || usuarioId;
      } catch (err) {
        console.warn("ensureUsuarioId error", err);
      }
    }
    return usuarioId;
  };

  // helper: upload files to Strapi
  const uploadFilesToStrapi = async (filesArr) => {
    if (!filesArr || filesArr.length === 0) return [];
    const fd = new FormData();
    filesArr.forEach((f) => fd.append("files", f));
    const res = await fetch(`${STRAPI_URL}/api/upload`, { method: "POST", credentials: "include", body: fd });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Fallo upload: ${res.status} ${txt}`);
    }
    const json = await res.json();
    if (Array.isArray(json)) return json;
    if (json?.data) return json.data;
    return json;
  };

  // fetch how many plantas the user already has (by usuario_email)
  const fetchExistingPlantCount = async (email) => {
    if (!email) return 0;
    try {
      const res = await fetch(`${STRAPI_URL}/api/plantas?filters[usuario_email][$eq]=${encodeURIComponent(email)}&pagination[pageSize]=1`, { credentials: "include" });
      if (!res.ok) return 0;
      const json = await res.json();
      const total = json?.meta?.pagination?.total ?? (Array.isArray(json?.data) ? json.data.length : 0);
      return Number(total || 0);
    } catch (err) {
      console.warn("fetchExistingPlantCount error", err);
      return 0;
    }
  };

  // fetch if there is an open solicitudplantas (status = solicitada) for this user (by email)
  const fetchHasOpenSolicitud = async (email) => {
    if (!email) return false;
    try {
      const res = await fetch(`${STRAPI_URL}/api/solicitudplantas?filters[usuario_email][$eq]=${encodeURIComponent(email)}&filters[status][$eq]=solicitada&pagination[pageSize]=1`, { credentials: "include" });
      if (!res.ok) return false;
      const json = await res.json();
      const total = json?.meta?.pagination?.total ?? (Array.isArray(json?.data) ? json.data.length : 0);
      return (Number(total || 0) > 0);
    } catch (err) {
      console.warn("fetchHasOpenSolicitud error", err);
      return false;
    }
  };

  // when userData changes, fetch counts if needed
  useEffect(() => {
    let mounted = true;
    (async () => {
      setExistingPlantCount(null);
      setHasOpenSolicitud(false);
      setError(null);
      if (!userData) return;
      const email = (user && user.email) || userData?.email;
      if (!email) return;
      // fetch plant count only for ingresarsemillas
      if (accion === "ingresarsemillas") {
        const count = await fetchExistingPlantCount(email);
        if (mounted) setExistingPlantCount(count);
      }
      // fetch open solicitud only for flores actions
      if (accion === "solicitarflores" || accion === "retirarflores") {
        const has = await fetchHasOpenSolicitud(email);
        if (mounted) setHasOpenSolicitud(has);
      }
    })();
    return () => { mounted = false; };
  }, [userData, accion, user]);

  // handlers
  const onFilesChange = (e) => {
    setMensaje(null); setError(null);
    const chosen = Array.from(e.target.files || []);
    setFiles(chosen);
  };

  const clearForm = () => {
    setFiles([]); setPreviews([]); setAcepto(false); setNumSemillas(1); setFechaSolicitada(""); setMensaje(null); setError(null);
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setMensaje(null); setError(null);

    if (!club) { setError("No se encontró el club asociado al usuario."); return; }
    if (!acepto) { setError("Debes aceptar la declaración antes de continuar."); return; }
    if (!fechaSolicitada) { setError("Selecciona la fecha y hora propuestas."); return; }

    // block if user already exhausted their cupo
    if (accion === "ingresarsemillas" && remainingPlants !== null && remainingPlants <= 0) {
      setError(`Tu solicitud de ingreso de semillas ya ha sido realizada. Solo se pueden ingresar semillas para hasta ${allowedPlants} plantas.`);
      return;
    }

    setSending(true);
    try {
      // upload files only when ingresarsemillas (per tu requisito)
      let uploaded = [];
      if (accion === "ingresarsemillas" && files.length > 0) {
        uploaded = await uploadFilesToStrapi(files);
      }
      const uploadedIds = (Array.isArray(uploaded) ? uploaded : [uploaded]).map(getStrapiFileId).filter(Boolean);

      const usuarioId = await ensureUsuarioId();
      const nowISO = new Date().toISOString();
      const requestedISO = new Date(fechaSolicitada).toISOString();

      if (accion === "ingresarsemillas") {
        // create up to requested number of seeds but not exceeding remainingPlants (or fallback)
        const requestedCount = Number(numSemillas) || 1;
        const maxAllowed = (remainingPlants == null) ? DEFAULT_NUM_PLANTAS_FALLBACK : remainingPlants;
        const createCount = Math.max(0, Math.min(requestedCount, maxAllowed));
        if (createCount <= 0) {
          setError(`Tu solicitud de ingreso de semillas ya ha sido realizada. Solo se permiten hasta ${allowedPlants} plantas.`);
          setSending(false);
          return;
        }

        const fechaBase = userData?.fechaingresoplantas || requestedISO || nowISO;
        const fechaObj = new Date(fechaBase);
        const emailStr = (user && user.email) || userData?.email || "";

        // fetch existing plant codes (hasta 100) para alimentar el helper y mantener secuencia
        let plantasExistentes = [];
        try {
          const resp = await fetch(`${STRAPI_URL}/api/plantas?filters[usuario_email][$eq]=${encodeURIComponent(emailStr)}&pagination[pageSize]=100&fields[0]=codigo`, { credentials: "include" });
          if (resp.ok) {
            const json = await resp.json();
            const items = json?.data || [];
            plantasExistentes = items.map((it) => ({ codigo: it?.attributes?.codigo || null })).filter(p => p.codigo);
          }
        } catch (err) {
          console.warn('No pude obtener plantas existentes para secuencia, continuaré igualmente', err);
          plantasExistentes = [];
        }

        const created = [];
        // baseIndex: punto de partida 0-based. Preferimos existingPlantCount si ya lo tenemos.
        const baseIndex = (typeof existingPlantCount === 'number' && !Number.isNaN(existingPlantCount))
          ? existingPlantCount
          : (plantasExistentes ? plantasExistentes.length : 0);

        for (let i = 0; i < createCount; i++) {
          const idxGlobal = baseIndex + i;
          const gen = generarCodigoPlanta({
            email: emailStr,
            fecha: fechaObj,
            indexGlobal: idxGlobal,
          });
          const codigo = gen.codigo;
          const color = gen.color;

          const payload = {
            data: {
              usuario: usuarioId,
              usuario_email: (user && user.email) || userData?.email || "",
              club: club.id || club._id || null,
              color,
              viva: false,
              semilla: true,
              codigo,
              origen: "semilla",
              fechasolicitada: nowISO,
              galeria: uploadedIds,
              numero_semillas_reportadas: numSemillas,
            },
          };

          const res = await fetch(`${STRAPI_URL}/api/plantas`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const txt = await res.text();
            throw new Error(`Fallo creando planta ${i + 1}: ${res.status} ${txt}`);
          }
          const json = await res.json();
          created.push(json);

          // empujamos localmente el codigo creado para que la siguiente iteración vea la nueva planta
          plantasExistentes.push({ codigo });
        }
        setMensaje(`Solicitud enviada: ${created.length} plantas creadas. El club confirmará la hora.`);
        clearForm();
        // update local count
        setExistingPlantCount((prev) => (prev == null ? created.length : prev + created.length));
      } else if (accion === "solicitarflores" || accion === "retirarflores") {
        // prevent duplicate solicitud
        if (hasOpenSolicitud) {
          setError("Ya cuentas con una solicitud para ingresar flores.");
          setSending(false);
          return;
        }

        const payload = {
          data: {
            usuario: usuarioId,
            usuario_email: (user && user.email) || userData?.email || "",
            club: club.id || club._id || null,
            timestamp: nowISO,
            fechasolicitada: requestedISO,
            numero_semillas_reportadas: numSemillas,
            // NO incluimos galeria para flores (requisito)
            status: "solicitada",
          },
        };

        const res = await fetch(`${STRAPI_URL}/api/solicitudplantas`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Fallo creando solicitud: ${res.status} ${txt}`);
        }

        setMensaje("Solicitud de flores enviada. El club se pondrá en contacto para confirmar.");
        clearForm();
        setHasOpenSolicitud(true);
      } else {
        setError(`Acción desconocida: ${accion}`);
      }
    } catch (err) {
      console.error("handleSubmit error:", err);
      setError(err.message || "Error inesperado al procesar la solicitud.");
    } finally {
      setSending(false);
    }
  };

  // UI states
  if (clubLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Paper sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <CircularProgress />
            <Typography>Cargando información del club...</Typography>
          </Stack>
        </Paper>
      </Box>
    );
  }

  if (!club) {
    return (
      <Box sx={{ p: 2 }}>
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Acciones del Club</Typography>
            <Alert severity="warning">
              No se encontró el club asociado al usuario. Asegúrate que RolesContext esté poblando <code>club</code>.
            </Alert>
            {clubError && <Alert severity="error">Error al obtener club: {clubError}</Alert>}
            <Stack direction={isSm ? "column" : "row"} spacing={1}>
              <Button startIcon={<Refresh />} onClick={async () => { setClubError(null); setClubLoading(true); try { await fetchRolesYMembresia(true); setTimeout(() => setClubLoading(false), 700); } catch (err) { setClubError(String(err.message || err)); setClubLoading(false); } }}>Reintentar (refrescar roles)</Button>
              <Button color="inherit" startIcon={<Clear />} onClick={() => { setClub(null); setClubError(null); }}>Limpiar estado</Button>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Si después de reintentar sigue sin aparecer, revisa en Strapi que el usuario tenga la relación <code>club</code> poblada o que incluyas <code>populate=club</code> en RolesContext.
            </Typography>
          </Stack>
        </Paper>
      </Box>
    );
  }

  // block when user already used their cupo for seeds
  if (accion === "ingresarsemillas" && remainingPlants !== null && remainingPlants <= 0) {
    return (
      <Box sx={{ p: { xs: 1, sm: 2 } }}>
        <MotionPaper initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Ingreso de semillas</Typography>
            <Alert severity="info">Tu solicitud de ingreso de semillas ya ha sido realizada — solo se pueden ingresar semillas para hasta {allowedPlants} plantas.</Alert>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={() => navigate(-1)}>Volver</Button>
            </Stack>
          </Stack>
        </MotionPaper>
      </Box>
    );
  }

  // block when there's already a solicitud for flowers
  if ((accion === "solicitarflores" || accion === "retirarflores") && hasOpenSolicitud) {
    return (
      <Box sx={{ p: { xs: 1, sm: 2 } }}>
        <MotionPaper initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Solicitud de flores</Typography>
            <Alert severity="info">Ya cuentas con una solicitud para ingresar flores.</Alert>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={() => navigate(-1)}>Volver</Button>
            </Stack>
          </Stack>
        </MotionPaper>
      </Box>
    );
  }

  // normal render
  const tieneHorarios = club.horarios && Object.keys(club.horarios).length > 0;
  const reservacion = Boolean(club.reservacion);

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <MotionPaper initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36 }} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
        <Stack spacing={2}>
          <Stack direction={isSm ? "column" : "row"} spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src={club?.foto_de_perfil?.data?.attributes?.url || club?.foto_de_perfil?.url || ""} variant="rounded" sx={{ width: 80, height: 80 }} />
              <Box>
                <Typography variant="h6" fontWeight={800}>{club?.nombre_club || club?.nombre || "Club"}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                  <Chip label={`ID ${club.id || club._id || "-"}`} size="small" />
                  <Chip label={reservacion ? "Reservación requerida" : "No requiere reservación"} size="small" />
                </Stack>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button variant="outlined" size="small" href={`${STRAPI_URL}/clubs/${club?.slug || ""}`} target="_blank">Ver público</Button>
            </Stack>
          </Stack>

          <Divider />

          <Box>
            <Typography variant="subtitle2" fontWeight={700}>Horarios</Typography>
            {tieneHorarios ? <Box sx={{ mt: 1 }}>{renderHorarios(club.horarios)}</Box> : <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No tienen un horario especificado.</Typography>}
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField label="Fecha y hora propuesta" type="datetime-local" value={fechaSolicitada} onChange={(e) => setFechaSolicitada(e.target.value)} InputLabelProps={{ shrink: true }} required fullWidth />
                <TextField label="Número de semillas" type="number" value={numSemillas} onChange={(e) => setNumSemillas(Number(e.target.value))} inputProps={{ min: 1 }} required sx={{ width: { xs: "100%", md: 200 } }} />
              </Stack>

              {/* uploader ONLY for ingresarsemillas */}
              {accion === "ingresarsemillas" && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>Fotos (opcional)</Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <Button variant="contained" component="label" startIcon={<CloudUpload />}>
                      Subir fotos
                      <input hidden multiple accept="image/*" type="file" onChange={onFilesChange} />
                    </Button>
                    <Stack direction="row" spacing={1}>
                      {previews.map((src, i) => <Avatar key={i} src={src} variant="rounded" sx={{ width: 64, height: 64, borderRadius: 1 }} />)}
                    </Stack>
                  </Stack>
                </Box>
              )}

              <Paper variant="outlined" sx={{ p: 2, bgcolor: "background.paper" }}>
                <Typography variant="subtitle2" fontWeight={800}>Advertencia / Declaración</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Al solicitar el ingreso de semillas declaras que las semillas son de uso personal. Confirmas que las semillas provienen
                  de tu reserva personal (ej. hasta 5 gramos de uso inmediato). Al asistir firmarás un acta que manifiesta el origen y dejarás
                  las semillas al cuidado del jardinero, rentándole el espacio. Se separarán 1–4 semillas por planta; una vez germinadas se conservarán 6.
                </Typography>
              </Paper>

              <FormControlLabel control={<Checkbox checked={acepto} onChange={(e) => setAcepto(e.target.checked)} />} label="He leído y acepto la declaración y procedimiento." />

              {error && <Alert severity="error">{error}</Alert>}
              {mensaje && <Alert severity="success">{mensaje}</Alert>}

              <Stack direction="row" spacing={1}>
                <Button type="submit" variant="contained" disabled={sending}>{sending ? <CircularProgress size={20} color="inherit" /> : (accion === "ingresarsemillas" ? "Ingresar semillas" : "Solicitar/Retirar flores")}</Button>
                <Button variant="outlined" onClick={clearForm} disabled={sending} startIcon={<Clear />}>Limpiar</Button>
                <Button startIcon={<Refresh />} onClick={async () => { setClubError(null); setClubLoading(true); try { await fetchRolesYMembresia(true); setTimeout(() => setClubLoading(false), 700); } catch (err) { setClubError(String(err.message || err)); setClubLoading(false); } }}>Reintentar datos</Button>
                <Button color="inherit" onClick={() => navigate(-1)}>Volver</Button>
              </Stack>

              {/* info auxiliar */}
              {accion === "ingresarsemillas" && allowedPlants != null && existingPlantCount != null && (
                <Typography variant="caption" color="text.secondary">
                  Plantas permitidas: {allowedPlants} — Plantas registradas: {existingPlantCount} — Cupo restante: {remainingPlants}
                </Typography>
              )}
            </Stack>
          </Box>
        </Stack>
      </MotionPaper>
    </Box>
  );
}

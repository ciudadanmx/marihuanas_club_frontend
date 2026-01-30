// src/components/Clubs/RevisarClubs.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Avatar,
  Chip,
  Link as MuiLink,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tooltip,
  Snackbar,
  Alert,
  Input,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Place as PlaceIcon,
  WhatsApp as WhatsAppIcon,
  PhotoLibrary as PhotoLibraryIcon,
  Language as LanguageIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  HighlightOff as HighlightOffIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
  Edit as EditIcon,
  Publish as PublishIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  AssignmentInd as AssignmentIndIcon,
  Gavel as GavelIcon,
  History as HistoryIcon,
  Sms as SmsIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
} from "@mui/icons-material";

/**
 * RevisarClubs (ADMIN)
 * - Prop: clubSlug (slug en la colección 'clubs')
 * - Dependencia: process.env.REACT_APP_STRAPI_URL
 * - Para acciones admin: setea process.env.REACT_APP_STRAPI_TOKEN con un token de Strapi con permisos admin/editor
 *
 * NOTAS:
 * - Ignora y no muestra: archivos_legal, estatutos, acta, documentos, direccion_legal, telefono_legal
 * - No muestra lat/lng en texto; solo usa para el mapa iframe y link a Google Maps
 */

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL || "";
const ADMIN_TOKEN = process.env.REACT_APP_STRAPI_TOKEN || ""; // opcional: para calls admin (PUT/POST/DELETE)

const safeUrl = (u) => {
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `${STRAPI_URL}${u}`;
};

const extractMediaUrls = (field) => {
  if (!field) return [];
  const data = field.data ?? field;
  if (!data) return [];
  if (Array.isArray(data)) {
    return data
      .map((d) => d?.attributes?.url ?? d?.url)
      .filter(Boolean)
      .map(safeUrl);
  } else {
    const url = data?.attributes?.url ?? data?.url;
    return url ? [safeUrl(url)] : [];
  }
};

const isImage = (u = "") => /\.(jpe?g|png|webp|avif|gif|svg)(\?.*)?$/i.test(u || "");
const isVideo = (u = "") => /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(u || "");

const splitDireccion = (d) => {
  if (!d) return null;
  if (typeof d === "object") return d;
  const raw = String(d);
  try {
    const maybeJson = JSON.parse(raw);
    if (typeof maybeJson === "object") return maybeJson;
  } catch {}
  const parts = raw
    .replace(/\s+/g, " ")
    .split(/[,·•\.]+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const [calleOrPrimera, segunda, ciudad = "", estado = "", pais = ""] = parts;
  return {
    calle: calleOrPrimera || null,
    zona: segunda || null,
    ciudad: ciudad || null,
    estado: estado || null,
    pais: pais || null,
    raw: raw,
  };
};

const formatHorario = (h) => {
  if (!h) return null;
  const daysOrder = [
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
    "domingo",
  ];
  return daysOrder.map((d) => {
    const v = h[d] ?? h[d.toLowerCase()];
    if (!v) return { dia: d, text: "No disponible" };
    const cerradoFlag =
      v.cerrado === true ||
      String(v.abre || v.open || "").toLowerCase() === "cerrado" ||
      String(v.cierra || v.close || "").toLowerCase() === "cerrado";
    if (cerradoFlag) return { dia: d, text: "Cerrado" };
    const abre = v.abre || v.open || null;
    const cierra = v.cierra || v.close || null;
    const t =
      abre && cierra
        ? `${abre} — ${cierra}`
        : abre
        ? `Abre: ${abre}`
        : cierra
        ? `Cierra: ${cierra}`
        : "Horario incompleto";
    return { dia: d, text: t };
  });
};

export default function RevisarClubs({ clubSlug, onActionComplete = () => {} }) {
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState(null);
  const [error, setError] = useState(null);

  // admin ui states
  const [snack, setSnack] = useState({ open: false, severity: "info", message: "" });
  const [confirm, setConfirm] = useState({ open: false, action: null, payload: null });
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignUserEmail, setAssignUserEmail] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [preview, setPreview] = useState({ open: false, url: null, type: "image" });
  const [saving, setSaving] = useState(false);

  const valorBusqueda = useMemo(() => {
    if (!clubSlug || typeof clubSlug !== "string" || clubSlug.trim() === "") return null;
    return clubSlug.trim();
  }, [clubSlug]);

  useEffect(() => {
    if (!valorBusqueda) {
      setError("Slug no especificado");
      setLoading(false);
      return;
    }

    let mounted = true;
    const fetchClub = async () => {
      setLoading(true);
      try {
        const q = `${STRAPI_URL}/api/clubs?filters[slug][$eq]=${encodeURIComponent(
          valorBusqueda
        )}&populate=*&pagination[pageSize]=1`;
        const res = await fetch(q);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const item = Array.isArray(json.data) && json.data.length > 0 ? json.data[0] : json.data;
        const attrs = item?.attributes ?? null;
        if (!attrs) {
          if (mounted) {
            setClub(null);
            setError("Club no encontrado");
          }
          return;
        }

        // extraer medias
        const fotoUrls = extractMediaUrls(attrs.foto_de_perfil);
        const fotos = extractMediaUrls(attrs.fotos);
        const documentos = extractMediaUrls(attrs.documentos);
        const estatutos = extractMediaUrls(attrs.estatutos);
        const acta = extractMediaUrls(attrs.acta);
        const archivos_legal = extractMediaUrls(attrs.archivos_legal);

        // owner (si existe)
        let owner = null;
        try {
          const userRel = attrs.users_permissions_user ?? attrs.user ?? null;
          const userData = userRel?.data ?? userRel;
          const userAttrs = userData?.attributes ?? (userData || null);
          if (userAttrs) {
            owner = {
              id: userData?.id ?? null,
              username: userAttrs.username ?? userAttrs.name ?? userAttrs.email ?? null,
              email: userAttrs.email ?? null,
            };
          }
        } catch {}

        const normalized = {
          id: item?.id ?? null,
          ...attrs,
          fotoUrls,
          fotos,
          documentos,
          estatutos,
          acta,
          archivos_legal,
          owner,
        };

        if (mounted) {
          setClub(normalized);
          setError(null);
        }
      } catch (err) {
        if (mounted) setError(err.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchClub();
    return () => {
      mounted = false;
    };
  }, [valorBusqueda]);

  /* ---------------- Admin actions: helper para requests autenticadas -------------- */
  const adminFetch = async (path, opts = {}) => {
    const headers = opts.headers ?? {};
    if (ADMIN_TOKEN) headers["Authorization"] = `Bearer ${ADMIN_TOKEN}`;
    const res = await fetch(`${STRAPI_URL}${path}`, { ...opts, headers });
    return res;
  };

  /* --------- UI helpers ---------- */
  const showSnack = (severity, message) => {
    setSnack({ open: true, severity, message });
  };

  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  /* ----------------- ACTIONS (optimista con re-fetch parcial) ------------------ */

  async function handleAprobar() {
    if (!club?.id) return;
    setConfirm({
      open: true,
      action: "aprobar",
      payload: { id: club.id },
    });
  }

  async function doAprobar(id) {
    try {
      setSaving(true);
      // Ejemplo: marcar activo y quitar en_revision, cambiar status_legal a 'aprobado'
      const body = {
        data: {
          activo: true,
          en_revision: false,
          status_legal: "aprobado",
        },
      };
      const res = await adminFetch(`/api/clubs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
      setClub((c) => ({ ...c, ...json.data?.attributes }));
      showSnack("success", "Club aprobado y activado.");
      onActionComplete("aprobar", club);
    } catch (e) {
      showSnack("error", `Error al aprobar: ${e.message || e}`);
    } finally {
      setSaving(false);
      setConfirm({ open: false, action: null, payload: null });
      // re-fetch para limpiar populate si se necesita (omito por simplicidad)
    }
  }

  async function handleRechazar() {
    if (!club?.id) return;
    setConfirm({
      open: true,
      action: "rechazar",
      payload: { id: club.id },
    });
  }

  async function doRechazar(id) {
    try {
      setSaving(true);
      const body = { data: { activo: false, en_revision: false, status_legal: "rechazado" } };
      const res = await adminFetch(`/api/clubs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
      setClub((c) => ({ ...c, ...json.data?.attributes }));
      showSnack("info", "Club marcado como rechazado.");
      onActionComplete("rechazar", club);
    } catch (e) {
      showSnack("error", `Error al rechazar: ${e.message || e}`);
    } finally {
      setSaving(false);
      setConfirm({ open: false, action: null, payload: null });
    }
  }

  async function handleToggleActivo() {
    if (!club?.id) return;
    const nuevo = !club.activo;
    setConfirm({
      open: true,
      action: nuevo ? "activar" : "desactivar",
      payload: { id: club.id, nuevo },
    });
  }

  async function doToggleActivo(id, nuevo) {
    try {
      setSaving(true);
      const body = { data: { activo: nuevo } };
      const res = await adminFetch(`/api/clubs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
      setClub((c) => ({ ...c, ...json.data?.attributes }));
      showSnack("success", `Club ${nuevo ? "activado" : "desactivado"}.`);
      onActionComplete("toggle_activo", club);
    } catch (e) {
      showSnack("error", `Error: ${e.message || e}`);
    } finally {
      setSaving(false);
      setConfirm({ open: false, action: null, payload: null });
    }
  }

  async function handleIniciarGestion() {
    // abrir modal para meter datos_legales mínimos o usar los existentes
    setEditForm((f) => ({
      ...f,
      datos_legales: club.datos_legales ?? club.datosLegales ?? {},
      status_legal: "gestion",
    }));
    setEditOpen(true);
  }

  async function doGuardarEdicion() {
    if (!club?.id) return;
    try {
      setSaving(true);
      const payload = {
        data: {
          ...club,
          ...editForm,
        },
      };
      // solo mandar campos que queremos actualizar (evitar sobrescribir media sin populate)
      const toSend = {
        data: {
          status_legal: editForm.status_legal ?? club.status_legal,
          datos_legales: editForm.datos_legales ?? club.datos_legales,
          nombre_club: editForm.nombre_club ?? club.nombre_club,
          descripcion: editForm.descripcion ?? club.descripcion,
          servicios: editForm.servicios ?? club.servicios,
          productos: editForm.productos ?? club.productos,
        },
      };
      const res = await adminFetch(`/api/clubs/${club.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSend),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
      setClub((c) => ({ ...c, ...json.data?.attributes }));
      showSnack("success", "Cambios guardados.");
      setEditOpen(false);
      onActionComplete("editar", club);
    } catch (e) {
      showSnack("error", `Error guardando: ${e.message || e}`);
    } finally {
      setSaving(false);
    }
  }

  /* --------- Asignar gestor (demo: guarda email en datos_legales.gestor) ---------- */
  async function handleAsignarGestorOpen() {
    setAssignUserEmail("");
    setAssignOpen(true);
  }

  async function doAsignarGestor() {
    if (!club?.id) return;
    try {
      setSaving(true);
      const nuevos = { ...(club.datos_legales ?? {}), gestor: assignUserEmail };
      const res = await adminFetch(`/api/clubs/${club.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { datos_legales: nuevos } }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
      setClub((c) => ({ ...c, datos_legales: json.data?.attributes?.datos_legales ?? nuevos }));
      showSnack("success", "Gestor asignado.");
      setAssignOpen(false);
      onActionComplete("asignar_gestor", club);
    } catch (e) {
      showSnack("error", `Error asignando gestor: ${e.message || e}`);
    } finally {
      setSaving(false);
    }
  }

  /* ---------------- Subir documento (ejemplo usando /api/upload de Strapi) ---------------- */
  async function handleUploadOpen() {
    setUploadFile(null);
    setUploadOpen(true);
  }

  async function doUploadDocumento() {
    if (!uploadFile || !club?.id) {
      showSnack("warning", "Selecciona un archivo primero.");
      return;
    }
    try {
      setSaving(true);
      // 1) subir el archivo a strapi /api/upload
      const fd = new FormData();
      fd.append("files", uploadFile);
      // rel: necesitas relacionarlo a la entidad. Strapi v4: POST /api/upload?populate=*&refId={id}&ref=clubs&field=documentos
      // Aquí se usa un ejemplo (ajusta según tu Strapi)
      const upRes = await fetch(`${STRAPI_URL}/api/upload?refId=${club.id}&ref=clubs&field=documentos`, {
        method: "POST",
        headers: ADMIN_TOKEN ? { Authorization: `Bearer ${ADMIN_TOKEN}` } : undefined,
        body: fd,
      });
      if (!upRes.ok) throw new Error(`Upload error ${upRes.status}`);
      const uploaded = await upRes.json();
      // 2) re-fetch club para traer el archivo nuevo en populate
      showSnack("success", "Archivo subido.");
      setUploadOpen(false);
      // re-fetch simple:
      await reloadClub();
      onActionComplete("upload", club);
    } catch (e) {
      showSnack("error", `Error subiendo: ${e.message || e}`);
    } finally {
      setSaving(false);
    }
  }

  /* ---------------- eliminar documento (ejemplo) ---------------- */
  async function handleEliminarDocumento(url) {
    // confirm y luego eliminar por filename (esto depende de tu Strapi)
    setConfirm({ open: true, action: "eliminar_doc", payload: { url } });
  }

  async function doEliminarDocumento(url) {
    try {
      setSaving(true);
      // Si en tu Strapi guardas archivos como media, necesitas eliminar por ID. Aquí es ejemplo de petición (ajusta).
      // Si no puedes eliminar media desde aquí, al menos puedes quitar referencia del club (PUT sin ese doc).
      // Implementación depende de tu backend.
      showSnack("info", "Eliminación no implementada automáticamente — adapta esta llamada según tu Strapi.");
      setConfirm({ open: false, action: null, payload: null });
    } catch (e) {
      showSnack("error", `Error: ${e.message || e}`);
    } finally {
      setSaving(false);
    }
  }

  /* --------------- publicar / despublicar (ejemplo) ---------------- */
  async function handleTogglePublicar() {
    if (!club?.id) return;
    setConfirm({ open: true, action: "toggle_publicar", payload: { id: club.id, nuevo: !club.activo } });
  }

  async function doTogglePublicar(id, nuevo) {
    // Reusa doToggleActivo
    await doToggleActivo(id, nuevo);
  }

  /* --------------- reload club ---------------- */
  async function reloadClub() {
    if (!valorBusqueda) return;
    setLoading(true);
    try {
      const q = `${STRAPI_URL}/api/clubs?filters[slug][$eq]=${encodeURIComponent(
        valorBusqueda
      )}&populate=*&pagination[pageSize]=1`;
      const res = await fetch(q);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const item = Array.isArray(json.data) && json.data.length > 0 ? json.data[0] : json.data;
      const attrs = item?.attributes ?? null;
      if (!attrs) {
        setClub(null);
        setError("Club no encontrado");
        return;
      }
      const fotoUrls = extractMediaUrls(attrs.foto_de_perfil);
      const fotos = extractMediaUrls(attrs.fotos);
      const documentos = extractMediaUrls(attrs.documentos);
      const estatutos = extractMediaUrls(attrs.estatutos);
      const acta = extractMediaUrls(attrs.acta);
      const normalized = {
        id: item?.id ?? null,
        ...attrs,
        fotoUrls,
        fotos,
        documentos,
        estatutos,
        acta,
      };
      setClub(normalized);
    } catch (e) {
      setError(e.message || e);
    } finally {
      setLoading(false);
    }
  }

  /* ------------------ Confirm dialog handler ----------------- */
  const confirmAction = async () => {
    const { action, payload } = confirm;
    if (!action) {
      setConfirm({ open: false, action: null, payload: null });
      return;
    }
    // map actions:
    if (action === "aprobar") await doAprobar(payload.id);
    else if (action === "rechazar") await doRechazar(payload.id);
    else if (action === "activar" || action === "desactivar")
      await doToggleActivo(payload.id, payload.nuevo);
    else if (action === "eliminar_doc") await doEliminarDocumento(payload.url);
    else if (action === "toggle_publicar") await doTogglePublicar(payload.id, payload.nuevo);
    else {
      setConfirm({ open: false, action: null, payload: null });
    }
  };

  /* ------------------ Render UI ------------------ */
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 1100, mx: "auto", p: 2 }}>
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography color="error">Error: {error}</Typography>
        </Paper>
      </Box>
    );
  }

  if (!club) {
    return (
      <Box sx={{ maxWidth: 1100, mx: "auto", p: 2 }}>
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography>No se encontró información del club.</Typography>
        </Paper>
      </Box>
    );
  }

  // Preparar campos
  const firstFoto = (club.fotoUrls && club.fotoUrls[0]) || null;
  const fotos = club.fotos || [];
  const documentos = club.documentos || [];
  const direccionParsed = splitDireccion(club.direccion ?? club.direccion?.raw ?? null);

  const horariosObj = club.horarios ?? {};
  const consumoHorario = horariosObj?.consumo ?? horariosObj?.consumo ?? null;
  const cultivoHorario = horariosObj?.cultivo ?? horariosObj?.cultivo ?? null;
  const consumoFormatted = consumoHorario ? formatHorario(consumoHorario) : null;
  const cultivoFormatted = cultivoHorario ? formatHorario(cultivoHorario) : null;

  const integrantes = club.num_integrantes ?? 0;
  const lugares = club.lugares ?? 0;
  const tipoLabel = club.tipo === "ambos" ? "Cultivo y Consumo" : club.tipo ?? null;
  const whatsappRaw = club.whatsapp ?? club.whats ?? null;
  const whatsappNumber = whatsappRaw ? String(whatsappRaw).replace(/\D/g, "") : null;
  const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber}` : null;

  // datos legales parse
  let datosLegales = club.datos_legales ?? club.datosLegales ?? null;
  if (typeof datosLegales === "string") {
    try {
      datosLegales = JSON.parse(datosLegales);
    } catch {}
  }
  const statusRaw = (club.status_legal ?? "").toString().toLowerCase();
  const isGestion = statusRaw === "gestion" || statusRaw === "gestión";

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
      {/* HEADER ADMIN ACTIONS */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => window.history.back()}>
          Volver
        </Button>

        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {club.nombre_club ?? "Club"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Slug: {club.slug || "—"} · ID: {club.id}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Tooltip title="Editar datos (admin)">
            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => { setEditForm({ nombre_club: club.nombre_club, descripcion: club.descripcion, servicios: club.servicios, productos: club.productos, datos_legales: datosLegales, status_legal: club.status_legal }); setEditOpen(true); }}>
              Editar
            </Button>
          </Tooltip>

          <Tooltip title={club.activo ? "Desactivar" : "Activar"}>
            <Button variant="contained" color={club.activo ? "warning" : "success"} startIcon={club.activo ? <ToggleOffIcon /> : <ToggleOnIcon />} onClick={handleToggleActivo}>
              {club.activo ? "Desactivar" : "Activar"}
            </Button>
          </Tooltip>

          <Tooltip title="Aprobar y publicar">
            <Button variant="contained" color="primary" startIcon={<PublishIcon />} onClick={handleAprobar} disabled={saving}>
              Aprobar
            </Button>
          </Tooltip>

          <Tooltip title="Rechazar (marcar rechazo)">
            <Button variant="outlined" color="error" startIcon={<HighlightOffIcon />} onClick={handleRechazar} disabled={saving}>
              Rechazar
            </Button>
          </Tooltip>
        </Stack>
      </Box>

      <Grid container spacing={2}>
        {/* LEFT: resumen, mapas, horarios, legal (acciones) */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
              <Avatar src={firstFoto || undefined} alt={club.nombre_club} variant="rounded" sx={{ width: 180, height: 140 }} />
              {!firstFoto && <Typography variant="caption" color="text.secondary">Sin foto</Typography>}

              <Typography variant="subtitle2" sx={{ mt: 1 }}>{club.nombre_titular}</Typography>

              {/* Dirección */}
              {direccionParsed ? (
                <Typography variant="body2" sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
                  <PlaceIcon fontSize="small" /> { [direccionParsed.calle, direccionParsed.zona, direccionParsed.ciudad, direccionParsed.estado].filter(Boolean).join(", ") || direccionParsed.raw }
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Dirección no disponible</Typography>
              )}

              {/* Map (iframe) */}
              {club.lat && club.lng && (
                <Box sx={{ mt: 1, width: "100%" }}>
                  <Box sx={{ position: "relative", pt: "56.25%", borderRadius: 1, overflow: "hidden" }}>
                    <iframe
                      title={`map-${club.id}`}
                      src={`https://www.google.com/maps?q=${encodeURIComponent(`${club.lat},${club.lng}`)}&z=16&output=embed`}
                      style={{ border: 0, position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                      loading="lazy"
                    />
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <MuiLink href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${club.lat},${club.lng}`)}`} target="_blank" rel="noopener noreferrer">
                      Abrir en Google Maps
                    </MuiLink>
                  </Box>
                </Box>
              )}

              {/* Contactos */}
              {whatsappLink && (
                <Box sx={{ mt: 1, width: "100%" }}>
                  <MuiLink href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon fontSize="small" /> Contactar por WhatsApp
                  </MuiLink>
                </Box>
              )}

              {club.auth_name && (
                <Box sx={{ mt: 1, width: "100%" }}>
                  <MuiLink href={club.auth_name} target="_blank" rel="noopener noreferrer">
                    <LanguageIcon fontSize="small" /> {club.auth_name}
                  </MuiLink>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Horarios */}
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle2">Horarios</Typography>
            <Box sx={{ mt: 1 }}>
              {consumoFormatted || cultivoFormatted ? (
                <>
                  {consumoFormatted && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>Consumo</Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableBody>
                            {consumoFormatted.map((row) => (
                              <TableRow key={`c-${row.dia}`}>
                                <TableCell sx={{ width: 120, textTransform: "capitalize", borderBottom: "none", p: 0.5 }}>{row.dia}</TableCell>
                                <TableCell sx={{ borderBottom: "none", p: 0.5 }}>{row.text}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                  {cultivoFormatted && (
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>Cultivo / Entrega</Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableBody>
                            {cultivoFormatted.map((row) => (
                              <TableRow key={`cu-${row.dia}`}>
                                <TableCell sx={{ width: 120, textTransform: "capitalize", borderBottom: "none", p: 0.5 }}>{row.dia}</TableCell>
                                <TableCell sx={{ borderBottom: "none", p: 0.5 }}>{row.text}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">Horarios no disponibles</Typography>
              )}
            </Box>
          </Paper>

          {/* Legal (con prioridad de acciones) */}
          <Paper sx={{ p: 2, mt: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle2">Estatus legal</Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" startIcon={<GavelIcon />} onClick={handleIniciarGestion}>Iniciar gestión</Button>
                <Button size="small" startIcon={<AssignmentIndIcon />} onClick={handleAsignarGestorOpen}>Asignar gestor</Button>
              </Stack>
            </Box>

            <Box sx={{ mt: 1 }}>
              {isGestion ? (
                <Chip label="Gestión (Ciudadan)" icon={<GavelIcon />} sx={{ bgcolor: "warning.main", color: "black", fontWeight: 700 }} />
              ) : (
                <Chip label={club.status_legal || "Sin status"} />
              )}

              <Box sx={{ mt: 1 }}>
                {isGestion ? (
                  <>
                    <Typography variant="body2" color="text.secondary">Datos para trámite</Typography>
                    <Typography variant="body1"><strong>Dirección:</strong> {datosLegales?.direccion ? (typeof datosLegales.direccion === "object" ? [datosLegales.direccion.calle, datosLegales.direccion.colonia, datosLegales.direccion.ciudad].filter(Boolean).join(", ") : datosLegales.direccion) : (club.direccion || "No especificada")}</Typography>
                    <Typography variant="body1"><strong>Tel:</strong> {datosLegales?.telefono ?? "No disponible"}</Typography>
                    <Typography variant="body1"><strong>Email:</strong> {datosLegales?.email ?? "No disponible"}</Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" color="text.secondary">Detalle</Typography>
                    <Typography variant="body1"><strong>Tipo:</strong> {datosLegales?.tipo_resolucion ?? datosLegales?.tipo ?? "—"}</Typography>
                    <Typography variant="body1"><strong>Folio:</strong> {datosLegales?.folio ?? "—"}</Typography>
                    <Typography variant="body1"><strong>Año:</strong> {datosLegales?.anio_tramite ?? datosLegales?.anio ?? "—"}</Typography>
                  </>
                )}
              </Box>
            </Box>
          </Paper>

          {/* Documentos (acciones rápidas) */}
          <Paper sx={{ p: 2, mt: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle2">Documentos</Typography>
              <Stack direction="row" spacing={1}>
                <Button startIcon={<CloudUploadIcon />} onClick={handleUploadOpen}>Subir</Button>
                <Button startIcon={<HistoryIcon />} onClick={reloadClub}>Refrescar</Button>
              </Stack>
            </Box>

            <TableContainer sx={{ mt: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Archivo</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(documentos.length === 0) && (
                    <TableRow><TableCell colSpan={3}><Typography variant="body2" color="text.secondary">No hay documentos</Typography></TableCell></TableRow>
                  )}
                  {documentos.map((u, i) => (
                    <TableRow key={`doc-${i}`}>
                      <TableCell sx={{ borderBottom: "none", wordBreak: "break-all" }}>{u.split("/").pop() ?? `doc-${i+1}`}</TableCell>
                      <TableCell sx={{ borderBottom: "none" }}>Documento</TableCell>
                      <TableCell sx={{ borderBottom: "none" }}>
                        <Stack direction="row" spacing={1}>
                          <Button size="small" onClick={() => window.open(u, "_blank")}>Abrir</Button>
                          <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleEliminarDocumento(u)}>Eliminar</Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* RIGHT: contenido completo, galería, metadatos y acciones masivas */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Contenido y administración</Typography>

            {/* Descripción / servicios / productos */}
            {club.descripcion && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2">Descripción</Typography>
                <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>{club.descripcion}</Typography>
              </Box>
            )}

            {club.servicios && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2">Servicios</Typography>
                <Typography variant="body2">{club.servicios}</Typography>
              </Box>
            )}

            {club.productos && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2">Productos</Typography>
                <Typography variant="body2">{club.productos}</Typography>
              </Box>
            )}

            {/* Galería admin con preview */}
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle2"><PhotoLibraryIcon fontSize="small" /> Galería</Typography>
                <Stack direction="row" spacing={1}>
                  <Button size="small" startIcon={<PhotoLibraryIcon />} onClick={() => window.open(club.fotoUrls?.[0] ?? "#", "_blank")}>Abrir perfil</Button>
                </Stack>
              </Box>

              {fotos.length === 0 ? (
                <Typography variant="body2" color="text.secondary">Sin fotos/videos</Typography>
              ) : (
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  {fotos.map((u, i) => (
                    <Grid item xs={6} sm={4} md={3} key={`g-${i}`}>
                      <Paper elevation={1} sx={{ overflow: "hidden", height: 160, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        {isImage(u) ? (
                          <img src={u} alt={`img-${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} onClick={() => setPreview({ open: true, url: u, type: "image" })} />
                        ) : isVideo(u) ? (
                          <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
                            <video src={u} style={{ width: "100%", height: "100%", objectFit: "cover" }} preload="metadata" />
                            <IconButton sx={{ position: "absolute", top: 8, right: 8, bgcolor: "rgba(0,0,0,0.4)", color: "#fff" }} onClick={() => setPreview({ open: true, url: u, type: "video" })}><PlayCircleOutlineIcon /></IconButton>
                          </Box>
                        ) : (
                          <MuiLink href={u} target="_blank" rel="noopener noreferrer">{u.split("/").pop()}</MuiLink>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>

            {/* metadata y acciones masivas */}
            <Box sx={{ mt: 3, display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
              {club.fecha_alta && <Chip label={`Alta: ${new Date(club.fecha_alta).toLocaleString()}`} size="small" />}
              {club.fecha_activado && <Chip label={`Activado: ${new Date(club.fecha_activado).toLocaleString()}`} size="small" />}
              <Chip label={`${integrantes} integrantes • ${lugares} lugares`} />
              <Chip label={tipoLabel ?? "Tipo: —"} />

              <Button startIcon={<SmsIcon />} onClick={() => { window.open(`mailto:${club.datos_legales?.email ?? club.owner?.email ?? ""}`); }}>Notificar</Button>

              <Button startIcon={<HistoryIcon />} onClick={reloadClub}>Refrescar datos</Button>
            </Box>

            {/* historial simple: observaciones + en_revision */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Historial / Observaciones</Typography>
              <Typography variant="body2" color="text.secondary">{club.observaciones ?? "Sin observaciones"}</Typography>
              <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                <Chip label={club.en_revision ? "En revisión" : "No en revisión"} />
                <Chip label={club.activo ? "Activo" : "Inactivo"} color={club.activo ? "success" : "default"} />
                <Chip label={`Status legal: ${club.status_legal ?? "—"}`} />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ------------------ DIALOGS ------------------ */}

      {/* Confirm */}
      <Dialog open={confirm.open} onClose={() => setConfirm({ open: false, action: null, payload: null })}>
        <DialogTitle>Confirmar acción</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de ejecutar "{confirm.action}"?</Typography>
          {confirm.payload?.url && <Typography variant="caption" sx={{ wordBreak: "break-all" }}>{confirm.payload.url}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm({ open: false, action: null, payload: null })}>Cancelar</Button>
          <Button onClick={confirmAction} variant="contained" color="primary">Sí, ejecutar</Button>
        </DialogActions>
      </Dialog>

      {/* Edit modal */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Editar club (admin)</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Nombre" value={editForm.nombre_club || ""} onChange={(e) => setEditForm((s) => ({ ...s, nombre_club: e.target.value }))} fullWidth />
            <TextField label="Descripción" value={editForm.descripcion || ""} onChange={(e) => setEditForm((s) => ({ ...s, descripcion: e.target.value }))} fullWidth multiline minRows={3} />
            <TextField label="Servicios" value={editForm.servicios || ""} onChange={(e) => setEditForm((s) => ({ ...s, servicios: e.target.value }))} fullWidth />
            <TextField label="Productos" value={editForm.productos || ""} onChange={(e) => setEditForm((s) => ({ ...s, productos: e.target.value }))} fullWidth />
            <TextField select label="Status legal" value={editForm.status_legal || club.status_legal || ""} onChange={(e) => setEditForm((s) => ({ ...s, status_legal: e.target.value }))}>
              <MenuItem value="gestion">gestion</MenuItem>
              <MenuItem value="aprobado">aprobado</MenuItem>
              <MenuItem value="rechazado">rechazado</MenuItem>
              <MenuItem value="cofepris">permiso COFEPRIS</MenuItem>
              <MenuItem value="amparo">amparo</MenuItem>
            </TextField>

            <TextField label="Datos legales (JSON)" value={JSON.stringify(editForm.datos_legales ?? datosLegales ?? {}, null, 2)} onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setEditForm((s) => ({ ...s, datos_legales: parsed }));
              } catch {
                setEditForm((s) => ({ ...s, datos_legales: e.target.value }));
              }
            }} fullWidth multiline minRows={3} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={doGuardarEdicion} disabled={saving}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Assign gestor */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)}>
        <DialogTitle>Asignar gestor</DialogTitle>
        <DialogContent>
          <TextField label="Email del gestor" value={assignUserEmail} onChange={(e) => setAssignUserEmail(e.target.value)} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)}>Cerrar</Button>
          <Button variant="contained" onClick={doAsignarGestor} disabled={saving}>Asignar</Button>
        </DialogActions>
      </Dialog>

      {/* Upload */}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)}>
        <DialogTitle>Subir documento</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <Input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)} />
            <Typography variant="caption">El archivo se subirá y se relacionará con el campo 'documentos'. Ajusta endpoint si tu Strapi usa otra configuración.</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={doUploadDocumento} disabled={saving || !uploadFile}>Subir</Button>
        </DialogActions>
      </Dialog>

      {/* Preview */}
      <Dialog open={preview.open} onClose={() => setPreview({ open: false, url: null })} maxWidth="xl">
        <DialogContent>
          {preview.type === "image" ? (
            <img src={preview.url} alt="preview" style={{ maxWidth: "95vw", maxHeight: "80vh", display: "block", margin: "0 auto" }} />
          ) : (
            <video src={preview.url} controls style={{ maxWidth: "95vw", maxHeight: "80vh", display: "block", margin: "0 auto" }} />
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={5000} onClose={closeSnack}>
        <Alert onClose={closeSnack} severity={snack.severity} sx={{ width: "100%" }}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}

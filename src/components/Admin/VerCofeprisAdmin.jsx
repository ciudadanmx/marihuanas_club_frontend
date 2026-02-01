// VerCofeprisAdmin.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  Avatar,
  Button,
  Chip,
  Divider,
  Dialog,
  DialogContent,
  Slider,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Collapse,
  TextField,
} from "@mui/material";
import {
  ContentCopy,
  Visibility,
  OpenInNew,
  FileDownload,
  Print,
  ZoomIn,
  ZoomOut,
  Refresh,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import IngresarCitaCofeprisModalImported from "./IngresarCitaCofeprisModal.jsx";
import PreLoader from "../PreLoader.jsx";
import sinImagen from "../../assets/placeholders/sinimagen.jpg";

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL || "";
const COFEPRIS_CITAS_URL =
  process.env.REACT_APP_COFEPRIS_CITAS_URL || "https://citas.cofepris.gob.mx";

/**
 * VerCofeprisAdmin
 * - Recibe prop `rfc` (string) — lo limpiamos y hacemos fetch.
 * - Integra directamente IngresarCitaCofeprisModalImported (fecha + hora).
 */
export default function VerCofeprisAdmin({ rfc }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  // cleaned RFC (trim + uppercase)
  const rfcClean = typeof rfc === "string" ? rfc.trim().toUpperCase() : "";

  // states
  const [tramite, setTramite] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // debug raw JSON
  const [rawJson, setRawJson] = useState(null);

  // modals / viewer
  const [openIngresarCita, setOpenIngresarCita] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerSrc, setViewerSrc] = useState(null);
  const [viewerTitle, setViewerTitle] = useState("");
  const [zoom, setZoom] = useState(1);

  // copy feedback
  const [copied, setCopied] = useState({
    rfc: false,
    curp: false,
    telefono: false,
    email: false,
  });

  // helpers
  const getMediaUrl = (mediaField) => {
    if (!mediaField) return null;
    const extract = (m) => {
      if (!m) return null;
      const file = m.data ? m.data : m;
      const first = Array.isArray(file) ? file[0] : file;
      if (!first) return null;
      const attrs = first.attributes || first;
      const formats = attrs.formats || {};
      const thumb =
        formats?.thumbnail?.url ||
        formats?.small?.url ||
        formats?.medium?.url ||
        formats?.large?.url;
      const url = thumb || attrs.url || attrs?.data?.attributes?.url;
      if (!url) return null;
      if (String(url).startsWith("http")) return url;
      return `${STRAPI_URL}${url}`;
    };
    if (Array.isArray(mediaField)) return extract(mediaField[0]);
    return extract(mediaField);
  };

  const formatDate = (d) => {
    if (!d) return "Sin fecha";
    try {
      const date = new Date(d);
      return date.toLocaleString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(d);
    }
  };

  const copyToClipboard = async (key, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied((p) => ({ ...p, [key]: true }));
      setTimeout(() => setCopied((p) => ({ ...p, [key]: false })), 1400);
    } catch (e) {
      console.warn("Clipboard error", e);
    }
  };

  const openViewer = (src, title = "") => {
    if (!src) return;
    setViewerSrc(src);
    setViewerTitle(title);
    setZoom(1);
    setViewerOpen(true);
  };
  const closeViewer = () => {
    setViewerOpen(false);
    setViewerSrc(null);
    setViewerTitle("");
    setZoom(1);
  };

  const handleDownloadViewer = () => {
    if (!viewerSrc) return;
    const a = document.createElement("a");
    a.href = viewerSrc;
    a.download = `${viewerTitle || "imagen"}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  const handlePrintViewer = () => {
    if (!viewerSrc) return;
    const w = window.open("");
    w.document.write(`<img src="${viewerSrc}" style="max-width:100%"/>`);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  // Fetch with debug + AbortController
  useEffect(() => {
    console.debug("[VerCofeprisAdmin] prop rfc (raw):", rfc);
    console.debug("[VerCofeprisAdmin] rfcClean:", rfcClean);

    if (!rfcClean) {
      setTramite(null);
      setError("RFC no especificado (prop rfc vacío).");
      setRawJson(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchTramite = async () => {
      setLoading(true);
      setError(null);
      setRawJson(null);
      try {
        const base = STRAPI_URL || "";
        const url = `${base}/api/cofepristramites?filters[rfc][$eq]=${encodeURIComponent(
          rfcClean
        )}&populate=usuario,club,ine_frente,ine_tras,acuse,acuse_sellado,resolucion,otros_documentos,escrito_libre_generado,escrito_libre_firmado`;

        console.debug("[VerCofeprisAdmin] fetch URL:", url);

        const res = await fetch(url, { signal });
        console.debug("[VerCofeprisAdmin] HTTP status:", res.status, res.statusText);

        let json = null;
        try {
          json = await res.json();
        } catch (parseErr) {
          console.error("Error parsing JSON response", parseErr);
        }
        console.debug("[VerCofeprisAdmin] raw json:", json);
        setRawJson(json || null);

        if (!res.ok) {
          setError(`HTTP ${res.status} ${res.statusText}`);
          setTramite(null);
        } else {
          const entry = (json && json.data && json.data[0]) || null;
          if (!entry) {
            setError("Trámite no encontrado para ese RFC (json.data vacío). Revisa rawJson abajo.");
            setTramite(null);
          } else {
            setTramite(entry);
            setError(null);
          }
        }
      } catch (err) {
        if (err.name === "AbortError") {
          console.debug("fetch aborted");
          return;
        }
        console.error("Error fetchTramite:", err);
        setError("Error cargando trámite (ver consola/network).");
        setTramite(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTramite();
    return () => controller.abort();
  }, [rfcClean]);

  // Diagnostics panel
  const Diagnostics = () => (
    <Paper sx={{ p: 2, mt: 2, bgcolor: "background.paper" }}>
      <Stack spacing={1}>
        <Typography variant="subtitle2">Diagnóstico rápido</Typography>
        <Typography variant="body2">
          RFC usado: <strong>{rfcClean || "—"}</strong>
        </Typography>
        <Typography variant="body2">
          STRAPI_URL: <strong>{STRAPI_URL || "(no definido en REACT_APP_STRAPI_URL)"}</strong>
        </Typography>
        <Typography variant="body2">Comprueba la pestaña Network y la respuesta rawJson abajo.</Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Button
            startIcon={<Refresh />}
            size="small"
            onClick={() => {
              setTramite(null);
              setError(null);
              setRawJson(null);
              window.location.reload();
            }}
          >
            Reintentar (recargar)
          </Button>
        </Stack>

        <Collapse in={Boolean(rawJson)}>
          <Box sx={{ mt: 1, p: 1, bgcolor: "background.default", borderRadius: 1, maxHeight: 220, overflow: "auto" }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              rawJson:
            </Typography>
            <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(rawJson, null, 2)}</pre>
          </Box>
        </Collapse>
      </Stack>
    </Paper>
  );

  // Loading UI
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <PreLoader />
      </Box>
    );
  }

  // Error UI
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography color="error" sx={{ fontWeight: 700 }}>
            {error}
          </Typography>
          <Diagnostics />
          <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
            Pasos rápidos:
            <ul>
              <li>Abre DevTools → Network, recarga y busca la petición a <code>/api/cofepristramites</code>.</li>
              <li>Revisa la URL que hizo fetch (debe coincidir con la que pruebas en el navegador).</li>
              <li>Revisa la respuesta (status, body). Si status ≠ 200, quizá CORS o auth.</li>
              <li>Si rawJson muestra data vacío pero el navegador muestra data, revisa si STRAPI_URL es distinto o si hay diferencias de host (http vs https).</li>
            </ul>
          </Typography>
        </Paper>
      </Box>
    );
  }

  // No tramite found UI
  if (!tramite) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography>No se encontró el trámite. Revisa el diagnóstico abajo.</Typography>
          <Diagnostics />
        </Paper>
      </Box>
    );
  }

  // We have tramite -> render full UI
  const attrs = tramite.attributes || tramite;
  const usuarioData = attrs.usuario && attrs.usuario.data ? attrs.usuario.data : attrs.usuario;
  const clubData = attrs.club && attrs.club.data ? attrs.club.data : attrs.club;

  const tipo = (attrs.tipo || "").toString().toLowerCase();
  const relatedSlug =
    tipo === "gestion" || tipo === "membresia"
      ? usuarioData?.attributes?.slug || usuarioData?.slug
      : clubData?.attributes?.slug || clubData?.slug || attrs.club_slug;

  const relatedName =
    tipo === "gestion" || tipo === "membresia"
      ? usuarioData?.attributes?.username || usuarioData?.attributes?.nombre_completo || attrs.nombre_completo || "Usuario sin nombre"
      : clubData?.attributes?.nombre_club || attrs.nombre_completo || "Club sin nombre";

  const relatedImage =
    tipo === "gestion" || tipo === "membresia"
      ? getMediaUrl(usuarioData?.attributes?.profilepic) || sinImagen
      : getMediaUrl(clubData?.attributes?.foto_de_perfil) || sinImagen;

  const ineFrenteUrl = getMediaUrl(attrs.ine_frente) || null;
  const ineTrasUrl = getMediaUrl(attrs.ine_tras) || null;
  const acuseUrl = getMediaUrl(attrs.acuse) || null;
  const acuseSelladoUrl = getMediaUrl(attrs.acuse_sellado) || null;
  const resolucionUrl = getMediaUrl(attrs.resolucion) || null;
  const escritoGeneradoUrl = getMediaUrl(attrs.escrito_libre_generado) || null;
  const otrosDocumentos = attrs.otros_documentos ? (attrs.otros_documentos.data || attrs.otros_documentos) : null;

  const goToRelated = () => {
    if (!relatedSlug) return;
    if (tipo === "gestion" || tipo === "membresia") {
      navigate(`/profile/${relatedSlug}`);
    } else {
      navigate(`/clubs/${relatedSlug}`);
    }
  };

  return (
    <Box sx={{ width: "100%", p: { xs: 1, sm: 2, md: 3 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderLeft: "6px solid primary.main" }}>
        {/* Header */}
        <Stack direction={isSm ? "column" : "row"} spacing={2} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={relatedImage} alt={relatedName} variant="rounded" sx={{ width: 88, height: 88, borderRadius: 2, boxShadow: 1 }} />

            <Box>
              <Button startIcon={<OpenInNew />} onClick={goToRelated} sx={{ textTransform: "none", p: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{relatedName}</Typography>
              </Button>

              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                <Chip label={attrs.status || "Sin status"} size="small" />
                <Chip label={`Tipo: ${tipo || "no especificado"}`} size="small" />
                {attrs.concedido && <Chip label="Concedido" size="small" color="success" />}
                {attrs.negado && <Chip label="Negado" size="small" color="error" />}
              </Stack>

              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
                Solicitado: {formatDate(attrs.fecha_inicial)}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mt: { xs: 1, sm: 0 } }}>
            <Tooltip title="Ir a la página pública de citas Cofepris">
              <Button variant="contained" color="success" size="small" startIcon={<OpenInNew />} href={COFEPRIS_CITAS_URL} target="_blank" rel="noopener noreferrer" sx={{ textTransform: "none" }}>
                Generar cita COFEPRIS
              </Button>
            </Tooltip>

            <Tooltip title="Ingresar fecha de cita">
              <Button variant="outlined" size="small" startIcon={<Visibility />} onClick={() => setOpenIngresarCita(true)} sx={{ textTransform: "none" }}>
                Ingresar fecha cita
              </Button>
            </Tooltip>

            <Tooltip title="Generar escrito libre para este trámite">
              <Button variant="contained" size="small" onClick={() => navigate(`/legal/generartramite/${attrs.rfc || tramite.id}`)} sx={{ textTransform: "none" }}>
                Generar escrito libre
              </Button>
            </Tooltip>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Info principal */}
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Box sx={{ minWidth: 220, flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>RFC</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography>{rfcClean || "No especificado"}</Typography>
              <IconButton size="small" onClick={() => copyToClipboard("rfc", attrs.rfc || rfcClean || "")}><ContentCopy fontSize="small" /></IconButton>
              {copied.rfc && <Typography variant="caption" color="success.main">Copiado</Typography>}
            </Stack>
          </Box>

          <Box sx={{ minWidth: 220, flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>CURP</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography>{attrs.curp || "No especificado"}</Typography>
              <IconButton size="small" onClick={() => copyToClipboard("curp", attrs.curp || "")}><ContentCopy fontSize="small" /></IconButton>
              {copied.curp && <Typography variant="caption" color="success.main">Copiado</Typography>}
            </Stack>
          </Box>

          <Box sx={{ minWidth: 220, flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Teléfono</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography>{attrs.telefono || attrs.whatsapp || "No especificado"}</Typography>
              <IconButton size="small" onClick={() => copyToClipboard("telefono", attrs.telefono || attrs.whatsapp || "")}><ContentCopy fontSize="small" /></IconButton>
              {copied.telefono && <Typography variant="caption" color="success.main">Copiado</Typography>}
            </Stack>
          </Box>

          <Box sx={{ minWidth: 220, flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Email</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography>{attrs.email || "No especificado"}</Typography>
              <IconButton size="small" onClick={() => copyToClipboard("email", attrs.email || "")}><ContentCopy fontSize="small" /></IconButton>
              {copied.email && <Typography variant="caption" color="success.main">Copiado</Typography>}
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Fecha solicitada / fecha cita */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Fecha solicitud cita</Typography>
            <Typography variant="body2">{attrs.fecha_solicitud_cita ? formatDate(attrs.fecha_solicitud_cita) : "No registrada"}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Fecha de cita (si existe)</Typography>
            <Typography variant="body2">{attrs.fecha_cita ? formatDate(attrs.fecha_cita) : "No registrada"}</Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Documentos */}
        <Stack spacing={2}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Documentos</Typography>

          <Stack direction={isSm ? "column" : "row"} spacing={2} alignItems="flex-start">
            <Paper sx={{ p: 1, width: { xs: "100%", sm: 220 }, textAlign: "center" }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>INE - Frente</Typography>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Avatar src={ineFrenteUrl || sinImagen} alt="INE Frente" variant="rounded" sx={{ width: 160, height: 100, cursor: ineFrenteUrl ? "pointer" : "default" }} onClick={() => openViewer(ineFrenteUrl || sinImagen, "INE_Frente")} />
              </Box>
              <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1 }}>
                {ineFrenteUrl && (
                  <>
                    <Tooltip title="Abrir"><IconButton size="small" onClick={() => openViewer(ineFrenteUrl, "INE_Frente")}><Visibility fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Descargar"><IconButton size="small" onClick={() => { const a = document.createElement("a"); a.href = ineFrenteUrl; a.download = `INE_Frente_${attrs.rfc || "tramite"}`; document.body.appendChild(a); a.click(); a.remove(); }}><FileDownload fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Imprimir"><IconButton size="small" onClick={() => { const w = window.open(""); w.document.write(`<img src="${ineFrenteUrl}" style="max-width:100%"/>`); w.document.close(); w.print(); w.close(); }}><Print fontSize="small" /></IconButton></Tooltip>
                  </>
                )}
              </Stack>
            </Paper>

            <Paper sx={{ p: 1, width: { xs: "100%", sm: 220 }, textAlign: "center" }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>INE - Tras</Typography>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Avatar src={ineTrasUrl || sinImagen} alt="INE Tras" variant="rounded" sx={{ width: 160, height: 100, cursor: ineTrasUrl ? "pointer" : "default" }} onClick={() => openViewer(ineTrasUrl || sinImagen, "INE_Tras")} />
              </Box>
              <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1 }}>
                {ineTrasUrl && (
                  <>
                    <Tooltip title="Abrir"><IconButton size="small" onClick={() => openViewer(ineTrasUrl, "INE_Tras")}><Visibility fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Descargar"><IconButton size="small" onClick={() => { const a = document.createElement("a"); a.href = ineTrasUrl; a.download = `INE_Tras_${attrs.rfc || "tramite"}`; document.body.appendChild(a); a.click(); a.remove(); }}><FileDownload fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Imprimir"><IconButton size="small" onClick={() => { const w = window.open(""); w.document.write(`<img src="${ineTrasUrl}" style="max-width:100%"/>`); w.document.close(); w.print(); w.close(); }}><Print fontSize="small" /></IconButton></Tooltip>
                  </>
                )}
              </Stack>
            </Paper>

            <Box sx={{ flex: 1 }}>
              <Stack spacing={1}>
                <Paper sx={{ p: 1 }}>
                  <Typography variant="subtitle2">Acuse</Typography>
                  {acuseUrl ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button size="small" onClick={() => openViewer(acuseUrl, "Acuse")}>Ver</Button>
                      <Button size="small" onClick={() => { const a = document.createElement("a"); a.href = acuseUrl; a.download = `Acuse_${attrs.rfc || "tramite"}`; document.body.appendChild(a); a.click(); a.remove(); }}>Descargar</Button>
                    </Stack>
                  ) : <Typography variant="body2" color="text.secondary">No hay acuse</Typography>}
                </Paper>

                <Paper sx={{ p: 1 }}>
                  <Typography variant="subtitle2">Resolución</Typography>
                  {resolucionUrl ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button size="small" onClick={() => openViewer(resolucionUrl, "Resolucion")}>Ver</Button>
                      <Button size="small" onClick={() => { const a = document.createElement("a"); a.href = resolucionUrl; a.download = `Resolucion_${attrs.rfc || "tramite"}`; document.body.appendChild(a); a.click(); a.remove(); }}>Descargar</Button>
                    </Stack>
                  ) : <Typography variant="body2" color="text.secondary">No hay resolución</Typography>}
                </Paper>

                <Paper sx={{ p: 1 }}>
                  <Typography variant="subtitle2">Escrito libre generado</Typography>
                  {escritoGeneradoUrl ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button size="small" onClick={() => openViewer(escritoGeneradoUrl, "EscritoLibre")}>Ver</Button>
                      <Button size="small" onClick={() => { const a = document.createElement("a"); a.href = escritoGeneradoUrl; a.download = `EscritoLibre_${attrs.rfc || "tramite"}`; document.body.appendChild(a); a.click(); a.remove(); }}>Descargar</Button>
                    </Stack>
                  ) : <Typography variant="body2" color="text.secondary">No hay escrito generado</Typography>}
                </Paper>

                {otrosDocumentos && (
                  <Paper sx={{ p: 1 }}>
                    <Typography variant="subtitle2">Otros documentos</Typography>
                    <Stack spacing={1}>
                      {(Array.isArray(otrosDocumentos) ? otrosDocumentos : (otrosDocumentos.data || [])).map((doc, idx) => {
                        const url = getMediaUrl(doc);
                        return (
                          <Stack key={idx} direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2">Documento {idx + 1}</Typography>
                            {url && <Button size="small" onClick={() => openViewer(url, `Documento_${idx + 1}`)}>Ver</Button>}
                          </Stack>
                        );
                      })}
                    </Stack>
                  </Paper>
                )}
              </Stack>
            </Box>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>Observaciones</Typography>
          <Typography variant="body2">{attrs.observaciones || "Sin observaciones"}</Typography>
        </Box>
      </Paper>

      {/* Usamos directamente el modal importado (fecha + hora). */}
      <IngresarCitaCofeprisModalImported
        open={openIngresarCita}
        onClose={() => setOpenIngresarCita(false)}
        tramiteId={tramite.id}
        rfc={attrs.rfc || ""}
        onSaved={() => window.location.reload()}
      />

      {/* Viewer modal */}
      <Dialog open={viewerOpen} onClose={closeViewer} maxWidth="xl" fullWidth>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{viewerTitle}</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="Zoom menos"><IconButton size="small" onClick={() => setZoom((z) => Math.max(0.25, Number((z - 0.25).toFixed(2))))}><ZoomOut /></IconButton></Tooltip>
              <Tooltip title="Zoom más"><IconButton size="small" onClick={() => setZoom((z) => Math.min(5, Number((z + 0.25).toFixed(2))))}><ZoomIn /></IconButton></Tooltip>
              <Tooltip title="Descargar"><IconButton size="small" onClick={handleDownloadViewer}><FileDownload /></IconButton></Tooltip>
              <Tooltip title="Imprimir"><IconButton size="small" onClick={handlePrintViewer}><Print /></IconButton></Tooltip>
              <Tooltip title="Abrir en nueva pestaña"><IconButton size="small" onClick={() => viewerSrc && window.open(viewerSrc, "_blank")}><OpenInNew /></IconButton></Tooltip>
            </Stack>
          </Stack>

          <Box sx={{ display: "flex", justifyContent: "center", overflow: "auto", p: 1 }}>
            {viewerSrc ? (
              <img src={viewerSrc} alt={viewerTitle} style={{ transform: `scale(${zoom})`, transformOrigin: "center center", maxWidth: "100%", maxHeight: "80vh", transition: "transform 120ms linear" }} />
            ) : <Typography>No hay imagen</Typography>}
          </Box>

          <Box sx={{ px: 1 }}>
            <Typography variant="caption">Zoom: {(zoom * 100).toFixed(0)}%</Typography>
            <Slider value={zoom} min={0.25} max={5} step={0.01} onChange={(_, val) => setZoom(Number(val))} sx={{ mt: 1 }} />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

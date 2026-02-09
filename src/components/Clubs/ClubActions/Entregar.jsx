// Entregar.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Avatar,
  Button,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Tooltip,
  Alert,
  CircularProgress,
} from "@mui/material";
import { PhotoCamera, CheckCircle, Cancel, Refresh } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useRoles } from "../../../Contexts/RolesContext";
import sinImagen from "../../../assets/placeholders/sinimagen.jpg";
import { useNavigate } from "react-router-dom";

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL;

/** Conversión gramos -> onzas */
const gramsToOz = (g) => {
  const oz = Number(g) * 0.0352739619;
  return Number(oz.toFixed(2));
};

/** Helper simple para subir archivos a Strapi (retorna array de objetos con id) */
async function uploadFilesToStrapiLocal(files = []) {
  if (!files || files.length === 0) return [];
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));
  const res = await fetch(`${STRAPI_URL}/api/upload`, {
    method: "POST",
    body: fd,
    credentials: "include",
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Error subiendo archivos: ${res.status} ${txt}`);
  }
  const json = await res.json();
  // Strapi normalmente retorna array
  return Array.isArray(json) ? json : json;
}

/** Normaliza club/usuario shapes (acepta {data:{id}}, id directo, etc.) */
function getIdFromPossibleShape(obj) {
  if (!obj) return null;
  if (typeof obj === "number" || typeof obj === "string") return obj;
  if (obj?.data?.id) return obj.data.id;
  if (obj?.id) return obj.id;
  if (obj?.attributes?.id) return obj.attributes.id;
  return null;
}

/** Componente principal */
export default function Entregar({ clubIdProp = null }) {
  const { userData, isJardinero } = useRoles();
  const navigate = useNavigate();

  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Dialog / estados para operación de entrega
  const [openEntrega, setOpenEntrega] = useState(false);
  const [openRechazo, setOpenRechazo] = useState(false);
  const [currentSolicitud, setCurrentSolicitud] = useState(null);

  // formulario de entrega
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [observaciones, setObservaciones] = useState("");
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // rechazo
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [processingRechazo, setProcessingRechazo] = useState(false);

  // permiso
  const esJardinero = !!(isJardinero && typeof isJardinero === "function" ? isJardinero() : isJardinero);

  // club actual normalizado: prioridad prop -> userData.club
  const clubId = useMemo(() => {
    return clubIdProp ?? getIdFromPossibleShape(userData?.club ?? userData);
  }, [clubIdProp, userData]);

  // fetch solicitudes "solicitada" para este club
  const fetchSolicitudes = async () => {
    setLoading(true);
    setFetchError("");
    try {
      if (!clubId) {
        setSolicitudes([]);
        setLoading(false);
        return;
      }
      // populate usuario.profilepic, plantas (y sus gramos_en_existencia), club
      const url = `${STRAPI_URL}/api/solicitudplantas?pagination[pageSize]=100&populate=usuario.profilepic,plantas,club&filters[club][id][$eq]=${encodeURIComponent(
        clubId
      )}&filters[status][$eq]=solicitada&sort=createdAt:asc`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error(`Error fetching solicitudes (${res.status})`);
      const json = await res.json();
      const raw = Array.isArray(json.data) ? json.data : json.data ? [json.data] : [];
      // normalizar cada solicitud
      const items = raw.map((s) => {
        const attrs = s.attributes ?? s;
        return {
          id: s.id ?? attrs.id,
          ...attrs,
          usuario: (attrs.usuario?.data ?? attrs.usuario) || null,
          plantas: (attrs.plantas?.data ?? attrs.plantas) || [],
        };
      });
      setSolicitudes(items);
    } catch (e) {
      setFetchError(String(e?.message || e));
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId]);

  // previews para uploads
  useEffect(() => {
    if (!files || files.length === 0) {
      setPreviews([]);
      return;
    }
    const readers = files.map(
      (f) =>
        new Promise((resolve) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.readAsDataURL(f);
        })
    );
    let mounted = true;
    Promise.all(readers).then((res) => {
      if (mounted) setPreviews(res);
    });
    return () => {
      mounted = false;
    };
  }, [files]);

  // abrir diálogo de entrega
  const openEntregaDialog = (sol) => {
    setCurrentSolicitud(sol);
    setOpenEntrega(true);
    setFiles([]);
    setPreviews([]);
    setObservaciones("");
    setActionError("");
    setSuccessMsg("");
  };

  // abrir diálogo de rechazo
  const openRechazoDialog = (sol) => {
    setCurrentSolicitud(sol);
    setOpenRechazo(true);
    setMotivoRechazo("");
    setActionError("");
  };

  // manejar upload input
  const onSelectFiles = (e) => {
    setActionError("");
    const f = Array.from(e.target.files || []);
    setFiles(f);
  };

  // Confirmar entrega: lógica principal
  const handleConfirmEntrega = async () => {
    setActionError("");
    setSuccessMsg("");
    if (!esJardinero) {
      setActionError("No tienes permisos para realizar entregas.");
      return;
    }
    if (!currentSolicitud) {
      setActionError("Solicitud inválida.");
      return;
    }

    const solicitudId = currentSolicitud.id;
    const gramosSolicitud = Number(currentSolicitud.gramos ?? currentSolicitud.attributes?.gramos ?? 0) || 0;
    const plantasRelacion = Array.isArray(currentSolicitud.plantas) ? currentSolicitud.plantas : [];
    const plantasIds = plantasRelacion.map((p) => p.id ?? p.attributes?.id).filter(Boolean);

    if (plantasIds.length === 0) {
      setActionError("Esta solicitud no tiene plantas asociadas.");
      return;
    }
    if (gramosSolicitud <= 0) {
      setActionError("La solicitud no tiene gramos válidos para entregar.");
      return;
    }

    setProcessing(true);

    try {
      // 1) subir imágenes (si hay)
      let uploaded = [];
      if (files.length > 0) {
        uploaded = await uploadFilesToStrapiLocal(files);
      }
      const mediaIds = (Array.isArray(uploaded) ? uploaded : []).map((u) => u?.id).filter(Boolean);

      // 2) calcular gramos por planta (división simple)
      const divisor = plantasIds.length;
      const gramsPerPlant = Number((gramosSolicitud / divisor).toFixed(2));

      // 3) actualizar cada planta: restar gramos_en_existencia y ajustar entregada/status
      // hacemos PUT a /api/plantas/:id por cada planta relacionada
      const plantUpdatePromises = plantasIds.map(async (pid) => {
        // primero obtener la planta actual para leer gramos_en_existencia (podrías usar la data ya populada)
        // si plantasRelacion incluye attributes con gramos_en_existencia podemos usarlo:
        const found = plantasRelacion.find((x) => (x.id ?? x.attributes?.id) === pid);
        let currentExist = 0;
        if (found) {
          currentExist = Number(found.attributes?.gramos_en_existencia ?? found.gramos_en_existencia ?? found._peso ?? 0) || 0;
        } else {
          // fallback fetch planta
          const r = await fetch(`${STRAPI_URL}/api/plantas/${pid}`, { credentials: "include" });
          if (!r.ok) throw new Error(`Error leyendo planta ${pid}`);
          const j = await r.json();
          currentExist = Number(j.data?.attributes?.gramos_en_existencia ?? 0) || 0;
        }

        const newExist = Number((currentExist - gramsPerPlant).toFixed(2));
        const willBeZeroOrNeg = newExist <= 0;
        const payload = {
          data: {
            gramos_en_existencia: newExist < 0 ? 0 : newExist,
            entregada: willBeZeroOrNeg ? true : false,
            status: willBeZeroOrNeg ? "entregada" : "parcialmente-entregada",
          },
        };

        const resp = await fetch(`${STRAPI_URL}/api/plantas/${pid}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (!resp.ok) {
          const txt = await resp.text();
          throw new Error(`Error actualizando planta ${pid}: ${resp.status} ${txt}`);
        }
        const updated = await resp.json();
        return updated;
      });

      const settled = await Promise.allSettled(plantUpdatePromises);
      const rejected = settled.filter((s) => s.status === "rejected");
      if (rejected.length > 0) {
        const msgs = rejected.map((r) => (r.reason?.toString ? r.reason.toString() : JSON.stringify(r.reason)));
        throw new Error(`Error actualizando plantas: ${msgs.join(" ; ")}`);
      }

      // 4) actualizar solicitud: status "entregada" y fechaentregada = now
      const fechaNow = new Date().toISOString();
      const solicitudPayload = {
        data: {
          status: "entregada",
          fechaentregada: fechaNow,
        },
      };
      const updSol = await fetch(`${STRAPI_URL}/api/solicitudplantas/${solicitudId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(solicitudPayload),
      });
      if (!updSol.ok) {
        const txt = await updSol.text();
        throw new Error(`Error actualizando solicitud: ${updSol.status} ${txt}`);
      }
      const updSolJson = await updSol.json();

      // 5) crear registro en registrosbitacoras (tipo: entrega)
      const usuarioId = getIdFromPossibleShape(currentSolicitud.usuario) ?? getIdFromPossibleShape(userData);
      const usuario_email = userData?.email ?? null;
      const clubIdForBit = getIdFromPossibleShape(currentSolicitud.club) ?? clubId ?? null;

      const texto = `Entrega realizada desde solicitud ${solicitudId}\nGramos totales solicitados: ${gramosSolicitud} g\nPlantas: ${plantasIds.join(", ")}\nGramos por planta: ${gramsPerPlant} g\nObservaciones: ${observaciones || "-"}`;

      const bitPayload = {
        data: {
          tipo: "entrega",
          status: "entregada",
          texto,
          observaciones: observaciones || "",
          media: mediaIds,
          timestamp: new Date().toISOString(),
          registrojardinero: true,
          usuario: usuarioId,
          usuario_email,
          club: clubIdForBit,
          plantas: plantasIds,
        },
      };

      const bitRes = await fetch(`${STRAPI_URL}/api/registrosbitacoras`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(bitPayload),
      });
      if (!bitRes.ok) {
        const txt = await bitRes.text();
        throw new Error(`Error creando bitácora: ${bitRes.status} ${txt}`);
      }
      const bitJson = await bitRes.json();

      // éxito
      setSuccessMsg(`Entrega registrada: ${gramosSolicitud} g entregados (${gramsPerPlant} g/planta).`);
      setProcessing(false);
      setProcessingRechazo(false);
      setOpenEntrega(false);
      // refrescar lista
      await fetchSolicitudes();
    } catch (e) {
      setActionError(String(e?.message || e));
    } finally {
      setProcessing(false);
    }
  };

  // Confirmar rechazo: actualiza solicitud status "rechazada" y crea bitácora con status "rechazada"
  const handleConfirmRechazo = async () => {
    setActionError("");
    if (!currentSolicitud) {
      setActionError("Solicitud inválida.");
      return;
    }
    if (!motivoRechazo || motivoRechazo.trim().length < 3) {
      setActionError("Debes indicar un motivo de rechazo (mínimo 3 caracteres).");
      return;
    }
    setProcessingRechazo(true);
    try {
      const solicitudId = currentSolicitud.id;
      const fechaNow = new Date().toISOString();

      // 1) actualizar solicitud
      const payload = {
        data: {
          status: "rechazada",
          fechaentregada: fechaNow,
          observaciones: (currentSolicitud.observaciones || "") + "\nRechazo: " + motivoRechazo,
        },
      };
      const upd = await fetch(`${STRAPI_URL}/api/solicitudplantas/${solicitudId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!upd.ok) {
        const txt = await upd.text();
        throw new Error(`Error actualizando solicitud: ${upd.status} ${txt}`);
      }

      // 2) crear bitácora con status "rechazada" y tipo "entrega"
      const usuarioId = getIdFromPossibleShape(currentSolicitud.usuario) ?? getIdFromPossibleShape(userData);
      const usuario_email = userData?.email ?? null;
      const clubIdForBit = getIdFromPossibleShape(currentSolicitud.club) ?? clubId ?? null;

      const texto = `Solicitud ${solicitudId} rechazada.\nMotivo: ${motivoRechazo}\nSolicitante: ${currentSolicitud.usuario?.attributes?.username ?? currentSolicitud.usuario?.username ?? "-"}`;

      const bitPayload = {
        data: {
          tipo: "entrega",
          status: "rechazada",
          texto,
          observaciones: motivoRechazo,
          media: [], // permitir que el jardinero suba pruebas si se requiere — hoy no lo hacemos aquí
          timestamp: new Date().toISOString(),
          registrojardinero: true,
          usuario: usuarioId,
          usuario_email,
          club: clubIdForBit,
          plantas: (currentSolicitud.plantas || []).map((p) => p.id ?? p.attributes?.id).filter(Boolean),
        },
      };

      const bitRes = await fetch(`${STRAPI_URL}/api/registrosbitacoras`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(bitPayload),
      });
      if (!bitRes.ok) {
        const txt = await bitRes.text();
        throw new Error(`Error creando bitácora: ${bitRes.status} ${txt}`);
      }

      // éxito
      setOpenRechazo(false);
      setProcessingRechazo(false);
      await fetchSolicitudes();
    } catch (e) {
      setActionError(String(e?.message || e));
      setProcessingRechazo(false);
    }
  };

  if (!esJardinero) {
    return <Alert severity="error">No tienes permisos para ver esta sección.</Alert>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">Solicitudes — Entregas</Typography>
              <Typography variant="caption" color="text.secondary">
                Aquí verás las solicitudes en estado <strong>solicitada</strong> para el club {clubId || "(sin club)"}.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="Refrescar">
                <IconButton onClick={fetchSolicitudes}><Refresh /></IconButton>
              </Tooltip>
              <Button variant="contained" onClick={() => navigate(-1)}>Volver</Button>
            </Stack>
          </Stack>

          {fetchError && <Alert severity="error">{fetchError}</Alert>}
          {successMsg && <Alert severity="success">{successMsg}</Alert>}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : solicitudes.length === 0 ? (
            <Typography color="text.secondary">No hay solicitudes en estado <strong>solicitada</strong>.</Typography>
          ) : (
            <Grid container spacing={2}>
              {solicitudes.map((s) => {
                const usuario = s.usuario ?? null;
                const usuarioAttrs = usuario?.attributes ?? usuario ?? {};
                const grams = Number(s.gramos ?? s.attributes?.gramos ?? 0) || 0;
                const fechaSolicitada = s.fechahora ?? s.attributes?.fechahora ?? s.attributes?.fechasolicitada ?? s.createdAt ?? null;
                const plantasCount = (s.plantas || []).length;

                return (
                  <Grid item xs={12} md={6} key={s.id}>
                    <Paper sx={{ p: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar
                            src={usuarioAttrs?.profilepic?.data ? usuarioAttrs.profilepic.data.attributes?.url : usuarioAttrs?.profilepic ?? undefined}
                            alt={usuarioAttrs?.username}
                          >
                            {usuarioAttrs?.username?.charAt?.(0)?.toUpperCase() ?? "U"}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 700 }}>{usuarioAttrs?.username || usuarioAttrs?.nombre || `Usuario ${s.usuario?.id ?? ""}`}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {grams} g • {gramsToOz(grams)} oz • {plantasCount} plantas
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Solicitada: {fechaSolicitada ? new Date(fechaSolicitada).toLocaleString() : "—"}
                            </Typography>
                          </Box>
                        </Stack>

                        <Stack direction="row" spacing={1}>
                          <Button variant="contained" color="success" onClick={() => openEntregaDialog(s)} startIcon={<CheckCircle />}>
                            Marcar como entregada
                          </Button>
                          <Button variant="outlined" color="error" onClick={() => openRechazoDialog(s)} startIcon={<Cancel />}>
                            Rechazar
                          </Button>
                        </Stack>
                      </Stack>
                      {/* opcional: mostrar lista de plantas relacionadas */}
                      {s.plantas && s.plantas.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" color="text.secondary">Plantas solicitadas:</Typography>
                          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                            {s.plantas.map((p) => {
                              const pid = p.id ?? p.attributes?.id;
                              const nombre = p.attributes?.nombre ?? p.attributes?.codigo ?? `Planta ${pid}`;
                              return (
                                <Button key={pid} size="small" onClick={() => navigate(`/plantas/${pid}`)} sx={{ textTransform: "none" }}>
                                  {nombre}
                                </Button>
                              );
                            })}
                          </Stack>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Stack>
      </Paper>

      {/* DIALOG: Entrega */}
      <Dialog open={openEntrega} onClose={() => setOpenEntrega(false)} fullWidth maxWidth="sm">
        <DialogTitle>Confirmar entrega</DialogTitle>
        <DialogContent>
          {currentSolicitud && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="subtitle2">
                Usuario: {currentSolicitud.usuario?.attributes?.username ?? currentSolicitud.usuario?.username ?? `Usuario ${currentSolicitud.usuario?.id ?? ""}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gramos solicitados: <strong>{Number(currentSolicitud.gramos ?? currentSolicitud.attributes?.gramos ?? 0)}</strong> g
                {" — "} {gramsToOz(Number(currentSolicitud.gramos ?? currentSolicitud.attributes?.gramos ?? 0))} oz
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Plantas: {(currentSolicitud.plantas || []).length}
              </Typography>

              <TextField
                multiline
                rows={3}
                label="Observaciones (opcional)"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />

              <Box>
                <Typography variant="body2">Fotos / Evidencias (opcional)</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center">
                  <Button variant="contained" component="label" startIcon={<PhotoCamera />}>
                    Seleccionar fotos
                    <input hidden multiple accept="image/*" type="file" onChange={onSelectFiles} />
                  </Button>
                  <Stack direction="row" spacing={1}>
                    {previews.map((src, i) => (
                      <Avatar key={i} src={src} variant="rounded" sx={{ width: 56, height: 56 }} />
                    ))}
                  </Stack>
                </Stack>
              </Box>

              {actionError && <Alert severity="error">{actionError}</Alert>}
              {processing && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={20} />
                  <Typography variant="caption">Procesando entrega...</Typography>
                </Stack>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenEntrega(false)}>Cancelar</Button>
          <Button onClick={handleConfirmEntrega} variant="contained" color="success" disabled={processing}>
            Confirmar entrega
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG: Rechazo */}
      <Dialog open={openRechazo} onClose={() => setOpenRechazo(false)} fullWidth maxWidth="sm">
        <DialogTitle>Rechazar solicitud</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2">Por favor indica el motivo del rechazo. Se creará un registro de bitácora con estado <strong>rechazada</strong>.</Typography>
            <TextField
              multiline
              rows={4}
              label="Motivo de rechazo"
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
            />
            {actionError && <Alert severity="error">{actionError}</Alert>}
            {processingRechazo && <Box sx={{ display: "flex", alignItems: "center" }}><CircularProgress size={20} sx={{ mr: 1 }} />Procesando rechazo...</Box>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRechazo(false)}>Cancelar</Button>
          <Button onClick={handleConfirmRechazo} variant="contained" color="error" disabled={processingRechazo}>
            Confirmar rechazo
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}

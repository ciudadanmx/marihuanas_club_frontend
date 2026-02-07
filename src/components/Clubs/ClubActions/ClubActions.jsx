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
import { Refresh, Clear } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useRoles } from "../../../Contexts/RolesContext.jsx";

import {
  uploadFilesToStrapi,
  getStrapiFileId,
  ensureUsuarioId,
  normalizeClub,
  fetchExistingPlantCount,
  fetchHasOpenSolicitud,
  generarCodigoPlanta,
  STRAPI_URL,
} from "@/utils";

import ClubHeader from './ClubHeader.jsx';
import HorariosBlock from './HorariosBlock.jsx';
import RegistroForm from './RegistroForm.jsx';

const MotionPaper = motion(Paper);
const DEFAULT_NUM_PLANTAS_FALLBACK = 6;


export default function ClubActions({ accion = "ingresarsemillas", params = "", user = null }) {
  // CONTEXT / HOOKS
  const { userData, fetchRolesYMembresia } = useRoles();
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  // ESTADOS PRINCIPALES
  const [club, setClub] = useState(null); // club normalizado
  const [clubLoading, setClubLoading] = useState(false);
  const [clubError, setClubError] = useState(null);

  // formulario
  const [fechaSolicitada, setFechaSolicitada] = useState("");
  const [numSemillas, setNumSemillas] = useState(1);
  const [files, setFiles] = useState([]); // archivos seleccionados
  const [previews, setPreviews] = useState([]); // base64 previews
  const [acepto, setAcepto] = useState(false);

  // UI / proceso
  const [sending, setSending] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  // checks relacionados a plantas/solicitudes
  const [existingPlantCount, setExistingPlantCount] = useState(null);
  const [hasOpenSolicitud, setHasOpenSolicitud] = useState(false);

  const fetchingClubRef = useRef(false);
  const rawClub = useMemo(() => userData?.club ?? null, [userData]);

  // DERIVADOS
  const allowedPlants = Number(userData?.plantas ?? null);
  const remainingPlants = useMemo(() => {
    if (allowedPlants == null || existingPlantCount == null) return null;
    return Math.max(0, allowedPlants - existingPlantCount);
  }, [allowedPlants, existingPlantCount]);

  /* -------------------------
     EFECTO: normalizar club
     - usa normalizeClub helper para cubrir todas las formas que puede traer RolesContext
     ------------------------- */
useEffect(() => {
  setClubError(null);

  if (!rawClub) {
    setClub(null);
    return;
  }

  setClubLoading(true);

  try {
    // Si ya trae id + nombre_club, asumimos que está listo
    const normalized =
      rawClub?.id && rawClub?.nombre_club
        ? rawClub
        : normalizeClub(rawClub);

    setClub(normalized);
  } catch (err) {
    setClubError(String(err?.message || err));
    setClub(null);
  } finally {
    setClubLoading(false);
  }
}, [rawClub]);

  /* -------------------------
     EFECTO: previews de archivos (FileReader -> base64)
     - compacto y seguro: Promise.all
     ------------------------- */
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
    Promise.all(readers).then((results) => {
      if (mounted) setPreviews(results);
    });
    return () => {
      mounted = false;
    };
  }, [files]);

  /* -------------------------
     EFECTO: obtener contadores / flags según acción
     - fetchExistingPlantCount / fetchHasOpenSolicitud viven en helpers
     ------------------------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      setExistingPlantCount(null);
      setHasOpenSolicitud(false);
      setError(null);
      const email = (user && user.email) || userData?.email;
      if (!email) return;
      try {
        if (accion === "ingresarsemillas") {
          const count = await fetchExistingPlantCount(email);
          if (mounted) setExistingPlantCount(count);
        }
        if (accion === "solicitarflores" || accion === "retirarflores") {
          const has = await fetchHasOpenSolicitud(email);
          if (mounted) setHasOpenSolicitud(has);
        }
      } catch (err) {
        // los helpers ya hacen logging; aquí no rompemos la UI
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userData, accion, user]);

  /* -------------------------
     HANDLERS simples
     ------------------------- */
  const onFilesChange = (e) => {
    setMensaje(null);
    setError(null);
    const chosen = Array.from(e.target.files || []);
    setFiles(chosen);
  };

  const clearForm = () => {
    setFiles([]);
    setPreviews([]);
    setAcepto(false);
    setNumSemillas(1);
    setFechaSolicitada("");
    setMensaje(null);
    setError(null);
  };

  /* -------------------------
     ensureUsuarioId wrapper — usa helper ensureUsuarioId
     - helper recibe { user, userData } y devuelve id ó null
     ------------------------- */
  const handleEnsureUsuarioId = async () => {
    return await ensureUsuarioId({ user, userData });
  };

  /* -------------------------
     handleSubmit:
     - lógica central para las 3 acciones (ingresarsemillas, solicitarflores, retirarflores)
     - usa uploadFilesToStrapi + getStrapiFileId + generarCodigoPlanta
     - mantiene compatibilidad con la API Strapi que usas
     ------------------------- */
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setMensaje(null);
    setError(null);

    if (!club) {
      setError("No se encontró el club asociado al usuario.");
      return;
    }
    if (!acepto) {
      setError("Debes aceptar la declaración antes de continuar.");
      return;
    }
    if (!fechaSolicitada) {
      setError("Selecciona la fecha y hora propuestas.");
      return;
    }

    if (accion === "ingresarsemillas" && remainingPlants !== null && remainingPlants <= 0) {
      setError(`Tu solicitud de ingreso de semillas ya ha sido realizada. Solo se pueden ingresar semillas para hasta ${allowedPlants} plantas.`);
      return;
    }

    setSending(true);
    try {
      // 1) subir archivos si aplica
      let uploaded = [];
      if (accion === "ingresarsemillas" && files.length > 0) {
        const uploadResp = await uploadFilesToStrapi(files);
        if (Array.isArray(uploadResp)) uploaded = uploadResp;
        else if (uploadResp?.data) uploaded = uploadResp.data;
        else uploaded = Array.isArray(uploadResp) ? uploadResp : [uploadResp];
      }
      const uploadedIds = (Array.isArray(uploaded) ? uploaded : [uploaded]).map(getStrapiFileId).filter(Boolean);

      // 2) usuario id
      const usuarioId = await handleEnsureUsuarioId();
      const nowISO = new Date().toISOString();
      const requestedISO = new Date(fechaSolicitada).toISOString();

      // 3) lógica por acción
      if (accion === "ingresarsemillas") {
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

        // obtener códigos existentes (hasta 100) para mantener secuencia
        let plantasExistentes = [];
        try {
          const resp = await fetch(
            `${STRAPI_URL}/api/plantas?filters[usuario_email][$eq]=${encodeURIComponent(emailStr)}&pagination[pageSize]=100&fields[0]=codigo`,
            { credentials: "include" }
          );
          if (resp.ok) {
            const json = await resp.json();
            const items = json?.data || [];
            plantasExistentes = items.map((it) => ({ codigo: it?.attributes?.codigo || null })).filter((p) => p.codigo);
          }
        } catch (err) {
          plantasExistentes = [];
        }

        const created = [];
        const baseIndex =
          typeof existingPlantCount === "number" && !Number.isNaN(existingPlantCount)
            ? existingPlantCount
            : plantasExistentes
            ? plantasExistentes.length
            : 0;

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
          plantasExistentes.push({ codigo });
        }

        setMensaje(`Solicitud enviada: ${created.length} plantas creadas. El club confirmará la hora.`);
        clearForm();
        setExistingPlantCount((prev) => (prev == null ? created.length : prev + created.length));
      } else if (accion === "solicitarflores" || accion === "retirarflores") {
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

  /* ============================
     RENDERS DE ESTADO (loading / no club / bloqueos)
     ============================ */

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
              <Button
                startIcon={<Refresh />}
                onClick={async () => {
                  setClubError(null);
                  setClubLoading(true);
                  try {
                    await fetchRolesYMembresia(true);
                    setTimeout(() => setClubLoading(false), 700);
                  } catch (err) {
                    setClubError(String(err.message || err));
                    setClubLoading(false);
                  }
                }}
              >
                Reintentar (refrescar roles)
              </Button>
              <Button color="inherit" startIcon={<Clear />} onClick={() => { setClub(null); setClubError(null); }}>
                Limpiar estado
              </Button>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Si después de reintentar sigue sin aparecer, revisa en Strapi que el usuario tenga la relación <code>club</code> poblada o que
              incluyas <code>populate=club</code> en RolesContext.
            </Typography>
          </Stack>
        </Paper>
      </Box>
    );
  }

  if (accion === "ingresarsemillas" && remainingPlants !== null && remainingPlants <= 0) {
    return (
      <Box sx={{ p: { xs: 1, sm: 2 } }}>
        <MotionPaper initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Ingreso de semillas</Typography>
            <Alert severity="info">
              Tu solicitud de ingreso de semillas ya ha sido realizada — solo se pueden ingresar semillas para hasta {allowedPlants} plantas.
            </Alert>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={() => navigate(-1)}>
                Volver
              </Button>
            </Stack>
          </Stack>
        </MotionPaper>
      </Box>
    );
  }

  if ((accion === "solicitarflores" || accion === "retirarflores") && hasOpenSolicitud) {
    return (
      <Box sx={{ p: { xs: 1, sm: 2 } }}>
        <MotionPaper initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Solicitud de flores</Typography>
            <Alert severity="info">Ya cuentas con una solicitud para ingresar flores.</Alert>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={() => navigate(-1)}>
                Volver
              </Button>
            </Stack>
          </Stack>
        </MotionPaper>
      </Box>
    );
  }

  const reservacion = Boolean(club.reservacion);

  /* ============================
     RENDER PRINCIPAL
     ============================ */
  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <MotionPaper initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36 }} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
        <Stack spacing={2}>
          <ClubHeader club={club} reservacion={reservacion} isSm={isSm} />
          <Divider />
          <HorariosBlock horarios={club.horarios} />

          <RegistroForm
            accion={accion}
            fechaSolicitada={fechaSolicitada}
            setFechaSolicitada={setFechaSolicitada}
            numSemillas={numSemillas}
            setNumSemillas={setNumSemillas}
            onFilesChange={onFilesChange}
            previews={previews}
            acepto={acepto}
            setAcepto={setAcepto}
            sending={sending}
            handleSubmit={handleSubmit}
            clearForm={clearForm}
            allowedPlants={allowedPlants}
            existingPlantCount={existingPlantCount}
            remainingPlants={remainingPlants}
          />

          {error && <Alert severity="error">{error}</Alert>}
          {mensaje && <Alert severity="success">{mensaje}</Alert>}

          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<Refresh />}
              onClick={async () => {
                setClubError(null);
                setClubLoading(true);
                try {
                  await fetchRolesYMembresia(true);
                  setTimeout(() => setClubLoading(false), 700);
                } catch (err) {
                  setClubError(String(err.message || err));
                  setClubLoading(false);
                }
              }}
            >
              Reintentar datos
            </Button>
            <Button color="inherit" onClick={() => navigate(-1)}>
              Volver
            </Button>
          </Stack>
        </Stack>
      </MotionPaper>
    </Box>
  );
}

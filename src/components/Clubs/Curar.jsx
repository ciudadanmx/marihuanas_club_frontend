// Curar.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Slider,
  IconButton,
  Button,
  Alert,
  Stack,
  Avatar,
  Paper,
} from "@mui/material";
import { Add, Remove, PhotoCamera } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useRoles } from "../../Contexts/RolesContext";
import sinImagen from "../../assets/placeholders/sinimagen.jpg";

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL;

/**
 * Helper: subir archivos a Strapi (multipart/form-data)
 * Devuelve array de objetos subidos (tal cual responde Strapi: [{id, ...}, ...])
 * Nota: si tienes un helper global (uploadFilesToStrapi) puedes reemplazarlo.
 */
async function uploadFilesToStrapiLocal(files = []) {
  if (!files || files.length === 0) return [];
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));
  // si Strapi está protegido por auth/cookies, la llamada debe llevar credentials: "include"
  const res = await fetch(`${STRAPI_URL}/api/upload`, {
    method: "POST",
    body: fd,
    credentials: "include",
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Error subiendo archivos: ${res.status} ${txt}`);
  }
  const json = await res.json(); // normalmente json es array
  return json;
}

/**
 * Control de peso (slider + input + botones)
 */
function PesoControl({ value, onChange, max }) {
  const handleInc = () => onChange(Number((Number(value) + 1).toFixed(2)));
  const handleDec = () => onChange(Number(Math.max(0, Number((Number(value) - 1).toFixed(2)))));

  return (
    <Box>
      <Typography variant="subtitle1">Gramos a pasar a curado</Typography>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
        <IconButton onClick={handleDec} size="small">
          <Remove />
        </IconButton>

        <TextField
          type="number"
          value={value}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (Number.isNaN(v)) return onChange(0);
            // limitar entre 0 y max
            const capped = v < 0 ? 0 : v > max ? max : v;
            onChange(Number(capped.toFixed(2)));
          }}
          inputProps={{ step: 0.01, min: 0, max }}
          size="small"
          sx={{ width: 160 }}
        />

        <IconButton onClick={handleInc} size="small">
          <Add />
        </IconButton>

        <Typography variant="caption" sx={{ ml: 2 }}>
          Máx: {max} g
        </Typography>
      </Stack>

      <Slider
        value={Number(value)}
        min={0}
        max={Number(max) || 1}
        step={0.01}
        onChange={(_, v) => onChange(Number(v))}
        sx={{ mt: 1 }}
      />
    </Box>
  );
}

/**
 * Componente principal: Curar
 * Props:
 *  - user: objeto proveniente de armariosMap (id, info, plantas[])
 *  - onDone: callback opcional (ej: cerrar modal / refrescar lista)
 */
export default function Curar({ user, onDone = () => {} }) {
  const navigate = useNavigate();
  const { isJardinero, userData } = useRoles();

  const [imagenes, setImagenes] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [gramosSeleccionados, setGramosSeleccionados] = useState(0);
  const [observaciones, setObservaciones] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Derivados: plantas en secado y totales
  const plantasEnSecado = useMemo(() => {
    if (!user?.plantas) return [];
    return user.plantas.filter((p) => !!p._flags?.secado);
  }, [user]);

  const countSecado = plantasEnSecado.length;

  const totalGramosEnSecado = useMemo(() => {
    return plantasEnSecado.reduce((s, p) => {
      const g = Number(p.gramos_cosechados ?? p.gramos ?? p._peso ?? 0) || 0;
      return s + g;
    }, 0);
  }, [plantasEnSecado]);

  // Inicializar el slider al máximo cuando cambian las plantas/total
  useEffect(() => {
    setGramosSeleccionados(Number((totalGramosEnSecado || 0).toFixed(2)));
  }, [totalGramosEnSecado]);

  // previews de imágenes
  useEffect(() => {
    if (!imagenes || imagenes.length === 0) {
      setPreviews([]);
      return;
    }
    const readers = imagenes.map(
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
  }, [imagenes]);

  const handleSelectImages = (e) => {
    setError("");
    const files = Array.from(e.target.files || []);
    setImagenes(files);
  };

  const esJardinero = !!(isJardinero && typeof isJardinero === "function" ? isJardinero() : isJardinero);

  // Validaciones antes de enviar
  const validar = () => {
    setError("");
    if (!esJardinero) {
      setError("No tienes permisos para realizar esta operación.");
      return false;
    }
    if (!user) {
      setError("Usuario inválido.");
      return false;
    }
    if (countSecado === 0) {
      setError("No hay plantas en secado para este usuario.");
      return false;
    }
    if (!gramosSeleccionados || Number(gramosSeleccionados) <= 0) {
      setError("Ingresa una cantidad de gramos válida (> 0).");
      return false;
    }
    if (Number(gramosSeleccionados) > Number(totalGramosEnSecado)) {
      setError("No puedes pasar más gramos que los disponibles en secado.");
      return false;
    }
    return true;
  };

  // Navegar a merma (por usuario)
  const handleEnviarAMerma = () => {
    navigate(`/plantas/merma?armario=${encodeURIComponent(user.id)}`);
  };

  // Submit principal: actualiza plantas y crea registrobitacora
  const handleSubmit = async () => {
    setError("");
    setSuccessMsg("");
    if (!validar()) return;

    setLoading(true);
    try {
      // 1) subir imágenes si hay
      let uploaded = [];
      if (imagenes.length > 0) {
        uploaded = await uploadFilesToStrapiLocal(imagenes);
      }
      // obtener ids si la respuesta es array de objetos con id
      const mediaIds = (Array.isArray(uploaded) ? uploaded : []).map((u) => u?.id).filter(Boolean);

      // 2) calcular porPlanta (división exacta)
      const divider = countSecado;
      const divisorNumber = Number(divider) || 1;
      const perPlant = Number((Number(gramosSeleccionados) / divisorNumber).toFixed(2)); // 2 decimales

      // 3) preparar updates por planta
      // Para cada planta en secado calculamos:
      // - gramos_curandose = perPlant (sumar si ya tenía algo? asumimos set directo)
      // - resta = gramos_cosechados - perPlant (si <= 0 entonces secado:false, status 'curado')
      // - curado: true (si se pasa > 0)
      // - si queda remanente > 0 => status 'secado-curado'
      const plantUpdatePromises = plantasEnSecado.map(async (pl) => {
        const plantaId = pl.id ?? pl.attributes?.id;
        const origGramos = Number(pl.gramos_cosechados ?? pl.gramos ?? pl._peso ?? 0) || 0;
        const assigned = perPlant;

        // if assigned <= 0, skip
        if (assigned <= 0) return { id: plantaId, ok: true, data: null };

        const remaining = Number((origGramos - assigned).toFixed(2));
        const nuevaSecado = remaining > 0; // si queda algo en secado
        const nuevoStatus = nuevaSecado ? "secado-curado" : "curado";

        // construimos payload (ten en cuenta los nombres de campo en tu Strapi)
        const updatePayload = {
          data: {
            gramos_curandose: assigned,
            curado: true,
            secado: nuevaSecado,
            status: nuevoStatus,
          },
        };

        // Ejecutar PUT a Strapi
        const res = await fetch(`${STRAPI_URL}/api/plantas/${plantaId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updatePayload),
        });

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Error actualizando planta ${plantaId}: ${res.status} ${txt}`);
        }
        const j = await res.json();
        return { id: plantaId, ok: true, data: j };
      });

      // Ejecutar updates en paralelo
      const updatesResults = await Promise.allSettled(plantUpdatePromises);

      // detectar errores
      const errors = updatesResults.filter((r) => r.status === "rejected").map((r) => r.reason?.toString?.() ?? r.reason);
      if (errors.length > 0) throw new Error(`Error al actualizar plantas: ${errors.join("; ")}`);

      // 4) crear registro en registrosbitacoras
      // construir texto descriptivo
      const plantasIds = plantasEnSecado.map((p) => p.id ?? p.attributes?.id);
      const texto = `Operacion: pasar a curado\nUsuario (armario): ${user.id}\nPlantas involucradas: ${plantasIds.join(", ")}\nGramos totales pasados: ${gramosSeleccionados} g\nGramos por planta (división en ${divider}): ${perPlant} g\nObservaciones: ${observaciones || "-"}`;

      // usuarioId: intentar usar userData.id (si viene del contexto)
      const usuarioId = userData?.id ?? null;
      const usuario_email = userData?.email ?? null;

      // club: intentar obtener desde la primera planta o user.info.club si existe
      const clubId =
        // planta puede venir con attributes.club.data.id
        (plantasEnSecado[0]?.attributes?.club?.data?.id ??
          plantasEnSecado[0]?.attributes?.club ??
          plantasEnSecado[0]?.club ??
          user?.info?.club) ??
        null;

      const bitacoraPayload = {
        data: {
          tipo: "curado",
          texto,
          observaciones,
          media: mediaIds,
          timestamp: new Date().toISOString(),
          registrojardinero: true,
          usuario: usuarioId,
          usuario_email,
          club: clubId,
          plantas: plantasIds,
        },
      };

      const bitRes = await fetch(`${STRAPI_URL}/api/registrosbitacoras`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(bitacoraPayload),
      });

      if (!bitRes.ok) {
        const txt = await bitRes.text();
        throw new Error(`Error creando registro: ${bitRes.status} ${txt}`);
      }
      const bitJson = await bitRes.json();

      // Éxito
      setSuccessMsg(`Se pasaron ${gramosSeleccionados} g a curado (≈ ${perPlant} g/planta).`);
      setError("");
      setImagenes([]);
      setPreviews([]);
      setObservaciones("");

      // callback para refrescar data externa
      onDone && onDone({ success: true, registro: bitJson?.data });

    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  // Render de permisos / errores
  if (!user) return <Alert severity="error">Usuario inválido</Alert>;
  if (!esJardinero) return <Alert severity="error">No tienes permisos para curar plantas</Alert>;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 56, height: 56 }}>
              {user.info?.username?.charAt(0)?.toUpperCase() ?? "U"}
            </Avatar>
            <Box>
              <Typography variant="h6">Pasar a Curado — {user.info?.username || `Usuario ${user.id}`}</Typography>
              <Typography variant="caption" color="text.secondary">
                Plantas en secado: {countSecado} • Total en secado: {totalGramosEnSecado} g
              </Typography>
            </Box>
          </Stack>

          {/* Control de gramos a pasar */}
          <PesoControl
            value={gramosSeleccionados}
            onChange={setGramosSeleccionados}
            max={totalGramosEnSecado}
          />

          {/* Mostrar cálculo por planta */}
          <Typography variant="body2" color="text.secondary">
            Gramos por planta (≈):{" "}
            {countSecado > 0 ? (Number(gramosSeleccionados) / countSecado).toFixed(2) : "0.00"} g
          </Typography>

          {/* Observaciones */}
          <TextField
            multiline
            rows={3}
            label="Observaciones (opcional)"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />

          {/* Upload imágenes */}
          <Box>
            <Typography>Fotos / Evidencias (opcional)</Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
              <Button variant="contained" component="label" startIcon={<PhotoCamera />}>
                Seleccionar fotos
                <input hidden multiple accept="image/*" type="file" onChange={handleSelectImages} />
              </Button>
              <Stack direction="row" spacing={1}>
                {previews.map((src, i) => (
                  <Avatar
                    key={i}
                    src={src}
                    variant="rounded"
                    sx={{ width: 64, height: 64, borderRadius: 1 }}
                  />
                ))}
                {/* si no hay previews, mostrar la primera planta como referencia */}
                {previews.length === 0 && plantasEnSecado[0] && (
                  <Avatar
                    src={plantasEnSecado[0]._mediaUrl || sinImagen}
                    variant="rounded"
                    sx={{ width: 64, height: 64, borderRadius: 1 }}
                  />
                )}
              </Stack>
            </Stack>
          </Box>

          {/* error / success */}
          {error && <Alert severity="error">{error}</Alert>}
          {successMsg && <Alert severity="success">{successMsg}</Alert>}

          {/* acciones */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="flex-end">
            <Button onClick={handleEnviarAMerma} color="warning" variant="outlined">
              Enviar a merma
            </Button>
            <Button onClick={() => navigate(-1)} variant="text">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading} variant="contained" color="success">
              {loading ? "Procesando..." : "Pasar a curado"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </motion.div>
  );
}

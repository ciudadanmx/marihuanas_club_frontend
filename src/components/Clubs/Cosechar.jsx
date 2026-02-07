// components/Clubs/Cosechar.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Slider,
  IconButton,
  Switch,
  Button,
  Alert,
  Stack,
  Avatar,
} from "@mui/material";
import { Add, Remove, PhotoCamera } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useRoles } from "../../Contexts/RolesContext";
import { uploadFilesToStrapi, getStrapiFileId, ensureUsuarioId } from "@/utils";

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL;

/**
 * ===================================================
 * Helper UI: control de peso con botones y slider
 * ===================================================
 */
function PesoControl({ peso, onChange }) {
  const handleInc = () => onChange(Number((Number(peso) + 1).toFixed(1)));
  const handleDec = () => {
    const n = Number((Number(peso) - 1).toFixed(1));
    onChange(n < 0 ? 0 : n);
  };

  return (
    <Box>
      <Typography>Peso cosechado (g)</Typography>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
        <IconButton onClick={handleDec} size="small">
          <Remove />
        </IconButton>
        <TextField
          type="number"
          value={peso}
          onChange={(e) => {
            const v = Number(e.target.value);
            onChange(Number.isNaN(v) ? 0 : v);
          }}
          inputProps={{ step: 0.1, min: 0 }}
          size="small"
          sx={{ width: 120 }}
        />
        <IconButton onClick={handleInc} size="small">
          <Add />
        </IconButton>
      </Stack>
      <Slider
        value={Number(peso)}
        min={0}
        max={5000}
        step={0.1}
        onChange={(_, v) => onChange(Number(v))}
        sx={{ mt: 1 }}
      />
    </Box>
  );
}

/**
 * ===================================================
 * Helper UI: switches para secado / merma
 * ===================================================
 */
function EstadoSwitches({ secado, setSecado, merma, setMerma }) {
  return (
    <Stack direction="row" spacing={4} sx={{ mt: 2 }}>
      <Box>
        <Typography>Pasar a secado</Typography>
        <Switch
          checked={secado}
          onChange={(e) => {
            const val = !!e.target.checked;
            setSecado(val);
            setMerma(!val);
          }}
        />
      </Box>
      <Box>
        <Typography>Desechada (merma)</Typography>
        <Switch
          checked={merma}
          onChange={(e) => {
            const val = !!e.target.checked;
            setMerma(val);
            setSecado(!val);
          }}
        />
      </Box>
    </Stack>
  );
}

/**
 * ===================================================
 * Componente principal: Cosechar
 * - usa helpers de /utils para upload y user id
 * - comentarios en español y estructura modular
 * ===================================================
 */
export default function Cosechar({ user, cosechaid }) {
  // Contexto / permisos
  const { isJardinero, userData } = useRoles();

  // Estados locales
  const [planta, setPlanta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [peso, setPeso] = useState(0);
  const [observaciones, setObservaciones] = useState("");
  const [fechaCortada, setFechaCortada] = useState("");
  const [secado, setSecado] = useState(true);
  const [merma, setMerma] = useState(false);
  const [imagenes, setImagenes] = useState([]);
  const [previews, setPreviews] = useState([]);

  // derivado: id del club asociado a la planta (según shape de Strapi)
  const plantaClubId = useMemo(() => {
    // soporta shape: planta.attributes.club.data.id o planta.attributes.club
    if (!planta) return null;
    return planta?.attributes?.club?.data?.id ?? planta?.attributes?.club ?? null;
  }, [planta]);

  // Fetch de la planta por ID (simple, directo)
  useEffect(() => {
    let mounted = true;
    const fetchPlanta = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${STRAPI_URL}/api/plantas/${cosechaid}?populate=club`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Planta no encontrada (HTTP ${res.status})`);
        const json = await res.json();
        if (mounted) setPlanta(json.data);
      } catch (e) {
        if (mounted) setError(String(e?.message || e));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPlanta();
    return () => {
      mounted = false;
    };
  }, [cosechaid]);

  // Generar previews cuando se seleccionan imágenes
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

  // Handler para seleccionar imágenes
  const onSelectImages = (e) => {
    setError("");
    const files = Array.from(e.target.files || []);
    setImagenes(files);
  };



  /* ------------------------
   Normalizadores robustos
   ------------------------ */

// Extrae un id de un "club" que puede venir en varias formas:
// - { data: { id: 3, attributes: {...} } }
// - { id: 3, attributes: {...} }
// - 3
// - { activo: true, ... } (si viene todo el objeto del club en userData)
const getClubIdFromPossibleShape = (maybeClub) => {
  if (!maybeClub) return null;

  // Si es número o string (id directo)
  if (typeof maybeClub === "number" || typeof maybeClub === "string") {
    return maybeClub;
  }

  // Si tiene .data?.id (forma Strapi populate)
  if (maybeClub?.data?.id) return maybeClub.data.id;

  // Si tiene id directo
  if (maybeClub?.id) return maybeClub.id;

  // Si viene como attributes con id dentro
  if (maybeClub?.attributes?.id) return maybeClub.attributes.id;

  // A veces tu context guarda club completo en userData.club (con campos)
  // Si dentro hay un campo id o clubid lo tomamos
  if (maybeClub?.clubid) return maybeClub.clubid;
  if (maybeClub?.clubId) return maybeClub.clubId;

  // fallback null
  return null;
};

/* ------------------------
   Valores derivados (usar en los checks)
   ------------------------ */

// Booleano seguro si es jardinero
const esJardinero = !!isJardinero();

// Id del club del usuario (normalizado)
const userClubId = React.useMemo(() => {
  // userData puede contener el club directamente (userData.club) o un club id distinto
  return getClubIdFromPossibleShape(userData?.club ?? userData);
}, [userData]);

// Id del club de la planta (normalizado)
const plantaClubIdRobusta = React.useMemo(() => {
  // planta viene como json.data (Strapi). Su club suele estar en planta.attributes.club
  return getClubIdFromPossibleShape(planta?.attributes?.club ?? planta?.attributes ?? planta);
}, [planta]);




  // Validaciones simples antes de enviar
// Validaciones simples antes de enviar
const validarAntesDeEnviar = () => {
  if (!peso || Number(peso) <= 0) {
    setError("Debes ingresar el peso cosechado en gramos");
    return false;
  }

  if (!fechaCortada) {
    setError("Debes ingresar la fecha y hora de corte");
    return false;
  }

  if (!planta) {
    setError("Planta inválida");
    return false;
  }

  // obtener ids ya normalizados
  const plantaClubId = plantaClubIdRobusta;
  const userClub = userClubId;

  // si no tenemos ids no podemos validar aún (posible carga)
  if (!plantaClubId || !userClub) {
    setError("No se pudo validar el club (datos incompletos)");
    // no bloquear de forma agresiva — devuelve false para que el caller no continúe
    return false;
  }

  // validación final
  const mismoClub = String(userClub) === String(plantaClubId);
  if (!esJardinero || !mismoClub) {
    setError("No tienes permisos para cosechar esta planta");
    console.log("DEBUG permisos:", {
      esJardinero,
      userClub,
      plantaClubId,
      userDataSample: userData ? JSON.stringify({ club: userData.club?.data?.id ?? userData.club ?? null, isJardinero: userData.isJardinero }, null, 2) : null
    });
    return false;
  }

  return true;
};





  // Subida y guardado (usa helpers ya creados)
  const handleSubmit = async () => {
    setError("");
    if (!validarAntesDeEnviar()) return;

    try {
      // 1) subir imágenes si hay (usamos helper uploadFilesToStrapi)
      let uploaded = [];
      if (imagenes.length > 0) {
        const uploadResp = await uploadFilesToStrapi(imagenes);
        // normalize response: helper puede devolver {data} o array
        if (Array.isArray(uploadResp)) uploaded = uploadResp;
        else if (uploadResp?.data) uploaded = uploadResp.data;
        else uploaded = Array.isArray(uploadResp) ? uploadResp : [uploadResp];
      }
      const mediaIds = (Array.isArray(uploaded) ? uploaded : [uploaded]).map(getStrapiFileId).filter(Boolean);

      // 2) determinar status: secado o merma
      const status = secado ? "secando" : "merma";

      // 3) construir observaciones finales
      const observacionesFinal = `Peso cosechado: ${peso} g\n------------------------\n${observaciones || ""}`;

      // 4) obtener usuarioId (helper)
      const usuarioId = await ensureUsuarioId({ user, userData });

      // 5) crear bitácora
      const bitacoraPayload = {
        data: {
          observaciones: observacionesFinal,
          media: mediaIds,
          timestamp: new Date().toISOString(),
          status,
          peso_gramos: peso,
          usuario: usuarioId,
          usuario_email: user?.email || userData?.email,
          club: plantaClubId,
          registroJardinero: true,
          plantas: [planta.id],
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
        throw new Error(`Error creando bitácora: ${bitRes.status} ${txt}`);
      }

      const bitJson = await bitRes.json();
      const bitacoraId = bitJson?.data?.id;

      // 6) actualizar la planta con la cosecha
      const updatePayload = {
        data: {
          status,
          secado,
          viva: false,
          curado: false,
          fecha_cortada: fechaCortada,
          gramos_cosechados: peso,
          cosecha: bitacoraId,
        },
      };

      const updRes = await fetch(`${STRAPI_URL}/api/plantas/${planta.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatePayload),
      });

      if (!updRes.ok) {
        const txt = await updRes.text();
        throw new Error(`Error actualizando planta: ${updRes.status} ${txt}`);
      }

      // éxito
      setError("");
      alert("Cosecha registrada correctamente 🌿");
      // reset form mínimo
      setPeso(0);
      setObservaciones("");
      setFechaCortada("");
      setImagenes([]);
      setPreviews([]);
    } catch (e) {
      setError(String(e?.message || "Error al guardar la cosecha"));
    }
  };

  // RENDERS de estado
  if (loading) return <Typography>Cargando...</Typography>;
  if (error && !planta) return <Alert severity="error">{error}</Alert>;

  // permisos extra: si no es jardinero o no pertenece al club, mostrar error
if (!esJardinero || !userClubId || !plantaClubIdRobusta || String(userClubId) !== String(plantaClubIdRobusta)) {
  return <Alert severity="error">No tienes permisos para cosechar esta planta</Alert>;
}

  // RENDER principal
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Box sx={{ p: 3 }}>
        {/* Header simple con id/codigo de planta */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Avatar sx={{ width: 56, height: 56 }}>{planta?.attributes?.codigo?.charAt(0) ?? "P"}</Avatar>
          <Box>
            <Typography variant="h5">Cosechar Planta</Typography>
            <Typography variant="caption" color="text.secondary">
              Código: {planta?.attributes?.codigo || planta?.id}
            </Typography>
          </Box>
        </Stack>

        {/* Control de peso */}
        <PesoControl peso={peso} onChange={setPeso} />

        {/* Fecha de corte */}
        <TextField
          fullWidth
          type="datetime-local"
          label="Fecha y hora de corte"
          InputLabelProps={{ shrink: true }}
          value={fechaCortada}
          onChange={(e) => setFechaCortada(e.target.value)}
          sx={{ mt: 2 }}
        />

        {/* Observaciones */}
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Observaciones"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          sx={{ mt: 2 }}
        />

        {/* Switches secado / merma */}
        <EstadoSwitches secado={secado} setSecado={setSecado} merma={merma} setMerma={setMerma} />

        {/* Upload imágenes (opcional) */}
        <Box sx={{ mt: 2 }}>
          <Typography>Fotos (opcional)</Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            <Button variant="contained" component="label" startIcon={<PhotoCamera />}>
              Seleccionar fotos
              <input hidden multiple accept="image/*" type="file" onChange={onSelectImages} />
            </Button>
            {/* previews inline */}
            <Stack direction="row" spacing={1}>
              {previews.map((src, i) => (
                <Avatar key={i} src={src} variant="rounded" sx={{ width: 64, height: 64, borderRadius: 1 }} />
              ))}
            </Stack>
          </Stack>
        </Box>

        {/* Mensaje de error */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* Acción final */}
        <Button variant="contained" color="success" sx={{ mt: 3 }} onClick={handleSubmit}>
          Guardar Cosecha
        </Button>
      </Box>
    </motion.div>
  );
}

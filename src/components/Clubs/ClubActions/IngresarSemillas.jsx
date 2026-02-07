import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Avatar,
  CircularProgress,
  Typography,
  IconButton,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { motion } from "framer-motion";

/**
 * IngresarSemillas
 * Props: { idplanta }
 *  - idplanta: ID de la planta en Strapi (v4)
 *
 * Nuevos requisitos implementados:
 *  1) Valida que la planta exista en Strapi antes de mostrar el formulario. Si no existe muestra un mensaje y no renderiza el formulario.
 *  2) Agrega un segundo input de archivos para "Acta de semillas firmada" que se sube al campo 'documentos'.
 *  3) Después de crear el registro en registrosbitacoras, actualiza la planta:
 *     - Si recibida === true (por defecto), pone plant.status = "recibidas" y mantiene semilla = true
 *     - Si recibida === false (usuario desactiva), pone plant.status = "semilladescartada", semilla = false y la deja en draft (unpublish)
 *
 * Ajusta nombres de campos según tu modelo de Strapi si fueran diferentes.
 */

export default function IngresarSemillas({ idplanta }) {
  const STRAPI = process.env.REACT_APP_STRAPI_URL || "";
  const STRAPI_TOKEN = process.env.REACT_APP_STRAPI_TOKEN || null; // opcional: token con permisos para crear/editar

  const [loading, setLoading] = useState(true);
  const [plant, setPlant] = useState(null); // datos de la planta traída de Strapi
  const [existsError, setExistsError] = useState(null);

  // Form state
  // Por defecto la opción debe venir activada (recibida = true)
  const [recibida, setRecibida] = useState(true);
  const [observaciones, setObservaciones] = useState("");
  const [photoFiles, setPhotoFiles] = useState([]); // fotos
  const [docFiles, setDocFiles] = useState([]); // acta firmada u otros docs
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function checkPlant() {
      try {
        if (!STRAPI) throw new Error("REACT_APP_STRAPI_URL no está configurada");
        if (!idplanta) throw new Error("No se recibió idplanta por props");

        const headers = {};
        if (STRAPI_TOKEN) headers["Authorization"] = `Bearer ${STRAPI_TOKEN}`;

        // Consultar la planta por id
        const res = await fetch(`${STRAPI}/api/plantas/${idplanta}?populate=*`, { headers });
        if (!res.ok) {
          if (res.status === 404) throw new Error("Planta no encontrada");
          else throw new Error(`Error al consultar planta: ${res.status}`);
        }

        const json = await res.json();
        const data = json?.data || null;
        if (!data) throw new Error("Planta no encontrada");

        if (!mounted) return;
        setPlant({ id: data.id, ...(data.attributes || {}) });
      } catch (err) {
        console.error(err);
        if (mounted) setExistsError(err.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    checkPlant();
    return () => (mounted = false);
  }, [STRAPI, STRAPI_TOKEN, idplanta]);

  // manejadores de archivos
  function handlePhotoChange(e) {
    const chosen = Array.from(e.target.files || []);
    const next = chosen.map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    setPhotoFiles((prev) => [...prev, ...next]);
  }

  function handleDocChange(e) {
    const chosen = Array.from(e.target.files || []);
    const next = chosen.map((f) => ({ file: f, name: f.name }));
    setDocFiles((prev) => [...prev, ...next]);
  }

  function removePhoto(index) {
    setPhotoFiles((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      return copy;
    });
  }

  function removeDoc(index) {
    setDocFiles((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  }

  // Helper para subir archivos al endpoint de Strapi (/api/upload)
  async function uploadFiles(list) {
    if (!list || list.length === 0) return [];
    const form = new FormData();
    list.forEach((i) => form.append("files", i.file));

    const headers = {};
    if (STRAPI_TOKEN) headers["Authorization"] = `Bearer ${STRAPI_TOKEN}`;

    const res = await fetch(`${STRAPI}/api/upload`, {
      method: "POST",
      headers, // No establecer 'Content-Type' cuando se usa FormData
      body: form,
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Error subiendo archivos: ${res.status} ${txt}`);
    }

    const uploaded = await res.json();
    // Strapi devuelve un array con objetos de archivo
    return Array.isArray(uploaded) ? uploaded.map((u) => u.id) : (uploaded?.data || []).map((u) => u.id);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!plant || !plant.id) throw new Error("Planta no disponible para relacionar");

      // 1) subir fotos
      const photoIds = await uploadFiles(photoFiles);

      // 2) subir documentos (acta de semillas firmada)
      const docIds = await uploadFiles(docFiles);

      // 3) crear registro de bitácora
      const payload = {
        data: {
          recibida: !!recibida,
          observaciones: observaciones || "",
          plantas: [plant.id],
          ...(photoIds.length ? { media: photoIds } : {}),
          ...(docIds.length ? { documentos: docIds } : {}),
        },
      };

      const headersCreate = { "Content-Type": "application/json" };
      if (STRAPI_TOKEN) headersCreate["Authorization"] = `Bearer ${STRAPI_TOKEN}`;

      const createRes = await fetch(`${STRAPI}/api/registrosbitacoras`, {
        method: "POST",
        headers: headersCreate,
        body: JSON.stringify(payload),
      });

      if (!createRes.ok) {
        const txt = await createRes.text();
        throw new Error(`Error creando registro: ${createRes.status} ${txt}`);
      }

      const created = await createRes.json();

      // 4) actualizar planta según recibida
      // Si recibida === true => status: "recibidas", semilla: true
      // Si recibida === false => status: "semilladescartada", semilla: false, poner a draft (unpublish)
      const plantUpdate = {
        data: {
          status: recibida ? "recibidas" : "semilladescartada",
          semilla: !!recibida,
        },
      };

      // Si se descarta, además solicitamos que quede en draft (no publicada)
      // En Strapi v4, para poner a draft se puede enviar publishedAt: null junto con el update.
      // (Si tu Strapi usa otro campo para publicar, ajústalo)
      const updateBody = recibida
        ? JSON.stringify(plantUpdate)
        : JSON.stringify({ ...plantUpdate, publishedAt: null });

      const headersUpdate = { "Content-Type": "application/json" };
      if (STRAPI_TOKEN) headersUpdate["Authorization"] = `Bearer ${STRAPI_TOKEN}`;

      const updateRes = await fetch(`${STRAPI}/api/plantas/${plant.id}`, {
        method: "PUT",
        headers: headersUpdate,
        body: updateBody,
      });

      if (!updateRes.ok) {
        const txt = await updateRes.text();
        console.warn("Advertencia: fallo al actualizar planta:", updateRes.status, txt);
        // No hacemos throw porque el registro ya fue creado; pero avisamos al usuario
        alert("Registro creado pero falló la actualización de la planta. Revisa logs.");
      } else {
        const updatedPlant = await updateRes.json();
        setPlant({ id: updatedPlant.data.id, ...(updatedPlant.data.attributes || {}) });
      }

      // limpiar vistas
      setObservaciones("");
      photoFiles.forEach((f) => URL.revokeObjectURL(f.preview));
      setPhotoFiles([]);
      setDocFiles([]);

      alert("Registro creado correctamente 🌱");
    } catch (err) {
      console.error(err);
      setError(err.message || String(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 4 }}>
      <CircularProgress />
    </Box>
  );

  // Si la planta no existe, mostrar error y no renderizar el formulario
  if (existsError) {
    return (
      <Box sx={{ maxWidth: 720, mx: "auto", p: 4 }}>
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
          No se puede continuar
        </Typography>
        <Typography>
          {existsError}
        </Typography>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 720, mx: "auto", p: 3, borderRadius: 3, boxShadow: 4 }}>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Registro de semillas para: {plant?.nombre || `Planta ${plant?.id}`}
        </Typography>

        <Typography variant="body2" sx={{ mb: 2 }}>
          ID: {plant?.id}
        </Typography>

        <FormControlLabel
          control={<Switch checked={recibida} onChange={(e) => setRecibida(e.target.checked)} />}
          label={recibida ? "Semilla recibida" : "Semilla no recibida / descartada"}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Observaciones"
          multiline
          minRows={3}
          fullWidth
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Fotos (evidencia)
          </Typography>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
            <label>
              <input accept="image/*" style={{ display: "none" }} multiple type="file" onChange={handlePhotoChange} />
              <Button startIcon={<AddPhotoAlternateIcon />} component="span" sx={{ bgcolor: '#6a00ff', color: 'white', '&:hover': { bgcolor: '#5200cc' } }}>
                Agregar fotos
              </Button>
            </label>

            {photoFiles.map((f, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar variant="rounded" src={f.preview} sx={{ width: 88, height: 64 }} />
                <IconButton size="small" onClick={() => removePhoto(idx)}><DeleteIcon /></IconButton>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Acta de semillas firmada (documento)
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <label>
              <input style={{ display: 'none' }} type="file" onChange={handleDocChange} />
              <Button component="span" sx={{ borderColor: '#00ff6a', color: '#00ff6a' }}>
                Agregar acta firmada
              </Button>
            </label>

            {docFiles.map((d, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">{d.name}</Typography>
                <IconButton size="small" onClick={() => removeDoc(idx)}><DeleteIcon /></IconButton>
              </Box>
            ))}
          </Box>
        </Box>

        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

        <Button type="submit" fullWidth disabled={submitting} startIcon={<SaveIcon />} sx={{ mt: 2, py: 1.4, bgcolor: '#00ff6a', color: '#003300', fontWeight: 'bold', '&:hover': { bgcolor: '#00e65f' } }}>
          {submitting ? 'Guardando…' : 'Guardar registro'}
        </Button>
      </Box>
    </motion.div>
  );
}

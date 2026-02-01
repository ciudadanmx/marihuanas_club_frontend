// IngresarCitaCofeprisModal.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL || "";

export default function IngresarCitaCofeprisModal({
  open,
  onClose,
  rfc,
  onSaved,
}) {
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    if (!fecha || !hora) {
      setError("Debes seleccionar fecha y hora");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fechaCitaISO = new Date(`${fecha}T${hora}:00`).toISOString();

      const findRes = await fetch(
        `${STRAPI_URL}/api/cofepristramites?filters[rfc][$eq]=${encodeURIComponent(
          rfc
        )}`
      );

      if (!findRes.ok) {
        throw new Error("No se pudo buscar el trámite");
      }

      const findJson = await findRes.json();
      const tramite = findJson?.data?.[0];

      if (!tramite) {
        throw new Error("No existe trámite con ese RFC");
      }

      const tramiteId = tramite.id;

      const updateRes = await fetch(
        `${STRAPI_URL}/api/cofepristramites/${tramiteId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              fecha_cita: fechaCitaISO,
              status: "cita cofepris",
            },
          }),
        }
      );

      if (!updateRes.ok) {
        const txt = await updateRes.text();
        console.error("STRAPI UPDATE ERROR:", txt);
        throw new Error("Error guardando fecha");
      }

      if (onSaved) onSaved(fechaCitaISO);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo guardar la fecha de cita");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>📅 Ingresar fecha de cita COFEPRIS</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2">
            RFC: <strong>{rfc}</strong>
          </Typography>

          <TextField
            label="Fecha de la cita"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />

          <TextField
            label="Hora de la cita"
            type="time"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={hora}
            onChange={(e) => setHora(e.target.value)}
          />

          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

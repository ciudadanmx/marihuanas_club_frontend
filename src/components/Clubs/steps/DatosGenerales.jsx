import React, { useEffect, useState } from "react";
import {
  TextField,
  FormControl,
  FormLabel,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Typography,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

const TIPOS = ["cultivo", "consumo", "tienda", "cursos", "comida", "eventos"];

export default function DatosGenerales({ form, setForm, tipo }) {
  // 🔥 NORMALIZACIÓN CLAVE
  const tipoValue = typeof tipo === "string" ? tipo : tipo?.tipo;
  console.log('klubs tipo', tipoValue.tipo);
  const [openModal, setOpenModal] = useState(false);
  const [cultivoHabilitado, setCultivoHabilitado] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    console.log("🔥 klubs INIT tipoValue:", tipoValue);

    setForm((prev) => {
      const tiposPrevios = prev.tipo_club || [];

      if (tipoValue.tipo === "cultivo") {
        return {
          ...prev,
          tipo_club: tiposPrevios.includes("cultivo")
            ? tiposPrevios
            : [...tiposPrevios, "cultivo"],
        };
      }

      if (tipoValue.tipo === "consumo") {
        return {
          ...prev,
          tipo_club: [
            // quitamos cultivo si existía
            ...tiposPrevios.filter((t) => t !== "cultivo" && t !== "consumo"),
            // forzamos consumo
            "consumo",
          ],
        };
      }

      return prev;
    });
  }, [tipoValue, setForm]);

  const handleTipoClick = (t) => {
    console.log("👉 klubs CLICK:", t, "| tipoValue:", tipoValue);
    if (
      (t === "cultivo" && tipoValue.tipo === "cultivo") ||
      (t === "consumo" && tipoValue.tipo === "consumo")
    ) {
      console.log("🔒 klubs tipo bloqueado:", t);
      return;
    }
    

    if (t === "cultivo") {
      
      if (tipoValue.tipo === "cultivo") {
        console.log("🔒 klubs cultivo bloqueado por tipo");
        return;
      }

      if (tipoValue.tipo === "consumo" && !cultivoHabilitado) {
        console.log("💥 klubs ABRIENDO MODAL");
        setOpenModal(true);
        return;
      }
    }

    setForm((prev) => {
      const tiposPrevios = prev.tipo_club || [];
      const nuevos = tiposPrevios.includes(t)
        ? tiposPrevios.filter((x) => x !== t)
        : [...tiposPrevios, t];

      console.log("✅ klubs tipo_club actualizado:", nuevos);
      return { ...prev, tipo_club: nuevos };
    });
  };

  const aceptarPago = () => {
    console.log("💰 klubs Pago aceptado");
    setCultivoHabilitado(true);

    setForm((prev) => ({
      ...prev,
      tipo_club: prev.tipo_club.includes("cultivo")
        ? prev.tipo_club
        : [...prev.tipo_club, "cultivo"],
    }));

    setOpenModal(false);
  };

  // 🧠 HANDLERS CAMPOS TEXTO (AGREGADOS)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <Typography variant="h6">Datos generales del club</Typography>
      <Divider sx={{ mb: 3 }} />

      {/* ==================== CAMPOS AGREGADOS ==================== */}

      <TextField
        fullWidth
        margin="normal"
        label="Nombre del club"
        name="nombre_club"
        value={form.nombre_club || ""}
        onChange={handleChange}
        onFocus={() => setFocusedField("nombre_club")}
        onBlur={() => setFocusedField(null)}
        helperText={
          focusedField === "nombre_club"
            ? "Este es el nombre público con el que se mostrará tu club."
            : " "
        }
      />

      <Typography variant="subtitle1" sx={{ mt: 3 }}>
        Nombre completo del titular
      </Typography>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Nombre(s)"
            name="nombre"
            value={form.nombre || ""}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Apellido paterno"
            name="apellido_paterno"
            value={form.apellido_paterno || ""}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Apellido materno"
            name="apellido_materno"
            value={form.apellido_materno || ""}
            onChange={handleChange}
          />
        </Grid>
      </Grid>

      <TextField
        fullWidth
        margin="normal"
        label="Descripción"
        name="descripcion"
        multiline
        minRows={3}
        value={form.descripcion || ""}
        onChange={handleChange}
      />

      <FormControl color="succes" component="fieldset">
        <FormLabel color="succes">Tipo de club</FormLabel>
        <FormGroup row color="succes">
          {TIPOS.map((t) => {
            const checked = form.tipo_club?.includes(t);
            const disabled =
              (t === "cultivo" && tipoValue.tipo === "cultivo") ||
              (t === "consumo" && tipoValue.tipo === "consumo");

            return (
              <FormControlLabel
                color="success"
                key={t}
                label={t}
                control={
                  <Checkbox
                    checked={checked}
                    disabled={disabled}
                    onClick={(e) => {
                      e.preventDefault(); // 🔥 CLAVE
                      handleTipoClick(t);
                    }}
                    color="success"
                  />
                }
              />
            );
          })}
        </FormGroup>
      </FormControl>

      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Club de cultivo</DialogTitle>
        <DialogContent>
          <Typography>
            Para clubs de cultivo es necesario un pago de{" "}
            <strong>$10,000 MXN</strong>.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={aceptarPago}>
            Aceptar
          </Button>
          <Button onClick={() => setOpenModal(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

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
  FormHelperText,
} from "@mui/material";

const TIPOS = ["cultivo", "consumo", "tienda", "cursos", "comida", "eventos"];

export default function DatosGenerales({ form, setForm, tipo }) {
  // 🔥 NORMALIZACIÓN CLAVE
  const tipoValue = typeof tipo === "string" ? tipo : tipo?.tipo;
  const [openModal, setOpenModal] = useState(false);
  const [cultivoHabilitado, setCultivoHabilitado] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {

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
    //Dependiendo de si es cultivo o consumo muestra condicionalmente el modal de pago, así como la selección de los checkbox
    if (
      (t === "cultivo" && tipoValue.tipo === "cultivo") ||
      (t === "consumo" && tipoValue.tipo === "consumo")
    ) {
      return;
    }
    
    if (t === "cultivo") {
      
      if (tipoValue.tipo === "cultivo") {
        return;
      }

      if (tipoValue.tipo === "consumo" && !cultivoHabilitado) {
        setOpenModal(true);
        return;
      }
    }
    setForm((prev) => {
      const tiposPrevios = prev.tipo_club || [];
      const nuevos = tiposPrevios.includes(t)
        ? tiposPrevios.filter((x) => x !== t)
        : [...tiposPrevios, t];
      return { ...prev, tipo_club: nuevos };
    });
  };

  //Acepta el modal y se selecciona el checkbox
  const aceptarPago = () => {
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
    setForm((prev) => {
      const updated = { ...prev, [name]: value }
      updated.nombre_titular = `${updated.nombre || "" } ${updated.apellido_paterno || "" } ${updated.apellido_materno || "" }`
      return updated;
    })
  };

  return (
    <>
      <Typography variant="h6">📝 Datos generales del club</Typography>
      <Divider sx={{ mb: 3 }} />

      {/* ==================== CAMPOS NOMBRES Y DESCRIPCIÓN ==================== */}
      <TextField
        fullWidth
        margin="normal"
        label="Nombre del club"
        name="nombre_club"
        value={form.nombre_club || ""}
        onChange={handleChange}
        onFocus={() => setFocusedField("nombre_club")}
        onBlur={() => setFocusedField(null)}
        color="success"
        helperText={
          focusedField === "nombre_club"
            ? "👉 Éste es el nombre público con el que se mostrará tu club."
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
            onFocus={() => setFocusedField("nombre")}
            onBlur={() => setFocusedField(null)}
            value={form.nombre || ""}
            onChange={handleChange}
            color="success"
            helperText={
              focusedField === "nombre"
                ? "👉 Ingresa tu nombre completo tal cual como aparece en tu identificación."
                : " "
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Apellido paterno"
            name="apellido_paterno"
            value={form.apellido_paterno || ""}
            onChange={handleChange}
            onFocus={() => setFocusedField("apellido_paterno")}
            onBlur={() => setFocusedField(null)}
            color="success"
            helperText={
              focusedField === "apellido_paterno"
                ? "👉 Ingresa tu nombre completo tal cual como aparece en tu identificación."
                : " "
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Apellido materno"
            name="apellido_materno"
            value={form.apellido_materno || ""}
            onChange={handleChange}
            onFocus={() => setFocusedField("apellido_materno")}
            onBlur={() => setFocusedField(null)}
            color="success"
            helperText={
              focusedField === "apellido_materno"
                ? "👉 Ingresa tu nombre completo tal cual como aparece en tu identificación."
                : " "
            }
          />
        </Grid>
      </Grid>

      {/* Campo oculto para enviar o usar en otros pasos */}
      <input
        type="hidden"
        name="nombre_titular"
        value={form.nombre_titular || ""}
      />

      <TextField
        fullWidth
        margin="normal"
        label="Descripción"
        name="descripcion"
        multiline
        minRows={3}
        value={form.descripcion || ""}
        onChange={handleChange}
        onFocus={() => setFocusedField("descripcion")}
        onBlur={() => setFocusedField(null)}
        color="success"
        helperText={
          focusedField === "descripcion"
            ? "👉 Ingresa una descripción pública para tu Club."
            : " "
        }
      />

      <FormControl color="succes" component="fieldset" >
        <FormLabel color="succes" >Tipo de club</FormLabel>
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
                      e.preventDefault(); // 🔥 CLAVE para la lógica de modal y bloquedo
                      handleTipoClick(t);
                    }}
                    color="success"
                  />
                }
              />
            );
          })}
        </FormGroup>
        <FormHelperText>
        👉 Puedes seleccionar más de un tipo de club*
      </FormHelperText>
      </FormControl>

      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Club de cultivo</DialogTitle>
        <DialogContent>
          <Typography>
            Para clubs de cultivo es necesario cubrir un pago de{" "}
            <strong>$10,000 MXN que incluye un kit de cultivo con 3 armarios y otros accesorios de jardinero.</strong>.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="success" variant="contained" onClick={aceptarPago}>
            Aceptar
          </Button>
          <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

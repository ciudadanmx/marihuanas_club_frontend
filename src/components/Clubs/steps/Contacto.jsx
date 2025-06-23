import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Chip,
  Icon,
  InputAdornment,
} from "@mui/material";

const phoneRegex = /^\+52\d{7,14}$/; // regex ajustado a +52

const daysOfWeek = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

const initialHorarios = {
  lunes: { abierto: false, apertura: "09:00", cierre: "18:00" },
  martes: { abierto: false, apertura: "09:00", cierre: "18:00" },
  miercoles: { abierto: false, apertura: "09:00", cierre: "18:00" },
  jueves: { abierto: false, apertura: "09:00", cierre: "18:00" },
  viernes: { abierto: false, apertura: "09:00", cierre: "18:00" },
  sabado: { abierto: false, apertura: "09:00", cierre: "18:00" },
  domingo: { abierto: false, apertura: "09:00", cierre: "18:00" },
};

const initialForm = {
  horarios: initialHorarios,
  whatsapp: "",
  productos: [],
  servicios: [],
};

export default function Contacto({ form: externalForm, setForm: externalSetForm }) {
  const [localForm, setLocalForm] = useState(initialForm);

  useEffect(() => {
    if (externalForm) {
      setLocalForm((f) => ({
        ...externalForm,
        horarios: {
          ...initialHorarios,
          ...(externalForm.horarios || {}),
        },
      }));
    }
  }, [externalForm]);

  const setForm = externalSetForm || setLocalForm;
  const form = externalForm || localForm;

  const [productoInput, setProductoInput] = useState("");
  const [servicioInput, setServicioInput] = useState("");
  const [whatsappError, setWhatsappError] = useState("");

  // Para el input mostramos sólo el número SIN el prefijo +52 (si está presente)
  const whatsappWithoutPrefix = form.whatsapp.startsWith("+52")
    ? form.whatsapp.slice(3)
    : form.whatsapp;

  const handleWhatsappChange = (e) => {
    let val = e.target.value;

    // Limitar sólo números en input
    val = val.replace(/\D/g, "");

    // Actualizamos el form completo con +52 + lo que el usuario escribe
    setForm((f) => ({ ...f, whatsapp: "+52" + val }));

    // Validación con +52 fijo
    if (val.length > 0 && !phoneRegex.test("+52" + val)) {
      setWhatsappError(
        "Número inválido. Debe incluir prefijo internacional +52 y contener sólo números."
      );
    } else {
      setWhatsappError("");
    }
  };

  const handleHorarioChange = (day, field, value) => {
    setForm((f) => ({
      ...f,
      horarios: {
        ...(f.horarios ?? initialHorarios),
        [day]: {
          ...((f.horarios && f.horarios[day]) ?? initialHorarios[day]),
          [field]: value,
        },
      },
    }));
  };

  const addProducto = () => {
    const trimmed = productoInput.trim();
    if (trimmed && !form.productos.includes(trimmed)) {
      setForm((f) => ({ ...f, productos: [...f.productos, trimmed] }));
      setProductoInput("");
    }
  };

  const addServicio = () => {
    const trimmed = servicioInput.trim();
    if (trimmed && !form.servicios.includes(trimmed)) {
      setForm((f) => ({ ...f, servicios: [...f.servicios, trimmed] }));
      setServicioInput("");
    }
  };

  const removeProducto = (index) => {
    setForm((f) => ({
      ...f,
      productos: f.productos.filter((_, i) => i !== index),
    }));
  };

  const removeServicio = (index) => {
    setForm((f) => ({
      ...f,
      servicios: f.servicios.filter((_, i) => i !== index),
    }));
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}>
        WhatsApp de contacto
      </Typography>
      <TextField
        label="Número WhatsApp"
        value={whatsappWithoutPrefix}
        onChange={handleWhatsappChange}
        error={!!whatsappError}
        helperText={
          whatsappError || "Número en formato mexicano, sólo números, sin +52"
        }
        fullWidth
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" sx={{ gap: 0.5 }}>
              <span style={{ fontSize: 24 }}>🇲🇽</span>
              <Typography sx={{ fontWeight: "bold" }}>+52</Typography>
            </InputAdornment>
          ),
        }}
        inputProps={{
          maxLength: 14, // longitud típica sin prefijo
          inputMode: "numeric",
          pattern: "[0-9]*",
        }}
      />

      <Typography variant="h6" mt={4} mb={2}>
        Horarios de atención
      </Typography>
      {daysOfWeek.map((day) => {
        const horario =
          form.horarios?.[day] || {
            abierto: false,
            apertura: "09:00",
            cierre: "18:00",
          };

        return (
          <Box
            key={day}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 1,
              flexWrap: "wrap",
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={horario.abierto}
                  onChange={(e) =>
                    handleHorarioChange(day, "abierto", e.target.checked)
                  }
                />
              }
              label={day.charAt(0).toUpperCase() + day.slice(1)}
            />

            {horario.abierto && (
              <>
                <TextField
                  type="time"
                  label="Apertura"
                  value={horario.apertura}
                  onChange={(e) =>
                    handleHorarioChange(day, "apertura", e.target.value)
                  }
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: 120 }}
                />
                <TextField
                  type="time"
                  label="Cierre"
                  value={horario.cierre}
                  onChange={(e) =>
                    handleHorarioChange(day, "cierre", e.target.value)
                  }
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: 120 }}
                />
              </>
            )}
          </Box>
        );
      })}

      <Typography variant="h6" mt={4} mb={2}>
        Productos
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
        <TextField
          label="Agregar producto"
          value={productoInput}
          onChange={(e) => setProductoInput(e.target.value)}
          fullWidth
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addProducto();
            }
          }}
        />
        <Button variant="contained" onClick={addProducto}>
          Añadir
        </Button>
      </Box>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {form.productos.map((prod, i) => (
          <Chip
            key={i}
            label={prod}
            onDelete={() => removeProducto(i)}
            deleteIcon={<Icon fontSize="small" color="error">delete</Icon>}
            color="success"
          />
        ))}
      </Box>

      <Typography variant="h6" mt={4} mb={2}>
        Servicios
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
        <TextField
          label="Agregar servicio"
          value={servicioInput}
          onChange={(e) => setServicioInput(e.target.value)}
          fullWidth
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addServicio();
            }
          }}
        />
        <Button variant="contained" onClick={addServicio}>
          Añadir
        </Button>
      </Box>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {form.servicios.map((serv, i) => (
          <Chip
            key={i}
            label={serv}
            onDelete={() => removeServicio(i)}
            deleteIcon={<Icon fontSize="small" color="error">delete</Icon>}
            color="primary"
          />
        ))}
      </Box>
    </Box>
  );
}

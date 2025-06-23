// src/components/Clubs/steps/DatosGenerales.jsx
import React from "react";
import {
  TextField,
  FormControl,
  FormLabel,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Typography,
} from "@mui/material";

const tipos = ["cultivo", "tienda", "cursos", "comida", "eventos"];

export default function DatosGenerales({ form, setForm }) {
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTipoChange = (e) => {
    const value = e.target.name;
    const newTipos = form.tipo_club.includes(value)
      ? form.tipo_club.filter((t) => t !== value)
      : [...form.tipo_club, value];
    setForm({ ...form, tipo_club: newTipos });
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>Datos generales del club</Typography>

      <TextField
        fullWidth
        margin="normal"
        label="Nombre del club"
        name="nombre_club"
        value={form.nombre_club}
        onChange={handleChange}
      />

      <TextField
        fullWidth
        margin="normal"
        label="Nombre del titular"
        name="nombre_titular"
        value={form.nombre_titular}
        onChange={handleChange}
      />

      <TextField
        fullWidth
        margin="normal"
        label="Descripción"
        name="descripcion"
        multiline
        minRows={3}
        value={form.descripcion}
        onChange={handleChange}
      />

      <FormControl component="fieldset" margin="normal">
        <FormLabel component="legend">Tipo de club</FormLabel>
        <FormGroup row>
          {tipos.map((tipo) => (
            <FormControlLabel
              key={tipo}
              control={
                <Checkbox
                  checked={form.tipo_club.includes(tipo)}
                  onChange={handleTipoChange}
                  name={tipo}
                />
              }
              label={tipo}
            />
          ))}
        </FormGroup>
      </FormControl>
    </div>
  );
}

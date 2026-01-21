import React, { useState } from "react";
import { Box, Button, Divider, Typography, Input, Grid, TextField } from "@mui/material";

export default function Archivos({ form, setForm, tipo }) {

  const [focusedField, setFocusedField] = useState(null);
  const handleFileChange = (e) => {
    const { name, files } = e.target;

    if (name === "foto_perfil") {
      setForm((f) => ({ ...f, foto_perfil: files[0] }));
    } else if (name === "fotos_club") {
      setForm((f) => ({
        ...f,
        fotos_club: [...f.fotos_club, ...Array.from(files)],
      }));
    }
  };

  const removeFotoClub = (index) => {
    setForm((f) => ({
      ...f,
      fotos_club: f.fotos_club.filter((_, i) => i !== index),
    }));
  };

  // 🧠 HANDLERS CAMPOS TEXTO 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}>
        <u>🖼️ Foto de Portada del Club:</u>
      </Typography>
        
      <Typography variant="body1" mb={2}>
        Selecciona la imagen de portada para el perfil público de tu Club.
      </Typography>

      <Button
        variant="contained"
        component="label"
        sx={{
          backgroundColor: "#9c27b0",
          "&:hover": { backgroundColor: "#7b1fa2" },
        }}
      >
        ⬆️ Subir Foto de Portada:
        <Input
          type="file"
          name="foto_perfil"
          accept="image/*"
          onChange={handleFileChange}
          sx={{ display: "none" }}
        />
      </Button>

      {form.foto_perfil && (
        <Box mt={2}>
          <Typography
            variant="subtitle2"
            sx={{ fontStyle: "italic", color: "#9c27b0", fontSize: "0.85rem" }}
          >
            Vista previa:
          </Typography>
          <img
            src={URL.createObjectURL(form.foto_perfil)}
            alt="Vista previa perfil"
            style={{
              maxWidth: "100%",
              maxHeight: "200px",
              marginTop: "8px",
              borderRadius: 8,
            }}
          />
        </Box>
      )}

      <Divider sx={{ my: 3, borderColor: "rgba(104, 64, 92, 0.57)" }} />

      <Typography variant="h6" mt={4} mb={2}>
        <u>📸 Fotos del Club:</u>
      </Typography>

      <Button
        variant="contained"
        component="label"
        sx={{
          backgroundColor: "#9c27b0",
          "&:hover": { backgroundColor: "#7b1fa2" },
        }}
      >
        ⬆️ Subir Fotos del Club 
        <Input
          type="file"
          name="fotos_club"
          accept="image/*"
          multiple // 🔹 ahora sí permite seleccionar varios archivos
          onChange={handleFileChange}
          sx={{ display: "none" }}
        />
      </Button>
      {/* ✅ */}

      {form.fotos_club.length > 0 && (
        <Grid container spacing={2} mt={2}>
          {form.fotos_club.map((file, index) => (
            <>
              <Grid item xs={6} sm={4} md={3} key={index} position="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`foto-${index}`}
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    objectFit: "cover",
                    height: "150px",
                  }}
                />
                <button
                  onClick={() => removeFotoClub(index)}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    background: "rgba(255,255,255,0.8)",
                    border: "none",
                    borderRadius: "50%",
                    padding: 4,
                    cursor: "pointer",
                  }}
                >
                  <span className="material-icons-outlined" style={{ color: "#d32f2f" }}>
                    ❌ Borrar
                  </span>
                </button>
              </Grid>
              <Divider sx={{ my: 3, borderColor: "rgba(104, 64, 92, 0.57)" }} />
            </>
          ))}
        </Grid>
      )}

      {(tipo.tipo.tipo === 'cultivo' || form.tipo_club?.includes('cultivo' )) && (
        <>
          <Divider sx={{ my: 3, borderColor: "rgba(104, 64, 92, 0.57)" }} />

          <Typography variant="h6" mb={2}>
            <u>FOTOS DEL LUGAR DE CULTIVO (PRIVADAS)</u>
          </Typography>
            
          <Typography variant="body1" mb={2}>
            Sube al menos 5 fotos del lugar 
          </Typography>

          <Button
            variant="contained"
            component="label"
            sx={{
              backgroundColor: "#9c27b0",
              "&:hover": { backgroundColor: "#7b1fa2" },
            }}
          >
            ⬆️ Subir Foto de Portada:
            <Input
              type="file"
              name="foto_perfil"
              accept="image/*"
              onChange={handleFileChange}
              sx={{ display: "none" }}
            />
          </Button>
        </>
      )}

      {tipo.tipo.tipo === 'consumo' && (
        <>
          <Divider sx={{ my: 3, borderColor: "rgba(104, 64, 92, 0.57)" }} />

          <Typography variant="h6" mb={2}>
            <u>Permiso COFEPRIS EN TRÁMITE</u>
          </Typography>
            
          <Typography variant="body1" mb={2}>
            Muestra que tienes iniciado el trámite. 
          </Typography>

         <TextField
            fullWidth
            margin="normal"
            label="Folio de tu Trámite COFEPRIS"
            name="cofepris"
            value={form.cofepris || ""}
            onChange={handleChange}
            onFocus={() => setFocusedField("cofepris")}
            onBlur={() => setFocusedField(null)}
            color="success"
            helperText={
              focusedField === "nombre_club"
                ? "👉 Éste es el nombre público con el que se mostrará tu club."
                : " "
            }
        />
        </>
      )}

    </Box>
  );
}

import React from "react";
import { Box, Typography, Input, Grid } from "@mui/material";

export default function Archivos({ form, setForm }) {
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

  return (
    <Box>
      <Typography variant="h6" mb={2}>
        Foto de perfil
      </Typography>

      <Input
        type="file"
        name="foto_perfil"
        accept="image/*"
        onChange={handleFileChange}
        fullWidth
      />

      {form.foto_perfil && (
        <Box mt={2}>
          <Typography variant="subtitle1">Vista previa:</Typography>
          <img
            src={URL.createObjectURL(form.foto_perfil)}
            alt="Vista previa perfil"
            style={{ maxWidth: "100%", maxHeight: "200px", marginTop: "8px", borderRadius: 8 }}
          />
        </Box>
      )}

      <Typography variant="h6" mt={4} mb={2}>
        Fotos del club
      </Typography>

      <Input
        type="file"
        name="fotos_club"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        fullWidth
      />

      {form.fotos_club.length > 0 && (
        <Grid container spacing={2} mt={2}>
          {form.fotos_club.map((file, index) => (
            <Grid item xs={6} sm={4} md={3} key={index} position="relative">
              <img
                src={URL.createObjectURL(file)}
                alt={`foto-${index}`}
                style={{ width: "100%", borderRadius: 8, objectFit: "cover", height: "150px" }}
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
                  delete
                </span>
              </button>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

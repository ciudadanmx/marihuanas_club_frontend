import React from "react";
import { Box, Avatar, Typography, Button } from "@mui/material";
import SpaIcon from "@mui/icons-material/Spa";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";

const EmptyState = ({ navigate }) => (
  <Box sx={{ py: 4, px: 2, textAlign: "center" }}>
    <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Aún no tienes plantas afiliadas</Typography>
    <Typography sx={{ mb: 2, color: "text.secondary" }}>Sigue estos pasos para iniciar tu primera planta en la red:</Typography>

    <Box sx={{ display: "grid", gap: 12, gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" }, maxWidth: 900, mx: "auto" }}>
      <Box>
        <Avatar sx={{ bgcolor: "#fff9c4", width: 64, height: 64, mx: "auto", mb: 1 }}><SpaIcon sx={{ color: "#5b4b00" }} /></Avatar>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>1. Adopta tu planta</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>Solicita un kit de jardinero o afilia tu club para recibir espacio y asistencia técnica.</Typography>
      </Box>
      <Box>
        <Avatar sx={{ bgcolor: "#e6f7ff", width: 64, height: 64, mx: "auto", mb: 1 }}><PhotoCameraIcon sx={{ color: "#025" }} /></Avatar>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>2. Documenta con fotos</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>Registra fotos periódicas en la bitácora (tipo fotoplanta) para que el jardinero valide y asigne color.</Typography>
      </Box>
      <Box>
        <Avatar sx={{ bgcolor: "#fff0f6", width: 64, height: 64, mx: "auto", mb: 1 }}><PlayCircleOutlineIcon sx={{ color: "#7a0036" }} /></Avatar>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>3. Sube evidencias y empieza</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>Comparte tu link de videos si quieres seguimiento extra y consulta el manual del jardinero.</Typography>
      </Box>
    </Box>

    <Box sx={{ mt: 4 }}>
      <Button variant="contained" color="success" onClick={() => navigate("/clubs/miclub/crear-planta")}>
        Iniciar mi primera planta
      </Button>
    </Box>
  </Box>
);

export default EmptyState;

import React from "react";
import { Box, Typography, Chip, Tooltip } from "@mui/material";
import SpaIcon from "@mui/icons-material/Spa";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const Header = ({ numeroPlantasVivas, fechaProximaCosecha }) => {
  return (
    <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2, flexWrap: "wrap", justifyContent: "space-between" }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Mis Plantas</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>Tu jardín en la red — fotos, estados y enlaces de seguimiento.</Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Chip icon={<SpaIcon />} label={`Plantas vivas: ${numeroPlantasVivas}`} color="success" />
        {fechaProximaCosecha ? (
          <Tooltip title="Fecha estimada próxima cosecha">
            <Chip label={`Próx. cosecha: ${fechaProximaCosecha}`} variant="outlined" />
          </Tooltip>
        ) : (
          <Tooltip title="No hay fecha de próxima cosecha registrada en tu perfil">
            <Chip icon={<ErrorOutlineIcon />} label="Próx. cosecha: —" variant="outlined" />
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export default Header;

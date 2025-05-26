// src/components/Clubs/steps/Confirmacion.jsx
import React from "react";
import { Box, Typography, Button } from "@mui/material";

export default function Confirmacion({ form }) {
  return (
    <Box>
      <Typography variant="h6" mb={2}>
        Confirma la información del club
      </Typography>

      <pre style={{ background: "#f5f5f5", padding: "1em", borderRadius: 4 }}>
        {JSON.stringify(form, null, 2)}
      </pre>

      <Typography variant="body2" mt={2}>
        Si todo está correcto, presiona Enviar.
      </Typography>
    </Box>
  );
}

// src/components/KitItem.jsx
import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Box,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { motion } from "framer-motion";

const PLACEHOLDER_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><rect fill='#f8fafc' width='100%' height='100%'/><g fill='#9ca3af' text-anchor='middle' font-family='Arial'><text x='50%' y='50%' dy='-6' font-size='22'>Imagen no encontrada</text><text x='50%' y='50%' dy='22' font-size='12'>Si faltan imágenes revisa populate=imagen</text></g></svg>`
  );

const KitItem = ({ item }) => {
  const imageToUse = item?.imagenUrl || PLACEHOLDER_SVG;

  return (
    <Accordion
      sx={{
        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        borderRadius: "12px",
        mb: 1,
        overflow: "visible",
        "&:before": { display: "none" },
        "& .MuiCollapse-root": { overflow: "visible" },
        "&.Mui-expanded": { zIndex: 1200, position: "relative" },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
          <Typography sx={{ fontWeight: 800 }}>{item.cantidad} × {item.nombre}</Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ overflow: "visible", display: "block", p: 2 }}>
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} md={4} sx={{ display: "flex", justifyContent: "center", overflow: "visible" }}>
            <Box
              component={motion.img}
              src={imageToUse}
              alt={item.nombre || "Imagen del item"}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.objectFit = "contain";
                e.currentTarget.src = PLACEHOLDER_SVG;
              }}
              whileHover={{ scale: 1.02 }}
              sx={{
                width: { xs: "100%", md: "100%" },
                height: "auto",
                maxHeight: { xs: 360, md: 220 },
                borderRadius: 2,
                objectFit: "cover",
                boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                display: "block",
              }}
            />
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography sx={{ whiteSpace: "pre-line" }}>{item.texto || "No hay descripción para este elemento."}</Typography>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default KitItem;

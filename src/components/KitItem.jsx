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

/**
 * resolveStrapiImage
 * - soporta Strapi v4 (imagen.data.attributes.url)
 * - soporta estructuras comunes: imagen.url, imagen.formats, imagenUrl
 * - si la URL es relativa (empieza con /uploads...) la prefixea con REACT_APP_STRAPI_URL o window.location.origin
 */
const resolveStrapiImage = (imgField) => {
  if (!imgField) return null;

  // si ya tenemos imagenUrl directo
  if (typeof imgField === "string") {
    return maybePrefix(imgField);
  }
  if (imgField.imagenUrl) return maybePrefix(imgField.imagenUrl);

  // Strapi v4: imagen.data (array) o imagen.data.attributes
  if (imgField.data) {
    const data = Array.isArray(imgField.data) ? imgField.data[0] : imgField.data;
    if (!data) return null;
    const attrs = data.attributes ?? data;
    if (!attrs) return null;
    // prefer formats.small > formats.medium > url
    const formats = attrs.formats;
    if (formats && formats.small?.url) return maybePrefix(formats.small.url);
    if (formats && formats.medium?.url) return maybePrefix(formats.medium.url);
    if (attrs.url) return maybePrefix(attrs.url);
  }

  // Strapi v3 style: imgField.formats...
  if (imgField.formats) {
    if (imgField.formats.small?.url) return maybePrefix(imgField.formats.small.url);
    if (imgField.formats.medium?.url) return maybePrefix(imgField.formats.medium.url);
    if (imgField.url) return maybePrefix(imgField.url);
  }

  // direct url property
  if (imgField.url) return maybePrefix(imgField.url);

  return null;
};

const maybePrefix = (url) => {
  if (!url) return null;
  // si ya es absoluto
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // si es relativo, anteponemos la variable de entorno o el origin
  const host =
    process.env.REACT_APP_STRAPI_URL ||
    process.env.REACT_APP_API_URL ||
    window?.location?.origin ||
    "";
  // limpiar doble slash
  return `${host.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
};

const KitItem = ({ item }) => {
  const imageUrl = resolveStrapiImage(item.imagen || item.image || item.imagenes || item);

  return (
    <Accordion
      key={item.id}
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
          <Typography sx={{ fontWeight: 800 }}>
            {item.cantidad} × {item.nombre}
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ overflow: "visible", display: "block", p: 2 }}>
        <Grid container spacing={2} alignItems="flex-start">
          {imageUrl ? (
            <Grid item xs={12} md={4} sx={{ display: "flex", justifyContent: "center", overflow: "visible" }}>
              <Box
                component={motion.img}
                src={imageUrl}
                alt={item.nombre || "Imagen del item"}
                loading="lazy"
                onError={(e) => {
                  console.warn("[KitItem] error cargando imagen:", imageUrl);
                  e.currentTarget.style.objectFit = "contain";
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
          ) : (
            <Grid item xs={12} md={4} />
          )}

          <Grid item xs={12} md={imageUrl ? 8 : 12}>
            <Typography sx={{ whiteSpace: "pre-line" }}>
              {item.texto || "No hay descripción para este elemento."}
            </Typography>

            {item.extraDetalle && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                  {item.extraDetalle}
                </Typography>
              </Box>
            )}

            {Array.isArray(item.imagenes) && item.imagenes.length > 0 && (
              <Box sx={{ mt: 2, display: "grid", gap: 1 }}>
                {item.imagenes.map((src, idx) => (
                  <Box
                    key={idx}
                    component="img"
                    src={maybePrefix(src)}
                    alt={`${item.nombre} - ${idx + 1}`}
                    loading="lazy"
                    onError={(e) => (e.currentTarget.style.objectFit = "contain")}
                    sx={{
                      width: "100%",
                      height: "auto",
                      maxHeight: 500,
                      objectFit: "contain",
                      borderRadius: 1,
                      boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                    }}
                  />
                ))}
              </Box>
            )}
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default KitItem;

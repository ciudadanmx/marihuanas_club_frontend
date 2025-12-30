// src/components/Clubs/MisPlantas/PlantCard.jsx
import React from "react";
import { Grid, Card, Box, Chip, CardContent, Typography, CardActions, Button, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { cardVariants, PLACEHOLDER, firstImageFromMedia } from "./utils";

const PlantCard = ({ g, navigate }) => {
  // g puede venir desde colorSlots o desde fallback: normalizar la imagen
  let computedImg =
    g.imagenUrl ||
    (g.planta ? (g.planta.imagenUrl || firstImageFromMedia(g.planta.media ?? g.planta.imagen ?? g.planta.imagenes ?? null)) : null) ||
    PLACEHOLDER;

  // Si Strapi devuelve rutas relativas (ej: /uploads/...), anteponemos la base si está disponible
  try {
    if (typeof computedImg === "string" && computedImg.startsWith("/")) {
      const base = process.env.REACT_APP_STRAPI_URL || "";
      computedImg = `${base}${computedImg}`;
    }
  } catch (e) {
    // noop
  }

  return (
    <Grid item xs={12} sm={6} md={4}>
      <motion.div initial="initial" animate="enter" whileHover="hover" variants={cardVariants}>
        <Card
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            cursor: "pointer",
            boxShadow: "0 12px 40px rgba(3,10,22,0.07)",
            // asegurar contraste: borde sutil en caso de que g.accent exista
            border: g.accent ? `1px solid ${g.accent}` : undefined,
          }}
          onClick={() => navigate(`/clubs/miclub/misplantas/${encodeURIComponent(g.codigoplanta)}`)}
        >
          {/* Contenedor con padding para que el color de fondo se vea como borde / marco */}
          <Box sx={{ position: "relative", height: 220, background: g.bg ?? "linear-gradient(135deg,#e6e9ee,#bfc7d6)", p: 1.2 }}>
            {/* caja interna con overflow para que la imagen respete el padding y muestre el fondo alrededor */}
            <Box
              sx={{
                width: "100%",
                height: "100%",
                borderRadius: 2,
                overflow: "hidden",
                backgroundColor: "rgba(0,0,0,0.03)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                component="img"
                src={computedImg}
                alt={g.codigoplanta}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = PLACEHOLDER;
                  e.currentTarget.style.objectFit = "contain";
                }}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                  transition: "transform .45s ease",
                }}
              />
            </Box>

            <Chip
              label={g.colorLabel}
              sx={{
                position: "absolute",
                right: 12,
                top: 12,
                bgcolor: "rgba(255,255,255,0.95)",
                fontWeight: 700,
              }}
            />
          </Box>

          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
              {g.planta?.nombre || g.codigoplanta}
            </Typography>

            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
              Estado: <b>{String(g.planta?.viva) === "true" ? "Viva" : "No viva"}</b>
            </Typography>

            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
              Último registro:{" "}
              {g.registro?.createdAt ? new Date(g.registro.createdAt).toLocaleString("es-MX") : "—"}
              {" • "}Código: <code style={{ fontSize: 12 }}>{g.codigoplanta}</code>
            </Typography>
          </CardContent>

          <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/clubs/miclub/misplantas/${encodeURIComponent(g.codigoplanta)}`);
              }}
            >
              Ver detalle
            </Button>
            <IconButton
              aria-label="foto"
              onClick={(e) => {
                e.stopPropagation();
                const url = g.registro?.imagenUrl || g.imagenUrl || computedImg || "#";
                window.open(url, "_blank");
              }}
            >
              <PhotoCameraIcon />
            </IconButton>
          </CardActions>
        </Card>
      </motion.div>
    </Grid>
  );
};

export default PlantCard;

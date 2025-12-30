import React from "react";
import { Grid, Card, Box, Chip, CardContent, Typography, CardActions, Button, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { cardVariants, PLACEHOLDER, firstImageFromMedia } from "./utils";

const PlantCard = ({ g, navigate }) => {
  console.group("🌱 PlantCard render");
  console.log("g (raw):", g);
  console.log("g.planta:", g?.planta);
  console.log("g.registro:", g?.registro);
  console.log("g.bg:", g?.bg);
  console.log("g.colorLabel:", g?.colorLabel);

  // -------- imagen base --------
  console.log("👉 g.imagenUrl:", g?.imagenUrl);
  console.log("👉 g.planta?.imagenUrl:", g?.planta?.imagenUrl);
  console.log("👉 g.planta?.galeria:", g?.planta?.galeria);
  console.log("👉 g.planta?.imagen:", g?.planta?.imagen);
  console.log("👉 g.planta?.imagenes:", g?.planta?.imagenes);

  const mediaFromPlantaRaw =
    g?.planta?.galeria ??
    g?.planta?.imagen ??
    g?.planta?.imagenes ??
    null;

  const mediaFromPlanta =
    mediaFromPlantaRaw?.data ? mediaFromPlantaRaw.data : mediaFromPlantaRaw;

  console.log("📦 mediaFromPlanta (input a firstImageFromMedia):", mediaFromPlanta);

  const imageFromMedia = firstImageFromMedia(mediaFromPlanta);
  console.log("🧩 imageFromMedia (resultado helper):", imageFromMedia);

let computedImg =
  imageFromMedia ||
  g.planta?.imagenUrl ||
  (g.imagenUrl && !g.imagenUrl.startsWith("data:image/svg+xml") ? g.imagenUrl : null) ||
  PLACEHOLDER;

  console.log("🧠 computedImg ANTES normalizar:", computedImg);

  // -------- normalización Strapi v4 --------
  if (typeof computedImg === "string") {
    console.log("🔍 computedImg es string");

    if (computedImg.startsWith("/")) {
      const base = process.env.REACT_APP_STRAPI_URL || "";
      console.log("🌐 URL relativa detectada, base:", base);
      computedImg = `${base}${computedImg}`;
    } else {
      console.log("🌐 URL absoluta detectada");
    }
  } else {
    console.warn("⚠️ computedImg NO es string:", computedImg);
  }

  console.log("✅ computedImg FINAL:", computedImg);
  console.groupEnd();

  return (
    <Grid item xs={12} sm={6} md={4}>
      <motion.div initial="initial" animate="enter" whileHover="hover" variants={cardVariants}>
        <Card
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            cursor: "pointer",
            boxShadow: "0 12px 40px rgba(3,10,22,0.07)",
            border: g?.accent ? `1px solid ${g.accent}` : undefined,
          }}
          onClick={() => navigate(`/clubs/miclub/misplantas/${encodeURIComponent(g.codigoplanta)}`)}
        >
          <Box
            sx={{
              position: "relative",
              height: 220,
              background: g?.bg,
              p: 1.2,
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: "100%",
                borderRadius: 2,
                overflow: "hidden",
                backgroundColor: "rgba(0,0,0,0.04)",
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
                  console.error("❌ ERROR cargando imagen:", computedImg);
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
              {g.registro?.createdAt
                ? new Date(g.registro.createdAt).toLocaleString("es-MX")
                : "—"}
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
                console.log("📷 abrir imagen:", g.registro?.imagenUrl || g.imagenUrl || computedImg);
                window.open(g.registro?.imagenUrl || g.imagenUrl || computedImg || "#", "_blank");
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

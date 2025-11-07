import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import autocultivaGif from "../../assets/autocultiva.gif";
import kitSencilloImg from "../../assets/kitsencillo.png";
import kitFullImg from "../../assets/kitfull.png";

// Helper to extract image url from various Strapi shapes
const extractImageUrl = (imageField, base) => {
  try {
    if (!imageField) return null;
    if (typeof imageField === "string") return imageField.startsWith("http") ? imageField : `${base}${imageField}`;
    if (Array.isArray(imageField) && imageField.length > 0) return extractImageUrl(imageField[0], base);
    if (imageField?.data && imageField.data?.attributes && imageField.data.attributes.url)
      return `${base}${imageField.data.attributes.url}`;
    if (imageField?.attributes && imageField.attributes.url) return `${base}${imageField.attributes.url}`;
    return null;
  } catch (e) {
    return null;
  }
};

export default function KitAutoCultivo() {
  const [kits, setKits] = useState({ sencilla: [], full: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const endpoints = ["https://back.ciudadan.org/api/kitjardineros?populate=*"];

    async function fetchItems() {
      setLoading(true);
      setError(null);
      let parsed = [];
      let foundUrl = null;

      for (const url of endpoints) {
        try {
          const res = await fetch(url, { method: "GET", mode: "cors" });
          if (!res.ok) continue;
          const text = await res.text();
          let json = null;
          try {
            json = text ? JSON.parse(text) : null;
          } catch (e) {
            continue;
          }

          if (Array.isArray(json?.data)) {
            parsed = json.data.map((d) => d.attributes || d);
          } else if (json?.data && json.data.attributes) {
            const attrs = json.data.attributes;
            const arrFromAttrs = Object.values(attrs).find(
              (v) => Array.isArray(v) || (v && v.data && Array.isArray(v.data))
            );
            if (Array.isArray(arrFromAttrs)) {
              parsed = arrFromAttrs.map((i) => (i.attributes ? i.attributes : i));
            } else if (arrFromAttrs && Array.isArray(arrFromAttrs.data)) {
              parsed = arrFromAttrs.data.map((i) => (i.attributes ? i.attributes : i));
            } else if ("cantidad" in attrs && "nombre" in attrs) {
              parsed = [attrs];
            }
          } else {
            const possible = Object.values(json || {}).find((v) => Array.isArray(v));
            if (Array.isArray(possible)) parsed = possible;
          }

          foundUrl = url;
          break;
        } catch (err) {
          console.error("[kit] error fetch a", url, err);
          continue;
        }
      }

      if (!foundUrl) {
        setError("No se encontró endpoint válido para /api/kitjardineros");
        setLoading(false);
        return;
      }

      const envBaseForImages = (process.env.REACT_APP_STRAPI_URL || "").replace(/\/$/, "") || window.location.origin;

      const sencilla = (parsed || [])
        .filter((it) => (it.pack || "").toString().toLowerCase() === "sencilla")
        .map((it) => ({
          cantidad: it.cantidad ?? it.Cantidad ?? 0,
          nombre: it.nombre ?? it.name ?? it.titulo ?? "",
          texto: it.texto ?? it.descripcion ?? it.description ?? "",
          precio: it.precio ?? 4200,
          imagenUrl: extractImageUrl(it.imagen ?? it.imagenes ?? it.image, envBaseForImages) || kitSencilloImg,
          id: it.id ?? Math.random().toString(36).slice(2, 9),
        }));

      const full = (parsed || [])
        .filter((it) => (it.pack || "").toString().toLowerCase() === "full")
        .map((it) => ({
          cantidad: it.cantidad ?? it.Cantidad ?? 0,
          nombre: it.nombre ?? it.name ?? it.titulo ?? "",
          texto: it.texto ?? it.descripcion ?? it.description ?? "",
          precio: it.precio ?? 7100,
          imagenUrl: extractImageUrl(it.imagen ?? it.imagenes ?? it.image, envBaseForImages) || kitFullImg,
          id: it.id ?? Math.random().toString(36).slice(2, 9),
        }));

      setKits({ sencilla, full });
      setLoading(false);
    }

    fetchItems();
  }, []);

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 3,
        p: { xs: 3, md: 6 },
        my: 6,
        boxShadow: "0 0 40px rgba(0,255,120,0.06)",
        background: "radial-gradient(circle at top left, #08130b 0%, #021308 100%)",
        color: "#e9fff0",
        top: -40,
        marginBottom: -10,
      }}
    >
      {/* GIF blur decorative background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.12 }}
        transition={{ duration: 2 }}
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 420,
          height: 420,
          backgroundImage: `url(${autocultivaGif})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(12px) saturate(1.2)",
          zIndex: 0,
        }}
      />

      <Box sx={{ position: "relative", zIndex: 2 }}>
       

        {/* Loading / error states */}
        {!loading && !error && (
  <Grid container spacing={4}>
    {/* Primera fila: Intro y GIF */}
    <Grid item xs={12} md={6}>
      <Box>
        <Typography
          variant="h4"
          sx={{ fontWeight: 900, mb: 2, color: "#7effa8", fontFamily: "'Space Grotesk', sans-serif" }}
        >
          AutoCultiva: independencia verde 🌿
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.9)", mb: 2 }}>
          Cultivar tus propias plantas no solo te da control total sobre su calidad, sino que reduce costos,
          promueve el autoconsumo responsable y te conecta directamente con la naturaleza. Aquí tienes kits
          completos — desde el básico para principiantes hasta el Full Production para quienes buscan rendimiento profesional.
        </Typography>

        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            onClick={() => navigate("/market/kitautocultivobasico")}
            sx={{
              background: "linear-gradient(90deg, #00ff99, #00cc66)",
              color: "#000",
              fontWeight: 800,
              borderRadius: 3,
              px: 3,
              py: 1,
              boxShadow: "0 0 20px rgba(0,255,120,0.15)",
            }}
          >
            🌿 Obtener Kit Básico
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/market/kitautocultivofull")}
            sx={{
              borderColor: "rgba(255,255,255,0.08)",
              color: "#e9fff0",
              fontWeight: 700,
              borderRadius: 3,
              px: 3,
              py: 1,
            }}
          >
            💡 Ver Kit Full
          </Button>
        </Box>
      </Box>
    </Grid>

    <Grid item xs={12} md={6} sx={{ display: "flex", justifyContent: "center" }}>
      <motion.img
        src={autocultivaGif}
        alt="Autocultiva"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9 }}
        style={{ width: "100%", maxWidth: 420, borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
      />
    </Grid>

    {/* Segunda fila: Kits */}
    <Grid item xs={12} md={6}>
      {/* Kit Sencillo */}
      <Typography variant="h5" sx={{ fontWeight: 800, color: "#a6f8c9", mb: 1 }}>🌱 Kit Básico — Sencilla</Typography>
      <Typography sx={{ color: "rgba(255,255,255,0.85)", mb: 2 }}>
        Ideal para principiantes o espacios reducidos. Incluye los elementos esenciales para 2–3 plantas.
      </Typography>

      <Box sx={{ textAlign: "center", mb: 3 }}>
        <motion.div
          animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
          style={{ display: "inline-block", fontWeight: 900, fontSize: "1.9rem", textShadow: "0 0 12px #00ff99" }}
        >
          ${kits.sencilla.length ? kits.sencilla[0].precio?.toLocaleString() : 4200} MXN
        </motion.div>
      </Box>

      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Box
          component={motion.img}
          src={kitSencilloImg}
          alt="Kit Sencillo"
          whileHover={{ scale: 1.03 }}
          sx={{ width: "100%", borderRadius: 2, maxWidth: 420, boxShadow: "0 18px 40px rgba(0,0,0,0.6)" }}
        />
      </Box>

      {/* Incluye */}
      <Typography sx={{ fontWeight: 800, color: "#ffd600", mb: 1 }}>Incluye:</Typography>

      {kits.sencilla.map((it) => (
        <Accordion
          key={it.id}
          sx={{
            mb: 2,
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(6px)",
            border: "none",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "#ffd600", fontSize: "1.5rem" }} />}
          >
            <Typography sx={{ fontWeight: 800, color: "#d8ffd8" }}>
              {it.nombre} {it.cantidad ? `x${it.cantidad}` : ""}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography sx={{ color: "rgba(255,255,255,0.85)", whiteSpace: "pre-line" }}>{it.texto || "No hay descripción disponible."}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}

      <Box sx={{ textAlign: "center", mt: 2 }}>
        <Button onClick={() => navigate(`/market/kitautocultivobasico`)} variant="contained" sx={{ background: "linear-gradient(90deg, #00ff99, #00cc66)", color: "#000", fontWeight: 800, borderRadius: 3, px: 3, py: 1 }}>
          Solicítalo ahora
        </Button>
      </Box>
    </Grid>

    <Grid item xs={12} md={6}>
      {/* Kit Full */}
      <Typography variant="h5" sx={{ fontWeight: 800, color: "#cbb7ff", mb: 1 }}>💡 Kit Full Production</Typography>
      <Typography sx={{ color: "rgba(255,255,255,0.85)", mb: 2 }}>
        Diseñado para cultivadores que buscan máxima producción y control profesional del ambiente.
      </Typography>

      <Box sx={{ textAlign: "center", mb: 3 }}>
        <motion.div
          animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
          style={{ display: "inline-block", fontWeight: 900, fontSize: "1.9rem", textShadow: "0 0 12px #b388ff" }}
        >
          ${kits.full.length ? kits.full[0].precio?.toLocaleString() : 7100} MXN
        </motion.div>
      </Box>

      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Box
          component={motion.img}
          src={kitFullImg}
          alt="Kit Full"
          whileHover={{ scale: 1.03 }}
          sx={{ width: "100%", borderRadius: 2, maxWidth: 420, boxShadow: "0 18px 40px rgba(0,0,0,0.6)" }}
        />
      </Box>

      {/* Incluye */}
      <Typography sx={{ fontWeight: 800, color: "#ffd600", mb: 1 }}>Incluye:</Typography>

      {kits.full.map((it) => (
        <Accordion
          key={it.id}
          sx={{
            mb: 2,
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(6px)",
            border: "none",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "#ffd600", fontSize: "1.5rem" }} />}
          >
            <Typography sx={{ fontWeight: 800, color: "#f0e7ff" }}>
              {it.nombre} {it.cantidad ? `x${it.cantidad}` : ""}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography sx={{ color: "rgba(255,255,255,0.85)", whiteSpace: "pre-line" }}>{it.texto || "No hay descripción disponible."}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}

      <Box sx={{ textAlign: "center", mt: 2 }}>
        <Button onClick={() => navigate(`/market/kitautocultivofull`)} variant="contained" sx={{ background: "linear-gradient(90deg, #7c4dff, #b388ff)", color: "#000", fontWeight: 800, borderRadius: 3, px: 3, py: 1 }}>
          Solicítalo ahora
        </Button>
      </Box>
    </Grid>
  </Grid>
)}



      </Box>
    </Box>
  );
}

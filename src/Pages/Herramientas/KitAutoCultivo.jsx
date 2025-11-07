import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { motion } from "framer-motion";

const extractImageUrl = (imageField, base) => {
  if (!imageField) return null;
  if (typeof imageField === "string") return imageField.startsWith("http") ? imageField : `${base}${imageField}`;
  if (Array.isArray(imageField) && imageField.length > 0) return extractImageUrl(imageField[0], base);
  if (imageField.data && imageField.data.attributes && imageField.data.attributes.url)
    return `${base}${imageField.data.attributes.url}`;
  return null;
};

export default function KitAutoCultivo() {
  const [kits, setKits] = useState({ sencilla: [], full: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const uniq = ["https://back.ciudadan.org/api/kitjardineros?populate=*"];
    console.log("Endpoints usados:", uniq);

    async function fetchItems() {
      setLoading(true);
      setError(null);

      let parsed = [];
      let foundUrl = null;

      for (const url of uniq) {
        try {
          const res = await fetch(url, { method: "GET", mode: "cors" });
          if (!res.ok) continue;

          const text = await res.text();
          let json = null;
          try {
            json = text ? JSON.parse(text) : null;
          } catch {
            continue;
          }

          if (Array.isArray(json.data)) {
            parsed = json.data.map((d) => d.attributes || d);
          } else if (json.data && json.data.attributes) {
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
            const possible = Object.values(json).find((v) => Array.isArray(v));
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

      const envBaseForImages =
        (process.env.REACT_APP_STRAPI_URL || "").replace(/\/$/, "") ||
        window.location.origin;

      const sencilla = parsed
        .filter((it) => it.pack === "sencilla")
        .map((it) => ({
          cantidad: it.cantidad ?? it.Cantidad ?? 0,
          nombre: it.nombre ?? it.name ?? it.titulo ?? "",
          texto: it.texto ?? it.descripcion ?? it.description ?? "",
          precio: it.precio ?? null,
          imagenUrl: extractImageUrl(it.imagen ?? it.imagenes ?? it.image, envBaseForImages),
          id: it.id ?? Math.random().toString(36).slice(2, 9),
        }));

      const full = parsed
        .filter((it) => it.pack === "full")
        .map((it) => ({
          cantidad: it.cantidad ?? it.Cantidad ?? 0,
          nombre: it.nombre ?? it.name ?? it.titulo ?? "",
          texto: it.texto ?? it.descripcion ?? it.description ?? "",
          precio: it.precio ?? null,
          imagenUrl: extractImageUrl(it.imagen ?? it.imagenes ?? it.image, envBaseForImages),
          id: it.id ?? Math.random().toString(36).slice(2, 9),
        }));

      setKits({ sencilla, full });
      setLoading(false);
    }

    fetchItems();
  }, []);

  return (
    <Box sx={{ py: 6, px: { xs: 2, md: 6 }, backgroundColor: "#f8f9fa" }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 800, mb: 2, textAlign: "center", color: "#1a1a1a" }}
      >
        Kit de AutoCultivo
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: "center",
          mb: 5,
          maxWidth: 800,
          mx: "auto",
          lineHeight: 1.7,
          color: "#444",
        }}
      >
        Descubre la libertad del <strong>autocultivo responsable</strong>.  
        Nuestros kits te permiten producir tus propias flores de forma segura,  
        eficiente y completamente legal dentro de los límites personales.  
        Reduce costos, asegura calidad y disfruta del proceso natural del cultivo. 🌿
      </Typography>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && (
        <>
          {/* 🪴 KIT BÁSICO */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: "#2e7d32" }}>
              🌱 Kit Básico — "Sencilla"
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: "#555" }}>
              Ideal para principiantes o espacios reducidos. Incluye los elementos esenciales
              para mantener 2 a 3 plantas saludables, con todo lo necesario para iniciar tu cultivo
              interior con éxito.
            </Typography>

            <Box>
              {kits.sencilla.map((it) => (
                <Accordion key={it.id} sx={{ mb: 1.5, borderRadius: 2, overflow: "hidden" }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        width: "100%",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box>
                          <Typography sx={{ fontWeight: 800 }}>
                            {it.cantidad} × {it.nombre}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails>
                    <Grid container spacing={2} alignItems="center">
                      {it.imagenUrl && (
                        <Grid
                          item
                          xs={12}
                          md={3}
                          sx={{ display: "flex", justifyContent: { xs: "center", md: "flex-start" } }}
                        >
                          <Box
                            component={motion.img}
                            src={it.imagenUrl}
                            alt={it.nombre}
                            loading="lazy"
                            whileHover={{ scale: 1.02 }}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                            sx={{
                              width: { xs: 160, md: 160 },
                              height: 120,
                              borderRadius: 2,
                              objectFit: "cover",
                              boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                            }}
                          />
                        </Grid>
                      )}

                      <Grid item xs={12} md={it.imagenUrl ? 9 : 12}>
                        <Typography sx={{ whiteSpace: "pre-line" }}>
                          {it.texto || "No hay descripción para este elemento."}
                        </Typography>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Box>

          {/* 💡 KIT COMPLETO */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: "#6a1b9a" }}>
              💡 Kit Full Production
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: "#555" }}>
              Diseñado para cultivadores que buscan máxima producción y rendimiento profesional.
              Este kit incluye componentes de alta potencia y herramientas avanzadas para un control
              total del entorno, ideal para 6 plantas en plena floración.
            </Typography>

            <Box>
              {kits.full.map((it) => (
                <Accordion key={it.id} sx={{ mb: 1.5, borderRadius: 2, overflow: "hidden" }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        width: "100%",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box>
                          <Typography sx={{ fontWeight: 800 }}>
                            {it.cantidad} × {it.nombre}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails>
                    <Grid container spacing={2} alignItems="center">
                      {it.imagenUrl && (
                        <Grid
                          item
                          xs={12}
                          md={3}
                          sx={{ display: "flex", justifyContent: { xs: "center", md: "flex-start" } }}
                        >
                          <Box
                            component={motion.img}
                            src={it.imagenUrl}
                            alt={it.nombre}
                            loading="lazy"
                            whileHover={{ scale: 1.02 }}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                            sx={{
                              width: { xs: 160, md: 160 },
                              height: 120,
                              borderRadius: 2,
                              objectFit: "cover",
                              boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                            }}
                          />
                        </Grid>
                      )}

                      <Grid item xs={12} md={it.imagenUrl ? 9 : 12}>
                        <Typography sx={{ whiteSpace: "pre-line" }}>
                          {it.texto || "No hay descripción para este elemento."}
                        </Typography>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}

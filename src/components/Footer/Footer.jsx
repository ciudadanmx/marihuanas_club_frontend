// Footer.jsx
import React from "react";
import { Box, Grid, Typography, IconButton, Link as MLink } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { FaFacebookSquare, FaInstagram, FaWhatsapp, FaYoutube } from "react-icons/fa";

// IMPORTADO: gif animado transparente y asistente
import footerGif from "../../assets/footer_marihuanasclub.gif";
import asistenteImg from "../../assets/asistente_min.png";

export default function Footer() {
  // Normaliza número para wa.me (agregar 52 si sólo hay 10 dígitos MX)
  const raw = process.env.REACT_APP_WHATSAPP_NUMBER || "5559099956";
  const digits = ("" + raw).replace(/\D/g, "");
  const waNumber = digits.length === 10 ? `52${digits}` : digits.startsWith("52") ? digits : digits;
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent("Hola, tengo una pregunta sobre Ciudadan")}`;

  return (
    <Box
      component="footer"
      sx={{
        mt: 6,
        bgcolor: "#002b00", // verde bastante oscuro
        color: "rgba(255,255,255,0.92)",
        px: { xs: 3, sm: 6, md: 10 },
        py: { xs: 4, sm: 6 },
        borderTop: "1px solid rgba(0,0,0,0.18)",
        fontFamily: "'Poppins','Inter','Montserrat',system-ui,-apple-system,Segoe UI,Roboto,'Helvetica Neue',Arial",
      }}
    >
      <Grid container spacing={3} alignItems="flex-start">
        {/* Columna izquierda: gif + redes (gif importado) */}
        <Grid item xs={12} sm={5} md={4}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box
              component="img"
              src={footerGif}
              alt="Cogollo bailando"
              sx={{
                width: { xs: 80, sm: 90, md: 100 },
                height: "auto",
                alignSelf: "flex-start",
                filter: "drop-shadow(0 8px 22px rgba(0,0,0,0.35))",
              }}
            />

            {/* iconos sociales en una sola línea */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 1 }}>
              <IconButton
                component="a"
                href="https://facebook.com/marihuanasclub"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                sx={{
                  color: "#ffffff",
                  bgcolor: "rgba(255,255,255,0.04)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                }}
                size="large"
              >
                <FaFacebookSquare />
              </IconButton>

              <IconButton
                component="a"
                href="https://instagram.com/marihuanas.club"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                sx={{
                  color: "#ffffff",
                  bgcolor: "rgba(255,255,255,0.04)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                }}
                size="large"
              >
                <FaInstagram />
              </IconButton>

              <IconButton
                component="a"
                href={waLink}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                sx={{
                  color: "#ffffff",
                  bgcolor: "rgba(255,255,255,0.04)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                }}
                size="large"
              >
                <FaWhatsapp />
              </IconButton>

              <IconButton
                component="a"
                href="https://youtube.com/@marihuanasclub"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                sx={{
                  color: "#ffffff",
                  bgcolor: "rgba(255,255,255,0.04)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                }}
                size="large"
              >
                <FaYoutube />
              </IconButton>
            </Box>
          </Box>
        </Grid>

        {/* Columna centro: enlaces internos (sin título) */}
        <Grid item xs={12} sm={4} md={4}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            <Box sx={{ display: "flex", flexDirection: "column", mt: 0.5, gap: 0.5 }}>
              <MLink component={RouterLink} to="/clubs" underline="hover" sx={{ color: "rgba(255,255,255,0.92)", fontWeight: 600 }}>
                Clubs
              </MLink>
              <MLink component={RouterLink} to="/membresias" underline="hover" sx={{ color: "rgba(255,255,255,0.92)", fontWeight: 600 }}>
                Membresías
              </MLink>
              <MLink component={RouterLink} to="/legal/tuabogado" underline="hover" sx={{ color: "rgba(255,255,255,0.92)", fontWeight: 600 }}>
                TuAbogado
              </MLink>
              <MLink component={RouterLink} to="/wiki" underline="hover" sx={{ color: "rgba(255,255,255,0.92)", fontWeight: 600 }}>
                Wiki
              </MLink>
              <MLink component={RouterLink} to="/info/faq" underline="hover" sx={{ color: "rgba(255,255,255,0.92)", fontWeight: 600 }}>
                Preguntas Frecuentes
              </MLink>
              <MLink component={RouterLink} to="/info/ayuda" underline="hover" sx={{ color: "rgba(255,255,255,0.92)", fontWeight: 600 }}>
                Ayuda
              </MLink>
            </Box>
          </Box>
        </Grid>

        {/* Columna derecha: asistente (pegado hasta abajo) */}
        <Grid item xs={12} sm={3} md={4}>
          <Box sx={{ position: "relative", minHeight: { xs: 80, sm: 120 } }}>
            <Box
              component="img"
              src={asistenteImg}
              alt="Asistente"
              sx={{
                position: "absolute",
                right: { xs: 8, md: 0 },
                bottom: 0, // pegado hasta abajo
                width: { xs: 60, sm: 90, md: 120 },
                height: "auto",
                display: "block",
                boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
              }}
            />
          </Box>
        </Grid>
      </Grid>

      {/* Línea inferior con Términos y Privacidad */}
      <Box
        sx={{
          mt: 4,
          pt: 2,
          borderTop: "1px solid rgba(255,255,255,0.04)",
          display: "flex",
          justifyContent: "center",
          gap: 3,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <MLink component={RouterLink} to="/terminos" underline="hover" sx={{ color: "rgba(255,255,255,0.76)", fontSize: 14 }}>
          Términos y Condiciones
        </MLink>

        <Box sx={{ width: 6, height: 6, bgcolor: "#b300ff", borderRadius: "50%" }} aria-hidden />

        <MLink component={RouterLink} to="/privacidad" underline="hover" sx={{ color: "rgba(255,255,255,0.76)", fontSize: 14 }}>
          Política de privacidad
        </MLink>
      </Box>
    </Box>
  );
}

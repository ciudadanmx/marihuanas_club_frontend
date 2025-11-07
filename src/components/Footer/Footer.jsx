// Footer.jsx
import React from "react";
import { Box, Grid, IconButton, Link as MLink } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { FaFacebookSquare, FaInstagram, FaWhatsapp, FaYoutube, FaEnvelope } from "react-icons/fa";

import footerGif from "../../assets/footer_marihuanasclub.gif";
import asistenteImg from "../../assets/asistente_min.png";

export default function Footer() {
  const raw = process.env.REACT_APP_WHATSAPP_NUMBER || "5559099956";
  const digits = ("" + raw).replace(/\D/g, "");
  const waNumber =
    digits.length === 10 ? `52${digits}` : digits.startsWith("52") ? digits : digits;
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    "Hola, tengo una pregunta sobre Ciudadan"
  )}`;

  return (
    <Box
      component="footer"
      sx={{
        mt: 6,
        bgcolor: "#002b00",
        color: "rgba(255,255,255,0.92)",
        px: { xs: 3, sm: 6, md: 10 },
        py: { xs: 4, sm: 6 },
        borderTop: "1px solid rgba(0,0,0,0.18)",
        fontFamily:
          "'Poppins','Inter','Montserrat',system-ui,-apple-system,Segoe UI,Roboto,'Helvetica Neue',Arial",
      }}
    >
      <Grid container spacing={3} alignItems="flex-start">
        {/* Columna izquierda: gif + redes */}
        <Grid item xs={12} sm={5} md={4}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <center>
              <Box
                component="img"
                src={footerGif}
                alt="Cogollo bailando"
                sx={{
                  width: { xs: 80, sm: 90, md: 111 },
                  height: "auto",
                  alignSelf: "flex-start",
                  filter: "drop-shadow(0 8px 22px rgba(0,0,0,0.35))",
                }}
              />
            </center>

            {/* iconos sociales (ajuste responsive aquí) */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 0.5,
                alignItems: "center",
                mt: 1,
                justifyContent: { xs: "flex-start", sm: "flex-start", md: "flex-start" },
                ml: { xs: 0, sm: 1, md: 0 }, // más pegado a la izquierda en tablet
              }}
            >
              <IconButton
                component="a"
                href="https://facebook.com/marihuanasclub"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                sx={{
                  color: "#fff200",
                  bgcolor: "rgba(255,255,255,0.04)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                }}
                size="large"
              >
                <FaFacebookSquare />
              </IconButton>

              <IconButton
                component="a"
                href="https://instagram.com/marihuanasclub"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                sx={{
                  color: "#fff200",
                  bgcolor: "rgba(255,255,255,0.04)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                }}
                size="large"
              >
                <FaInstagram />
              </IconButton>

              <IconButton
                component="a"
                href="mailto:marihuanasclub@gmail.com"
                aria-label="Correo Gmail"
                sx={{
                  color: "#fff200",
                  bgcolor: "rgba(255,255,255,0.04)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                }}
                size="large"
              >
                <FaEnvelope />
              </IconButton>

              <IconButton
                component="a"
                href={waLink}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                sx={{
                  color: "#fff200",
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
                  color: "#fff200",
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

        {/* Columna centro: enlaces internos */}
        <Grid item xs={12} sm={4} md={4}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            <Box sx={{ display: "flex", flexDirection: "column", mt: 0.5, gap: 0.5 }}>
              {[
                { text: "Clubs", to: "/clubs" },
                { text: "Membresías", to: "/membresias" },
                { text: "AutoCultiva", to: "/herramientas/kitautocultivo" },
                { text: "TuAbogado", to: "/legal/tuabogado" },
                { text: "Wiki", to: "/wiki" },
                { text: "Preguntas Frecuentes", to: "/info/faq" },
                { text: "Ayuda", to: "/info/ayuda" },
              ].map((link) => (
                <MLink
                  key={link.to}
                  component={RouterLink}
                  to={link.to}
                  underline="hover"
                  sx={{ color: "#fff200", fontWeight: 600 }}
                >
                  {link.text}
                </MLink>
              ))}
            </Box>
          </Box>
        </Grid>

        {/* Columna derecha: asistente (oculto en smartphone) */}
        <Grid item xs={12} sm={3} md={4}>
          <Box
            sx={{
              position: "relative",
              minHeight: { xs: 80, sm: 120 },
              display: { xs: "none", md: "block" },
            }}
          >
            <Box
              component="img"
              src={asistenteImg}
              alt="Asistente"
              sx={{
                position: "absolute",
                right: { xs: 8, md: -38 },
                bottom: -190,
                width: { xs: 60, sm: 90, md: 92 },
                height: "auto",
                display: "block",
                boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
              }}
            />
          </Box>
        </Grid>
      </Grid>

      {/* Línea inferior */}
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
        <MLink
          component={RouterLink}
          to="/terminos"
          underline="hover"
          sx={{ color: "#fff200", fontSize: 14 }}
        >
          Términos y Condiciones
        </MLink>

        <Box sx={{ width: 6, height: 6, bgcolor: "#b300ff", borderRadius: "50%" }} aria-hidden />

        <MLink
          component={RouterLink}
          to="/privacidad"
          underline="hover"
          sx={{ color: "#fff200", fontSize: 14 }}
        >
          Política de privacidad
        </MLink>
      </Box>
    </Box>
  );
}

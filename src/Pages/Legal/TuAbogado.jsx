// src/components/TuAbogado.jsx
import React from "react";
import { motion } from "framer-motion";
import {
  Box,
  Typography,
  Stack,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import { LocalPolice, Gavel, EmojiNature } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import tuAbogadoImg from "../../assets/tuabogado.png"; // ← usa tu ruta correcta

const Fondo = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg,#C7FF4E 0%,#A1FF84 30%,#8DF4FF 100%)",
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "2rem",
}));

const TextoGradient = styled(Typography)(() => ({
  background: "linear-gradient(90deg,#1a1a1a 0%,#4d004d 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontWeight: 900,
}));

const WhatsappNumber = process.env.REACT_APP_TUABOGADO_WHATSAPP || "5559099956";

export default function TuAbogado() {
  const whatsappUrl = `https://wa.me/${WhatsappNumber}?text=${encodeURIComponent(
    "Quiero asesoría de Tu@bogado420"
  )}`;

  return (
    <Fondo>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1, transition: { duration: 0.8 } }}
        style={{ width: "100%", maxWidth: 1100 }}
      >
        <Card
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 25px 80px rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.05)",
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
            backdropFilter: "blur(12px)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              alignItems="center"
              spacing={4}
            >
              {/* Imagen */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                style={{ flex: "0 0 380px", borderRadius: 16, overflow: "hidden" }}
              >
                <img
                  src={tuAbogadoImg}
                  alt="Abogado"
                  style={{
                    width: "100%",
                    borderRadius: 16,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                  }}
                />
              </motion.div>

              {/* Texto */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{ flex: 1 }}
              >
                <TextoGradient variant="h3" gutterBottom>
                  🧑‍⚖️ ASESORÍAS, ACOMPAÑAMIENTO Y REPRESENTACIÓN
                </TextoGradient>

                <Typography
                  variant="h6"
                  sx={{ mb: 1, fontWeight: 600, color: "#1a1a1a" }}
                >
                  En temas de:
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontSize: "1.15rem",
                    fontWeight: 600,
                    color: "#222",
                    mb: 2,
                  }}
                >
                  USO PERSONAL, PENAL, MEDICINAL, AMBIENTAL, EMPRESARIAL,
                  ACTIVISMO, CABILDEO, LEGISLACIÓN 4:20
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ mb: 2, color: "#1a1a1a", fontWeight: 600 }}
                >
                  En <strong>Tu@bogado420</strong> ofrecemos acompañamiento legal completo para clubes de cultivo y proyectos de cáñamo medicinal. Contamos con diversos niveles de membresía que se ajustan a tus necesidades, desde asesorías básicas hasta soporte integral. 💡 Nuestro objetivo es guiarte paso a paso y asegurar que tu proyecto cumpla con la ley.
                </Typography>

                <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2 }}>
                  🌱 Servicios destacados:
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Asesoría legal para clubes de cultivo: registro, estatutos internos y cumplimiento normativo.
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Uso de cáñamo medicinal: permisos, dosis, documentación y protocolos de seguridad.
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Casos penales relacionados: defensa legal especializada.
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Consultoría estratégica: implementación de protocolos internos y planificación de proyectos.
                </Typography>

                <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2 }}>
                  💡 Casos de uso reales:
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  - Juan completó el registro oficial de su club medicinal en tiempo récord.
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  - María enfrentaba un caso penal por cultivo y recibió asesoría completa para minimizar riesgos.
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  - Cooperativas estructuraron estatutos internos y planes de membresía claros con nuestro acompañamiento.
                </Typography>

                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "#2c2c2c",
                    fontWeight: 700,
                    fontStyle: "italic",
                    mt: 3,
                  }}
                >
                  NO ES ASESINA ES MEDICINA 🌿  
                  HASTA LA VICTORIA VERDE !!
                </Typography>

                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ mt: 4, flexWrap: "wrap" }}
                >
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Button
                      variant="contained"
                      startIcon={<Gavel />}
                      sx={{
                        background: "linear-gradient(90deg,#7CFF5A,#40DD80)",
                        fontWeight: 800,
                        color: "#0b0b0b",
                        borderRadius: 2,
                        px: 3,
                        py: 1.2,
                        textTransform: "none",
                        "&:hover": {
                          background: "linear-gradient(90deg,#98FF77,#55F9A0)",
                        },
                      }}
                      component="a"
                      href={whatsappUrl}
                      target="_blank"
                    >
                      💬 Contactar por WhatsApp
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Button
                      variant="outlined"
                      startIcon={<LocalPolice />}
                      sx={{
                        borderWidth: 2,
                        fontWeight: 700,
                        borderColor: "#1a1a1a",
                        color: "#1a1a1a",
                        borderRadius: 2,
                        px: 3,
                        py: 1.2,
                        textTransform: "none",
                        "&:hover": {
                          borderColor: "#4d004d",
                          color: "#4d004d",
                        },
                      }}
                    >
                      Conoce tus derechos
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Button
                      variant="text"
                      startIcon={<EmojiNature />}
                      sx={{
                        fontWeight: 700,
                        color: "#006600",
                        textTransform: "none",
                      }}
                    >
                      Movimiento Verde 🌱
                    </Button>
                  </motion.div>
                </Stack>
              </motion.div>
            </Stack>
          </CardContent>
        </Card>
      </motion.div>
    </Fondo>
  );
}

// src/components/KitJardinero.jsx
import React, { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PrecioKitJardinero from "../components/Clubs/PrecioKitJardinero.jsx";
import jardinero from "../assets/jardineros.mp4";

const KitJardinero = ({
  kitImage,
  loadingItems,
  errorItems,
  kitItems,
  setOpenKitModal,
  handleOpenKitModal,
  LocalPlayer,
}) => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  return (
    <>
      <Typography
        variant="h3"
        sx={{
          mt: 2,
          mb: 1,
          fontWeight: "bold",
          color: "#14532d",
          textShadow: "0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        Red de Clubs Solidarios 🌱
      </Typography>
      <Typography
        variant="h6"
        sx={{ color: "#1f2937", maxWidth: "900px", mx: "auto", mb: 3 }}
      >
        Conoce las tres modalidades para participar en la red de clubs sin fines
        de lucro. Puedes iniciar con un kit de jardinero, abrir un club de
        consumo o combinar ambas opciones.
      </Typography>

      <Card
        sx={{
          mb: 6,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,255,250,0.98) 100%)",
          borderRadius: "20px",
          boxShadow: "0 18px 40px rgba(6,30,15,0.12)",
          overflow: "visible",
        }}
      >
        <CardContent>
          <Grid container spacing={3} alignItems="flex-start">
            {/* Columna izquierda */}
            <Grid item xs={12} md={8}>
              <Typography variant="h4" color="green" sx={{ mb: 1 }}>
                🌱 Kit Inicial del Jardinero del Club
              </Typography>

              <PrecioKitJardinero
                handleOpenModal={handleOpenModal}
                handleCloseModal={handleCloseModal}
                openModal={openModal}
              />

              <Typography sx={{ mb: 2 }}>
                👨‍🌾 Tu punto de partida para crear un club de cultivo
                responsable y autosustentable. Este kit te convierte en{" "}
                <b>jardinero acreditado</b> de la red, con todo lo necesario —
                físico, legal y digital— para operar un espacio seguro, donde
                cada miembro cultiva sus propias semillas bajo tus servicios de
                renta, asesoría y seguimiento técnico.
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography
                variant="h6"
                color="success.dark"
                fontWeight="bold"
                sx={{ mb: 1 }}
              >
                ⚖️ Marco legal y acompañamiento
              </Typography>
              <Typography sx={{ mb: 2 }}>
                - Gestión completa ante COFEPRIS (uso personal, amparo
                incluido). <br />
                - Membresía oficial de jardinero y acceso a soporte jurídico.
                <br />
                - Generador automático de estatutos internos, acta constitutiva
                y documentación SAT.
                <br />- Asistencia personalizada por WhatsApp durante todo el
                proceso.
              </Typography>

              <Typography
                variant="h6"
                color="success.dark"
                fontWeight="bold"
                sx={{ mt: 1, mb: 1 }}
              >
                🛠️ Infraestructura de cultivo incluida
              </Typography>

              <Box sx={{ mb: 2 }}>
                {loadingItems ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <CircularProgress size={20} />
                    <Typography>Cargando componentes del kit...</Typography>
                  </Box>
                ) : errorItems ? (
                  <Typography color="error">
                    No fue posible cargar los componentes: {errorItems}
                  </Typography>
                ) : kitItems?.length === 0 ? (
                  <Typography sx={{ opacity: 0.8 }}>
                    No hay items registrados en la colección{" "}
                    <code>kitjardinero</code>.
                  </Typography>
                ) : (
                  kitItems?.map((it) => (
                    <Accordion
                      key={it.id}
                      sx={{
                        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                        borderRadius: "12px",
                        mb: 1,
                        "&:before": { display: "none" },
                      }}
                    >
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
                          <Typography sx={{ fontWeight: 800 }}>
                            {it.cantidad} × {it.nombre}
                          </Typography>
                        </Box>
                      </AccordionSummary>

                      <AccordionDetails>
                        <Grid container spacing={2} alignItems="center">
                          {it.imagenUrl && (
                            <Grid
                              item
                              xs={12}
                              md={3}
                              sx={{
                                display: "flex",
                                justifyContent: {
                                  xs: "center",
                                  md: "flex-start",
                                },
                              }}
                            >
                              <Box
                                component={motion.img}
                                src={it.imagenUrl}
                                alt={it.nombre}
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  console.warn(
                                    "[kit] fallo cargando imagen:",
                                    it.imagenUrl
                                  );
                                }}
                                whileHover={{ scale: 1.02 }}
                                sx={{
                                  width: { xs: 160, md: 160 },
                                  height: 120,
                                  borderRadius: 2,
                                  objectFit: "cover",
                                  boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                                  display: "block",
                                }}
                              />
                            </Grid>
                          )}

                          <Grid item xs={12} md={it.imagenUrl ? 9 : 12}>
                            <Typography sx={{ whiteSpace: "pre-line" }}>
                              {it.texto ||
                                "No hay descripción para este elemento."}
                            </Typography>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))
                )}
              </Box>

              <Typography
                variant="h6"
                color="success.dark"
                fontWeight="bold"
                sx={{ mt: 1 }}
              >
                💻 Herramientas digitales del jardinero
              </Typography>
              <Typography sx={{ mb: 2 }}>
                Incluye acceso al sistema de gestión y bitácoras automatizadas:
                registro de fotos, videos, trazabilidad por semilla, firma
                digital y almacenamiento en la nube. Cada usuario lleva sus
                propias semillas, el jardinero solo renta el espacio y servicios
                de cultivo.
              </Typography>

              <Typography
                variant="h6"
                color="success.dark"
                fontWeight="bold"
              >
                ⚡ Sistema de energía individualizada
              </Typography>
              <Typography sx={{ mb: 2 }}>
                Cada nuevo miembro instala su propio medidor ante CFE,
                garantizando consumo transparente y sustentable.
              </Typography>

              <Typography
                variant="h6"
                color="success.dark"
                fontWeight="bold"
              >
                📦 Entrega y soporte
              </Typography>
              <Typography sx={{ mb: 1 }}>
                - Financiado con las dos primeras mensualidades. <br />
                - Envío nacional en dos entregas con manual, soporte y acceso
                inmediato al sistema. <br />
                - Certificación digital como Jardinero Responsable tras tu
                primer trimestre.
              </Typography>

              <Box
                sx={{
                  width: "100%",
                  backgroundColor: "rgba(144, 238, 144, 0.3)",
                  py: 3,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                  borderRadius: 2,
                  mt: 3,
                }}
              >
                {LocalPlayer && (
                  <LocalPlayer
                    src={jardinero}
                    poster={undefined}
                    width="100%"
                    sx={{ maxHeight: 300 }}
                  />
                )}

                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  sx={{ mt: 3, borderRadius: "999px", px: 5 }}
                  onClick={() => navigate("/clubs/requisitos-jardinero")}
                >
                  Afiliar mi Club de Cultivo
                </Button>
              </Box>
            </Grid>

            {/* Columna derecha */}
            <Grid
              item
              xs={12}
              md={4}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Box
                component={motion.div}
                whileHover={{ scale: 1.02 }}
                sx={{
                  width: { xs: "90%", md: "92%" },
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
                  border: "1px solid rgba(0,0,0,0.06)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.6), rgba(250,250,250,0.4))",
                  p: 1,
                }}
              >
                <Box
                  onClick={handleOpenKitModal}
                  sx={{
                    width: "100%",
                    height: { xs: 220, md: 320 },
                    overflow: "hidden",
                    borderRadius: 1,
                    cursor: "pointer",
                    "& img": {
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center left",
                      transition:
                        "object-position 700ms ease, transform 300ms ease",
                      display: "block",
                    },
                    "&:hover img": {
                      objectPosition: "center right",
                      transform: "scale(1.02)",
                    },
                  }}
                  aria-label="Abrir imagen ampliada del kit"
                  role="button"
                >
                  <Box
                    component="img"
                    src={kitImage}
                    alt="Kit Jardinero - contenido"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center left",
                      display: "block",
                    }}
                  />
                </Box>

                <Box sx={{ p: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Contenido visual del kit
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.75 }}>
                    Imagen ilustrativa con todos los componentes incluidos.
                  </Typography>

                  <Button
                    variant="contained"
                    size="small"
                    onClick={() =>
                      window.open("/downloads/kit-detalles.pdf", "_blank")
                    }
                    sx={{ mt: 1, borderRadius: "999px", textTransform: "none" }}
                  >
                    📄 Ficha técnica (PDF)
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  );
};

export default KitJardinero;

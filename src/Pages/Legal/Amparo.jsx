// src/components/Amparo.jsx
import React from "react";
import { motion } from "framer-motion";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Divider,
  Link as MuiLink,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AutoAmparoImg from "../../assets/autoamparo.png";
import AmparameImg from "../../assets/amparame.png";

const Amparo = () => {
  const navigate = useNavigate();

  const handleNav = (path) => {
    window.scrollTo(0, 0);
    navigate(path);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        maxWidth: "1200px",
        margin: "5px auto 0 auto", // 🔽 menos pegado al topbar
        padding: "0 20px",
      }}
    >
      <Card
        elevation={6}
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          background: "linear-gradient(135deg, #5b2e8b 0%, #3a9954 100%)",
          color: "white",
          mt: 0,
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 6 } }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
          >
            Amparo
          </Typography>

          <Typography variant="body1" sx={{ mb: 3 }}>
            Con tu membresía de cualquier{" "}
            <MuiLink
              component="button"
              onClick={() => handleNav("/membresias")}
              underline="hover"
              sx={{ color: "#d6ffb7", fontWeight: "bold" }}
            >
              tipo
            </MuiLink>{" "}
            se te incluye el inicio del trámite colectivamente ante{" "}
            <strong>COFEPRIS federal en CDMX</strong>. Se ingresan trámites
            una o dos veces por mes. Aquí aparecerá el enlace para consultar
            el estado de tu trámite.
          </Typography>

          <Box textAlign="center" mb={4}>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleNav("/legal/consultacofepris")}
                sx={{
                  backgroundColor: "#3a9954",
                  fontWeight: "bold",
                  px: 3,
                  borderRadius: "30px",
                }}
              >
                Consultar estado del trámite
              </Button>
            </motion.div>
          </Box>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.3)", mb: 4 }} />

          {/* --- AutoAmparo Section --- */}
          <Box
            display="flex"
            flexDirection={{ xs: "column", md: "row" }}
            alignItems="center"
            gap={4}
          >
            <motion.img
              src={AutoAmparoImg}
              alt="Auto Amparo"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              style={{
                width: "320px", // 🔥 más grande
                borderRadius: "20px",
                boxShadow: "0 0 15px rgba(0,0,0,0.35)",
              }}
            />
            <Typography variant="body1" flex={1}>
              Si obtienes una negativa, tienes dos opciones:
              <br />
              <br />
              <strong>1️⃣ Autoamparo:</strong> Realiza el trámite tú mismo.
              Con tu membresía de cualquier{" "}
              <MuiLink
                component="button"
                onClick={() => handleNav("/membresias")}
                underline="hover"
                sx={{ color: "#d6ffb7", fontWeight: "bold" }}
              >
                tipo
              </MuiLink>
              , accedes a nuestro{" "}
              <strong>Generador de Demanda de Amparo Automático</strong>.
              Solo debes ingresar:
              <br />
              <em>
                Nombre, Dirección, Folio COFEPRIS, Fechas, Correo, Teléfono,
                RFC y CURP.
              </em>{" "}
              El sistema genera el texto para el tribunal, junto con el
              directorio, mapa de tribunales y tutorial completo. Solo
              necesitas <b>2 o 3 visitas al tribunal</b>.
            </Typography>
          </Box>

          <Box
            mt={3}
            mb={6}
            display="flex"
            justifyContent="center"
            flexWrap="wrap"
            gap={2}
          >
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => handleNav("/legal/generadoramparo")}
                sx={{
                  borderColor: "#d6ffb7",
                  color: "#d6ffb7",
                  fontWeight: "bold",
                  px: 3,
                  borderRadius: "30px",
                }}
              >
                Generador Autoamparo
              </Button>
            </motion.div>
          </Box>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.3)", mb: 4 }} />

          {/* --- Legal Amparo Section --- */}
          <Box
            display="flex"
            flexDirection={{ xs: "column-reverse", md: "row" }}
            alignItems="center"
            gap={4}
          >
            <Typography variant="body1" flex={1}>
              <strong>2️⃣ Amparo con nuestro equipo legal:</strong> Con tu
              membresía de cualquier{" "}
              <MuiLink
                component="button"
                onClick={() => handleNav("/membresias")}
                underline="hover"
                sx={{ color: "#d6ffb7", fontWeight: "bold" }}
              >
                tipo
              </MuiLink>
              , puedes optar por que nuestro equipo especializado tramite el
              amparo por ti, pagando solo{" "}
              <Typography
                component="span"
                sx={{
                  backgroundColor: "white",
                  color: "#3a9954",
                  px: 1,
                  borderRadius: "6px",
                  fontWeight: "bold",
                  mx: 1,
                }}
              >
                $1,500
              </Typography>{" "}
              en tres mensualidades adicionales a tu membresía.
            </Typography>
            <motion.img
              src={AmparameImg}
              alt="Amparame"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              style={{
                width: "320px", // 🔥 más grande
                borderRadius: "20px",
                boxShadow: "0 0 15px rgba(0,0,0,0.35)",
              }}
            />
          </Box>

          <Box textAlign="center" mt={4}>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                variant="contained"
                onClick={() => handleNav("/legal/amparame")}
                sx={{
                  backgroundColor: "#d6ffb7",
                  color: "#3a9954",
                  fontWeight: "bold",
                  px: 3,
                  borderRadius: "30px",
                }}
              >
                Solicitar amparo
              </Button>
            </motion.div>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Amparo;

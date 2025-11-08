// src/components/ClubConsumoBar.jsx
import React from "react";
import { motion } from "framer-motion";
import { Box, Container, Typography, Stack, Link, Button } from "@mui/material";

import { useNavigate } from "react-router-dom";

const ClubConsumoBar = ({LocalPlayer, afiliaconsumo}) => {
  const navigate = useNavigate();
  
  return (
    <>
    <Box
      component={motion.section}
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 80, damping: 12 }}
      sx={{
        width: "100%",
        bgcolor: "#eafaf0", // verde muy clarito
        borderTop: "1px solid rgba(0,0,0,0.04)",
        borderBottom: "1px solid rgba(0,0,0,0.04)",
        py: { xs: 3, md: 4 },
        // sombra sutil para separarlo del fondo
        boxShadow: "0 6px 18px rgba(30, 60, 30, 0.03)",
      }}
      aria-label="Sección Club de Consumo"
    >
      <Container maxWidth="lg">
        <Stack
          direction="row"
          spacing={3}
          alignItems="flex-start"
          justifyContent="space-between"
        >
          {/* Bloque principal de texto */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              component="h2"
              variant="h5"
              fontWeight={800}
              sx={{
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "#1b5e20",
              }}
            >
              <motion.span
                aria-hidden
                initial={{ scale: 0.9 }}
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                style={{ display: "inline-block" }}
              >
                🌿
              </motion.span>
              Club de Consumo
            </Typography>

            <Typography
              variant="body1"
              sx={{ color: "#184d27", mb: 1.5, lineHeight: 1.45 }}
            >
              ¿Cuentas con un espacio en donde recibir de forma cómoda y segura a usuarios de la red para que realicen consumo recreativo?
            </Typography>

            <Typography
              variant="body1"
              sx={{ color: "#184d27", mb: 1.5, lineHeight: 1.45 }}
            >
              ¿Realizas actividades económicas periféricas a la industria de cannabis como pueden ser cocina, entretenimiento, formación, etc.?
            </Typography>

            <Typography
              variant="body1"
              sx={{ color: "#184d27", mb: 1.5, lineHeight: 1.45 }}
            >
              AHORA PUEDES ABRIR TU CLUB Y AFILIARLO A LA RED MARIHUANAS.CLUB 
            </Typography>

            <Typography
              variant="body1"
              sx={{ color: "#184d27", mb: 1.5, lineHeight: 1.45 }}
            >
              Y MONETIZAR TU SOLIDARIDAD Y COMUNIDAD 4:20. 
            </Typography>

            <Typography
              variant="body1"
              sx={{ color: "#184d27", mt: 0, lineHeight: 1.5 }}
            >
              Afiliar tu club de consumo no tiene costo, solo se requiere que hagas 10% de descuento en sus consumos en tu club a todos los usuarios de la red{" "}
              <Link
                href="http://marihuanas.club"
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                sx={{ fontWeight: 700, color: "#0b6623" }}
              >
                marihuanas.club
              </Link>{" "}
              con membresía vigente (se identifican mediante un qr que scanneas desde la app), si quieres involucrarte más y remunerar tu esfuerzo puedes adquirir tu kit de jardinero y además integrarte como club de cultivo.
            </Typography>

            <Typography
              variant="body1"
              sx={{ color: "#184d27", mb: 1.5, lineHeight: 1.45 }}
            >
              Entre más actividades haces más ganas !! 
            </Typography>

          </Box>

          {/* Columna de emoji + micro-animación (oculta en pantallas chicas) */}
          <Box
            sx={{
              width: 120,
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden
              style={{
                fontSize: 40,
                lineHeight: 1,
                userSelect: "none",
              }}
            >
              🌈✨
            </motion.div>
          </Box>
        </Stack>
      </Container>
    </Box>
    <Box
      sx={{
        width: "100%",
        backgroundColor: "rgba(144, 238, 144, 0.3)", // verde clarito
        py: 3,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        borderRadius: 2,
        mt: 3,
      }}
    >

    <LocalPlayer
      src={afiliaconsumo}
      poster={undefined}
      width={{ xs: "100%", md: "60%" }}
      sx={{ maxHeight: 300 }}
    />

    <Button
      variant="contained"
      color="success"
      size="large"
      sx={{ mt: 3, borderRadius: "999px", px: 5 }}
      onClick={() => navigate("/clubs/agregar-club")}
    >
      Afiliar mi Club de Consumo
    </Button>
    </Box>
    </>

    
  );
};

export default ClubConsumoBar;

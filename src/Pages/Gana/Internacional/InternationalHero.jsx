import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { keyframes } from "@mui/system";
import leafPattern from "../../../assets/leaf-pattern.png"; // ya importado en assets
import intlGif from "../../../assets/internationalclub.gif";

const floatAnimation = keyframes`
  0% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
  50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
  100% { transform: translateY(0px) rotate(360deg); opacity: 0.6; }
`;

const swirlAnimation = keyframes`
  0% { transform: rotate(0deg) translateX(0) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(50px) rotate(-360deg); }
`;

const leavesCount = 14;

const InternationalHero = () => {
  const leaves = Array.from({ length: leavesCount });

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        minHeight: "100vh",
        background: "linear-gradient(120deg, #0d0d0d 0%, #121212 100%)",
        overflow: "hidden",
        color: "#f0f0f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
        zIndex: 0,
      }}
    >
      {/* Hojas (background, zIndex bajo) */}
      {leaves.map((_, i) => (
        <Box
          key={i}
          component="img"
          src={leafPattern}
          alt="leaf"
          sx={{
            position: "absolute",
            width: `${18 + (i % 6) * 8}px`,
            height: "auto",
            top: `${10 + (i * 7) % 80}%`,
            left: `${(i * 13) % 95}%`,
            opacity: 0.45 + (i % 4) * 0.14,
            transformOrigin: "center",
            pointerEvents: "none",
            zIndex: 0,
            animation: `${floatAnimation} ${6 + (i % 5) * 2}s ease-in-out infinite alternate,
                        ${swirlAnimation} ${22 + (i % 7) * 5}s linear infinite`,
            willChange: "transform, opacity",
            filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.6))",
          }}
        />
      ))}

      {/* Contenido del hero (visible encima de las hojas) */}
      <Container
        sx={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          backdropFilter: "blur(4px)",
          backgroundColor: "rgba(0,0,0,0.35)",
          borderRadius: 3,
          p: { xs: 6, md: 8 },
          maxWidth: "900px",
          pt: { xs: 8, md: 10 },
        }}
      >
        {/* GIF centrado encima del título, ajustado a mitad de la subida anterior */}
        <Box
          component="img"
          src={intlGif}
          alt="InternationaClub GIF"
          aria-hidden
          sx={{
            position: "absolute",
            top: { xs: -65, sm: -80, md: -105 }, // a mitad de la subida anterior
            left: "50%",
            transform: "translateX(-50%)",
            maxHeight: { xs: 60, sm: 110, md: 160 },
            width: "auto",
            zIndex: 3,
            pointerEvents: "none",
            userSelect: "none",
            filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.6))",
          }}
        />

        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 900,
            mt: { xs: 3, md: 5 },
            mb: 2,
            color: "#e0ff9f",
            textShadow: "0 0 20px #00ff99, 0 0 28px rgba(0,255,150,0.15)",
          }}
        >
          🌍 Internacionalización Marihuanas.Club
        </Typography>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 400,
            mb: 4,
            lineHeight: 1.5,
            color: "#f0f0f0",
            textShadow: "0 0 10px rgba(0,255,150,0.12)",
          }}
        >
          Conecta tu club cannábico con una red internacional 🌿 — tecnología, trazabilidad y
          soporte legal adaptado a tu país.
        </Typography>

      </Container>
    </Box>
  );
};

export default InternationalHero;
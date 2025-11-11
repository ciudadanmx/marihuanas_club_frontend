import React from "react";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import activGif from "../../assets/activatumembresia.gif";

// 🔥 Componente visualmente potente con humo, fondo oscuro y botón inclinado

const Wrapper = styled(Box)(() => `
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: radial-gradient(circle at 50% 30%, rgba(0,30,0,0.8), rgba(0,0,0,1));
  display: flex;
  justify-content: center;
  align-items: center;
`);

const Gif = styled("img")(() => `
  width: auto;
  height: 90%;
  max-height: 90vh;
  z-index: 5;
  object-fit: contain;
  filter: brightness(0.7) contrast(1.2) saturate(1.2);
`);

// Capa de oscuridad con un toque verdoso
const Overlay = styled(Box)(() => `
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 40% 40%, rgba(0,50,0,0.5), rgba(0,0,0,0.9));
  z-index: 6;
`);

// Capas de humo con animación y movimiento
const Smoke = styled(motion.div)(() => `
  position: absolute;
  width: 200%;
  height: 200%;
  top: -50%;
  left: -50%;
  background: radial-gradient(circle at 50% 50%, rgba(100,255,100,0.12), transparent 70%);
  filter: blur(100px);
  opacity: 0.4;
  z-index: 3;
`);

// Estilo del botón
const ButtonStyled = styled(motion.button)(() => `
  position: absolute;
  right: 4%;
  bottom: 5%;
  transform: rotate(-35deg);
  background: linear-gradient(145deg, #0c3, #063);
  color: white;
  font-size: clamp(18px, 2.8vw, 36px);
  font-weight: 900;
  letter-spacing: 2px;
  border: none;
  padding: 22px 60px;
  border-radius: 16px;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 10px 40px rgba(0,255,0,0.4), inset 0 -4px 10px rgba(0,0,0,0.6);
  text-transform: uppercase;
  font-family: "Rubik Wet Paint", "Special Elite", sans-serif;
  text-shadow: 0 3px 5px rgba(0,0,0,0.8);
  transition: all 0.3s ease;
`);

// Animaciones para el humo — se mueven constantemente en distintas direcciones
const smokeAnimations = [
  { x: [0, 100, -100, 0], y: [0, -50, 50, 0], rotate: [0, 10, -10, 0], transition: { duration: 60, repeat: Infinity, ease: "linear" } },
  { x: [0, -120, 120, 0], y: [0, 80, -60, 0], rotate: [0, -15, 15, 0], transition: { duration: 80, repeat: Infinity, ease: "linear" } },
  { x: [0, 60, -80, 0], y: [0, -40, 70, 0], rotate: [0, 8, -8, 0], transition: { duration: 70, repeat: Infinity, ease: "linear" } },
  { x: [0, -80, 100, 0], y: [0, 50, -40, 0], rotate: [0, -12, 12, 0], transition: { duration: 90, repeat: Infinity, ease: "linear" } },
];

export default function ActivaTuMembresia() {
  const navigate = useNavigate();
  return (
    <Wrapper>
      {/* Humo verdoso denso */}
      {smokeAnimations.map((anim, i) => (
        <Smoke
          key={i}
          animate={anim}
          style={{
            opacity: 0.25 + i * 0.1,
            background: `radial-gradient(circle at ${20 + i * 20}% ${30 + i * 10}%, rgba(0,255,100,0.15), transparent 70%)`,
            filter: `blur(${80 + i * 20}px)`,
          }}
        />
      ))}

      {/* GIF central */}
      <Gif src={activGif} alt="Activa tu membresía" />

      {/* Oscurecido verdoso */}
      <Overlay />

      {/* Botón animado */}
      <ButtonStyled
        whileHover={{ rotate: -15, scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/membresias")}
      >
        ACTIVAR AHORA
      </ButtonStyled>
    </Wrapper>
  );
}

import React from "react";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import activGif from "../../assets/activatumembresia.gif";

/*
  ActivaTuMembresia - Humo realista avanzado (CSS + SVG filter)
  - Usamos feTurbulence + feDisplacementMap para textura orgánica
  - Varias capas elípticas + blur + mix-blend-mode + animaciones combinadas
  - Centro enmascarado para no tapar GIF
*/

const Wrapper = styled(Box)(() => `
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: radial-gradient(circle at 50% 30%, rgba(0,24,0,0.9), rgba(0,0,0,1));
  display: flex;
  justify-content: center;
  align-items: center;
  isolation: isolate;
`);

/* GIF central, arriba del humo */
const Gif = styled("img")(() => `
  width: auto;
  height: 86%;
  max-height: 86vh;
  z-index: 40; /* GIF arriba */
  object-fit: contain;
  filter: brightness(0.72) contrast(1.18) saturate(1.18);
  pointer-events: none;
`);

/* overlay base (oscurece ligeramente) */
const Overlay = styled(Box)(() => `
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 40% 40%, rgba(0,60,0,0.26), rgba(0,0,0,0.9));
  z-index: 12;
  pointer-events: none;
`);

/* botón (igual que antes, ajustado z-index) */
const ButtonStyled = styled(motion.button)(() => `
  position: absolute;
  right: 3%;
  bottom: 6%;
  transform: rotate(-15deg);
  background: linear-gradient(145deg, #00c64a, #036622);
  color: white;
  font-size: clamp(18px, 2.8vw, 36px);
  font-weight: 900;
  letter-spacing: 2px;
  border: none;
  padding: 22px 60px;
  border-radius: 16px;
  cursor: pointer;
  z-index: 70; /* encima de todo */
  box-shadow: 0 10px 40px rgba(0,255,0,0.28), inset 0 -4px 10px rgba(0,0,0,0.62);
  text-transform: uppercase;
  font-family: "Rubik Wet Paint", "Special Elite", sans-serif;
  text-shadow: 0 3px 6px rgba(0,0,0,0.85);
`);

/* Inyectamos keyframes y utilitarios */
const GlobalStyles = styled("style")(() => ({
  children: `
    /* Drift / swirl / opacity pulse para humo */
    @keyframes driftSlow {
      0% { transform: translate3d(0,0,0) rotate(0deg) scale(1); opacity: 0.55; }
      25% { transform: translate3d(30px,-24px,0) rotate(1deg) scale(1.02); opacity: 0.68; }
      50% { transform: translate3d(-50px,40px,0) rotate(-1.2deg) scale(1.01); opacity: 0.48; }
      75% { transform: translate3d(24px,60px,0) rotate(0.6deg) scale(1.03); opacity: 0.62; }
      100% { transform: translate3d(0,0,0) rotate(0deg) scale(1); opacity: 0.55; }
    }

    @keyframes driftFast {
      0% { transform: translate3d(0,0,0) rotate(0deg) scale(1); opacity: 0.45; }
      33% { transform: translate3d(-80px,-20px,0) rotate(-1.8deg) scale(1.08); opacity: 0.56; }
      66% { transform: translate3d(70px,70px,0) rotate(1.5deg) scale(1.02); opacity: 0.38; }
      100% { transform: translate3d(0,0,0) rotate(0deg) scale(1); opacity: 0.45; }
    }

    @keyframes innerShift {
      0% { background-position: 20% 30%; }
      50% { background-position: 80% 70%; }
      100% { background-position: 20% 30%; }
    }

    @keyframes smokePulse {
      0% { opacity: 0.42; filter: blur(30px) saturate(1.25); }
      50% { opacity: 0.72; filter: blur(60px) saturate(1.6); }
      100% { opacity: 0.42; filter: blur(30px) saturate(1.25); }
    }

    /* Centro limpio: mayor % = hueco más grande */
    .smoke-mask-center {
      -webkit-mask-image: radial-gradient(circle at center, transparent 28%, black 32%);
      mask-image: radial-gradient(circle at center, transparent 28%, black 32%);
      -webkit-mask-size: cover;
      mask-size: cover;
    }

    /* pequeño helper para dar más variación en layers */
    .smoke-layer { will-change: transform, opacity, filter, background-position; }
  `
}));

/* invisible inline SVG filter que aplicaremos a las capas de humo
   - feTurbulence genera ruido fractal
   - feDisplacementMap desplaza la capa para texturarla
*/
const SvgFilters = () => (
  <svg width="0" height="0" style={{ position: "absolute", zIndex: -1 }}>
    <defs>
      <filter id="smokeNoise1">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="2" result="turb" />
        <feDisplacementMap in="SourceGraphic" in2="turb" scale="18" xChannelSelector="R" yChannelSelector="G" />
      </filter>

      <filter id="smokeNoise2">
        <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" seed="5" result="turb2" />
        <feDisplacementMap in="SourceGraphic" in2="turb2" scale="28" xChannelSelector="R" yChannelSelector="G" />
      </filter>

      <filter id="smokeNoiseSoft">
        <feTurbulence type="fractalNoise" baseFrequency="0.3" numOctaves="4" seed="8" result="turb3" />
        <feDisplacementMap in="SourceGraphic" in2="turb3" scale="10" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  </svg>
);

/* Contenedor que mantiene las capas de humo (encima del overlay, debajo del gif) */
const SmokeWrapper = styled("div")(() => `
  position: absolute;
  inset: 0;
  z-index: 18;
  pointer-events: none;
  isolation: isolate;
`);

/* Generador de capas de humo: cada uno usa varias gradientes elípticas para formar wisps */
const Layer = styled("div", { shouldForwardProp: (p) => p !== "i" })(({ i }) => {
  /* presets con variación de formas, opacidades y tamaños */
  const presets = [
    {
      // base grande, suave
      bg: `
        radial-gradient(40% 30% at 20% 20%, rgba(210,255,210,0.34) 0%, rgba(180,240,160,0.14) 30%, transparent 55%),
        radial-gradient(30% 18% at 70% 60%, rgba(200,255,190,0.22) 0%, transparent 60%)
      `,
      filter: "url(#smokeNoiseSoft)",
      blur: 38,
      opacity: 0.56,
      anim: "driftSlow 74s linear infinite",
      innerSpeed: 28
    },
    {
      bg: `
        radial-gradient(28% 22% at 10% 70%, rgba(190,255,170,0.30) 0%, transparent 50%),
        radial-gradient(25% 40% at 60% 20%, rgba(160,255,150,0.18) 0%, transparent 55%)
      `,
      filter: "url(#smokeNoise1)",
      blur: 48,
      opacity: 0.48,
      anim: "driftFast 60s linear infinite",
      innerSpeed: 46
    },
    {
      bg: `
        radial-gradient(36% 26% at 80% 10%, rgba(220,255,200,0.28) 0%, transparent 48%),
        radial-gradient(30% 35% at 30% 70%, rgba(170,250,150,0.16) 0%, transparent 52%)
      `,
      filter: "url(#smokeNoise2)",
      blur: 64,
      opacity: 0.42,
      anim: "driftSlow 92s linear infinite",
      innerSpeed: 34
    },
    {
      bg: `
        radial-gradient(20% 18% at 75% 75%, rgba(210,255,185,0.26) 0%, transparent 50%),
        radial-gradient(28% 24% at 40% 30%, rgba(180,245,150,0.12) 0%, transparent 56%)
      `,
      filter: "url(#smokeNoise1)",
      blur: 54,
      opacity: 0.36,
      anim: "driftFast 82s linear infinite",
      innerSpeed: 40
    },
    {
      bg: `
        radial-gradient(45% 38% at 50% 85%, rgba(140,230,120,0.18) 0%, transparent 60%),
        radial-gradient(32% 26% at 18% 18%, rgba(210,255,200,0.14) 0%, transparent 55%)
      `,
      filter: "url(#smokeNoiseSoft)",
      blur: 80,
      opacity: 0.30,
      anim: "driftSlow 120s linear infinite",
      innerSpeed: 26
    },
    {
      bg: `
        radial-gradient(30% 22% at 12% 30%, rgba(230,255,210,0.20) 0%, transparent 55%),
        radial-gradient(38% 30% at 78% 48%, rgba(200,255,190,0.12) 0%, transparent 58%)
      `,
      filter: "url(#smokeNoise2)",
      blur: 72,
      opacity: 0.28,
      anim: "driftFast 110s linear infinite",
      innerSpeed: 50
    }
  ];

  const p = presets[i % presets.length];

  return `
    position: absolute;
    inset: -12% -20%;
    background: ${p.bg};
    background-size: 180% 180%;
    mix-blend-mode: screen;
    opacity: ${p.opacity};
    filter: blur(${p.blur}px) saturate(1.35) ${p.filter};
    transform-origin: center;
    animation: ${p.anim};
    will-change: transform, opacity, filter, background-position;
    pointer-events: none;
    z-index: 18;
    /* animation of inner texture (background-position) to create flow */
    animation-delay: ${i * 1.8}s;
    /* custom property to let inline style drive inner shift speed */
    --innerSpeed: ${p.innerSpeed}s;
  `;
});

/* small wispy puffs to add curls */
const Wispy = styled("div", { shouldForwardProp: (p) => p !== "styleObj" })(({ styleObj = {} }) => `
  position: absolute;
  width: ${styleObj.w}px;
  height: ${styleObj.h}px;
  left: ${styleObj.left};
  top: ${styleObj.top};
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(240,255,220,0.95) 0%, rgba(140,240,140,0.4) 40%, transparent 70%);
  filter: blur(${styleObj.blur}px) saturate(1.25);
  mix-blend-mode: screen;
  transform: translateZ(0);
  z-index: 24;
  opacity: ${styleObj.opacity};
  pointer-events: none;
  animation: ${styleObj.anim} ${styleObj.dur}s linear infinite;
`);

/* small preset wisps */
const wisps = [
  { w: 140, h: 120, left: "10%", top: "8%", blur: 18, opacity: 0.95, anim: "driftSlow", dur: 56 },
  { w: 120, h: 96, left: "78%", top: "14%", blur: 14, opacity: 0.9, anim: "driftFast", dur: 66 },
  { w: 180, h: 140, left: "6%", top: "72%", blur: 22, opacity: 0.86, anim: "driftSlow", dur: 84 },
  { w: 100, h: 88, left: "74%", top: "62%", blur: 16, opacity: 0.82, anim: "driftFast", dur: 72 }
];

export default function ActivaTuMembresia() {
  const navigate = useNavigate();

  return (
    <Wrapper style={{ marginBottom: -40 }}>
      <GlobalStyles />
      <SvgFilters />

      {/* overlay debajo del humo (humo ilumina sobre esto) */}
      <Overlay />

      {/* Smoke container — aplicamos mask para no tapar el centro (GIF) */}
      <SmokeWrapper className="smoke-mask-center" aria-hidden>
        {/* Layers — cada una tiene filter, gradients y animation */}
        {[0,1,2,3,4,5].map(i => (
          <Layer
            key={i}
            className="smoke-layer"
            i={i}
            style={{
              animationIterationCount: "infinite",
              /* animate internal background-position to create flowing texture */
              animationName: undefined,
              backgroundPosition: `${10 + i * 12}% ${20 + i * 8}%`,
              /* we run innerShift on background position separately with different durations */
              animation: undefined
            }}
          />
        ))}

        {/* Animate background-position separately using pseudo inline elements: we use additional invisible divs to animate background-position via CSS animation */}
        {/* A lightweight moving overlay to shift background-position (makes texture flow) */}
        <div style={{
          position: "absolute",
          inset: "-12% -20%",
          zIndex: 19,
          pointerEvents: "none",
          background: "transparent",
          animation: "innerShift 36s linear infinite",
          mixBlendMode: "screen"
        }} />

        {/* Wispy curls that move individually */}
        {wisps.map((w, idx) => (
          <Wispy key={idx} styleObj={w} />
        ))}
      </SmokeWrapper>

      {/* GIF encima del humo */}
      <Gif src={activGif} alt="Activa tu membresía" />

      {/* Botón final, arriba de todo */}
      <ButtonStyled
        whileHover={{ rotate: -12, scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/membresias")}
        aria-label="Activar ahora - Ir a Membresías"
      >
        ACTIVAR AHORA
      </ButtonStyled>
    </Wrapper>
  );
}

// QuickActionBar.jsx
import React from "react";
import { Box, Grid, Typography, ButtonBase } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { keyframes } from "@mui/system";

import kitGif from "../../assets/kitautocultivo.gif";
import afiliatuGif from "../../assets/afiliatuclub.gif";
import suscribeGif from "../../assets/suscribete.gif";

/*
  Recomendación: para que las tipografías se vean EXACTO como en el diseño,
  añade en tu index.html (head) algo como:
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
  Yo usaré Poppins (peso alto) + Playfair Display para un contraste elegante.
*/

const BRAND_YELLOW = "#fff200";
const BG_GREEN = "rgba(199,224,106,0.95)"; // #C7E06A con ligera opacidad
const PURPLE_ACCENT = "#7b2cff";

// suave pulso en el badge
const pulse = keyframes`
  0% { box-shadow: 0 6px 14px rgba(255,242,0,0.06); transform: translateY(0); }
  50% { box-shadow: 0 12px 30px rgba(255,242,0,0.12); transform: translateY(-2px); }
  100% { box-shadow: 0 6px 14px rgba(255,242,0,0.06); transform: translateY(0); }
`;

// glow morado en hover
const hoverStyle = {
  boxShadow: `0 18px 40px rgba(123,44,255,0.12), 0 6px 30px rgba(0,0,0,0.12)`,
  transform: "translateY(-6px) scale(1.02)",
  transition: "transform 260ms cubic-bezier(.2,.9,.3,1), box-shadow 260ms ease",
};

function ActionCard({ to, imgSrc, title, subtitle }) {
  return (
    <ButtonBase
      component={RouterLink}
      to={to}
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: { xs: 1.25, sm: 2 },
        alignItems: "center",
        textAlign: "left",
        borderRadius: 2,
        overflow: "hidden",
        p: { xs: 1.2, sm: 1.6 },
        border: "1px solid rgba(0,0,0,0.06)",
        background: "rgba(255,255,255,0.02)",
        transition: "all 260ms ease",
        "&:hover": hoverStyle,
        "&:focus-visible": {
          outline: `3px solid ${BRAND_YELLOW}`,
          outlineOffset: 4,
        },
      }}
    >
      {/* contenedor fijo para igualar tamaño de gifs */}
      <Box
        sx={{
          width: { xs: "100%", sm: 120, md: 140 },
          height: { xs: 120, sm: 96, md: 110 },
          borderRadius: 1.5,
          overflow: "hidden",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "rgba(0,0,0,0.03)",
          boxShadow: "inset 0 -12px 30px rgba(0,0,0,0.05)",
        }}
        aria-hidden
      >
        <Box
          component="img"
          src={imgSrc}
          alt={title}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transform: "translateZ(0)",
          }}
        />
      </Box>

      {/* texto */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          component="h3"
          sx={{
            fontFamily: "'Playfair Display', 'Poppins', system-ui, sans-serif",
            fontWeight: 700,
            color: "rgba(0,0,0,0.88)",
            fontSize: { xs: 15, sm: 16, md: 17 },
            lineHeight: 1.02,
            letterSpacing: "-0.2px",
            mb: 0.35,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            color: "rgba(0,0,0,0.64)",
            fontFamily: "'Poppins', system-ui, sans-serif",
            fontSize: { xs: 12, sm: 13 },
            mb: 0.6,
          }}
        >
          {subtitle}
        </Typography>

        <Box
          sx={{
            display: "inline-block",
            px: 1.4,
            py: 0.45,
            borderRadius: 1,
            bgcolor: "rgba(255,242,0,0.12)",
            color: BRAND_YELLOW,
            fontWeight: 800,
            fontSize: 12,
            border: `1px solid rgba(255,242,0,0.14)`,
            animation: `${pulse} 3200ms ease-in-out infinite`,
          }}
        >
          Ver más
        </Box>
      </Box>
    </ButtonBase>
  );
}

export default function AccionHome() {
  return (
    <Box
      component="section"
      aria-label="Barra de accesos rápidos"
      sx={{
        width: "100%",
        px: { xs: 2, sm: 4, md: 6 },
        py: { xs: 2, sm: 3 },
        background: BG_GREEN,
        borderTop: `4px solid ${PURPLE_ACCENT}`,
        borderBottom: `2px solid rgba(0,0,0,0.06)`,
      }}
    >
      <Box
        sx={{
          maxWidth: 1400,
          mx: "auto",
        }}
      >
        <Grid container spacing={{ xs: 1.2, sm: 2 }} alignItems="stretch">
          <Grid item xs={12} sm={4}>
            <ActionCard
              to="/kitautocultivo"
              imgSrc={kitGif}
              title="Kit AutoCultivo"
              subtitle="Todo lo que necesitas para comenzar tu huerto en casa"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <ActionCard
              to="/tipos-clubs"
              imgSrc={afiliatuGif}
              title="Afíliate a un Club"
              subtitle="Únete a la comunidad y obtén beneficios exclusivos"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <ActionCard
              to="/membresias"
              imgSrc={suscribeGif}
              title="Suscríbete"
              subtitle="Planes con ventajas, descuentos y contenido premium"
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

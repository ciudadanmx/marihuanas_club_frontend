import React from "react";
import NoInversion from '../../assets/noinversion.png';
import {
  Button,
  Typography,
  Box,
  Tooltip,
  Chip,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useNavigate } from "react-router-dom";
const ClubConsumoTitulo = () => {

  const navigate = useNavigate();

  return (
   
        <Box
            sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 2,
            p: 1,
            }}
        >
           <Box
            sx={{
                flex: 1,
                borderRadius: "12px",
                px: 2,
                py: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background:
                "radial-gradient(circle at 10% 20%, rgba(32, 78, 5, 1)0.95), rgba(143, 245, 96, 1) 25%, rgba(81, 255, 0, 0.9))",
                boxShadow:
                "0 8px 24px rgba(187, 199, 23, 0.9), 0 3px 8px rgba(0,0,0,0.08), 0 0 18px rgba(10, 119, 68, 1) inset",
                border: "1px solid rgba(125, 226, 85, 0.69)",
                position: "relative",
                overflow: "visible",
            }}
            >
            {/* SVG hexágono grande de fondo (decorativo) */}
            <Box
                component="svg"
                viewBox="0 0 200 200"
                sx={{
                position: "absolute",
                left: -20,
                top: -30,
                width: { xs: 80, md: 110 },
                height: { xs: 80, md: 110 },
                zIndex: 0,
                opacity: 0.95,
                filter: "drop-shadow(0 6px 18px rgba(50,205,50,0.22))",
                transform: "rotate(-12deg)",
                pointerEvents: "none",
                }}
            >
                <defs>
                <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#A1F590" />
                    <stop offset="100%" stopColor="#8FF560" />
                </linearGradient>
                <filter id="f1" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                </defs>

                {/* Hexágono principal (autocerrado como <polygon />) */}
                <polygon
                    points="100,10 160,45 160,105 100,140 40,105 40,45"
                    fill="#b0a227ff"
                    stroke="#7edf71ff"
                    strokeWidth="2"
                    filter="url(#f1)"
                />
            </Box>

            <Box sx={{ position: "relative", zIndex: 1 }}>
  <Typography
    variant="h6"
    sx={{
      fontFamily: "Poppins, Montserrat, sans-serif",
      color: "#FF9800", // Naranja profesional
      fontWeight: 600,
      opacity: 0.95,
      display: "flex",
      alignItems: "center",
      gap: "8px",
      position: "relative",
    }}
  >
    <big>
      <big>💡</big>
    </big>{" "}
    <b>¿No cuentas con capital para invertir?</b>

    {/* Imagen pequeña sobrepuesta */}
    <Box
      component="img"
      src={NoInversion}
      alt="No inversión"
      sx={{
        position: "absolute",
        top: "-10px",
        right: "-55px",
        width: "50px",
        height: "auto",
        opacity: 0.95,
        pointerEvents: "none",
      }}
    />
  </Typography>

  {/* Contenedor especial para la cifra con estrellitas pequeñas */}
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
      {/* Estrellitas pequeñas a la izquierda */}
      <Box
        component="span"
        sx={{ fontSize: 20, lineHeight: 1.1, color: "#84c25a5b" }}
      >
        ❁ <font color="#6bd86ba1">❁</font>
      </Box>
      <Box
        component="span"
        sx={{
          fontSize: 14,
          lineHeight: 1,
          color: "#c25ac293",
          opacity: 0.9,
        }}
      >
        ★
      </Box>
    </Box>

    <Typography
      variant="h6"
      sx={{
        fontWeight: 900,
        letterSpacing: 0.6,
        display: "flex",
        alignItems: "baseline",
        gap: 1,
        ml: 0.5,
      }}
    >
      <Box
        component="span"
        sx={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        {/* Cifra con fondo sutil y pequeño borde para resaltarla */}
        <Box
          sx={{
            px: { xs: 0.8, md: 1.3 },
            py: 0.4,
            borderRadius: "8px",
            background: "rgba(179, 221, 151, 0.39)",
            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            position: "relative",
            zIndex: 2,
            display: "inline-block",
            decoration: "none",
            color: "#02471dff",
            fontFamily: "'Tilt Neon', sans-serif",
            fontWeight: 400,
            fontSize: { xs: 16, md: 17 },
            letterSpacing: "0.6px",
          }}
        >
          Inicia Gratis como Club de Consumo...
        </Box>

        {/* Brillos / destellos pequeños (SVG) */}
        <Box
          component="svg"
          viewBox="0 0 48 48"
          sx={{
            position: "absolute",
            right: -18,
            top: -10,
            width: 40,
            height: 40,
            zIndex: 0,
            pointerEvents: "none",
            opacity: 0.95,
            transform: "rotate(12deg)",
          }}
        >
          <polygon
            points="24,4 39,12 39,28 24,36 9,28 9,12"
            fill="#b0a227ff"
            stroke="rgba(19, 202, 74, 0.38)"
            background="#fff"
            strokeWidth="0.8"
            filter="url(#f2)"
          />

          <polygon
            points="24,6 36,14 36,26 24,34 12,26 12,14"
            fill="none"
            stroke="rgba(255, 255, 255, 0.55)"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ mixBlendMode: "screen", opacity: 0.45 }}
            filter="url(#glow)"
          />
        </Box>
      </Box>
    </Typography>
  </Box>

        </Box>
    </Box>

    </Box>
  )
}

export default ClubConsumoTitulo
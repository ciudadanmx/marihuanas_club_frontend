// src/components/Suscribete.jsx
import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// IMPORTA la imagen (coloca membresia.png en src/assets/)
import membImg from "../../assets/membresia.png";

// Decorador a la izquierda (barras verticales cálidas)
const DecoradorLateral = styled("div")(() => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  marginRight: 20,
  "& div": {
    width: 5,
    height: 46,
    borderRadius: 4,
  },
  "& div:nth-of-type(1)": {
    background: "linear-gradient(180deg,#ffb347,#ffcc33)",
    boxShadow: "0 0 10px rgba(255,200,80,0.45)",
  },
  "& div:nth-of-type(2)": {
    background: "linear-gradient(180deg,#ff6b6b,#ffb347)",
    boxShadow: "0 0 10px rgba(255,120,70,0.4)",
  },
}));

export default function Suscribete() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
      style={{ width: "100%", marginTop: 18 }}
    >
      <Card
        elevation={10}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: `1px solid rgba(255,255,255,0.04)`,
          background:
            "linear-gradient(180deg, rgba(58,12,89,0.32), rgba(132,94,255,0.08))",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 4,
            px: { xs: 2, md: 4 },
            py: { xs: 2, md: 3 },
            flexWrap: "wrap",
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          {/* Decorador lateral vertical */}
          <DecoradorLateral>
            <div></div>
            <div></div>
          </DecoradorLateral>

          {/* Texto + Botones */}
          <Box
            sx={{
              flex: 1,
              minWidth: 280,
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", sm: "flex-start" },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                letterSpacing: -0.3,
                color: "#cc832fff",
                mb: 0.5,
              }}
            >
              Adquiere ya tu Membresía !!
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "rgba(201, 163, 194, 0.94)92)",
                fontWeight: 700,
                mb: 1,
              }}
            >
              y sé parte de la red Marihuanas.Club
            </Typography>

            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mt: 1 }}>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => navigate("/membresias")}
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 900,
                    background: "linear-gradient(90deg,#7CFF5A,#6AE6A6)",
                    color: "#06120a",
                    boxShadow: "0 12px 36px rgba(124,255,90,0.12)",
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                  }}
                  aria-label="Ir a membresías"
                >
                  Suscribirme
                </Button>
              </motion.div>

              
            </Box>
          </Box>

          {/* Imagen a la derecha */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Avatar
              variant="square"
              src={membImg}
              alt="Membresía Marihuanas.Club"
              sx={{
                width: { xs: 160, sm: 200 },
                height: { xs: 120, sm: 140 },
                border: "none", // sin borde
                backgroundColor: "transparent !important", // fondo transparente
                boxShadow: "none !important", // sin sombra
                bgcolor: "transparent", // sin color de fondo MUI
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

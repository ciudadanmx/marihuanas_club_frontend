// TiposClub.jsx
import React from "react";
import { Box, Typography, Button, Card, CardContent, Grid } from "@mui/material";
import { motion } from "framer-motion";
import { Leaf, Users, Sparkles } from "lucide-react";
import portada from "../../assets/tiposclubs.png"; // tu imagen superior

const MotionCard = motion(Card);

export default function TiposClub() {
  return (
    <Box
      sx={{
        bgcolor: "#f5fff8",
        color: "#1b1b1b",
        minHeight: "100vh",
        pb: 6,
      }}
    >
      {/* Portada */}
      <Box
        component="img"
        src={portada}
        alt="Tipos de Club"
        sx={{
          width: "100%",
          height: { xs: "240px", md: "380px" },
          objectFit: "cover",
          borderBottom: "5px solid #43a047",
        }}
      />

      {/* Encabezado */}
      <Box textAlign="center" py={4}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            color: "#1B5E20",
            mb: 2,
            textShadow: "0px 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          🌿 Elige el Tipo de Club que deseas Afiliar
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ maxWidth: 750, mx: "auto", color: "#2e7d32" }}
        >
          Únete a la red nacional de clubs solidarios. Puedes registrar tu club
          como espacio de cultivo, de consumo o participar en ambas modalidades.
        </Typography>
      </Box>

      {/* Opciones */}
      <Grid container spacing={3} justifyContent="center" px={{ xs: 2, md: 8 }}>
        {/* 1. Club de Cultivo */}
        <Grid item xs={12} md={4}>
          <MotionCard
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
            sx={{
              borderRadius: "16px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
              overflow: "hidden",
              background: "#ffffff",
              border: "2px solid #a5d6a7",
            }}
          >
            <CardContent>
              <Box textAlign="center" mb={2}>
                <Leaf size={48} color="#2e7d32" />
              </Box>
              <Typography
                variant="h5"
                textAlign="center"
                sx={{ color: "#2e7d32", fontWeight: "bold", mb: 1 }}
              >
                Club de Cultivo
              </Typography>
              <Typography variant="body1" sx={{ color: "#333", mb: 2 }}>
                Si cuentas con espacio, tiempo e inversión, puedes gestionar un
                Club de hasta <b>20 miembros</b> y ofrecer tus servicios de
                jardinero bajo una lógica solidaria y cooperativa.  
                Incluye acompañamiento legal, herramientas digitales y el{" "}
                <b>Kit de Jardinero</b> para operar tu club.
              </Typography>
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#2e7d32",
                  "&:hover": { bgcolor: "#1b5e20" },
                  borderRadius: "12px",
                  px: 3,
                }}
              >
                Afiliar mi Club de Cultivo
              </Button>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* 2. Club de Consumo */}
        <Grid item xs={12} md={4}>
          <MotionCard
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
            sx={{
              borderRadius: "16px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
              overflow: "hidden",
              background: "#fffdf5",
              border: "2px solid #ffeb3b",
            }}
          >
            <CardContent>
              <Box textAlign="center" mb={2}>
                <Users size={48} color="#fbc02d" />
              </Box>
              <Typography
                variant="h5"
                textAlign="center"
                sx={{ color: "#f57f17", fontWeight: "bold", mb: 1 }}
              >
                Club de Consumo
              </Typography>
              <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
                Si no tienes espacio o inversión suficiente, pero sí un lugar
                adecuado para recibir a usuarios adultos que ya cuentan con su
                trámite o permiso ante COFEPRIS, puedes operar un{" "}
                <b>Club de Consumo</b>.  
                Realiza actividades económicas periféricas (cafetería, cursos,
                arte, música, alimentos, etc.) y obtén ganancias solidarias.  
                No pagas nada por registrar tu espacio, solo respetas el{" "}
                <b>10% de descuento</b> a miembros activos de Marihuanas.club.
              </Typography>
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#fbc02d",
                  "&:hover": { bgcolor: "#f57f17" },
                  borderRadius: "12px",
                  px: 3,
                }}
              >
                Afiliar mi Club de Consumo
              </Button>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* 3. Ambas Modalidades */}
        <Grid item xs={12} md={4}>
          <MotionCard
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
            sx={{
              borderRadius: "16px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
              overflow: "hidden",
              background: "#f3e5f5",
              border: "2px solid #ce93d8",
            }}
          >
            <CardContent>
              <Box textAlign="center" mb={2}>
                <Sparkles size={48} color="#8e24aa" />
              </Box>
              <Typography
                variant="h5"
                textAlign="center"
                sx={{ color: "#6a1b9a", fontWeight: "bold", mb: 1 }}
              >
                Ambas Modalidades
              </Typography>
              <Typography variant="body1" sx={{ color: "#333", mb: 2 }}>
                Puedes participar en ambas modalidades:  
                <b>Club de Cultivo</b> y <b>Club de Consumo</b>.  
                Tu espacio aparecerá en ambas categorías dentro del directorio
                nacional.  
                Si aún no adquieres tu kit, puedes iniciar como club de consumo
                y posteriormente afiliarte como jardinero con membresía activa.
              </Typography>
              <Box display="flex" justifyContent="center" gap={2}>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#2e7d32",
                    "&:hover": { bgcolor: "#1b5e20" },
                    borderRadius: "10px",
                  }}
                >
                  Afiliar mi Club de Cultivo
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#fbc02d",
                    "&:hover": { bgcolor: "#f57f17" },
                    borderRadius: "10px",
                  }}
                >
                  Afiliar mi Club de Consumo
                </Button>
              </Box>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>
    </Box>
  );
}

import React from "react";
import { motion } from "framer-motion";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Divider,
} from "@mui/material";
import headerImage from "../../assets/tiposclubs.png"; // ✅ Usa tu imagen real aquí
import { useNavigate } from "react-router-dom";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const TiposClub = () => {
    const navigate = useNavigate();

    return (
    <Box sx={{ backgroundColor: "#f9fdf9", color: "#1a1a1a" }}>
      {/* 🔹 Imagen Full Width */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        sx={{
          position: "relative",
          width: "100%",
          height: { xs: 300, md: 500 },
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          src={headerImage}
          alt="Kit Jardinero"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        </Box>
       
        <Box
        component={motion.div}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        sx={{
          position: "relative",
          width: "100%",
        }}
      >
        
        <Typography
          variant="h3"
          sx={{
            mt: 4,
            mb: 2,
            fontWeight: "bold",
            color: "#14532d",
            textShadow: "1px 1px 2px #fff",
          }}
        >
          Red de Clubs Solidarios 🌱
        </Typography>
        <Typography
          variant="h6"
          sx={{ color: "#1f2937", maxWidth: "900px", mx: "auto" }}
        >
          Conoce las tres modalidades para participar en la red de clubs sin
          fines de lucro. Puedes iniciar con un kit de jardinero, abrir un club
          de consumo o combinar ambas opciones.
        </Typography>
     

      {/* Sección Kit Inicial del Jardinero */}
      <motion.div variants={fadeIn} initial="hidden" whileInView="show">
        <Card
          sx={{
            mb: 8,
            background: "rgba(255,255,255,0.95)",
            borderRadius: "24px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          }}
        >
          <CardContent>
            <Typography variant="h4" color="success.main" fontWeight="bold" gutterBottom>
              🌱 Kit Inicial del Jardinero del Club
            </Typography>
            <Typography variant="h6" sx={{ mb: 2 }}>
              💸 Precio preferencial:{" "}
              <span
                style={{
                  backgroundColor: "#e3f7e9",
                  padding: "6px 10px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                }}
              >
                Solo $10,000 MXN
              </span>
            </Typography>

            <Typography sx={{ mb: 2 }}>
              👨‍🌾 Tu punto de partida para crear un club de cultivo responsable
              y autosustentable. Este kit te convierte en <b>jardinero acreditado</b> de
              la red, con todo lo necesario —físico, legal y digital— para operar
              un espacio seguro, donde cada miembro cultiva sus propias semillas
              bajo tus servicios de renta, asesoría y seguimiento técnico.
            </Typography>

            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" color="success.dark" fontWeight="bold">
              ⚖️ Marco legal y acompañamiento
            </Typography>
            <Typography sx={{ mb: 2 }}>
              - Gestión completa ante COFEPRIS (uso personal, amparo incluido).<br />
              - Membresía oficial de jardinero y acceso a soporte jurídico.<br />
              - Generador automático de estatutos internos, acta constitutiva y documentación SAT.<br />
              - Asistencia personalizada por WhatsApp durante todo el proceso.
            </Typography>

            <Typography variant="h6" color="success.dark" fontWeight="bold">
              🛠️ Infraestructura de cultivo incluida
            </Typography>
            <Typography sx={{ mb: 2 }}>
              - 3 armarios modulares de 80 cm² (para 6 plantas c/u).<br />
              - 5 lámparas LED de 300 W, 3 extractores y ventiladores.<br />
              - Hub Raspberry Pi + 4 cámaras HD para monitoreo remoto.<br />
              - Kit de germinación profesional con sustratos y medidores.
            </Typography>

            <Typography variant="h6" color="success.dark" fontWeight="bold">
              💻 Herramientas digitales del jardinero
            </Typography>
            <Typography sx={{ mb: 2 }}>
              Incluye acceso al sistema de gestión y bitácoras automatizadas: registro de fotos,
              videos, trazabilidad por semilla, firma digital y almacenamiento en la nube.
              Cada usuario lleva sus propias semillas, el jardinero solo renta el espacio
              y servicios de cultivo.
            </Typography>

            <Typography variant="h6" color="success.dark" fontWeight="bold">
              ⚡ Sistema de energía individualizada
            </Typography>
            <Typography sx={{ mb: 2 }}>
              Cada nuevo miembro instala su propio medidor ante CFE, garantizando consumo
              transparente y sustentable. Reduce costos y fomenta autonomía.
            </Typography>

            <Typography variant="h6" color="success.dark" fontWeight="bold">
              📦 Entrega y soporte
            </Typography>
            <Typography sx={{ mb: 2 }}>
              - Financiado con las dos primeras mensualidades.<br />
              - Envío nacional en dos entregas con manual, soporte y acceso inmediato al sistema.<br />
              - Certificación digital como Jardinero Responsable tras tu primer trimestre.
            </Typography>
          </CardContent>
        </Card>
      </motion.div>

      {/* Modalidades */}
      <Grid container spacing={4} justifyContent="center" maxWidth="1200px" mx="auto">
        {/* Club de Cultivo */}
        <Grid item xs={12} md={4}>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
            <Card
              sx={{
                background: "white",
                borderRadius: "24px",
                p: 2,
                height: "100%",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              }}
            >
              <CardContent>
                <Typography variant="h5" color="success.main" fontWeight="bold">
                  🌿 Club de Cultivo Solidario
                </Typography>
                <Typography sx={{ mt: 2 }}>
                  Gestiona un club de hasta 20 miembros y ofrece tus servicios de jardinero
                  bajo lógica cooperativa. Los usuarios llevan sus propias semillas, y tú
                  solo rentas espacio, equipo y servicios. Incluye respaldo jurídico y
                  herramientas digitales.
                </Typography>
                <Button
                    variant="contained"
                    color="success"
                    size="large"
                    sx={{ mt: 3, borderRadius: "999px" }}
                    onClick={() => navigate("/clubs/afiliar-jardinero")}
                    >
                    Afiliar mi Club de Cultivo
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Club de Consumo */}
        <Grid item xs={12} md={4}>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
            <Card
              sx={{
                background: "white",
                borderRadius: "24px",
                p: 2,
                height: "100%",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              }}
            >
              <CardContent>
                <Typography variant="h5" color="success.main" fontWeight="bold">
                  🍃 Club de Consumo
                </Typography>
                <Typography sx={{ mt: 2 }}>
                  Si tienes un espacio adecuado para recibir usuarios con permiso COFEPRIS,
                  puedes afiliarte gratis. Realiza actividades en industrias periféricas
                  (arte, cocina, bienestar), gana por ellas y respeta descuentos del 10 % a
                  miembros activos de Marihuanas.Club.
                </Typography>
                <Button
                    variant="contained"
                    color="success"
                    size="large"
                    sx={{ mt: 3, borderRadius: "999px" }}
                    onClick={() => navigate("/clubs/agregar-club")}
                >
                  Afiliar mi Club de Consumo
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Club Mixto */}
        <Grid item xs={12} md={4}>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
            <Card
              sx={{
                background: "white",
                borderRadius: "24px",
                p: 2,
                height: "100%",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              }}
            >
              <CardContent>
                <Typography variant="h5" color="success.main" fontWeight="bold">
                  🌱 Club Mixto (Cultivo + Consumo)
                </Typography>
                <Typography sx={{ mt: 2 }}>
                  Combina ambas modalidades y ofrece experiencias completas.
                  Tu club aparecerá en ambas categorías, con difusión ampliada,
                  acceso a capacitaciones y beneficios digitales.
                </Typography>
                <Box display="flex" flexDirection="column" gap={2} mt={3}>
                  <Button variant="contained" color="success" size="large" sx={{ borderRadius: "999px" }}>
                    Afiliar mi Club de Cultivo
                  </Button>
                  <Button variant="outlined" color="success" size="large" sx={{ borderRadius: "999px" }}>
                    Afiliar mi Club de Consumo
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
    </Box>
  );
};

export default TiposClub;
// Internacional.jsx
import React from "react";
import InternationalHero from "./InternationalHero.jsx"; // <-- asegúrate que la ruta coincide
import {
  Box,
  Typography,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/CheckCircle";
import PublicIcon from "@mui/icons-material/Public";
import HandshakeIcon from "@mui/icons-material/Handshake";
import RocketIcon from "@mui/icons-material/Rocket";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

const Internacional = () => {
  return (
    <>
      {/* Hero importado (ocupa 100vh) */}
      <InternationalHero />

      {/* Sección Internacional completa, justo debajo del hero */}
      <Box
        id="internacional-section"
        sx={{
          position: "relative",
          zIndex: 1,
          backgroundColor: "#0f0f0f",
          color: "#f0f0f0",
          py: { xs: 8, md: 12 },
          px: 2,
          borderTopLeftRadius: { xs: 0, md: 12 },
          borderTopRightRadius: { xs: 0, md: 12 },
          mt: -4,
          mb: -7,
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: "left" }}>
          {/* Intro */}
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: "#a0ff7f" }}>
            Creciendo juntos, país por país — cultivando comunidad y tecnología 🌱
          </Typography>

          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.7, color: "#e9e9e9" }}>
            Marihuanas.club no es solo una red: es un ecosistema digital cooperativo que conecta a
            los clubs cannábicos solidarios del mundo con herramientas tecnológicas, trazabilidad
            transparente y una visión compartida de autocultivo responsable y legalización consciente.
          </Typography>

          {/* Modelo adaptable */}
          <Typography variant="h5" sx={{ mb: 2, color: "#ffd166", fontWeight: 700 }}>
            🌐 Un modelo adaptable a cada país
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, color: "#e9e9e9" }}>
            Cada territorio tiene su propia forma de entender el cannabis — y nosotros nos adaptamos.
            Nuestra plataforma se configura según las leyes, prácticas y cultura local:
          </Typography>

          <List sx={{ mb: 3 }}>
            {[
              "🇲🇽 México — Clubs de Cultivo Solidario con amparo y registro de miembros.",
              "🇪🇸 España — Asociaciones privadas y autoconsumo controlado.",
              "🇩🇪 Alemania — Clubs Sociales con licencia y límites de trazabilidad.",
              "🇨🇴 Colombia — Cultivo solidario y autoconsumo medicinal.",
              "🇺🇾 Uruguay — Clubs registrados ante IRCCA.",
              "🇲🇹 Malta — Asociaciones cannábicas legales con control estatal.",
            ].map((text, i) => (
              <ListItem key={i} alignItems="flex-start" disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <PublicIcon sx={{ color: "#00ff99" }} />
                </ListItemIcon>
                <ListItemText
                  primary={text}
                  primaryTypographyProps={{ color: "#f0f0f0", fontSize: "0.98rem" }}
                />
              </ListItem>
            ))}
          </List>

          {/* Tecnología */}
          <Typography variant="h5" sx={{ mt: 1, mb: 2, color: "#ffd166", fontWeight: 700 }}>
            💻 Tecnología para la autogestión
          </Typography>

          <List sx={{ mb: 3 }}>
            {[
              "Registrar a sus miembros.",
              "Generar QRs únicos por planta.",
              "Llevar bitácoras digitales de cultivo y distribución.",
              "Controlar límites y trazabilidad según normativa local.",
              "Comunicar a su comunidad con total privacidad y transparencia.",
            ].map((text, i) => (
              <ListItem key={i} alignItems="flex-start" disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <CheckIcon sx={{ color: "#00ff99" }} />
                </ListItemIcon>
                <ListItemText primary={text} primaryTypographyProps={{ color: "#f0f0f0" }} />
              </ListItem>
            ))}
          </List>

          <Typography variant="body2" sx={{ mt: 2, mb: 4, color: "#dcdcdc" }}>
            Toda la información permanece encriptada y es auditable internamente, sin depender de plataformas externas.
          </Typography>

          {/* Socios */}
          <Typography variant="h5" sx={{ mt: 2, mb: 1, color: "#ffd166", fontWeight: 700 }}>
            🤝 Conviértete en socio de tu país
          </Typography>

          <Typography variant="body1" sx={{ mb: 2, color: "#e9e9e9" }}>
            Buscamos socios locales y colectivos pioneros que deseen implementar el modelo en su país o región.
            Nosotros proporcionamos la tecnología, el marco operativo y la marca; tú aportas el conocimiento del contexto local.
          </Typography>

          <List sx={{ mb: 3 }}>
            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LocalOfferIcon sx={{ color: "#00ff99" }} />
              </ListItemIcon>
              <ListItemText primary="Licencia nacional o regional." primaryTypographyProps={{ color: "#f0f0f0" }} />
            </ListItem>

            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <HandshakeIcon sx={{ color: "#00ff99" }} />
              </ListItemIcon>
              <ListItemText primary="Renta mensual por club activo." primaryTypographyProps={{ color: "#f0f0f0" }} />
            </ListItem>

            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <RocketIcon sx={{ color: "#00ff99" }} />
              </ListItemIcon>
              <ListItemText primary="Ingresos compartidos por membresías o servicios." primaryTypographyProps={{ color: "#f0f0f0" }} />
            </ListItem>

            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <RocketIcon sx={{ color: "#00ff99" }} />
              </ListItemIcon>
              <ListItemText primary="Posibilidad de ser embajador oficial o operador país." primaryTypographyProps={{ color: "#f0f0f0" }} />
            </ListItem>
          </List>

          <Typography variant="body1" sx={{ mt: 2, mb: 2, color: "#e9e9e9" }}>
            Sé parte de la nueva era del cannabis solidario. 🌿 <strong>Marihuanas.club:</strong> cultivando comunidad, tecnología y derechos.
          </Typography>

          <Box textAlign="center" mt={3}>
            <Button
              variant="contained"
              color="success"
              sx={{
                fontWeight: 700,
                fontSize: "1.05rem",
                py: 1.1,
                px: 4,
                boxShadow: "0 6px 30px rgba(0,255,150,0.12)",
                "&:hover": { transform: "translateY(-3px)" },
              }}
              onClick={() => {
                // ejemplo: abrir modal de contacto o scroll, ajusta según tu app
                const el = document.querySelector("#contact-section") || document.querySelector("#internacional-section");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            >
              💌 Únete a la expansión internacional →
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Internacional;

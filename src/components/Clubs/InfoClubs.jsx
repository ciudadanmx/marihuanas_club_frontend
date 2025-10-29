// src/components/InfoClubs.jsx
import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Chip,
  Divider,
  Stack,
  IconButton,
  useTheme,
  Badge,
  styled
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import PeopleIcon from "@mui/icons-material/People";
import HandshakeIcon from "@mui/icons-material/Handshake";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ReplayIcon from "@mui/icons-material/Replay";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import { motion } from "framer-motion";

import clubsVideo from "../../assets/clubs.mp4";

// ---------- Paleta y estilos ----------
const styles = {
  accentGradient: "linear-gradient(90deg,#8ef56b,#6ae6a6 45%,#b48bff 100%)",
  moradoGradient:
    "linear-gradient(120deg, rgba(132,94,255,0.12) 0%, rgba(175,96,255,0.08) 40%, rgba(58,12,89,0.04) 100%)",
  cardBg:
    "linear-gradient(180deg, rgba(18,10,30,0.6), rgba(40,10,60,0.45))",
  glassBorder: "rgba(255,255,255,0.04)",
  titleFont: `"Poppins", "Inter", "Segoe UI", Roboto, sans-serif`,
  bodyFont: `"Inter", "Roboto", "Segoe UI", sans-serif`
};

const ICON_YELLOW = "#FFD54A";

const parent = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { staggerChildren: 0.06 } }
};
const floaty = {
  rest: { y: 0 },
  hover: { y: -6, transition: { duration: 0.35, ease: "easeOut" } }
};

const AccentBar = styled("div")(({ theme }) => ({
  width: 8,
  borderRadius: 8,
  marginRight: 14,
  background: styles.accentGradient,
  boxShadow: "0 10px 30px rgba(88, 64, 255, 0.12)"
}));

const GlowChip = styled(Chip)(({ theme }) => ({
  borderRadius: 10,
  fontWeight: 800,
  letterSpacing: -0.2,
  boxShadow: "0 12px 36px rgba(111,66,193,0.12)",
  background: "linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
  border: `1px solid rgba(255,255,255,0.03)`
}));

const SECCIONES = [
  {
    id: "legalidad",
    icon: <LocalFloristIcon />,
    title: "¿Se puede consumir Cannabis de forma totalmente legal en México?",
    subtitle: "No y sí — explicación legal y práctica",
    content: [
      { type: "lead", text: "No y sí." },
      { type: "p", text: "..." } // truncado por brevedad
    ]
  },
  {
    id: "consumo",
    icon: <PeopleIcon />,
    title: "Clubs de Consumo",
    subtitle: "Espacios seguros, comunitarios y con servicios periféricos",
    content: [{ type: "p", text: "..." }]
  },
  {
    id: "cultivo",
    icon: <HandshakeIcon />,
    title: "Clubs de Cultivo Solidario",
    subtitle: "Organizados, transparentes y sin fines de lucro",
    content: [{ type: "p", text: "..." }]
  }
];

export default function InfoClubs() {
  const theme = useTheme();
  const videoRef = useRef(null);
  const [isLoop, setIsLoop] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showBigPlay, setShowBigPlay] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // manejar play/pause
  useEffect(() => {
    if (!videoRef.current) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    videoRef.current.addEventListener("play", onPlay);
    videoRef.current.addEventListener("pause", onPause);
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener("play", onPlay);
        videoRef.current.removeEventListener("pause", onPause);
      }
    };
  }, []);

  // sincronizar loop/mute en el elemento
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.loop = isLoop;
    videoRef.current.muted = isMuted;
  }, [isLoop, isMuted]);

  // 🔥 nuevo efecto: autoplay solo cuando entra al viewport y el usuario ya interactuó
  useEffect(() => {
    if (!videoRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          if (userInteracted && videoRef.current.paused) {
            videoRef.current.play().catch(() => {});
          }
        } else {
          if (!videoRef.current.paused) {
            videoRef.current.pause();
          }
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [userInteracted]);

  return (
    <motion.div initial="hidden" animate="show" variants={parent}>
      <Card
        elevation={14}
        sx={{
          borderRadius: 3,
          overflow: "visible",
          p: 0,
          background: styles.cardBg,
          border: `1px solid ${styles.glassBorder}`,
          boxShadow: "0 30px 80px rgba(8,8,20,0.45)"
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <AccentBar />
            <Box sx={{ minWidth: 0 }}>
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.06 } }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: styles.titleFont,
                    fontWeight: 900,
                    letterSpacing: -0.6,
                    mb: 0.3,
                    color: "#7CFF5A",
                    textShadow: "0 6px 30px rgba(124,255,90,0.08)"
                  }}
                >
                  Clubs & Cultivo — Marihuanas.Club
                </Typography>
              </motion.div>
              <Typography
                variant="body2"
                color="rgba(255,255,255,0.7)"
                sx={{ fontFamily: styles.bodyFont }}
              >
                Guía clara, con estilo y presencia — todo lo esencial sobre consumo, clubs y cultivo solidario.
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }} />
            <motion.div whileHover={{ scale: 1.06, rotate: -3 }}>
              <GlowChip
                icon={<EmojiObjectsIcon />}
                label="Información verificada"
                variant="outlined"
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderColor: "rgba(255,255,255,0.04)"
                }}
              />
            </motion.div>
          </Stack>

          {/* --- VIDEO --- */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: 0.12, duration: 0.6 } }}
            style={{ marginTop: 6 }}
          >
            <Box
              sx={{
                width: "100%",
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.04)",
                background: styles.moradoGradient,
                boxShadow: "0 18px 60px rgba(34,16,60,0.45)",
                position: "relative"
              }}
            >
              <video
                ref={videoRef}
                src={clubsVideo}
                // 👇 quitamos autoplay aquí 👇
                loop={isLoop}
                muted={isMuted}
                playsInline
                controls
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  objectFit: "cover",
                  maxHeight: 320,
                }}
              />

              {/* Overlay decorativo */}
              <Box
                sx={{
                  position: "relative",
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: 2,
                  background: "linear-gradient(180deg, rgba(0,0,0,0.0), rgba(0,0,0,0.12))"
                }}
              >
                <Avatar sx={{ bgcolor: "transparent", width: 48, height: 48 }}>
                  <LocalFloristIcon sx={{ color: ICON_YELLOW }} />
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 800, color: "#fff" }}>
                    Bienvenido a la Red de Clubs
                  </Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.75)">
                    Video presentación — ambiente, normas y comunidad.
                  </Typography>
                </Box>
              </Box>

              {/* Controles custom */}
              <Box
                sx={{
                  position: "absolute",
                  right: 12,
                  bottom: 12,
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                  zIndex: 30
                }}
              >
                <IconButton
                  onClick={() => {
                    if (!videoRef.current) return;
                    if (videoRef.current.paused) {
                      videoRef.current.play().catch(() => {});
                      setUserInteracted(true);
                    } else {
                      videoRef.current.pause();
                    }
                  }}
                  sx={{
                    bgcolor: "rgba(0,0,0,0.45)",
                    color: "#fff",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.55)" }
                  }}
                >
                  {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>

                <IconButton
                  onClick={() => {
                    const next = !isLoop;
                    setIsLoop(next);
                    if (videoRef.current) videoRef.current.loop = next;
                  }}
                  sx={{
                    bgcolor: isLoop ? "rgba(124,255,90,0.14)" : "rgba(0,0,0,0.45)",
                    color: isLoop ? "#062e00" : "#fff",
                    "&:hover": { bgcolor: isLoop ? "rgba(124,255,90,0.18)" : "rgba(0,0,0,0.55)" }
                  }}
                >
                  <ReplayIcon />
                </IconButton>

                <IconButton
                  onClick={() => {
                    const nextMuted = !isMuted;
                    setIsMuted(nextMuted);
                    if (videoRef.current) {
                      videoRef.current.muted = nextMuted;
                      if (!nextMuted && videoRef.current.paused) {
                        videoRef.current.play().catch(() => {});
                        setUserInteracted(true);
                      }
                    }
                  }}
                  sx={{
                    bgcolor: "rgba(0,0,0,0.45)",
                    color: "#fff",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.55)" }
                  }}
                >
                  {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                </IconButton>
              </Box>

              {/* overlay si autoplay bloqueado */}
              {showBigPlay && (
                <Box
                  onClick={async () => {
                    try {
                      if (!videoRef.current) return;
                      await videoRef.current.play();
                      videoRef.current.muted = false;
                      setIsMuted(false);
                      setShowBigPlay(false);
                      setUserInteracted(true);
                    } catch (e) {}
                  }}
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "grid",
                    placeItems: "center",
                    background: "linear-gradient(180deg, rgba(0,0,0,0.24), rgba(0,0,0,0.36))",
                    zIndex: 25,
                    cursor: "pointer"
                  }}
                >
                  <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}>
                    <Box sx={{ bgcolor: "rgba(255,255,255,0.06)", borderRadius: "50%", p: 2 }}>
                      <PlayArrowIcon sx={{ fontSize: 44, color: "#fff" }} />
                    </Box>
                    <Typography sx={{ color: "#fff", mt: 1, textAlign: "center" }}>
                      Tocar para reproducir con audio
                    </Typography>
                  </motion.div>
                </Box>
              )}
            </Box>
          </motion.div>

          <Divider sx={{ my: 2, borderStyle: "dashed", borderColor: "rgba(255,255,255,0.03)" }} />

          {/* acordeones */}
          <Box>
            {SECCIONES.map((s, idx) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.18 + idx * 0.06 } }}
                style={{ marginBottom: 14 }}
              >
                <Accordion
                  sx={{
                    borderRadius: 2,
                    background: "linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
                    border: `1px solid rgba(255,255,255,0.02)`,
                    boxShadow: "0 8px 30px rgba(8,6,20,0.06)"
                  }}
                  disableGutters
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ fontSize: 28 }} />}
                    sx={{
                      minHeight: 64,
                      "& .MuiAccordionSummary-content": { gap: 1, alignItems: "center" },
                      px: { xs: 2, md: 3 }
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ width: "100%" }}>
                      <motion.div whileHover="hover" initial="rest" variants={floaty}>
                        <Avatar
                          sx={{
                            width: 52,
                            height: 52,
                            bgcolor: "transparent",
                            border: `1px solid rgba(255,255,255,0.03)`,
                            boxShadow: "0 8px 26px rgba(124,255,90,0.06)"
                          }}
                        >
                          {React.cloneElement(s.icon, { sx: { color: ICON_YELLOW, fontSize: 28 } })}
                        </Avatar>
                      </motion.div>
                      <Box sx={{ textAlign: "left" }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 900,
                            fontFamily: styles.titleFont,
                            letterSpacing: -0.3,
                            color: "#EEF2FF"
                          }}
                        >
                          {s.title}
                        </Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.65)" sx={{ fontFamily: styles.bodyFont }}>
                          {s.subtitle}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }} />
                      <Badge
                        badgeContent={idx + 1}
                        color="success"
                        sx={{
                          mr: { xs: 0, md: 1 },
                          "& .MuiBadge-badge": {
                            fontWeight: 800,
                            fontFamily: styles.bodyFont,
                            boxShadow: "0 6px 20px rgba(124,255,90,0.12)"
                          }
                        }}
                      />
                    </Stack>
                  </AccordionSummary>
                </Accordion>
              </motion.div>
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />
        </CardContent>
      </Card>
    </motion.div>
  );
}

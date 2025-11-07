// src/pages/TiposClub.jsx
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Divider,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import headerImage from "../../assets/tiposclubs.png";
import kitImage from "../../assets/kitjardinero.png";
import { useNavigate } from "react-router-dom";
import ClubConsumo from '../../components/Clubs/ClubConsumo.jsx';
import ClubConsumoTitulo from '../../components/Clubs/ClubConsumoTitulo.jsx';
import TarjetasModal from '../../components/Clubs/TarjetasModal.jsx';

import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ReplayIcon from "@mui/icons-material/Replay";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";

import jardinero from "../../assets/jardineros.mp4";

const styles = {
  accentGradient: "linear-gradient(90deg,#8ef56b,#6ae6a6 45%,#b48bff 100%)",
  moradoGradient:
    "linear-gradient(120deg, rgba(132,94,255,0.12) 0%, rgba(175,96,255,0.08) 40%, rgba(58,12,89,0.04) 100%)",
  cardBg:
    "linear-gradient(180deg, rgba(18,10,30,0.6), rgba(40,10,60,0.45))", // morado oscuro sutil
  glassBorder: "rgba(255,255,255,0.04)",
  titleFont: `"Poppins", "Inter", "Segoe UI", Roboto, sans-serif`,
  bodyFont: `"Inter", "Roboto", "Segoe UI", sans-serif`
};


const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const TiposClub = () => {
  const navigate = useNavigate();

  const [kitItems, setKitItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [errorItems, setErrorItems] = useState(null);

  // Estado para el modal de la imagen del kit
  const [openKitModal, setOpenKitModal] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleOpenKitModal = () => setOpenKitModal(true);
  const handleCloseKitModal = () => setOpenKitModal(false);

// ------------------------------
// Reemplazar extractImageUrl + useEffect
// ------------------------------

const extractImageUrl = (field, envBaseFallback) => {
  if (!field) return null;

  let url = null;
  try {
    if (typeof field === "string") {
      url = field;
    } else if (field.data && Array.isArray(field.data) && field.data.length > 0) {
      url = field.data[0]?.attributes?.url || field.data[0]?.url || null;
    } else if (field.data && field.data.attributes) {
      url = field.data.attributes.url || null;
    } else if (field.attributes && field.attributes.url) {
      url = field.attributes.url;
    } else if (field.url) {
      url = field.url;
    }
  } catch (e) {
    console.warn("[kit][debug] error extrayendo url:", e);
    url = null;
  }

  if (!url) return null;

  if (url.startsWith("/")) {
    const base = envBaseFallback || window.location.origin;
    return `${base}${url}`;
  }
  return url;
};

useEffect(() => {
  const uniq = ['https://back.ciudadan.org/api/kitjardineros?populate=*'];
  console.log("Endpoints usados:", uniq);

  async function fetchItems() {
    setLoadingItems(true);
    setErrorItems(null);

    let parsed = [];
    let foundUrl = null;

    for (const url of uniq) {
      try {
        const res = await fetch(url, { method: "GET", mode: "cors" });
        if (!res.ok) {
          continue;
        }

        const text = await res.text();
        let json = null;
        try {
          json = text ? JSON.parse(text) : null;
        } catch (jerr) {
          continue;
        }

        // Caso Strapi: array en json.data
        if (Array.isArray(json.data)) {
          console.log('⁉️⁉️⁉️⁉️aca si');
          parsed = json.data.map((d) => d.attributes || d);
        }
        // Caso Strapi: json.data con attributes que contienen una colección
        else if (json.data && json.data.attributes) {
          const attrs = json.data.attributes;
          const arrFromAttrs = Object.values(attrs).find(
            (v) => Array.isArray(v) || (v && v.data && Array.isArray(v.data))
          );
          if (Array.isArray(arrFromAttrs)) {
            parsed = arrFromAttrs.map((i) => (i.attributes ? i.attributes : i));
          } else if (arrFromAttrs && Array.isArray(arrFromAttrs.data)) {
            parsed = arrFromAttrs.data.map((i) => (i.attributes ? i.attributes : i));
          } else {
            if ("cantidad" in attrs && "nombre" in attrs) parsed = [attrs];
          }
        }
        // Fallback: buscar primer array en el JSON
        else {
          const possible = Object.values(json).find((v) => Array.isArray(v));
          if (Array.isArray(possible)) parsed = possible;
        }

        foundUrl = url;
        break; // usamos este endpoint válido
      } catch (err) {
        console.error("[kit] error fetch a", url, err);
        continue;
      }
    } // end for

    if (!foundUrl) {
      setErrorItems(
        "No se encontró endpoint válido (revisa REACT_APP_STRAPI_URL, CORS o que la ruta /api/kitjardineros esté disponible). Mira la consola."
      );
      setKitItems([]);
      setLoadingItems(false);
      return;
    }

    // 🪴 Filtrar solo los items con pack === "jardinero"
    parsed = parsed.filter((it) => it.pack === "jardinero");

    const envBaseForImages =
      (process.env.REACT_APP_STRAPI_URL || "").replace(/\/$/, "") ||
      window.location.origin;
    const normalized = (parsed || []).map((it) => {
      const imageField = it.imagen ?? it.imagenes ?? it.image ?? null;
      const imagenUrl = extractImageUrl(imageField, envBaseForImages);
      return {
        cantidad: it.cantidad ?? it.Cantidad ?? 0,
        nombre: it.nombre ?? it.name ?? it.titulo ?? "",
        texto: it.texto ?? it.descripcion ?? it.description ?? "",
        precio: it.precio ?? null,
        imagenUrl,
        id: it.id ?? Math.random().toString(36).slice(2, 9),
      };
    });

    setKitItems(normalized);
    setLoadingItems(false);
  }

  fetchItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);



function LocalPlayer({ src, poster, maxHeight = 260 }) {
    const localRef = useRef(null);
    const [localPlaying, setLocalPlaying] = useState(false);
    const [localMuted, setLocalMuted] = useState(true); // por defecto muted para evitar bloqueo
    const [localLoop, setLocalLoop] = useState(true);

    useEffect(() => {
      if (!localRef.current) return;
      localRef.current.loop = localLoop;
    }, [localLoop, localMuted]);

    return (
      <Box sx={{ mt: 2, borderRadius: 2, overflow: "hidden", border: "1px solid rgba(255,255,255,0.03)", background: styles.moradoGradient, position: "relative" }}>
        <video
          ref={localRef}
          src={src}
          poster={poster}
          playsInline
          controls
          style={{ width: "100%", height: "auto", display: "block", objectFit: "cover", maxHeight }}
        />

        <Box sx={{ position: "absolute", right: 12, bottom: 12, display: "flex", gap: 1, alignItems: "center", zIndex: 30 }}>


          <IconButton
            onClick={() => {
              const next = !localLoop;
              setLocalLoop(next);
              if (localRef.current) localRef.current.loop = next;
            }}
            sx={{ bgcolor: localLoop ? "rgba(124,255,90,0.14)" : "rgba(0,0,0,0.45)", color: localLoop ? "#062e00" : "#fff", "&:hover": { bgcolor: localLoop ? "rgba(124,255,90,0.18)" : "rgba(0,0,0,0.55)" } }}
          >
            <ReplayIcon />
          </IconButton>

          
        </Box>
      </Box>
    );
  }


  return (
    <Box sx={{ backgroundColor: "#f9fdf9", color: "#1a1a1a", pb: 8 }}>
      {/* Imagen Full Width */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        sx={{
          position: "relative",
          width: "100%",
          height: { xs: 260, md: 420 },
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          src={headerImage}
          alt="Encabezado Tipos Club"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "saturate(1.05) contrast(1.03)",
          }}
        />
      </Box>

      <Box
        component={motion.div}
        variants={fadeIn}
        initial="hidden"
        whileInView="show"
        sx={{ px: { xs: 2, md: 6 }, mt: { xs: 3, md: 6 } }}
      >
        <Typography
          variant="h3"
          sx={{
            mt: 2,
            mb: 1,
            fontWeight: "bold",
            color: "#14532d",
            textShadow: "0 2px 6px rgba(0,0,0,0.08)",
          }}
        >
          Red de Clubs Solidarios 🌱
        </Typography>
        <Typography
          variant="h6"
          sx={{ color: "#1f2937", maxWidth: "900px", mx: "auto", mb: 3 }}
        >
          Conoce las tres modalidades para participar en la red de clubs sin fines de lucro.
          Puedes iniciar con un kit de jardinero, abrir un club de consumo o combinar ambas opciones.
        </Typography>

        {/* Card principal Kit */}
        <Card
          sx={{
            mb: 6,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,255,250,0.98) 100%)",
            borderRadius: "20px",
            boxShadow: "0 18px 40px rgba(6,30,15,0.12)",
            overflow: "visible",
          }}
        >
          <CardContent>
            <Grid container spacing={3} alignItems="flex-start">
              {/* Texto + precio + items (izquierda) */}
              <Grid item xs={12} md={8}>
                  <h1><font color="green"> 🌱 Kit Inicial del Jardinero del Club</font></h1>
                {/* Barra de precio llamativa con estrella SVG decorativa */}
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
                        "radial-gradient(circle at 10% 20%, rgba(97, 224, 59, 0.95), rgba(255,223,0,0.95) 25%, rgba(255,196,0,0.9))",
                      boxShadow:
                        "0 8px 24px rgba(255,197,0,0.15), 0 3px 8px rgba(0,0,0,0.08), 0 0 18px rgba(255,223,0,0.25) inset",
                      border: "1px solid rgba(0,0,0,0.05)",
                      position: "relative",
                      overflow: "visible",
                    }}
                  >
                    {/* SVG estrella grande de fondo (decorativa) */}
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
                        filter: "drop-shadow(0 6px 18px rgba(255,200,0,0.22))",
                        transform: "rotate(-12deg)",
                        pointerEvents: "none",
                      }}
                    >
                      <defs>
                        <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
                          <stop offset="0%" stopColor="#fff200" />
                          <stop offset="100%" stopColor="#ffdd00" />
                        </linearGradient>
                        <filter id="f1" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="6" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      {/* Estrella poligonal */}
                      <polygon
                        points="100,10 117,72 182,72 129,110 146,172 100,135 54,172 71,110 18,72 83,72"
                        fill="url(#g1)"
                        stroke="#6d6e71"
                        strokeWidth="2"
                        filter="url(#f1)"
                      />
                    </Box>

                    <Box sx={{ position: "relative", zIndex: 1 }}>
                      <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                        💸 Precio preferencial
                      </Typography>

                      {/* Contenedor especial para la cifra con estrellitas pequeñas */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                          {/* Estrellitas pequeñas a la izquierda */}
                          <Box component="span" sx={{ fontSize: 20, lineHeight: 1.1 }}>✦</Box>
                          <Box component="span" sx={{ fontSize: 14, lineHeight: 1, opacity: 0.9 }}>★</Box>
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
                          <Box component="span" sx={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                            {/* Cifra con fondo sutil y pequeño borde para resaltarla */}
                            <Box
                              sx={{
                                px: { xs: 1, md: 1.5 },
                                py: 0.5,
                                borderRadius: "8px",
                                background: "rgba(255,255,255,0.65)",
                                boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                                position: "relative",
                                zIndex: 2,
                                display: "inline-block",
                                color: "#006400",
                              }}
                            >
                              $ 15,000 MXN
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
                              <defs>
                                <linearGradient id="g2" x1="0" x2="1">
                                  <stop offset="0%" stopColor="#fff7a6" />
                                  <stop offset="100%" stopColor="#ffd400" />
                                </linearGradient>
                              </defs>
                              <polygon
                                points="24,2 29,18 46,18 32,28 37,44 24,34 11,44 16,28 2,18 19,18"
                                fill="url(#g2)"
                                stroke="#6d6e71"
                                strokeWidth="0.6"
                              />
                            </Box>
                          </Box>

                          <Typography
                            component="span"
                            sx={{
                              ml: 1,
                              fontSize: 14,
                              fontWeight: 700,
                            }}
                          >
                            <Box
                              component="span"
                              sx={{
                                display: "inline-block",
                                opacity: 0.95,
                                color: "#530e45ff",
                                textShadow: "0 0 8px #13031aff, 0 0 12px rgba(10, 1, 14, 0.6)",
                              }}
                            >
                              a 12 msi de $1,500
                            </Box>
                          </Typography>
                        </Typography>
                      </Box>
                    </Box>

                     <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Tooltip
          title={
            <span>
              Financia con tarjetas participantes — opciones en mensualidades.
              <br />
              🚀 ¡Aplica promoción lanzamiento!
            </span>
          }
          arrow
          placement="top"
        >
          <Chip
            label="💳 tarjetas participantes"
            size="small"
            onClick={handleOpenModal}
            sx={{
              bgcolor: "rgba(33, 150, 243, 0.2)",
              color: "#1976d2",
              borderRadius: "8px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                bgcolor: "rgba(33, 150, 243, 0.3)",
                transform: "scale(1.05)",
                boxShadow: "0 0 8px rgba(33,150,243,0.6)",
              },
            }}
          />
        </Tooltip>
      </Box>

      {/* Modal con info estática */}
      <TarjetasModal open={openModal} onClose={handleCloseModal} />
                  </Box>
                </Box>

                <Typography sx={{ mb: 2 }}>
                  👨‍🌾 Tu punto de partida para crear un club de cultivo responsable y autosustentable. Este
                  kit te convierte en <b>jardinero acreditado</b> de la red, con todo lo necesario —físico,
                  legal y digital— para operar un espacio seguro, donde cada miembro cultiva sus propias semillas
                  bajo tus servicios de renta, asesoría y seguimiento técnico.
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" color="success.dark" fontWeight="bold" sx={{ mb: 1 }}>
                  ⚖️ Marco legal y acompañamiento
                </Typography>
                <Typography sx={{ mb: 2 }}>
                  - Gestión completa ante COFEPRIS (uso personal, amparo incluido).<br />
                  - Membresía oficial de jardinero y acceso a soporte jurídico.<br />
                  - Generador automático de estatutos internos, acta constitutiva y documentación SAT.<br />
                  - Asistencia personalizada por WhatsApp durante todo el proceso.
                </Typography>

                <Typography variant="h6" color="success.dark" fontWeight="bold" sx={{ mt: 1, mb: 1 }}>
                  🛠️ Infraestructura de cultivo incluida
                </Typography>

                {/* Lista dinámica cargada desde Strapi usando Accordion */}
                <Box sx={{ mb: 2 }}>
                  {loadingItems ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <CircularProgress size={20} />
                      <Typography>Cargando componentes del kit...</Typography>
                    </Box>
                  ) : errorItems ? (
                    <Typography color="error">No fue posible cargar los componentes: {errorItems}</Typography>
                  ) : kitItems.length === 0 ? (
                    <Typography sx={{ opacity: 0.8 }}>
                      No hay items registrados en la colección <code>kitjardinero</code>.
                    </Typography>
                  ) : (
                    kitItems.map((it) => (
                    <Accordion
                      key={it.id}
                      sx={{
                        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                        borderRadius: "12px",
                        mb: 1,
                        "&:before": { display: "none" },
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%", justifyContent: "space-between" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>



                            <Box>
                              <Typography sx={{ fontWeight: 800 }}>
                                {it.cantidad} × {it.nombre}
                              </Typography>

                            </Box>
                          </Box>


                        </Box>
                      </AccordionSummary>

                      <AccordionDetails>
                        <Grid container spacing={2} alignItems="center">
                          {it.imagenUrl && (
                            <Grid item xs={12} md={3} sx={{ display: "flex", justifyContent: { xs: "center", md: "flex-start" } }}>
                              <Box
                                component={motion.img}
                                src={it.imagenUrl}
                                alt={it.nombre}
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  // eslint-disable-next-line no-console
                                  console.warn("[kit] fallo cargando imagen en detail:", it.imagenUrl);
                                }}
                                whileHover={{ scale: 1.02 }}
                                sx={{
                                  width: { xs: 160, md: 160 },
                                  height: 120,
                                  borderRadius: 2,
                                  objectFit: "cover",
                                  boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                                  display: "block",
                                }}
                              />
                            </Grid>
                          )}

                          <Grid item xs={12} md={it.imagenUrl ? 9 : 12}>
                            <Typography sx={{ whiteSpace: "pre-line" }}>
                              {it.texto || "No hay descripción para este elemento."}
                            </Typography>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  )))}
                </Box>

                <Typography variant="h6" color="success.dark" fontWeight="bold" sx={{ mt: 1 }}>
                  💻 Herramientas digitales del jardinero
                </Typography>
                <Typography sx={{ mb: 2 }}>
                  Incluye acceso al sistema de gestión y bitácoras automatizadas: registro de fotos, videos,
                  trazabilidad por semilla, firma digital y almacenamiento en la nube. Cada usuario lleva sus propias
                  semillas, el jardinero solo renta el espacio y servicios de cultivo.
                </Typography>

                <Typography variant="h6" color="success.dark" fontWeight="bold">
                  ⚡ Sistema de energía individualizada
                </Typography>
                <Typography sx={{ mb: 2 }}>
                  Cada nuevo miembro instala su propio medidor ante CFE, garantizando consumo transparente y sustentable.
                </Typography>

                <Typography variant="h6" color="success.dark" fontWeight="bold">
                  📦 Entrega y soporte
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  - Financiado con las dos primeras mensualidades.<br />
                  - Envío nacional en dos entregas con manual, soporte y acceso inmediato al sistema.<br />
                  - Certificación digital como Jardinero Responsable tras tu primer trimestre.
                </Typography>


                  <LocalPlayer src={jardinero} poster={undefined} maxHeight={300} />

              </Grid>

              {/* Imagen del kit a la derecha (medianona) - reducida apenas para evitar corte */}
              <Grid item xs={12} md={4} sx={{ display: "flex", justifyContent: "center" }}>
                <Box
                  component={motion.div}
                  whileHover={{ scale: 1.02 }}
                  sx={{
                    width: { xs: "90%", md: "92%" }, // <- reducido ligeramente en desktop para que no se corte
                    borderRadius: 2,
                    overflow: "hidden",
                    boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    background: "linear-gradient(180deg, rgba(255,255,255,0.6), rgba(250,250,250,0.4))",
                    p: 1,
                  }}
                >
                  {/* WRAPPER clickable: hover mueve el crop hacia la derecha (object-position) y click abre modal */}
                  <Box
                    onClick={handleOpenKitModal}
                    sx={{
                      width: "100%",
                      height: { xs: 220, md: 320 },
                      overflow: "hidden",
                      borderRadius: 1,
                      cursor: "pointer",
                      // Controlamos la transición del crop usando la regla para la imagen hija
                      "& img": {
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center left", // vista por defecto (izquierda)
                        transition: "object-position 700ms ease, transform 300ms ease",
                        display: "block",
                      },
                      "&:hover img": {
                        objectPosition: "center right", // al hover muestra la parte derecha
                        transform: "scale(1.02)",
                      },
                    }}
                    aria-label="Abrir imagen ampliada del kit"
                    role="button"
                  >
                    <Box
                      component="img"
                      src={kitImage}
                      alt="Kit Jardinero - contenido"
                      sx={{
                        // Estos estilos serán sobrescritos por el selector anterior pero mantenemos aquí por seguridad
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center left",
                        display: "block",
                      }}
                    />
                  </Box>

                  <Box sx={{ p: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      Contenido visual del kit
                    </Typography>
                    <Typography variant="caption" sx={{ display: "block", opacity: 0.75 }}>
                      Imagen ilustrativa con todos los componentes incluidos.
                    </Typography>

                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => window.open("/downloads/kit-detalles.pdf", "_blank")}
                      sx={{ mt: 1, borderRadius: "999px", textTransform: "none" }}
                    >
                      📄 Ficha técnica (PDF)
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>




        <ClubConsumoTitulo />

        <ClubConsumo />

        {/* Modals / cards de modalidades (mantengo tu estructura original) */}
        <Grid container spacing={4} justifyContent="center" maxWidth="1200px" mx="auto">
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
                    bajo lógica cooperativa. Incluye respaldo jurídico y herramientas digitales.
                  </Typography>
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    sx={{ mt: 3, borderRadius: "999px" }}
                    onClick={() => navigate("/clubs/requisitos-jardinero")}
                  >
                    Afiliar mi Club de Cultivo
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

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
                    puedes afiliarte gratis.
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

      {/* DIALOG / MODAL para mostrar imagen ampliada del kit */}
      <Dialog
        open={openKitModal}
        onClose={handleCloseKitModal}
        maxWidth="lg"
        fullWidth
        aria-labelledby="kit-image-dialog"
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
          <IconButton onClick={handleCloseKitModal} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent
          id="kit-image-dialog"
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: { xs: 1, md: 3 },
          }}
        >
          <Box
            component="img"
            src={kitImage}
            alt="Kit Jardinero - ampliada"
            sx={{
              maxWidth: "100%",
              maxHeight: { xs: "70vh", md: "80vh" },
              objectFit: "contain",
              borderRadius: 2,
              boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TiposClub;

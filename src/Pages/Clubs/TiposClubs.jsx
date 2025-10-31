// src/pages/TiposClub.jsx
import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import headerImage from "../../assets/tiposclubs.png";
import kitImage from "../../assets/kitjardinero.png";
import { useNavigate } from "react-router-dom";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const TiposClub = () => {
  const navigate = useNavigate();

  const [kitItems, setKitItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [errorItems, setErrorItems] = useState(null);

    // ---------------------------------------------------
  // Reemplaza tu función extractImageUrl (si la tienes) y el useEffect por esto
  // ---------------------------------------------------

  // Extrae URL de imagen desde posibles formas que devuelve Strapi
  const extractImageUrl = (field, envBaseFallback) => {
    console.log("[kit][debug] extractImageUrl - raw field:", field);
    if (!field) return null;

    let url = null;
    try {
      // Caso: field es string directo
      if (typeof field === "string") {
        url = field;
      }
      // Strapi v4: field = { data: [{ attributes: { url }}, ...] }
      else if (field.data && Array.isArray(field.data) && field.data.length > 0) {
        url = field.data[0]?.attributes?.url || field.data[0]?.url || null;
      }
      // Strapi v4: field = { data: { attributes: { url } } }
      else if (field.data && field.data.attributes) {
        url = field.data.attributes.url || null;
      }
      // Otra forma: field = { attributes: { url } }
      else if (field.attributes && field.attributes.url) {
        url = field.attributes.url;
      }
      // Forma simple: field.url
      else if (field.url) {
        url = field.url;
      }
    } catch (e) {
      console.warn("[kit][debug] error extrayendo url:", e);
      url = null;
    }

    if (!url) return null;

    // Si la url es relativa, anteponer base (env o origin)
    if (url.startsWith("/")) {
      const base = envBaseFallback || window.location.origin;
      return `${base}${url}`;
    }
    return url;
  };

  useEffect(() => {
    // --- Prueba con el slug correcto (plural) ---
    const slug = "/api/kitjardineros?populate=*"; // <-- aquí: kitjardineros (plural)
    const envBase = (process.env.REACT_APP_STRAPI_URL || "").replace(/\/$/, "");
    const originBase = window.location.origin;

    // Construye candidatos: preferir env -> origin -> relativo
    const candidates = [];
    if (envBase) candidates.push(`${envBase}${slug}`);
    candidates.push(`${originBase}${slug}`);
    candidates.push(slug);

    // quitar duplicados
    const uniq = [...new Map(candidates.map((u) => [u, u])).values()];

    async function fetchItems() {
      setLoadingItems(true);
      setErrorItems(null);

      let parsed = [];
      let foundUrl = null;

      for (const url of uniq) {
        console.log("[kit] probando endpoint:", url);
        try {
          const res = await fetch(url, { method: "GET", mode: "cors" });
          console.log(`[kit] respuesta ${url} => status: ${res.status} ok:${res.ok}`);

          // log headers (útil para ver CORS)
          try {
            const h = {};
            res.headers.forEach((v, k) => (h[k] = v));
            console.log("[kit] headers:", h);
          } catch (hh) {
            console.warn("[kit] no pude leer headers", hh);
          }

          const text = await res.text();
          console.log(`[kit] body (slice) de ${url}:\n`, text.slice(0, 1500));

          if (!res.ok) {
            console.warn("[kit] no ok, siguiente...");
            continue;
          }

          let json = null;
          try {
            json = text ? JSON.parse(text) : null;
          } catch (jerr) {
            console.warn("[kit] JSON parse error en", url, jerr);
            continue;
          }

          // parse flexible tipo Strapi
          if (Array.isArray(json.data)) {
            parsed = json.data.map((d) => d.attributes || d);
          } else if (json.data && json.data.attributes) {
            const attrs = json.data.attributes;
            const arrFromAttrs = Object.values(attrs).find(
              (v) => Array.isArray(v) || (v && v.data && Array.isArray(v.data))
            );
            if (Array.isArray(arrFromAttrs)) {
              parsed = arrFromAttrs.map((i) => (i.attributes ? i.attributes : i));
            } else if (arrFromAttrs && Array.isArray(arrFromAttrs.data)) {
              parsed = arrFromAttrs.data.map((i) => (i.attributes ? i.attributes : i));
            } else {
              // el propio attributes es el item
              if ("cantidad" in attrs && "nombre" in attrs) parsed = [attrs];
            }
          } else {
            // fallback: busca el primer array en el JSON
            const possible = Object.values(json).find((v) => Array.isArray(v));
            if (Array.isArray(possible)) parsed = possible;
          }

          
          foundUrl = url;
          break; // usamos este endpoint
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

      // Normaliza e intenta extraer imagen por cada item (imprime logs por cada item)
      const envBaseForImages = (process.env.REACT_APP_STRAPI_URL || "").replace(/\/$/, "") || window.location.origin;
      const normalized = (parsed || []).map((it) => {
        // 'it' normalmente ya es attributes de Strapi
        const imageField = it.imagen ?? it.imagenes ?? it.image ?? null;
        const imagenUrl = extractImageUrl(imageField, envBaseForImages);
        console.log("[kit][debug] item raw:", it, " -> imagenUrl:", imagenUrl);
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
                <Typography
                  variant="h4"
                  color="success.main"
                  fontWeight="bold"
                  gutterBottom
                >
                  🌱 Kit Inicial del Jardinero del Club
                </Typography>

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
                        "radial-gradient(circle at 10% 20%, rgba(255,242,0,0.95), rgba(255,223,0,0.95) 25%, rgba(255,196,0,0.9))",
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
                              }}
                            >
                              $15,000 MXN
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

                          <Typography component="span" sx={{ ml: 1, fontSize: 14, fontWeight: 700 }}>
                            <Box component="span" sx={{ display: "inline-block", opacity: 0.95 }}>
                              a 12 msi de $1,500
                            </Box>
                          </Typography>
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, position: "relative", zIndex: 1 }}>
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
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => navigate("/pagos/tarjetas")}
                          sx={{
                            textTransform: "none",
                            borderRadius: "999px",
                            px: 2,
                            py: 1,
                            fontWeight: 700,
                            boxShadow: "0 6px 18px rgba(13, 110, 253, 0.12)",
                          }}
                        >
                          💳 tarjetas participantes
                        </Button>
                      </Tooltip>

                      <Tooltip title="Más información" arrow>
                        <Chip
                          icon={<InfoOutlinedIcon />}
                          label="Info"
                          size="small"
                          sx={{
                            bgcolor: "rgba(255,255,255,0.5)",
                            borderRadius: "8px",
                            fontWeight: 700,
                          }}
                        />
                      </Tooltip>
                    </Box>
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

                          <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700 }}>
                            {it.cantidad ? `${it.cantidad}` : ""}
                          </Typography>
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
                  <Box
                    component="img"
                    src={kitImage}
                    alt="Kit Jardinero - contenido"
                    sx={{
                      width: "100%",
                      height: { xs: 220, md: 320 },
                      objectFit: "cover",
                      objectPosition: "center left", // <- evita que se recorte por la derecha: manéjalo hacia la izquierda
                      display: "block",
                      transformOrigin: "center",
                    }}
                  />
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
    </Box>
  );
};

export default TiposClub;

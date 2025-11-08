// src/components/Clubs/MisPlantas.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Avatar,
  Chip,
  Button,
  CircularProgress,
  Tooltip,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import SpaIcon from "@mui/icons-material/Spa";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

/* Helper: base Strapi */
const STRAPI_BASE = (process.env.REACT_APP_STRAPI_URL || "").replace(/\/$/, "");

/* Extraer primera imagen válida de media (Strapi v4) */
const firstImageFromMedia = (mediaField) => {
  try {
    if (!mediaField) return null;
    const data = Array.isArray(mediaField.data) ? mediaField.data : mediaField;
    const first =
      Array.isArray(data) ? data.find((d) => d?.attributes?.mime?.startsWith?.("image")) || data[0] : data;
    const attrs = first?.attributes ?? first;
    const url =
      attrs?.formats?.small?.url ??
      attrs?.formats?.medium?.url ??
      attrs?.formats?.thumbnail?.url ??
      attrs?.url ??
      null;
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${STRAPI_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
  } catch {
    return null;
  }
};

/* Formateadores de fecha */
const formatFechaEnEsp = (isoDate) => {
  try {
    if (!isoDate) return null;
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return null;
    const day = d.getDate();
    const month = new Intl.DateTimeFormat("es-MX", { month: "long" }).format(d);
    const year = d.getFullYear();
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    return `${day} de ${capitalizedMonth} del ${year}`;
  } catch {
    return null;
  }
};

/* Colores y estilos */
const COLORS = [
  { key: "rojo", label: "Rojo", bg: "linear-gradient(135deg,#ff4d4f,#ff7875)", accent: "#fff" },
  { key: "amarillo", label: "Amarillo", bg: "linear-gradient(135deg,#ffd666,#ffec3d)", accent: "#111" },
  { key: "verde", label: "Verde", bg: "linear-gradient(135deg,#95de64,#52c41a)", accent: "#fff" },
  { key: "azul", label: "Azul", bg: "linear-gradient(135deg,#69c0ff,#40a9ff)", accent: "#fff" },
  { key: "rosa", label: "Rosa", bg: "linear-gradient(135deg,#ff85c0,#ff4d6d)", accent: "#fff" },
  { key: "plata", label: "Plata", bg: "linear-gradient(135deg,#e6e9ee,#bfc7d6)", accent: "#111" },
];

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><rect width='100%' height='100%' fill='#fafafa'/><g fill='#cbd5e1' font-family='Arial' text-anchor='middle'><text x='50%' y='50%' dy='-6' font-size='20'>Sin foto</text><text x='50%' y='50%' dy='18' font-size='12'>Añade imágenes en la bitácora</text></g></svg>`
  );

const cardVariants = {
  initial: { scale: 0.985, y: 6, opacity: 0 },
  enter: { scale: 1, y: 0, opacity: 1, transition: { duration: 0.36, ease: "easeOut" } },
  hover: { scale: 1.02 },
};

const MisPlantas = ({ user }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [plantas, setPlantas] = useState([]);
  const [bitacoras, setBitacoras] = useState([]);
  const [userStrapi, setUserStrapi] = useState(null);
  const [linkVideos, setLinkVideos] = useState(null);

  // Refs para controlar logs/clear solo una vez
  const didClearConsoleRef = useRef(false);
  const didDumpOnceRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    // Clear console solo la primera vez (por este componente)
    if (!didClearConsoleRef.current) {
      try {
        console.clear();
        console.log("Console was cleared");
      } catch (e) {
        /* no-op */
      }
      didClearConsoleRef.current = true;
    }

    const loadAll = async (email) => {
      let lv = null; // <-- declarado al inicio para evitar reference errors
      try {
        if (!didDumpOnceRef.current) {
          console.log("=== MisPlantas: inicio de carga ===");
          console.log("MisPlantas: user.email ->", email);
        } else {
          console.log("MisPlantas: recargando para", email);
        }

        setLoading(true);
        setError(null);

        const base = STRAPI_BASE || "";
        const urlPlantas = `${base}/api/plantas?filters[usuario_email][$eq]=${encodeURIComponent(email)}&populate=media`;
        const urlUser = `${base}/api/users?filters[email][$eq]=${encodeURIComponent(email)}`;
        const urlBit =
          `${base}/api/registrobitacoras?filters[usuario_email][$eq]=${encodeURIComponent(
            email
          )}&filters[registrojardinero][$eq]=true&filters[tipo][$eq]=fotoplanta&sort=createdAt:desc&populate=media`;

        if (!didDumpOnceRef.current) {
          console.log("URLs construidas:");
          console.log("  urlPlantas:", urlPlantas);
          console.log("  urlUser:  ", urlUser);
          console.log("  urlBit:   ", urlBit);
        }

        const [resPlantas, resUser, resBit] = await Promise.allSettled([
          axios.get(urlPlantas),
          axios.get(urlUser),
          axios.get(urlBit),
        ]);

        if (!didDumpOnceRef.current) {
          console.log("Promise.allSettled status:", {
            plantas: resPlantas.status,
            user: resUser.status,
            bitacoras: resBit.status,
          });
        }

        // Plantas
        let plantasData = [];
        if (resPlantas.status === "fulfilled") {
          const entries = resPlantas.value.data?.data ?? [];
          if (!didDumpOnceRef.current) console.log("resPlantas.value.data (raw):", resPlantas.value.data);
          plantasData = entries.map((e) => {
            const attrs = e.attributes ?? {};
            const media = attrs.media ?? null;
            const imagenUrl = firstImageFromMedia(media);
            return {
              id: e.id,
              ...attrs,
              imagenUrl,
            };
          });
        } else {
          console.error("Error obteniendo plantas:", resPlantas.reason || resPlantas);
          // dejamos plantasData = []
        }

        // Usuario Strapi
        let userData = null;
        if (resUser.status === "fulfilled") {
          const uentries = resUser.value.data?.data ?? [];
          if (!didDumpOnceRef.current) console.log("resUser.value.data (raw):", resUser.value.data);
          if (Array.isArray(uentries) && uentries.length > 0) {
            userData = uentries[0].attributes ?? null;
          } else {
            userData = null;
          }
        } else {
          console.error("Error obteniendo usuario Strapi:", resUser.reason || resUser);
        }

        // Bitacoras
        let bitData = [];
        if (resBit.status === "fulfilled") {
          const bentries = resBit.value.data?.data ?? [];
          if (!didDumpOnceRef.current) console.log("resBit.value.data (raw):", resBit.value.data);
          bitData = bentries.map((b) => {
            const attrs = b.attributes ?? {};
            const media = attrs.media ?? null;
            const imagenUrl = firstImageFromMedia(media);
            return {
              id: b.id,
              ...attrs,
              imagenUrl,
              createdAt: b.attributes?.createdAt ?? null,
            };
          });
        } else {
          console.error("Error obteniendo bitácoras:", resBit.reason || resBit);
        }

        // Calculamos lv (linkVideos) desde plantasData si existe
        lv = (plantasData.find((p) => !!p.linkvideos)?.linkvideos) || plantasData[0]?.linkvideos || null;

        if (!cancelled) {
          setPlantas(plantasData);
          setUserStrapi(userData);
          setBitacoras(bitData);
          setLinkVideos(lv);
          setLoading(false);
        }

        if (!didDumpOnceRef.current) {
          console.log("=== Resumen cargado (primer dump) ===");
          console.log("Plantas count:", plantasData.length);
          console.log("Plantas ejemplo 0:", plantasData[0] ?? null);
          console.log("UserStrapi:", userData);
          console.log("Bitacoras count:", bitData.length);
          console.log("Bitacoras ejemplo 0:", bitData[0] ?? null);
          console.log("LinkVideos:", lv);
          console.log("=====================================");
          didDumpOnceRef.current = true;
        }
      } catch (err) {
        if (!cancelled) {
          console.error("MisPlantas: excepción en loadAll:", err);
          setError(err.message || "Error al cargar datos");
          setLoading(false);
        }
      }
    };

    if (user?.email) {
      loadAll(user.email);
    } else {
      // si no hay email, limpiamos y no bloqueamos la UI
      setPlantas([]);
      setUserStrapi(null);
      setBitacoras([]);
      setLinkVideos(null);
      setLoading(false);
      if (!didDumpOnceRef.current) console.log("MisPlantas: no hay user.email aún. Esperando autenticación.");
    }

    return () => {
      // marcar cancelado
      // (loadAll lee la var `cancelled` en scope y evita setState al desmontar)
      // eslint-disable-next-line no-unused-vars
      cancelled = true;
    };
  }, [user?.email]);

  // Número de plantas vivas
  const numeroPlantasVivas = useMemo(() => {
    try {
      return plantas.filter((p) => p?.viva === true || String(p?.viva) === "true").length;
    } catch {
      return 0;
    }
  }, [plantas]);

  // Fecha próxima cosecha formateada (acepta string u objeto)
  const fechaProximaCosecha = useMemo(() => {
    try {
      const raw = userStrapi?.proximacosecha ?? userStrapi?.proximaCosecha ?? null;
      const iso = typeof raw === "string" ? raw : raw?.value ?? raw?.fecha ?? null;
      return formatFechaEnEsp(iso);
    } catch {
      return null;
    }
  }, [userStrapi]);

  const curado = Number(userStrapi?.curado ?? 0);
  const secado = Number(userStrapi?.secado ?? 0);
  const totalCuradoSecado = curado + secado;

  // Map con última bitácora por código
  const latestBitByCodigo = useMemo(() => {
    const map = new Map();
    for (const b of bitacoras) {
      const code = b?.codigoplanta;
      if (!code) continue;
      if (!map.has(code)) {
        map.set(code, b);
      }
    }
    return map;
  }, [bitacoras]);

  // Slots de colores según últimas bitácoras y plantas vivas
  const colorSlots = useMemo(() => {
    const slots = {};
    for (const c of COLORS) slots[c.key] = null;

    for (const [cod, registro] of latestBitByCodigo.entries()) {
      const parts = String(cod).split("-");
      const colorCandidate = parts[parts.length - 1]?.toLowerCase?.() ?? null;
      if (!colorCandidate) continue;
      if (!Object.keys(slots).includes(colorCandidate)) continue;
      const plantaObj = plantas.find(
        (p) => String(p.codigoplanta) === String(cod) && (p.viva === true || String(p.viva) === "true")
      );
      if (!plantaObj) continue;
      if (!slots[colorCandidate]) {
        slots[colorCandidate] = {
          codigoplanta: cod,
          imagenUrl: registro.imagenUrl || plantaObj.imagenUrl || PLACEHOLDER,
          planta: plantaObj,
          registro,
        };
      }
    }

    return slots;
  }, [latestBitByCodigo, plantas]);

  const gridItems = useMemo(() => {
    return COLORS.map((c) => {
      const slot = colorSlots[c.key];
      if (!slot) return null;
      return {
        colorKey: c.key,
        colorLabel: c.label,
        bg: c.bg,
        accent: c.accent,
        ...slot,
      };
    })
      .filter(Boolean)
      .slice(0, 6);
  }, [colorSlots]);

  // Debug antes de render para inspección rápida
  useEffect(() => {
    console.log("MisPlantas: estado antes de render ->", {
      loading,
      error,
      plantasCount: plantas.length,
      gridItemsCount: gridItems.length,
      bitacorasCount: bitacoras.length,
      userStrapi,
      fechaProximaCosecha,
      curado,
      secado,
      linkVideos,
    });
  }, [loading, error, plantas, gridItems, bitacoras, userStrapi, fechaProximaCosecha, curado, secado, linkVideos]);

  // Mostrar "sin plantas" solo si NO hay plantas Y NO hay gridItems
  const sinPlantas = plantas.length === 0 && gridItems.length === 0;

  const RenderSinPlantas = () => (
    <Box sx={{ py: 4, px: 2, textAlign: "center" }}>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
        Aún no tienes plantas afiliadas
      </Typography>
      <Typography sx={{ mb: 2, color: "text.secondary" }}>
        Sigue estos pasos para iniciar tu primera planta en la red:
      </Typography>

      <Box sx={{ display: "grid", gap: 12, gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" }, maxWidth: 900, mx: "auto" }}>
        <Box>
          <Avatar sx={{ bgcolor: "#fff9c4", width: 64, height: 64, mx: "auto", mb: 1 }}>
            <SpaIcon sx={{ color: "#5b4b00" }} />
          </Avatar>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            1. Adopta tu planta
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Solicita un kit de jardinero o afilia tu club para recibir espacio y asistencia técnica.
          </Typography>
        </Box>
        <Box>
          <Avatar sx={{ bgcolor: "#e6f7ff", width: 64, height: 64, mx: "auto", mb: 1 }}>
            <PhotoCameraIcon sx={{ color: "#025" }} />
          </Avatar>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            2. Documenta con fotos
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Registra fotos periódicas en la bitácora (tipo fotoplanta) para que el jardinero valide y asigne color.
          </Typography>
        </Box>
        <Box>
          <Avatar sx={{ bgcolor: "#fff0f6", width: 64, height: 64, mx: "auto", mb: 1 }}>
            <PlayCircleOutlineIcon sx={{ color: "#7a0036" }} />
          </Avatar>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            3. Sube evidencias y empieza
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Comparte tu link de videos si quieres seguimiento extra y consulta el manual del jardinero.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Button variant="contained" color="success" onClick={() => navigate("/clubs/miclub/crear-planta")}>
          Iniciar mi primera planta
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2, flexWrap: "wrap", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Mis Plantas
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Tu jardín en la red — fotos, estados y enlaces de seguimiento.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Chip icon={<SpaIcon />} label={`Plantas vivas: ${numeroPlantasVivas}`} color="success" />
          {fechaProximaCosecha ? (
            <Tooltip title="Fecha estimada próxima cosecha">
              <Chip label={`Próx. cosecha: ${fechaProximaCosecha}`} variant="outlined" />
            </Tooltip>
          ) : (
            <Tooltip title="No hay fecha de próxima cosecha registrada en tu perfil">
              <Chip icon={<ErrorOutlineIcon />} label="Próx. cosecha: —" variant="outlined" />
            </Tooltip>
          )}
        </Box>
      </Box>

      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: "0 12px 30px rgba(2,6,23,0.06)" }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Estado de curado y secado
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Curado: <b>{curado}</b> días · Secado: <b>{secado}</b> días · Total acumulado: <b>{totalCuradoSecado}</b> días
              </Typography>
              <Typography variant="caption" sx={{ display: "block", mt: 1, color: "text.secondary" }}>
                Estos valores se obtienen de tu perfil (campo <code>curado</code> y <code>secado</code>).
              </Typography>
            </Grid>

            <Grid item xs={12} md={4} sx={{ textAlign: { xs: "left", md: "right" } }}>
              {linkVideos ? (
                <Button startIcon={<PlayCircleOutlineIcon />} variant="contained" color="primary" sx={{ textTransform: "none" }} onClick={() => window.open(linkVideos, "_blank")}>
                  Carpeta de videos
                </Button>
              ) : (
                <Button variant="outlined" disabled sx={{ textTransform: "none" }}>
                  Carpeta de videos no disponible
                </Button>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="h6" color="error" sx={{ mb: 2 }}>
            Error cargando tus datos
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            {String(error)}
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </Box>
      ) : sinPlantas ? (
        <RenderSinPlantas />
      ) : (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
              Aquí se muestran hasta 6 plantas activas (cada una con su color). Haz click en una para ver su ficha.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {gridItems.map((g) => (
              <Grid item xs={12} sm={6} md={4} key={g.codigoplanta}>
                <motion.div initial="initial" animate="enter" whileHover="hover" variants={cardVariants}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      overflow: "hidden",
                      cursor: "pointer",
                      boxShadow: "0 12px 40px rgba(3,10,22,0.07)",
                    }}
                    onClick={() => navigate(`/clubs/miclub/misplantas/${encodeURIComponent(g.codigoplanta)}`)}
                  >
                    <Box sx={{ position: "relative", height: 220, background: g.bg }}>
                      <Box
                        component="img"
                        src={g.imagenUrl || PLACEHOLDER}
                        alt={g.codigoplanta}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = PLACEHOLDER;
                          e.currentTarget.style.objectFit = "contain";
                        }}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "center",
                          display: "block",
                          transition: "transform .45s ease",
                        }}
                      />
                      <Chip
                        label={g.colorLabel}
                        sx={{
                          position: "absolute",
                          right: 12,
                          top: 12,
                          bgcolor: "rgba(255,255,255,0.85)",
                          fontWeight: 700,
                        }}
                      />
                    </Box>

                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                        {g.planta?.nombre || g.codigoplanta}
                      </Typography>

                      <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                        Estado: <b>{String(g.planta?.viva) === "true" ? "Viva" : "No viva"}</b>
                      </Typography>

                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
                        Último registro: {g.registro?.createdAt ? new Date(g.registro.createdAt).toLocaleString("es-MX") : "—"}
                        {" • "}Código: <code style={{ fontSize: 12 }}>{g.codigoplanta}</code>
                      </Typography>
                    </CardContent>

                    <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
                      <Button size="small" onClick={() => navigate(`/clubs/miclub/misplantas/${encodeURIComponent(g.codigoplanta)}`)}>
                        Ver detalle
                      </Button>
                      <IconButton aria-label="foto" onClick={(e) => { e.stopPropagation(); window.open(g.registro?.imagenUrl || g.imagenUrl || "#", "_blank"); }}>
                        <PhotoCameraIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default MisPlantas;

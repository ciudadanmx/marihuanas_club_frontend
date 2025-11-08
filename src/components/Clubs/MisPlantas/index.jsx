import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import { Box, Grid, Typography, Button, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import StatusCard from "./StatusCard";
import EmptyState from "./EmptyState";
import PlantCard from "./PlantCard";
import { firstImageFromMedia, formatFechaEnEsp, COLORS, PLACEHOLDER, cardVariants, STRAPI_BASE } from "./utils";

const MisPlantas = ({ user }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [plantas, setPlantas] = useState([]);
  const [bitacoras, setBitacoras] = useState([]);
  const [userStrapi, setUserStrapi] = useState(null);
  const [linkVideos, setLinkVideos] = useState(null);

  const didClearConsoleRef = useRef(false);
  const didDumpOnceRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    if (!didClearConsoleRef.current) {
      try {
        console.clear();
        console.log("Console was cleared");
      } catch (e) { /* noop */ }
      didClearConsoleRef.current = true;
    }

    const loadAll = async (email) => {
      let lv = null;
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
          `${base}/api/registrobitacoras?filters[usuario_email][$eq]=${encodeURIComponent(email)}&filters[registrojardinero][$eq]=true&filters[tipo][$eq]=fotoplanta&sort=createdAt:desc&populate=media`;

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
            return { id: e.id, ...attrs, imagenUrl };
          });
        } else {
          console.error("Error obteniendo plantas:", resPlantas.reason || resPlantas);
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
            return { id: b.id, ...attrs, imagenUrl, createdAt: b.attributes?.createdAt ?? null };
          });
        } else {
          console.error("Error obteniendo bitácoras:", resBit.reason || resBit);
        }

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
      setPlantas([]);
      setUserStrapi(null);
      setBitacoras([]);
      setLinkVideos(null);
      setLoading(false);
      if (!didDumpOnceRef.current) console.log("MisPlantas: no hay user.email aún. Esperando autenticación.");
    }

    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  const numeroPlantasVivas = useMemo(() => {
    try {
      return plantas.filter((p) => p?.viva === true || String(p?.viva) === "true").length;
    } catch {
      return 0;
    }
  }, [plantas]);

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

  const latestBitByCodigo = useMemo(() => {
    const map = new Map();
    for (const b of bitacoras) {
      const code = b?.codigoplanta;
      if (!code) continue;
      if (!map.has(code)) map.set(code, b);
    }
    return map;
  }, [bitacoras]);

  const colorSlots = useMemo(() => {
    const slots = {};
    for (const c of COLORS) slots[c.key] = null;

    for (const [cod, registro] of latestBitByCodigo.entries()) {
      const parts = String(cod).split("-");
      const colorCandidate = parts[parts.length - 1]?.toLowerCase?.() ?? null;
      if (!colorCandidate) continue;
      if (!Object.keys(slots).includes(colorCandidate)) continue;
      const plantaObj = plantas.find((p) => String(p.codigoplanta) === String(cod) && (p.viva === true || String(p.viva) === "true"));
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
    }).filter(Boolean).slice(0, 6);
  }, [colorSlots]);

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

  const sinPlantas = plantas.length === 0 && gridItems.length === 0;

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>
      <Header numeroPlantasVivas={numeroPlantasVivas} fechaProximaCosecha={fechaProximaCosecha} />

      <StatusCard curado={curado} secado={secado} totalCuradoSecado={totalCuradoSecado} linkVideos={linkVideos} />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="h6" color="error" sx={{ mb: 2 }}>
            Error cargando tus datos
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>{String(error)}</Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </Box>
      ) : sinPlantas ? (
        <EmptyState navigate={navigate} />
      ) : (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
              Aquí se muestran hasta 6 plantas activas (cada una con su color). Haz click en una para ver su ficha.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {gridItems.map((g) => (
              <PlantCard key={g.codigoplanta} g={g} navigate={navigate} />
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default MisPlantas;

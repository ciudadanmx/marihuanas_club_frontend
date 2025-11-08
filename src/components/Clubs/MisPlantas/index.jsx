// src/components/Clubs/MisPlantas/index.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import { Box, Grid, Typography, Button, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import StatusCard from "./StatusCard";
import EmptyState from "./EmptyState";
import PlantCard from "./PlantCard";
import { firstImageFromMedia, formatFechaEnEsp, COLORS, PLACEHOLDER, cardVariants, STRAPI_BASE } from "./utils";
import { useRoles } from "../../../Contexts/RolesContext.jsx";

const MisPlantas = () => {
  const navigate = useNavigate();
  const { userData } = useRoles(); // userData viene del contexto RolesProvider

  // Normalizar email (variantes posibles)
  const userEmail = userData?.email ?? userData?.usuario_email ?? null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [plantas, setPlantas] = useState([]);
  const [bitacoras, setBitacoras] = useState([]);
  const [linkVideos, setLinkVideos] = useState(null);

  // refs para logs
  const didClearConsoleRef = useRef(false);
  const didDumpOnceRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    if (!didClearConsoleRef.current) {
      try {
        console.clear();
        console.log("Console was cleared (MisPlantas component)");
      } catch (e) {}
      didClearConsoleRef.current = true;
    }

    const loadAll = async (email) => {
      let lv = null;
      try {
        if (!didDumpOnceRef.current) {
          console.log("=== MisPlantas: inicio de carga usando userData desde RolesContext ===");
          console.log("MisPlantas: userEmail ->", email);
          console.log("MisPlantas: userData raw ->", userData);
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

          plantasData = entries.map((e, idx) => {
            const attrs = e.attributes ?? {};

            // posibles campos donde Strapi guarda la media
            const mediaField =
              attrs.media ??
              attrs.imagen ??
              attrs.imagenes ??
              attrs.images ??
              (attrs.media && attrs.media.data ? attrs.media.data : null) ??
              null;

            // DEBUG por planta: mostrar mediaField
            console.log(`MisPlantas: planta[${idx}] - mediaField ->`, mediaField);

            // Intentar extraer imagen desde mediaField usando helper
            const imagenUrlFromMedia = firstImageFromMedia(mediaField, `planta[${idx}]`);

            // Fallbacks probables
            const imagenUrl =
              imagenUrlFromMedia ||
              attrs.imagenUrl ||
              attrs.url ||
              attrs.picture ||
              attrs.foto ||
              firstImageFromMedia(attrs.image ?? attrs.images ?? attrs.imagenes ?? null, `planta[${idx}] fallback2`) ||
              null;

            // Normalize keys: 'codigoplanta' u 'codigo'
            const codigo = attrs.codigoplanta ?? attrs.codigo ?? attrs.id ?? null;

            console.log(`MisPlantas: planta[${idx}] -> id:${e.id} codigo:${codigo} imagenUrl:`, imagenUrl);

            return {
              id: e.id,
              ...attrs,
              imagenUrl,
              codigo,
            };
          });
        } else {
          console.error("Error obteniendo plantas:", resPlantas.reason || resPlantas);
        }

        // Usuario Strapi (lo guardamos por si hay actualizaciones)
        let userDataFromStrapi = null;
        if (resUser.status === "fulfilled") {
          const uentries = resUser.value.data?.data ?? [];
          if (!didDumpOnceRef.current) console.log("resUser.value.data (raw):", resUser.value.data);
          if (Array.isArray(uentries) && uentries.length > 0) {
            userDataFromStrapi = uentries[0].attributes ?? null;
          }
        } else {
          console.error("Error obteniendo usuario Strapi (fetch adicional):", resUser.reason || resUser);
        }

        // Bitacoras
        let bitData = [];
        if (resBit.status === "fulfilled") {
          const bentries = resBit.value.data?.data ?? [];
          if (!didDumpOnceRef.current) console.log("resBit.value.data (raw):", resBit.value.data);
          bitData = bentries.map((b) => {
            const attrs = b.attributes ?? {};
            const media = attrs.media ?? null;
            const imagenUrl = firstImageFromMedia(media) || attrs.imagenUrl || null;
            const codigo = attrs.codigoplanta ?? attrs.codigo ?? null;
            return { id: b.id, ...attrs, imagenUrl, codigo, createdAt: attrs.createdAt ?? b.attributes?.createdAt ?? null };
          });
        } else {
          console.error("Error obteniendo bitácoras:", resBit.reason || resBit);
        }

        // linkVideos desde plantas
        lv = (plantasData.find((p) => !!p.linkvideos)?.linkvideos) || plantasData[0]?.linkvideos || null;

        if (!cancelled) {
          setPlantas(plantasData);
          setBitacoras(bitData);
          setLinkVideos(lv);
          setLoading(false);
        }

        if (!didDumpOnceRef.current) {
          console.log("=== Resumen cargado (primer dump) ===");
          console.log("Plantas count:", plantasData.length);
          console.log("Plantas ejemplo 0:", plantasData[0] ?? null);
          console.log("UserStrapi (extra fetch):", userDataFromStrapi);
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

    if (userEmail) {
      loadAll(userEmail);
    } else {
      setPlantas([]);
      setBitacoras([]);
      setLinkVideos(null);
      setLoading(false);
      if (!didDumpOnceRef.current) console.log("MisPlantas: no hay userEmail aún en RolesContext. Esperando autenticación.");
    }

    return () => {
      cancelled = true;
    };
    // Dependemos únicamente de la cadena userEmail para evitar re-ejecuciones por referencia
  }, [userEmail]);

  const numeroPlantasVivas = useMemo(() => {
    try {
      return plantas.filter((p) => p?.viva === true || String(p?.viva) === "true").length;
    } catch {
      return 0;
    }
  }, [plantas]);

  const fechaProximaCosecha = useMemo(() => {
    try {
      // userData proviene del context (RolesProvider) y contiene los atributos que guardaste en Strapi
      const raw = (userData?.proximacosecha ?? userData?.proximaCosecha ?? userData?.attributes?.proximacosecha) ?? null;
      const iso = typeof raw === "string" ? raw : raw?.value ?? raw?.fecha ?? null;
      return formatFechaEnEsp(iso);
    } catch {
      return null;
    }
  }, [userData]);

  const curado = Number(userData?.curado ?? userData?.attributes?.curado ?? 0);
  const secado = Number(userData?.secado ?? userData?.attributes?.secado ?? 0);
  const totalCuradoSecado = curado + secado;

  const latestBitByCodigo = useMemo(() => {
    const map = new Map();
    for (const b of bitacoras) {
      const code = b?.codigoplanta ?? b?.codigo ?? b?.codigo_planta ?? b?.codigoPlanta ?? null;
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
      const plantaObj = plantas.find(
        (p) =>
          (String(p.codigoplanta ?? p.codigo ?? p.id ?? p.codigo_planta ?? p.codigoPlanta) === String(cod)) &&
          (p.viva === true || String(p.viva) === "true")
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

  // items calculados a partir de colorSlots
  let gridItems = useMemo(() => {
    return Object.keys(colorSlots)
      .map((k) => {
        const slot = colorSlots[k];
        if (!slot) return null;
        const colorMeta = COLORS.find((c) => c.key === k) ?? { label: k, bg: "", accent: "#000" };
        return {
          colorKey: k,
          colorLabel: colorMeta.label ?? slot.planta?.color ?? k,
          bg: colorMeta.bg,
          accent: colorMeta.accent,
          ...slot,
        };
      })
      .filter(Boolean)
      .slice(0, 6);
  }, [colorSlots]);

  // FALLBACK: si gridItems está vacío pero hay plantas, generamos tarjetas básicas desde plantas
  const fallbackGridItems = useMemo(() => {
    if (gridItems.length > 0) return null;
    if (!plantas || plantas.length === 0) return null;

    console.log("MisPlantas: generando gridItems fallback desde plantas (no hay bitácoras)");

    return plantas
      .filter((p) => p?.viva === true || String(p?.viva) === "true")
      .slice(0, 6)
      .map((p) => {
        const codigo = p.codigoplanta ?? p.codigo ?? p.id ?? `p-${p.id}`;
        const colorKey = (p.color ?? p.colorName ?? "").toLowerCase?.() ?? null;
        const matchedColor = COLORS.find((c) => c.key === colorKey) ?? null;
        return {
          codigoplanta: codigo,
          imagenUrl: p.imagenUrl || PLACEHOLDER,
          planta: p,
          registro: null,
          colorKey: matchedColor?.key ?? "plata",
          colorLabel: matchedColor?.label ?? (p.color ?? "Color"),
          bg: matchedColor?.bg ?? "linear-gradient(135deg,#e6e9ee,#bfc7d6)",
          accent: matchedColor?.accent ?? "#111",
        };
      });
  }, [gridItems, plantas]);

  const itemsToRender = (fallbackGridItems && fallbackGridItems.length > 0) ? fallbackGridItems : gridItems;

  useEffect(() => {
    console.log("MisPlantas: estado antes de render ->", {
      loading,
      error,
      plantasCount: plantas.length,
      gridItemsCount: gridItems.length,
      fallbackGridItemsCount: fallbackGridItems ? fallbackGridItems.length : 0,
      bitacorasCount: bitacoras.length,
      userData,
      fechaProximaCosecha,
      curado,
      secado,
      linkVideos,
    });
  }, [loading, error, plantas, gridItems, fallbackGridItems, bitacoras, userData, fechaProximaCosecha, curado, secado, linkVideos]);

  const sinPlantas = plantas.length === 0 && (!itemsToRender || itemsToRender.length === 0);

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
            {itemsToRender.map((g) => (
              <PlantCard key={g.codigoplanta ?? g.planta?.id ?? Math.random()} g={g} navigate={navigate} />
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default MisPlantas;

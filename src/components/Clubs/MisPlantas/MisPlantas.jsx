import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import { Box, Grid, Typography, Button, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import StatusCard from "./StatusCard";
import EmptyState from "./EmptyState";
import PlantCard from "./PlantCard";
import {
  firstImageFromMedia,
  formatFechaEnEsp,
  COLORS,
  PLACEHOLDER,
  cardVariants,
  STRAPI_BASE,
} from "./utils";
import { useRoles } from "../../../Contexts/RolesContext.jsx";

const MisPlantas = () => {
  const navigate = useNavigate();
  const { userData } = useRoles();

  // Normalizar email (variantes posibles)
  const userEmail = userData?.email ?? null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [plantas, setPlantas] = useState([]);
  const [bitacoras, setBitacoras] = useState([]);
  const [linkVideos, setLinkVideos] = useState(null);

  // refs para logs y dump único
  const didClearConsoleRef = useRef(false);
  const didDumpOnceRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    if (!didClearConsoleRef.current) {
      try {
        console.clear();
        console.log("Console cleared (MisPlantas)");
      } catch (e) {}
      didClearConsoleRef.current = true;
    }

    const loadAll = async (email) => {
      try {
        if (!didDumpOnceRef.current) {
          console.log("=== MisPlantas: inicio de carga ===");
          console.log("User email:", email);
          console.log("userData (from RolesContext):", userData);
        } else {
          console.log("MisPlantas: recarga para", email);
        }

        setLoading(true);
        setError(null);

        const base = STRAPI_BASE || "";

        // Usamos populate=* para flexibilidad en medias, pero mantenemos endpoints tipo del segundo para user extra
        const urlPlantas = `${base}/api/plantas?filters[usuario_email][$eq]=${encodeURIComponent(
          email
        )}&populate=*`;
        const urlUser = `${base}/api/users?filters[email][$eq]=${encodeURIComponent(email)}`;
        const urlBit = `${base}/api/registrobitacoras?filters[usuario_email][$eq]=${encodeURIComponent(
          email
        )}&filters[registrojardinero][$eq]=true&filters[tipo][$eq]=fotoplanta&sort=createdAt:desc&populate=*`;

        if (!didDumpOnceRef.current) {
          console.log("URLs construidas:", { urlPlantas, urlUser, urlBit });
        }

        const [resPlantas, resUser, resBit] = await Promise.allSettled([
          axios.get(urlPlantas),
          axios.get(urlUser),
          axios.get(urlBit),
        ]);

        if (!didDumpOnceRef.current) {
          console.log("Promise.allSettled resultado:", {
            plantas: resPlantas.status,
            user: resUser.status,
            bitacoras: resBit.status,
          });
        }

        // ---- Plantas: extracción flexible de imagenes ----
        let plantasData = [];
        if (resPlantas.status === "fulfilled") {
          const entries = resPlantas.value.data?.data ?? [];
          if (!didDumpOnceRef.current) console.log("resPlantas (raw):", resPlantas.value.data);

          plantasData = entries.map((e, idx) => {
            const attrs = e.attributes ?? {};

            // Intentamos encontrar los campos más comunes para media/galería
            // Prioridad: galeria (como en la versión original), media, imagen/imagenes, etc.
            let imgFromGaleria = null;

            // Si existe attrs.galeria (versión original)
            if (attrs.galeria) {
              imgFromGaleria = firstImageFromMedia(attrs.galeria, `planta[${idx}].galeria`);
            }

            // Si no, chequeamos media, imagen, images, imagenes, etc.
            if (!imgFromGaleria) {
              const candidate =
                attrs.media ??
                attrs.imagen ??
                attrs.imagenes ??
                attrs.images ??
                attrs.image ??
                null;
              imgFromGaleria = firstImageFromMedia(candidate, `planta[${idx}].candidate`) || null;
            }

            // Normalize path to absolute if starts with '/'
            if (typeof imgFromGaleria === "string" && imgFromGaleria.startsWith("/")) {
              imgFromGaleria = `${STRAPI_BASE}${imgFromGaleria}`;
            }

            // Codigos / keys
            const codigo = attrs.codigoplanta ?? attrs.codigo ?? String(e.id);

            if (!didDumpOnceRef.current) {
              console.log(`Planta[${idx}] id:${e.id} codigo:${codigo} imagenGaleria:`, imgFromGaleria);
            }

            return {
              id: e.id,
              ...attrs,
              imagenGaleria: imgFromGaleria || null,
              codigoplanta: codigo,
              // legacy compatibility names some pieces might expect:
              imagenUrl: imgFromGaleria || attrs.imagenUrl || null,
            };
          });
        } else {
          console.error("Error obteniendo plantas:", resPlantas.reason || resPlantas);
        }

        // ---- Usuario Strapi (opcional) ----
        let userDataFromStrapi = null;
        if (resUser.status === "fulfilled") {
          const uentries = resUser.value.data?.data ?? [];
          if (!didDumpOnceRef.current) console.log("resUser (raw):", resUser.value.data);
          if (Array.isArray(uentries) && uentries.length > 0) {
            userDataFromStrapi = uentries[0].attributes ?? null;
          }
        } else {
          console.error("Error obteniendo usuario Strapi:", resUser.reason || resUser);
        }

        // ---- Bitacoras: extracción flexible ----
        let bitData = [];
        if (resBit.status === "fulfilled") {
          const bentries = resBit.value.data?.data ?? [];
          if (!didDumpOnceRef.current) console.log("resBit (raw):", resBit.value.data);
          bitData = bentries.map((b, idx) => {
            const attrs = b.attributes ?? {};
            // media field maybe media, imagen, imagenes...
            const mediaCandidate = attrs.media ?? attrs.imagen ?? attrs.imagenes ?? attrs.images ?? null;
            let imgFromBit = firstImageFromMedia(mediaCandidate, `bit[${idx}]`) || null;

            if (!imgFromBit && attrs.imagenUrl) imgFromBit = attrs.imagenUrl;
            if (typeof imgFromBit === "string" && imgFromBit.startsWith("/")) {
              imgFromBit = `${STRAPI_BASE}${imgFromBit}`;
            }

            const codigo = attrs.codigoplanta ?? attrs.codigo ?? null;
            return {
              id: b.id,
              ...attrs,
              imagenBitacora: imgFromBit,
              imagenUrl: imgFromBit || null,
              codigoplanta: codigo,
              createdAt: attrs.createdAt ?? null,
            };
          });
        } else {
          console.error("Error obteniendo bitácoras:", resBit.reason || resBit);
        }

        // ---- linkVideos desde plantas (fallback) ----
        const lv = (plantasData.find((p) => !!p.linkvideos)?.linkvideos) || plantasData[0]?.linkvideos || null;

        if (!cancelled) {
          setPlantas(plantasData);
          setBitacoras(bitData);
          setLinkVideos(lv);
          setLoading(false);
        }

        if (!didDumpOnceRef.current) {
          console.log("=== Resumen de carga (primer dump) ===");
          console.log("Plantas count:", plantasData.length);
          console.log("Ejemplo planta 0:", plantasData[0] ?? null);
          console.log("UserStrapi:", userDataFromStrapi);
          console.log("Bitacoras count:", bitData.length);
          console.log("Ejemplo bitacora 0:", bitData[0] ?? null);
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
      if (!didDumpOnceRef.current) console.log("MisPlantas: no hay userEmail aún en RolesContext.");
    }

    return () => {
      cancelled = true;
    };
  }, [userEmail, userData]);

  // ---- Cálculos para StatusCard y otros ----
  const numeroPlantasVivas = useMemo(() => {
    try {
      return plantas.filter((p) => p?.viva === true || String(p?.viva) === "true").length;
    } catch {
      return 0;
    }
  }, [plantas]);

  const fechaProximaCosecha = useMemo(() => {
    try {
      const raw =
        (userData?.proximacosecha ??
          userData?.proximaCosecha ??
          userData?.attributes?.proximacosecha ??
          userData?.attributes?.proximaCosecha) ??
        null;
      const iso = typeof raw === "string" ? raw : raw?.value ?? raw?.fecha ?? null;
      return formatFechaEnEsp(iso);
    } catch {
      return null;
    }
  }, [userData]);

  const curado = Number(userData?.curado ?? userData?.attributes?.curado ?? 0);
  const secado = Number(userData?.secado ?? userData?.attributes?.secado ?? 0);
  const totalCuradoSecado = curado + secado;

  // Mapa latest bit by codigo (para acceder rápido)
  const latestBitByCodigo = useMemo(() => {
    const map = new Map();
    for (const b of bitacoras) {
      const code =
        b?.codigoplanta ??
        b?.codigo ??
        b?.codigo_planta ??
        b?.codigoPlanta ??
        (b?.planta && (b.planta.codigoplanta ?? b.planta.codigo)) ??
        null;
      if (!code) continue;
      // solo setea si no existe (como vienen ordenadas por createdAt desc en la query)
      if (!map.has(String(code))) map.set(String(code), b);
    }
    return map;
  }, [bitacoras]);

  // colorSlots y gridItems (mantengo la lógica completa del segundo archivo)
  const colorSlots = useMemo(() => {
    const slots = {};
    for (const c of COLORS) slots[c.key] = null;

    for (const [cod, registro] of latestBitByCodigo.entries()) {
      const parts = String(cod).split("-");
      const colorCandidate = parts[parts.length - 1]?.toLowerCase?.() ?? null;
      if (!colorCandidate) continue;
      if (!(colorCandidate in slots)) continue;

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

  const gridItems = useMemo(() => {
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

  // fallbackGridItems si no hay gridItems
  const fallbackGridItems = useMemo(() => {
    if (gridItems.length > 0) return null;
    if (!plantas || plantas.length === 0) return null;

    console.log("MisPlantas: generando fallbackGridItems desde plantas");

    return plantas
      .filter((p) => p?.viva === true || String(p?.viva) === "true")
      .slice(0, 6)
      .map((p) => {
        const codigo = p.codigoplanta ?? p.codigo ?? p.id ?? `p-${p.id}`;
        const colorKey = (p.color ?? p.colorName ?? "").toLowerCase?.() ?? null;
        const matchedColor = COLORS.find((c) => c.key === colorKey) ?? null;
        return {
          codigoplanta: codigo,
          imagenUrl: p.imagenUrl || p.imagenGaleria || PLACEHOLDER,
          planta: p,
          registro: null,
          colorKey: matchedColor?.key ?? "plata",
          colorLabel: matchedColor?.label ?? (p.color ?? "Color"),
          bg: matchedColor?.bg ?? "linear-gradient(135deg,#e6e9ee,#bfc7d6)",
          accent: matchedColor?.accent ?? "#111",
        };
      });
  }, [gridItems, plantas]);

  // ---- itemsToRender para PlantCard: preservamos la lógica del primer componente (bit > galeria > placeholder)
  const itemsToRender = useMemo(() => {
    if (!plantas || plantas.length === 0) return [];

    // Tomamos las primeras 6 plantas (misma UX que el primer componente)
    return plantas.slice(0, 6).map((p) => {
      // Buscamos bitacora por codigoplanta (usamos map para eficiencia)
      const code = String(p.codigoplanta ?? p.codigo ?? p.id ?? p.id);
      const bit = latestBitByCodigo.get(code) ?? null;

      // Prioridad: imagen de bitacora > imagenGaleria (o imagenUrl) > PLACEHOLDER
      const imagenFinal = bit?.imagenBitacora || bit?.imagenUrl || p.imagenGaleria || p.imagenUrl || PLACEHOLDER;

      const colorKey = (p.color ?? "").toLowerCase();
      const meta = COLORS.find((c) => c.key === colorKey) ?? COLORS[0];

      return {
        codigoplanta: p.codigoplanta ?? p.codigo ?? String(p.id),
        imagenUrl: imagenFinal,
        planta: p,
        registro: bit ?? null,
        colorKey: meta.key,
        colorLabel: meta.label,
        bg: meta.bg,
        accent: meta.accent,
      };
    });
  }, [plantas, latestBitByCodigo]);

  const sinPlantas = !loading && (itemsToRender.length === 0 || plantas.length === 0);

  // debug log general
  useEffect(() => {
    console.log("MisPlantas: estado antes de render ->", {
      loading,
      error,
      plantasCount: plantas.length,
      itemsToRenderCount: itemsToRender.length,
      gridItemsCount: gridItems.length,
      fallbackGridItemsCount: fallbackGridItems ? fallbackGridItems.length : 0,
      bitacorasCount: bitacoras.length,
      userData,
      fechaProximaCosecha,
      curado,
      secado,
      linkVideos,
    });
  }, [
    loading,
    error,
    plantas,
    itemsToRender,
    gridItems,
    fallbackGridItems,
    bitacoras,
    userData,
    fechaProximaCosecha,
    curado,
    secado,
    linkVideos,
  ]);

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>
      {/* Header recibe numeroPlantasVivas y fechaProximaCosecha */}
      <Header numeroPlantasVivas={numeroPlantasVivas} fechaProximaCosecha={fechaProximaCosecha} />

      {/* StatusCard con todos los props del segundo componente */}
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
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            {String(error)}
          </Typography>
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
              Aquí se muestran hasta 6 plantas activas. Click para ver detalle.
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

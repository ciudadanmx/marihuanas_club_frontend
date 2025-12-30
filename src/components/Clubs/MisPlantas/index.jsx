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
  STRAPI_BASE
} from "./utils";
import { useRoles } from "../../../Contexts/RolesContext.jsx";

const MisPlantas = () => {
  const navigate = useNavigate();
  const { userData } = useRoles();

  const userEmail = userData?.email ?? userData?.usuario_email ?? null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plantas, setPlantas] = useState([]);
  const [bitacoras, setBitacoras] = useState([]);

  const didClearConsoleRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    if (!didClearConsoleRef.current) {
      console.clear();
      didClearConsoleRef.current = true;
    }

    const loadAll = async (email) => {
      try {
        setLoading(true);
        setError(null);

        const base = STRAPI_BASE || "";

        const urlPlantas = `${base}/api/plantas?filters[usuario_email][$eq]=${encodeURIComponent(
          email
        )}&populate=*`;

        const urlBit = `${base}/api/registrobitacoras?filters[usuario_email][$eq]=${encodeURIComponent(
          email
        )}&filters[registrojardinero][$eq]=true&filters[tipo][$eq]=fotoplanta&sort=createdAt:desc&populate=*`;

        const [resPlantas, resBit] = await Promise.allSettled([
          axios.get(urlPlantas),
          axios.get(urlBit),
        ]);

        let plantasData = [];
        if (resPlantas.status === "fulfilled") {
          plantasData = resPlantas.value.data?.data.map((e, idx) => {
            const attrs = e.attributes ?? {};

            // 👉 GALERIA es el campo correcto en plantas
            let imgFromGaleria = firstImageFromMedia(attrs.galeria);

            if (typeof imgFromGaleria === "string" && imgFromGaleria.startsWith("/")) {
              imgFromGaleria = `${STRAPI_BASE}${imgFromGaleria}`;
            }

            return {
              id: e.id,
              ...attrs,
              imagenGaleria: imgFromGaleria || null,
              codigoplanta: attrs.codigoplanta ?? attrs.codigo ?? String(e.id),
            };
          });
        }

        let bitData = [];
        if (resBit.status === "fulfilled") {
          bitData = resBit.value.data?.data.map((b) => {
            const attrs = b.attributes ?? {};

            let imgFromBit = firstImageFromMedia(attrs.media);

            if (typeof imgFromBit === "string" && imgFromBit.startsWith("/")) {
              imgFromBit = `${STRAPI_BASE}${imgFromBit}`;
            }

            return {
              id: b.id,
              ...attrs,
              imagenBitacora: imgFromBit || null,
              codigoplanta: attrs.codigoplanta ?? attrs.codigo ?? null,
              createdAt: attrs.createdAt ?? null,
            };
          });
        }

        if (!cancelled) {
          setPlantas(plantasData);
          setBitacoras(bitData);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Error cargando datos");
          setLoading(false);
        }
      }
    };

    if (userEmail) loadAll(userEmail);
    else setLoading(false);

    return () => {
      cancelled = true;
    };
  }, [userEmail]);

  /**
   * 🔗 Relación final planta + imagen:
   * bitácora > galeria > placeholder
   */
  const itemsToRender = useMemo(() => {
    if (!plantas || plantas.length === 0) return [];

    return plantas.slice(0, 6).map((p) => {
      const bit = bitacoras.find(
        (b) => String(b.codigoplanta) === String(p.codigoplanta)
      );

      const imagenFinal =
        bit?.imagenBitacora ||
        p.imagenGaleria ||
        PLACEHOLDER;

      const colorKey = (p.color ?? "").toLowerCase();
      const meta = COLORS.find((c) => c.key === colorKey) ?? COLORS[0];

      return {
        codigoplanta: p.codigoplanta,
        imagenUrl: imagenFinal,
        planta: p,
        registro: bit ?? null,
        colorKey: meta.key,
        colorLabel: meta.label,
        bg: meta.bg,
        accent: meta.accent,
      };
    });
  }, [plantas, bitacoras]);

  const sinPlantas = !loading && itemsToRender.length === 0;

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>
      <Header numeroPlantasVivas={itemsToRender.length} />

      <StatusCard />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="h6" color="error" sx={{ mb: 2 }}>
            Error cargando tus datos
          </Typography>
          <Typography variant="body2">{String(error)}</Typography>
          <Button sx={{ mt: 2 }} variant="contained" onClick={() => window.location.reload()}>
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
              <PlantCard
                key={g.codigoplanta}
                g={g}
                navigate={navigate}
              />
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default MisPlantas;

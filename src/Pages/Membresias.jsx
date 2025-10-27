// src/pages/Membresias.jsx
import React, { useEffect, useState } from "react";
import { Grid, Card, CardContent, Typography, Box, Chip, Zoom, CircularProgress, Alert, Button } from "@mui/material";
import '../styles/membresias.css';
import BotonMembresia from '../components/Membresias/BotonMembresia.jsx';
import membresiasImg from '../assets/como.png';
import { useRoles } from '../Contexts/RolesContext';
import MiMembresia from '../components/Membresias/MiMembresia.jsx';
import { useNavigate } from 'react-router-dom';

const COLLECTION_ENDPOINT = "membresias-tipos"; 

const Membresias = () => {
  const { isActivaMembresia } = useRoles();
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const strapiUrl = (process.env.REACT_APP_STRAPI_URL || "http://localhost:1337").replace(/\/$/, "");
  const apiToken = process.env.REACT_APP_STRAPI_TOKEN || null;

  const navigate = useNavigate();

  // Handler para navegar a /membresias/:order (fallback a id)
  const handleMembresiaClick = (plan) => (e) => {
    e.preventDefault();
    const order = (plan && (plan.order !== undefined && plan.order !== null))
      ? plan.order
      : (plan && (plan.id !== undefined && plan.id !== null) ? plan.id : 'unknown');

    console.log('[Membresias] Navegando a:', `/membresias/${order}`, 'plan:', plan);
    navigate(`/membresias/pagar/order/${order}`);
  };

  useEffect(() => {
    let mounted = true;

    const fetchPlanes = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers = apiToken ? { Authorization: `Bearer ${apiToken}` } : {};
        const fullUrl = `${strapiUrl}/api/${COLLECTION_ENDPOINT}?pagination[pageSize]=100&sort=order:asc&populate=*`;

        console.log("[Membresias] 🔍 Fetching desde:", fullUrl);

        const res = await fetch(fullUrl, { headers });
        const rawText = await res.text().catch(() => "");
        let json;
        try {
          json = JSON.parse(rawText);
        } catch (e) {
          console.error("[Membresias] ❌ Error parseando JSON:", rawText);
          throw new Error("Respuesta no JSON del Strapi");
        }

        if (!res.ok) {
          console.error("[Membresias] ❌ Error HTTP:", res.status, json);
          throw new Error(`Error ${res.status}: ${JSON.stringify(json)}`);
        }

        const items = json?.data ?? [];
        console.log(`[Membresias] ✅ ${items.length} membresías encontradas`, items);

        const mapped = items.map((r) => {
          const attrs = r.attributes || {};

          // Verifica que el campo pic venga
          console.log("[Membresias] 📸 Campo pic crudo:", attrs.pic);

          // 🔍 Caso de media single type
          let picUrl = null;
          if (attrs.pic && attrs.pic.data && attrs.pic.data.attributes) {
            picUrl = attrs.pic.data.attributes.url;
          } else if (attrs.pic && attrs.pic.url) {
            picUrl = attrs.pic.url;
          } else if (typeof attrs.pic === "string") {
            picUrl = attrs.pic;
          }

          console.log("[Membresias] 🧩 URL final de pic:", picUrl);

          let parsedJson = null;
          if (attrs.json) {
            try {
              parsedJson = typeof attrs.json === "string" ? JSON.parse(attrs.json) : attrs.json;
            } catch {
              parsedJson = null;
            }
          }

          const pick = (keys) => {
            for (const k of keys) {
              if (attrs[k] !== undefined && attrs[k] !== null && attrs[k] !== "") return attrs[k];
              if (parsedJson && parsedJson[k] !== undefined && parsedJson[k] !== null && parsedJson[k] !== "") return parsedJson[k];
            }
            return undefined;
          };

          const nombre = pick(["nombre", "title", "name"]) || "";
          const precio = pick(["precio", "price", "amount"]) || "";

          let beneficios = pick(["beneficios", "benefits", "features"]);
          if (typeof beneficios === "string") {
            beneficios =
              beneficios.split("\n").map(s => s.trim()).filter(Boolean)
                .length ? beneficios.split("\n").map(s => s.trim()).filter(Boolean)
                : (beneficios.split(",").map(s => s.trim()).filter(Boolean) || []);
          }
          if (!Array.isArray(beneficios)) beneficios = [];

          const icon = pick(["icon", "icono", "iconName"]) || "group";
          const color = pick(["color", "colorHex"]) || "#ccc";
          const destacado = Boolean(pick(["destacado", "featured", "highlight"]));
          const stripeButton = Boolean(pick(["stripeButton", "stripe"]));
          const priceId = pick(["priceId", "stripePriceId"]) || null;

          let subtypes_data = [];
          if (parsedJson) {
            if (Array.isArray(parsedJson.subtypes_data)) subtypes_data = parsedJson.subtypes_data;
            else if (Array.isArray(parsedJson.subtypes)) subtypes_data = parsedJson.subtypes;
          }
          if (!subtypes_data.length && attrs.subtypes_data) {
            if (Array.isArray(attrs.subtypes_data)) subtypes_data = attrs.subtypes_data;
            else if (attrs.subtypes_data.data && Array.isArray(attrs.subtypes_data.data)) {
              subtypes_data = attrs.subtypes_data.data.map(s => s.attributes ?? s);
            } else if (typeof attrs.subtypes_data === "string") {
              try { const parsed = JSON.parse(attrs.subtypes_data); if (Array.isArray(parsed)) subtypes_data = parsed; } catch {}
            }
          }

          const subtypesFlag = Boolean(attrs.subtypes) || (Array.isArray(subtypes_data) && subtypes_data.length > 0);

          return {
            id: r.id,
            order: attrs.order ?? 0,
            nombre,
            precio,
            picUrl,
            beneficios,
            icon,
            destacado,
            color,
            stripeButton,
            priceId,
            subtypes: subtypesFlag,
            subtypes_data,
          };
        });

        if (mounted) {
          console.log("[Membresias] ✅ Mapeo final de planes:", mapped);
          setPlanes(mapped);
          setLoading(false);
        }
      } catch (err) {
        console.error("[Membresias] 💥 Error fetching planes:", err);
        if (mounted) {
          setError(err.message || String(err));
          setLoading(false);
        }
      }
    };

    fetchPlanes();
    return () => { mounted = false; };
  }, [strapiUrl, apiToken]);

  if (isActivaMembresia()) return <MiMembresia />;

  return (
    <Box className="membresias-container" sx={{ px: 2, py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom className="membresias-titulo">
        Elige tu Membresía Cannábica 🌿
      </Typography>
      <Typography variant="subtitle1" align="center" className="membresias-subtitulo" sx={{ mb: 4 }}>
        Afíliate a la red de Clubs Cannábicos en México y ejerce tus derechos con respaldo legal.
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" my={6}><CircularProgress /></Box>
      ) : error ? (
        <Box display="flex" justifyContent="center" my={4}><Alert severity="error">Error cargando membresías: {error}</Alert></Box>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {planes.map((plan, index) => (
            <Grid item xs={12} sm={6} md={4} key={plan.id || `${plan.nombre}-${index}`}>
              <Zoom in style={{ transitionDelay: `${index * 150}ms` }}>
                <Card
                  className="membresia-card"
                  sx={{
                    background: `linear-gradient(135deg, ${plan.color}33, white)`,
                    border: plan.destacado ? `3px solid ${plan.color}` : '1px solid #ccc',
                    boxShadow: plan.destacado ? `0 0 30px ${plan.color}66` : undefined,
                  }}
                >
                  {plan.destacado && (
                    <Chip label="Recomendada" className="membresia-chip" sx={{ backgroundColor: plan.color }} />
                  )}
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
                      {plan.picUrl && (
                        <img
                          src={`${plan.picUrl.startsWith("http") ? plan.picUrl : strapiUrl + plan.picUrl}`}
                          alt={plan.nombre}
                          style={{
                            width: 60,
                            height: 60,
                            objectFit: "cover",
                            borderRadius: "12px"
                          }}
                        />
                      )}
                      <Box>
                        <Typography variant="h5" gutterBottom className="membresia-nombre">
                          {plan.nombre || "(sin nombre)"}
                        </Typography>
                        {!plan.subtypes && (
                          <Typography variant="h4" className="membresia-precio">
                            {plan.precio || "(sin precio)"}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {Array.isArray(plan.subtypes_data) && plan.subtypes_data.length > 0 && (
                      <Typography variant="h4" className="membresia-precio">
                        {plan.subtypes_data.map((subtype, index) => (
                          <span key={index} style={{ display: "block" }}>
                            <font color="purple">{subtype.ambiente} – {subtype.numplantas} plantas</font> ${subtype.precio} /mensual
                          </span>
                        ))}
                      </Typography>
                    )}

                    <ul className="membresia-beneficios" style={{ textAlign: 'left', margin: '12px 0' }}>
                      {plan.beneficios?.length > 0 ? (
                        plan.beneficios.map((beneficio, i) => (
                          <li key={i} className="membresia-beneficio" style={{ marginBottom: 6 }}>
                            <span
                              className="material-icons membresia-check-icon"
                              style={{ color: plan.color, verticalAlign: 'middle', marginRight: 8 }}
                            >
                              check_circle
                            </span>
                            <span style={{ verticalAlign: 'middle' }}>{beneficio}</span>
                          </li>
                        ))
                      ) : (
                        <li style={{ color: "#888" }}>No hay beneficios listados</li>
                      )}
                    </ul>

                    <Box mt={1}>
                      {/* Botón que navega sin recargar a /membresias/:order (usa plan.order o plan.id como fallback) */}
                      <Button
                        variant="contained"
                        onClick={handleMembresiaClick(plan)}
                        sx={{
                          backgroundColor: plan?.color || undefined,
                          color: plan?.color ? (isLightColor(plan?.color) ? '#000' : '#fff') : undefined,
                          textTransform: 'none',
                          fontWeight: 600,
                          padding: '10px 18px',
                        }}
                        aria-label={`Ir a membresía ${plan?.nombre ?? ''}`}
                      >
                        Afiliarme
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      )}

      <Box mt={6} display="flex" justifyContent="center">
        <img
          src={membresiasImg}
          alt="Cómo funcionan las membresías"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </Box>
    </Box>
  );
};

/**
 * Pequeña utilidad para decidir si un color hex es claro u oscuro
 * (para elegir color de texto sobre el botón). Admite formatos '#rrggbb' o '#rgb'.
 */
function isLightColor(hex) {
  if (!hex || typeof hex !== 'string') return false;
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h.split('').map(c => c + c).join('');
  }
  if (h.length !== 6) return false;
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.6;
}

export default Membresias;

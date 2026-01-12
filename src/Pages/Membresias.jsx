// src/pages/Membresias.jsx
import React, { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Zoom,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import "../styles/membresias.css";
import BotonMembresia from "../components/Membresias/BotonMembresia.jsx";
import InfoClubs from "../components/Clubs/InfoClubs.jsx";
import membresiasImg from "../assets/como.png";
import { useRoles } from "../Contexts/RolesContext";
import MiMembresia from "../components/Membresias/MiMembresia.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const COLLECTION_ENDPOINT = "membresias-tipos";

const Membresias = () => {
  const { isActivaMembresia } = useRoles();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const strapiUrl = (process.env.REACT_APP_STRAPI_URL || "http://localhost:1337").replace(/\/$/, "");

  const navigate = useNavigate();

  const handleMembresiaClick = (plan) => (e) => {
    e.preventDefault();
    const order =
      plan?.order !== undefined && plan?.order !== null
        ? plan.order
        : plan?.id ?? "unknown";

    navigate(`/membresias/pagar/order/${order}`);
  };

  useEffect(() => {
    let mounted = true;

    const fetchPlanes = async () => {
      setLoading(true);
      setError(null);

      try {
        let token = null;

        if (isAuthenticated) {
          token = await getAccessTokenSilently({
            authorizationParams: {
              audience: "https://api.marihuanas.club",
            },
          });
        }

        const headers = token
          ? { Authorization: `Bearer ${token}` }
          : {};

        const fullUrl = `${strapiUrl}/api/${COLLECTION_ENDPOINT}?pagination[pageSize]=100&sort=order:asc&populate=*`;

        const res = await fetch(fullUrl, { headers });
        const rawText = await res.text();

        let json;
        try {
          json = JSON.parse(rawText);
        } catch {
          throw new Error("Respuesta no JSON del Strapi");
        }

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${JSON.stringify(json)}`);
        }

        const items = json?.data ?? [];

        const mapped = items.map((r) => {
          const attrs = r.attributes || {};

          let picUrl = null;
          if (attrs.pic?.data?.attributes?.url) picUrl = attrs.pic.data.attributes.url;
          else if (attrs.pic?.url) picUrl = attrs.pic.url;
          else if (typeof attrs.pic === "string") picUrl = attrs.pic;

          let parsedJson = null;
          if (attrs.json) {
            try {
              parsedJson = typeof attrs.json === "string" ? JSON.parse(attrs.json) : attrs.json;
            } catch {}
          }

          const pick = (keys) => {
            for (const k of keys) {
              if (attrs[k]) return attrs[k];
              if (parsedJson?.[k]) return parsedJson[k];
            }
            return undefined;
          };

          let beneficios = pick(["beneficios", "benefits", "features"]);
          if (typeof beneficios === "string") {
            beneficios = beneficios
              .split(/[\n,]/)
              .map((s) => s.trim())
              .filter(Boolean);
          }
          if (!Array.isArray(beneficios)) beneficios = [];

          let subtypes_data = [];
          if (parsedJson?.subtypes_data) subtypes_data = parsedJson.subtypes_data;
          if (!subtypes_data.length && attrs.subtypes_data?.data) {
            subtypes_data = attrs.subtypes_data.data.map((s) => s.attributes ?? s);
          }

          return {
            id: r.id,
            order: attrs.order ?? 0,
            nombre: pick(["nombre", "title", "name"]) || "",
            precio: pick(["precio", "price", "amount"]) || "",
            picUrl,
            beneficios,
            icon: pick(["icon", "icono", "iconName"]) || "group",
            destacado: Boolean(pick(["destacado", "featured", "highlight"])),
            color: pick(["color", "colorHex"]) || "#ccc",
            stripeButton: Boolean(pick(["stripeButton", "stripe"])),
            priceId: pick(["priceId", "stripePriceId"]) || null,
            subtypes: subtypes_data.length > 0,
            subtypes_data,
          };
        });

        if (mounted) {
          setPlanes(mapped);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || String(err));
          setLoading(false);
        }
      }
    };

    fetchPlanes();
    return () => {
      mounted = false;
    };
  }, [strapiUrl, isAuthenticated, getAccessTokenSilently]);

  if (isActivaMembresia()) return <MiMembresia />;

  return (
    <Box className="membresias-container" sx={{ px: 2, py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Elige tu Membresía Cannábica 🌿
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" my={6}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {planes.map((plan, index) => (
            <Grid item xs={12} sm={6} md={4} key={plan.id}>
              <Zoom in style={{ transitionDelay: `${index * 150}ms` }}>
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${plan.color}33, white)`,
                    border: plan.destacado ? `3px solid ${plan.color}` : "1px solid #ccc",
                  }}
                >
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h5">{plan.nombre}</Typography>
                    <Typography variant="h4">{plan.precio}</Typography>

                    <Button
                      variant="contained"
                      onClick={handleMembresiaClick(plan)}
                      sx={{ mt: 2, backgroundColor: plan.color }}
                    >
                      Afiliarme
                    </Button>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      )}

      <InfoClubs />

      <Box mt={6} display="flex" justifyContent="center">
        <img src={membresiasImg} alt="Cómo funcionan" style={{ maxWidth: "100%" }} />
      </Box>
    </Box>
  );
};

export default Membresias;

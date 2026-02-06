import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Avatar,
  Paper,
  IconButton,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Spa as SembrarIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import sinImagen from "../../assets/placeholders/sinimagen.jpg";

const STRAPI = process.env.REACT_APP_STRAPI_URL;

/* ================= Helpers ================= */

const STRAPI_BASE = (STRAPI || "").replace(/\/$/, "");

function toAbsoluteUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${STRAPI_BASE}${url}`;
  return `${STRAPI_BASE}/${url}`;
}

function getImageUrl(obj) {
  if (!obj) return null;
  const attrs = obj.attributes ?? obj;

  const profile = attrs.profilepic;
  if (profile) {
    const data = profile.data ?? profile;
    const img = data?.attributes ?? data;
    const url =
      img?.formats?.thumbnail?.url ??
      img?.formats?.small?.url ??
      img?.url ??
      null;
    if (url) return toAbsoluteUrl(url);
  }

  return null;
}

/* ================= Componente ================= */

export default function Sembrar() {
  const navigate = useNavigate();
  const [semillas, setSemillas] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= Fetch ================= */

  useEffect(() => {
    const fetchSemillas = async () => {
      setLoading(true);
     try {
      let url = `${STRAPI_BASE}/api/plantas`;
      url += `?filters[semilla][$eq]=true`;
      url += `&filters[status][$eq]=recibidas`;
      url += `&populate=usuario.profilepic`;
      url += `&pagination[pageSize]=1000`;
      
        const res = await fetch(url);
        const json = await res.json();

        const data = Array.isArray(json.data) ? json.data : [];
        const normalized = data.map((p) => ({
          id: p.id,
          ...p.attributes,
          usuario: p.attributes.usuario?.data ?? null,
        }));

        setSemillas(normalized);
      } catch (err) {
        console.error("Error trayendo semillas:", err);
        setSemillas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSemillas();
  }, []);

  /* ================= Agrupar por usuario ================= */

  const semillasPorUsuario = useMemo(() => {
    const map = new Map();

    semillas.forEach((s) => {
      const user = s.usuario;
      const userId = user?.id ?? "sin-usuario";
      const userAttrs = user?.attributes ?? {};

      if (!map.has(userId)) {
        map.set(userId, {
          id: userId,
          username: userAttrs.username ?? "Usuario",
          profilepic: getImageUrl(userAttrs),
          semillas: [],
        });
      }

      map.get(userId).semillas.push(s);
    });

    return Array.from(map.values());
  }, [semillas]);

  /* ================= Render ================= */

  return (
    <Box sx={{ px: 2, py: 2 }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          🌱 Sembrar
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/clubs/miclub/admin/ingresarsemillas")}
        >
          Ingresar semillas a stock
        </Button>
      </Stack>

      {loading && (
        <Typography color="text.secondary">
          Cargando semillas…
        </Typography>
      )}

      {!loading && semillasPorUsuario.length === 0 && (
        <Typography color="text.secondary">
          No hay semillas disponibles.
        </Typography>
      )}

      <Stack spacing={4}>
        {semillasPorUsuario.map((user) => (
          <Box key={user.id}>
            {/* Usuario */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 1 }}
            >
              <Avatar
                src={user.profilepic || sinImagen}
                sx={{ width: 40, height: 40 }}
                imgProps={{ crossOrigin: "anonymous" }}
              >
                {user.username?.charAt(0)?.toUpperCase()}
              </Avatar>

              <Typography sx={{ fontWeight: 800 }}>
                {user.username}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                ({user.semillas.length} semillas)
              </Typography>
            </Stack>

            {/* Semillas */}
            <Stack spacing={1}>
              {user.semillas.map((s) => (
                <Paper
                  key={s.id}
                  elevation={1}
                  sx={{
                    p: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: 2,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>
                      {s.nombre ?? `Semilla ${s.id}`}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {s.variedad ?? "Variedad"}
                    </Typography>
                  </Box>

                  <Tooltip title="Sembrar">
                    <IconButton
                      color="success"
                      onClick={() =>
                        navigate(`/plantas/sembrar/${s.id}`)
                      }
                    >
                      <SembrarIcon />
                    </IconButton>
                  </Tooltip>
                </Paper>
              ))}
            </Stack>

            <Divider sx={{ mt: 2 }} />
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

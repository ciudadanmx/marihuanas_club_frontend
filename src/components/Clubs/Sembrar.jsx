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
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Spa as SembrarIcon,
  UploadFile as IngresarStockIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useRoles } from "../../Contexts/RolesContext.jsx";
import sinImagen from "../../assets/placeholders/sinimagen.jpg";

const STRAPI = process.env.REACT_APP_STRAPI_URL || "";
const STRAPI_BASE = STRAPI.replace(/\/$/, "");

/* ================= Helpers ================= */

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

/**
 * Sembrar
 * Props:
 *  - user: (opcional) objeto de Auth0 user (se usa para contextos donde haga falta)
 *  - tipo: 'recibidas' (default) | 'solicitadas'
 *
 * Uso:
 * <Sembrar user={user} tipo={'solicitadas'} />
 */
export default function Sembrar({ user = null, tipo = "recibidas" }) {
  const navigate = useNavigate();
  const { userData } = useRoles();

  const [semillas, setSemillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // extraer clubId robustamente de userData
  const clubId = useMemo(() => {
    const raw = userData?.club;
    if (!raw) return null;
    // varios formatos posibles
    if (typeof raw === "string" || typeof raw === "number") return raw;
    if (raw?.id) return raw.id;
    if (raw?.data?.id) return raw.data.id;
    if (Array.isArray(raw) && raw[0]) {
      const first = raw[0];
      if (first?.id) return first.id;
      if (first?.data?.id) return first.data.id;
    }
    return null;
  }, [userData]);

  useEffect(() => {
    let mounted = true;
    const fetchSemillas = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        // base URL
        let url = `${STRAPI_BASE}/api/plantas`;
        // filtros obligatorios
        url += `?filters[semilla][$eq]=true`;

        // status según tipo
        const statusToUse = tipo === "solicitadas" ? "solicitadas" : "recibidas";
        url += `&filters[status][$eq]=${encodeURIComponent(statusToUse)}`;

        // filter por club relacionado (si lo tenemos)
        if (clubId) {
          // filtrado por relación club id en Strapi v4:
          url += `&filters[club][id][$eq]=${encodeURIComponent(clubId)}`;
        }

        // populate usuario.profilepic
        url += `&populate=usuario.profilepic`;
        // page size grande para traer todo
        url += `&pagination[pageSize]=1000`;

        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`HTTP ${res.status} ${txt}`);
        }
        const json = await res.json();
        const data = Array.isArray(json.data) ? json.data : [];
        const normalized = data.map((p) => ({
          id: p.id,
          ...p.attributes,
          usuario: p.attributes.usuario?.data ?? null,
        }));
        if (mounted) setSemillas(normalized);
      } catch (err) {
        console.error("Error trayendo semillas:", err);
        if (mounted) {
          setSemillas([]);
          setFetchError(String(err?.message || err));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSemillas();
    return () => {
      mounted = false;
    };
  }, [tipo, clubId]);

  /* ================= Agrupar por usuario ================= */

  const semillasPorUsuario = useMemo(() => {
    const map = new Map();

    semillas.forEach((s) => {
      const userObj = s.usuario;
      const userId = userObj?.id ?? "sin-usuario";
      const userAttrs = userObj?.attributes ?? {};

      if (!map.has(userId)) {
        map.set(userId, {
          id: userId,
          username: userAttrs.username ?? userAttrs.email ?? "Usuario",
          profilepic: getImageUrl(userAttrs),
          semillas: [],
        });
      }

      map.get(userId).semillas.push(s);
    });

    return Array.from(map.values());
  }, [semillas]);

  /* ================= Render ================= */

  const isSolicitadas = tipo === "solicitadas";
  const titulo = isSolicitadas ? "🌿 Semillas solicitadas" : "🌱 Sembrar";
  const encabezadoButton = !isSolicitadas; // si es solicitadas, ocultar el botón de encabezado

  return (
    <Box sx={{ px: 2, py: 2 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          {titulo}
        </Typography>

        {encabezadoButton && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/clubs/miclub/admin/ingresarsemillas")}
          >
            Ingresar semillas a stock
          </Button>
        )}
      </Stack>

      {loading && (
        <Typography color="text.secondary">Cargando semillas…</Typography>
      )}

      {!loading && fetchError && (
        <Alert severity="error">Error cargando semillas: {String(fetchError)}</Alert>
      )}

      {!loading && !fetchError && semillasPorUsuario.length === 0 && (
        <Typography color="text.secondary">No hay semillas disponibles.</Typography>
      )}

      <Stack spacing={4}>
        {semillasPorUsuario.map((userBlock) => (
          <Box key={userBlock.id}>
            {/* Usuario */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 1 }}
            >
              <Avatar
                src={userBlock.profilepic || sinImagen}
                sx={{ width: 40, height: 40 }}
                imgProps={{ crossOrigin: "anonymous" }}
              >
                {userBlock.username?.charAt(0)?.toUpperCase()}
              </Avatar>

              <Typography sx={{ fontWeight: 800 }}>
                {userBlock.username}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                ({userBlock.semillas.length} semillas)
              </Typography>
            </Stack>

            {/* Semillas */}
            <Stack spacing={1}>
              {userBlock.semillas.map((s) => (
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
                    <Typography variant="caption" color="text.secondary">
                      {s.variedad ?? "Variedad"}
                      {s.codigo ? ` — ${s.codigo}` : ""}
                    </Typography>
                  </Box>

                  <Tooltip
                    title={
                      isSolicitadas
                        ? "Ingresar semillas a stock"
                        : "Sembrar"
                    }
                  >
                    <IconButton
                      color={isSolicitadas ? "primary" : "success"}
                      onClick={() =>
                        isSolicitadas
                          ? navigate(
                              `/clubs/miclub/admin/ingresarsemillas/${encodeURIComponent(
                                s.id
                              )}`
                            )
                          : navigate(`/clubs/miclub/admin/sembrar/${s.id}`)
                      }
                    >
                      {isSolicitadas ? <IngresarStockIcon /> : <SembrarIcon />}
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

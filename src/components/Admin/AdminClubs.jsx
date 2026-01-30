import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Pagination,
  IconButton,
  Tooltip,
  Avatar,
  Link,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Visibility,
  Event,
  CheckCircle,
  Cancel,
  Settings,
  FactCheck,
  ListAlt,
  FilterList,
  ArrowDownward,
  ArrowUpward,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import PreLoader from "../PreLoader.jsx";

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL;

export default function AdminClubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [filtro, setFiltro] = useState("revisar"); // 'revisar' | 'todos'
  const [order, setOrder] = useState("desc"); // 'desc' = recientes, 'asc' = viejos
  const [pageSize] = useState(8);

  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  // --- helpers robustos para Strapi media y direccion ---
  const getMediaUrl = (mediaField) => {
    // soporta: null, object single, { data: {...} }, array, formats.thumbnail
    if (!mediaField) return null;

    const extract = (m) => {
      if (!m) return null;
      // Strapi v4 single media: m.data or m
      const file = m.data ? m.data : m;
      if (!file) return null;
      // if array (multiple)
      const first = Array.isArray(file) ? file[0] : file;
      if (!first) return null;
      const attrs = first.attributes || first;
      // buscar thumbnail -> formatos -> thumbnail.url
      const formats = attrs.formats || attrs.formats || attrs.formats;
      const thumb =
        formats?.thumbnail?.url ||
        formats?.small?.url ||
        formats?.medium?.url ||
        formats?.large?.url;
      const url = thumb || attrs.url || attrs?.data?.attributes?.url;
      if (!url) return null;
      if (url.startsWith("http")) return url;
      // Strapi normalmente devuelve /uploads/..., necesita prefijo
      return `${STRAPI_URL}${url}`;
    };

    // si es array directo
    if (Array.isArray(mediaField)) {
      return extract(mediaField[0]);
    }
    return extract(mediaField);
  };

  const formatDate = (d) => {
    if (!d) return "Sin fecha";
    try {
      const date = new Date(d);
      return date.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return String(d);
    }
  };

  const extractLocation = (data) => {
    // data puede ser string, json con {colonia, ciudad, estado}, o null
    if (!data) return { colonia: null, ciudad: null, estado: null };

    // si es string intentar parsear (no siempre posible)
    if (typeof data === "string") {
      return { colonia: data, ciudad: null, estado: null };
    }

    // si es objeto
    const colonia = data.colonia || data.col || data.neighborhood || null;
    const ciudad =
      data.ciudad || data.municipio || data.city || data.locality || null;
    const estado = data.estado || data.state || null;
    return { colonia, ciudad, estado };
  };

  // --- fetch con filtros, paginación y orden ---
  const fetchClubs = useCallback(async () => {
    setLoading(true);
    try {
      // base
      let url = `${STRAPI_URL}/api/clubs?populate=foto_de_perfil&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
      // filtro por revisión
      if (filtro === "revisar") {
        url += `&filters[en_revision][$eq]=true`;
      }
      // orden
      // Strapi: sort=fecha_alta:desc
      url += `&sort=fecha_alta:${order}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Respuesta no OK");
      const json = await res.json();

      setClubs(json.data || []);
      setPageCount(json.meta?.pagination?.pageCount || 1);
    } catch (err) {
      console.error("Error cargando clubs:", err);
      setClubs([]);
      setPageCount(1);
    } finally {
      setLoading(false);
    }
  }, [filtro, page, pageSize, order]);

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  // --- UI handlers ---
  const handleFiltroClick = (nuevo) => {
    setFiltro(nuevo);
    setPage(1);
  };

  const handleOrderChange = (e) => {
    setOrder(e.target.value);
    setPage(1);
  };

  if (loading) return <PreLoader />;

  return (
    <Box sx={{ width: "100%", px: { xs: 1, sm: 2, md: 4 }, pb: 6 }}>
      {/* Top bar: breadcrumbs estilo, discreta */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isSm ? "column" : "row",
          gap: 1,
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle2" color="text.secondary">
            Admin / Clubs
          </Typography>

          {/* barra de enlaces discreta */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              ml: 1,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              component="button"
              onClick={() => handleFiltroClick("revisar")}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.2,
                py: 0.5,
                borderRadius: 1,
                bgcolor: filtro === "revisar" ? "success.main" : "transparent",
                color: filtro === "revisar" ? "common.white" : "text.primary",
                textTransform: "uppercase",
                fontSize: 12,
                fontWeight: 700,
                boxShadow:
                  filtro === "revisar" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              }}
            >
              <FactCheck sx={{ fontSize: 16 }} />
              Revisar
            </Link>

            <Link
              component="button"
              onClick={() => handleFiltroClick("todos")}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.2,
                py: 0.5,
                borderRadius: 1,
                bgcolor: filtro === "todos" ? "success.main" : "transparent",
                color: filtro === "todos" ? "common.white" : "text.primary",
                textTransform: "uppercase",
                fontSize: 12,
                fontWeight: 700,
                boxShadow:
                  filtro === "todos" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              }}
            >
              <ListAlt sx={{ fontSize: 16 }} />
              Todos
            </Link>
          </Stack>
        </Stack>

        {/* orden */}
        <Stack direction="row" spacing={1} alignItems="center">
          <FilterList sx={{ mr: 0.5 }} />
          <Select
            size="small"
            value={order}
            onChange={handleOrderChange}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="desc">
              <Stack direction="row" spacing={1} alignItems="center">
                <ArrowDownward fontSize="small" /> Más recientes
              </Stack>
            </MenuItem>
            <MenuItem value="asc">
              <Stack direction="row" spacing={1} alignItems="center">
                <ArrowUpward fontSize="small" /> Más viejos
              </Stack>
            </MenuItem>
          </Select>
        </Stack>
      </Box>

      {/* Lista de items */}
      <Stack spacing={2}>
        <AnimatePresence>
          {clubs.map((club) => {
            const attrs = club.attributes || {};
            const fotoUrl = getMediaUrl(attrs.foto_de_perfil);
            const direccion = attrs.direccion || attrs.direccion_legal || null;
            const { colonia, ciudad, estado } = extractLocation(direccion);
            const fecha = attrs.fecha_alta || attrs.createdAt || null;

            return (
              <motion.div
                key={club.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.22 }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    display: "flex",
                    gap: 2,
                    p: { xs: 2, sm: 2.5 },
                    alignItems: "center",
                    flexDirection: { xs: "column", sm: "row" },
                    borderLeft: `6px solid ${
                      filtro === "revisar" ? "warning.main" : "success.main"
                    }`,
                  }}
                >
                  {/* avatar / thumb */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: { xs: "100%", sm: 120 },
                      flexShrink: 0,
                      justifyContent: { xs: "flex-start", sm: "center" },
                    }}
                  >
                    <Avatar
                      src={fotoUrl || undefined}
                      alt={attrs.nombre_club || "club"}
                      variant="rounded"
                      sx={{
                        width: { xs: 72, sm: 96 },
                        height: { xs: 72, sm: 96 },
                        borderRadius: 2,
                        bgcolor: "grey.100",
                        boxShadow: 1,
                      }}
                    />
                  </Box>

                  {/* info principal */}
                  <Box
                    sx={{
                      flex: 1,
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, fontSize: { xs: 16, sm: 18 } }}
                    >
                      {attrs.nombre_club || "Club sin nombre"}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: 13 }}
                    >
                      {colonia ? `${colonia} · ` : ""}
                      {ciudad ? `${ciudad}${estado ? ` / ${estado}` : ""}` : "Ciudad no especificada"}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      Alta: {formatDate(fecha)}
                    </Typography>

                    {attrs.en_revision && (
                      <Box sx={{ mt: 1 }}>
                        <ChipMini label="En revisión" />
                      </Box>
                    )}
                  </Box>

                  {/* acciones */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: { xs: 1, sm: 1.5 },
                      alignItems: "center",
                      justifyContent: { xs: "flex-end", sm: "flex-end" },
                      width: { xs: "100%", sm: "auto" },
                      pt: { xs: 1, sm: 0 },
                    }}
                  >
                    {filtro === "revisar" ? (
                      <>
                        <Tooltip title="Revisar datos">
                          <IconButton color="primary" size={isSm ? "small" : "medium"}>
                            <FactCheck />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Agendar">
                          <IconButton color="info" size={isSm ? "small" : "medium"}>
                            <Event />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Activar">
                          <IconButton color="success" size={isSm ? "small" : "medium"}>
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Rechazar">
                          <IconButton color="error" size={isSm ? "small" : "medium"}>
                            <Cancel />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <>
                        <Tooltip title="Ver">
                          <IconButton color="primary" size={isSm ? "small" : "medium"}>
                            <Visibility />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Acciones">
                          <IconButton color="default" size={isSm ? "small" : "medium"}>
                            <Settings />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </Paper>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {!clubs.length && (
          <Typography align="center" color="text.secondary">
            No hay clubs para mostrar.
          </Typography>
        )}
      </Stack>

      {/* paginación */}
      {pageCount > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="success"
          />
        </Box>
      )}
    </Box>
  );
}

/* --- pequeños componentes internos para estilo --- */

function ChipMini({ label }) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        px: 1,
        py: 0.4,
        borderRadius: 1,
        bgcolor: "warning.light",
        color: "warning.contrastText",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {label}
    </Box>
  );
}

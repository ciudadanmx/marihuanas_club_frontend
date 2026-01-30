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
  Autocomplete,
  TextField,
  Chip,
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
import { Agriculture, LocalDining, AllInclusive } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import PreLoader from "../PreLoader.jsx";

// Navegación programática (lo pediste): usamos useNavigate para movernos a /admin/clubs/:verbo/:slug
import { useNavigate } from "react-router-dom";

// URL base de Strapi desde .env (mantener tal como lo tenías)
const STRAPI_URL = process.env.REACT_APP_STRAPI_URL;

/**
 * AdminClubs
 *
 * Componente completo para listar clubs en el panel de administración.
 * - Trae clubs desde Strapi con paginación, filtro y orden.
 * - Muestra avatar, dirección, fecha, acciones.
 * - Añadido: buscador/autocomplete y badges para status_legal y tipo.
 */
export default function AdminClubs() {
  // estado local
  const [clubs, setClubs] = useState([]); // lista de clubs (json.data desde Strapi)
  const [loading, setLoading] = useState(true); // indicador de carga
  const [page, setPage] = useState(1); // página actual
  const [pageCount, setPageCount] = useState(1); // total de páginas
  const [filtro, setFiltro] = useState("revisar"); // 'revisar' | 'todos'
  const [order, setOrder] = useState("desc"); // 'desc' = recientes, 'asc' = viejos
  const [pageSize] = useState(8); // tamaño de página (constante aquí)

  // buscador
  const [searchTerm, setSearchTerm] = useState("");

  // hooks de MUI para responsive
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  // useNavigate para navegación por botones (requerimiento)
  const navigate = useNavigate();

  /**
   * getMediaUrl
   * Helper robusto para obtener la URL completa de un mediaField de Strapi.
   */
  const getMediaUrl = (mediaField) => {
    if (!mediaField) return null;

    const extract = (m) => {
      if (!m) return null;
      const file = m.data ? m.data : m;
      if (!file) return null;
      const first = Array.isArray(file) ? file[0] : file;
      if (!first) return null;
      const attrs = first.attributes || first;
      const formats = attrs.formats || attrs.formats || attrs.formats;
      const thumb =
        formats?.thumbnail?.url ||
        formats?.small?.url ||
        formats?.medium?.url ||
        formats?.large?.url;
      const url = thumb || attrs.url || attrs?.data?.attributes?.url;
      if (!url) return null;
      if (url.startsWith("http")) return url;
      return `${STRAPI_URL}${url}`;
    };

    if (Array.isArray(mediaField)) {
      return extract(mediaField[0]);
    }
    return extract(mediaField);
  };

  /**
   * formatDate
   */
  const formatDate = (d) => {
    if (!d) return "Sin fecha";
    try {
      const date = new Date(d);
      return date.toLocaleString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return String(d);
    }
  };

  /**
   * extractLocation
   */
  const extractLocation = (direccion) => {
    if (!direccion || typeof direccion !== "string") {
      return { colonia: null, ciudad: null, estado: null };
    }

    const parts = direccion
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    let colonia = null;
    let ciudad = null;
    let estado = null;

    const mexicoIndex = parts.findIndex(
      (p) => p.toLowerCase() === "méxico" || p.toLowerCase() === "mexico"
    );

    if (mexicoIndex > 0) {
      estado = parts[mexicoIndex - 1];
    } else if (parts.length >= 2) {
      estado = parts[parts.length - 2];
    }

    for (let p of parts) {
      if (/\b\d{4,5}\b/.test(p)) {
        ciudad = p.replace(/\b\d{4,5}\b/, "").trim();
        break;
      }
    }

    if (parts.length >= 2) {
      colonia = parts[1];
    }

    if (!ciudad && estado) {
      ciudad = estado;
    }

    const clean = (v) => (typeof v === "string" ? v.replace(/^\s+|\s+$/g, "") : null);

    return {
      colonia: clean(colonia),
      ciudad: clean(ciudad),
      estado: clean(estado),
    };
  };

  /**
   * fetchClubs
   * Llama a Strapi con filtros, paginación y orden.
   */
  const fetchClubs = useCallback(async () => {
    setLoading(true);
    try {
      // URL base con populate y paginación
      let url = `${STRAPI_URL}/api/clubs?populate=foto_de_perfil&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;

      // cuando filtro = 'revisar' añadimos filtro por en_revision = true
      if (filtro === "revisar") {
        url += `&filters[en_revision][$eq]=true`;
      }

      // orden por fecha_alta
      url += `&sort=fecha_alta:${order}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Respuesta no OK");
      const json = await res.json();

      // json.data es el arreglo de entries en Strapi v4
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

  // efecto que trae los clubs cuando cambia el fetchClubs (page, filtro, order)
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

  // Filtrado local usando searchTerm (por nombre del club)
  const clubOptions = Array.from(
    new Set(
      clubs
        .map((c) => (c.attributes ? c.attributes.nombre_club : null))
        .filter(Boolean)
    )
  );

  const filteredClubs = clubs.filter((c) => {
    const nombre = (c.attributes && c.attributes.nombre_club) || "";
    if (!searchTerm) return true;
    return nombre.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // loader inicial mientras carga los datos
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
            Admin / Clubs -->
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

        {/* Search + orden */}
        <Stack
          direction={isSm ? "column" : "row"}
          spacing={1}
          alignItems="center"
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          {/* Autocomplete busqueda pequeña y estilizada */}
          <Autocomplete
            freeSolo
            size="small"
            options={clubOptions}
            onInputChange={(_, value) => setSearchTerm(value || "")}
            inputValue={searchTerm}
            sx={{
              width: { xs: "100%", sm: 300 },
              bgcolor: "background.paper",
              boxShadow: 1,
              borderRadius: 1,
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Buscar clubs..."
                size="small"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: params.InputProps.endAdornment,
                }}
              />
            )}
          />

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
        </Stack>
      </Box>

      {/* Lista de items */}
      <Stack spacing={2}>
        <AnimatePresence>
          {filteredClubs.map((club) => {
            // cada entry de Strapi viene como { id, attributes: { ... } }
            const attrs = club.attributes || {};
            // foto de perfil usando helper robusto
            const fotoUrl = getMediaUrl(attrs.foto_de_perfil);
            // dirección posible
            const direccion = attrs.direccion || attrs.direccion_legal || null;
            const { colonia, ciudad, estado } = extractLocation(direccion);
            const fecha = attrs.fecha_alta || attrs.createdAt || null;

            // --- SLUG seguro ---
            const clubSlug =
              attrs.slug ||
              (attrs.nombre_club
                ? String(attrs.nombre_club)
                    .trim()
                    .toLowerCase()
                    .replace(/[^a-z0-9áéíóúñ]+/g, "-")
                    .replace(/^-+|-+$/g, "")
                : String(club.id));

            // Handlers de navegación (todos usan useNavigate)
            const goRevisar = () => navigate(`/admin/clubs/revisar/${clubSlug}`);
            const goAgendar = () => navigate(`/admin/clubs/agendar/${clubSlug}`);
            const goAprobar = () => navigate(`/admin/clubs/aprobar/${clubSlug}`);
            const goRechazar = () => navigate(`/admin/clubs/rechazar/${clubSlug}`);
            const goVer = () => navigate(`/admin/clubs/ver/${clubSlug}`);
            const goConfigurar = () => navigate(`/admin/clubs/configurar/${clubSlug}`);

            // status_legal: 'gestión' -> Gestionar ; 'folio' -> Revisar trámite
            const statusLegal = (attrs.status_legal || "").toString().toLowerCase();

            // tipo: puede ser 'cultivo' 'consumo' o 'ambos'
            const tipo = (attrs.tipo || "").toString().toLowerCase();

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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, fontSize: { xs: 16, sm: 18 } }}
                      >
                        {/* Aquí mostramos nombre del club (STRING). Nunca renderizamos objetos. */}
                        {attrs.nombre_club || "Club sin nombre"}
                      </Typography>

                      {/* Badges pequeños al lado del título */}
                      {statusLegal === "gestión" && (
                        <Tooltip title="Requires legal management">
                          <Box
                            component="span"
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.6,
                              px: 1,
                              py: 0.4,
                              borderRadius: 1,
                              bgcolor: "info.light",
                              color: "info.contrastText",
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                            aria-label="Gestionar"
                          >
                            <Settings sx={{ fontSize: 16 }} />
                            Gestionar
                          </Box>
                        </Tooltip>
                      )}

                      {statusLegal === "folio" && (
                        <Tooltip title="Revisar trámite">
                          <Box
                            component="span"
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.6,
                              px: 1,
                              py: 0.4,
                              borderRadius: 1,
                              bgcolor: "warning.light",
                              color: "warning.contrastText",
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                            aria-label="Revisar trámite"
                          >
                            <FactCheck sx={{ fontSize: 16 }} />
                            Revisar trámite
                          </Box>
                        </Tooltip>
                      )}

                      {/* tipo - badge alargado */}
                      {(tipo === "cultivo" || tipo === "consumo" || tipo === "ambos") && (
                        <Box
                          component="span"
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.6,
                            px: 1,
                            py: 0.4,
                            borderRadius: 2,
                            bgcolor: "grey.100",
                            color: "text.primary",
                            fontSize: 12,
                            fontWeight: 700,
                            ml: 0.5,
                          }}
                          aria-label={`Tipo: ${tipo}`}
                        >
                          {tipo === "cultivo" && <Agriculture sx={{ fontSize: 16 }} />}
                          {tipo === "consumo" && <LocalDining sx={{ fontSize: 16 }} />}
                          {tipo === "ambos" && <AllInclusive sx={{ fontSize: 16 }} />}
                          {tipo === "cultivo" && "Cultivo"}
                          {tipo === "consumo" && "Consumo"}
                          {tipo === "ambos" && "Ambos"}
                        </Box>
                      )}
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: 13 }}
                    >
                      {colonia ? `${colonia} · ` : ""}
                      {ciudad
                        ? `${ciudad}${estado ? ` / ${estado}` : ""}`
                        : "Ciudad no especificada"}
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
                        {/* Revisar: navega a /admin/clubs/revisar/:slug */}
                        <Tooltip title="Revisar datos">
                          <IconButton
                            sx={{ color: "#7b2cbf" }}
                            size={isSm ? "small" : "medium"}
                            onClick={goRevisar}
                            aria-label={`Revisar ${attrs.nombre_club || clubSlug}`}
                          >
                            <FactCheck />
                          </IconButton>
                        </Tooltip>

                        {/* Agendar: navega a /admin/clubs/agendar/:slug */}
                        <Tooltip title="Agendar">
                          <IconButton
                            color="info"
                            size={isSm ? "small" : "medium"}
                            onClick={goAgendar}
                            aria-label={`Agendar ${attrs.nombre_club || clubSlug}`}
                          >
                            <Event />
                          </IconButton>
                        </Tooltip>

                        {/* Activar / Aprobar: navega a /admin/clubs/aprobar/:slug */}
                        <Tooltip title="Activar">
                          <IconButton
                            color="success"
                            size={isSm ? "small" : "medium"}
                            onClick={goAprobar}
                            aria-label={`Aprobar ${attrs.nombre_club || clubSlug}`}
                          >
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>

                        {/* Rechazar: navega a /admin/clubs/rechazar/:slug */}
                        <Tooltip title="Rechazar">
                          <IconButton
                            color="error"
                            size={isSm ? "small" : "medium"}
                            onClick={goRechazar}
                            aria-label={`Rechazar ${attrs.nombre_club || clubSlug}`}
                          >
                            <Cancel />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <>
                        {/* En vista 'todos' mostramos Ver y Configurar */}
                        <Tooltip title="Ver">
                          <IconButton
                            color="primary"
                            size={isSm ? "small" : "medium"}
                            onClick={goVer}
                            aria-label={`Ver ${attrs.nombre_club || clubSlug}`}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Acciones / Configurar">
                          <IconButton
                            color="default"
                            size={isSm ? "small" : "medium"}
                            onClick={goConfigurar}
                            aria-label={`Configurar ${attrs.nombre_club || clubSlug}`}
                          >
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

        {!filteredClubs.length && (
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

/**
 * ChipMini
 * Componente pequeño para etiquetas (ej: "En revisión")
 * Mantengo la implementación original y la dejo al final del archivo.
 */
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

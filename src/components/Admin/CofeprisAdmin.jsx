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
  Print,
  Autorenew,
} from "@mui/icons-material";

// Iconos para los tipos (elige alguno que te guste)
import CardMembership from "@mui/icons-material/CardMembership"; // membresía
import EmojiNature from "@mui/icons-material/EmojiNature"; // jardinero (florecita)
import Group from "@mui/icons-material/Group"; // club
import AccountCircle from "@mui/icons-material/AccountCircle"; // usuario
import ManageAccounts from "@mui/icons-material/ManageAccounts"; // gestión

import { motion, AnimatePresence } from "framer-motion";
import PreLoader from "../PreLoader.jsx";
import { useNavigate } from "react-router-dom";

// placeholder local para cuando no haya imagen
import sinImagen from "../../assets/placeholders/sinimagen.jpg";

// URL base de Strapi (igual que en tu ejemplo)
const STRAPI_URL = process.env.REACT_APP_STRAPI_URL;

/**
 * AdminCofeprisTramites
 *
 * Lista y gestiona trámites (colección cofepristramites).
 *
 * Reglas de filtrado:
 * - "solicitados": status === "solicitado"  (default)
 * - "entramite": status NOT IN ["solicitado","concluido","cancelado"]
 * - "concluidos": status === "concluido"
 * - "cancelados": status === "cancelado"
 *
 * Relaciones:
 * - Si tipo === 'membresia' || 'usuario' -> relación usuario (colección users, campos username + profilepic)
 * - Si tipo === 'club' || 'jardinero' -> relación club (colección clubs, campos nombre_club + foto_de_perfil)
 *
 * Botones:
 * - solicitados: Ver (/admin/tramites/ver/:rfc)
 * - entramite: Ver, Checar status, Imprimir documentos, Actualizar (los 3 últimos solo para tipos 'gestion' o 'club').
 *
 */
export default function CofeprisAdmin() {
  // estados principales
  const [tramites, setTramites] = useState([]); // array de registros de cofepristramites
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [pageSize] = useState(8);

  // filtro actual: 'solicitados' | 'entramite' | 'concluidos' | 'cancelados'
  const [filtro, setFiltro] = useState("solicitados");

  // orden (desc | asc)
  const [order, setOrder] = useState("desc");

  // buscador simple por rfc o nombre
  const [searchTerm, setSearchTerm] = useState("");

  // mapas temporales para users/clubs minimal (id -> objeto)
  const [usersMap, setUsersMap] = useState({});
  const [clubsMap, setClubsMap] = useState({});

  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  /**
   * getMediaUrl
   * helper robusto para extraer urls de archivos en Strapi.
   * Acepta: objeto populate, array o directamente atributos.
   */
  const getMediaUrl = (mediaField) => {
    if (!mediaField) return null;
    const extract = (m) => {
      if (!m) return null;
      // Strapi puede traer data: { id, attributes: { url, formats... } }
      const file = m.data ? m.data : m;
      const first = Array.isArray(file) ? file[0] : file;
      if (!first) return null;
      const attrs = first.attributes || first;
      const formats = attrs.formats || attrs.formats;
      const thumb =
        formats?.thumbnail?.url ||
        formats?.small?.url ||
        formats?.medium?.url ||
        formats?.large?.url;
      const url = thumb || attrs.url || attrs?.data?.attributes?.url;
      if (!url) return null;
      if (String(url).startsWith("http")) return url;
      return `${STRAPI_URL}${url}`;
    };

    if (Array.isArray(mediaField)) {
      return extract(mediaField[0]);
    }
    return extract(mediaField);
  };

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
   * buildTramitesUrl
   * Construye la URL para consultar la colección cofepristramites según filtro, paginación y orden.
   */
  const buildTramitesUrl = (page, pageSize, filtro, order) => {
    let url = `${STRAPI_URL}/api/cofepristramites?pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=fecha_inicial:${order}`;

    // agregamos filtros segun la pestaña
    if (filtro === "solicitados") {
      url += `&filters[status][$eq]=solicitado`;
    } else if (filtro === "entramite") {
      // NOT IN solicitados,concluido,cancelado
      url += `&filters[status][$notIn]=solicitado,concluido,cancelado`;
    } else if (filtro === "concluidos") {
      url += `&filters[status][$eq]=concluido`;
    } else if (filtro === "cancelados") {
      url += `&filters[status][$eq]=cancelado`;
    }

    // populate mínimo para poder leer relaciones (id) — si Strapi no devuelve ids sin populate,
    // esto asegura que tengamos al menos la estructura, pero no pedimos full media pesado.
    // Notarás que posteriormente hacemos fetch separado de users/clubs para traer solo los campos necesarios.
    url += `&populate[usuario]=usuario&populate[club]=club`;

    return url;
  };

  /**
   * fetchTramites
   * 1) Trae tramites según filtro/paginación
   * 2) Recolecta ids de usuario y clubs referenciados y trae desde /api/users y /api/clubs
   *    solo los campos necesarios (username + profilepic) y (nombre_club + foto_de_perfil).
   */
  const fetchTramites = useCallback(async () => {
    setLoading(true);
    try {
      const url = buildTramitesUrl(page, pageSize, filtro, order);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al traer trámites");
      const json = await res.json();

      const entries = json.data || [];
      setTramites(entries || []);
      setPageCount(json.meta?.pagination?.pageCount || 1);

      // Recolectar IDs de usuarios y clubs referenciados en los trámites
      const userIds = new Set();
      const clubIds = new Set();

      entries.forEach((entry) => {
        const attrs = entry.attributes || {};
        // Cuando populate hizo su trabajo: attrs.usuario.data?.id
        if (attrs.usuario && attrs.usuario.data) {
          const u = attrs.usuario.data;
          if (u && u.id) userIds.add(u.id);
        } else if (attrs.usuario && typeof attrs.usuario === "number") {
          userIds.add(attrs.usuario);
        }

        if (attrs.club && attrs.club.data) {
          const c = attrs.club.data;
          if (c && c.id) clubIds.add(c.id);
        } else if (attrs.club && typeof attrs.club === "number") {
          clubIds.add(attrs.club);
        }
      });

      // FETCH users minimal (solo si hay ids)
      const usersMapLocal = {};
      if (userIds.size > 0) {
        const ids = Array.from(userIds).join(",");
        // populate profilepic y solo traer username + profilepic
        const usersUrl = `${STRAPI_URL}/api/users?filters[id][$in]=${ids}&fields=username&populate[profilepic]=profilepic`;
        const rU = await fetch(usersUrl);
        if (rU.ok) {
          const jU = await rU.json();
          (jU.data || []).forEach((u) => {
            const a = u.attributes || {};
            usersMapLocal[u.id] = {
              id: u.id,
              username: a.username || null,
              profilepic: a.profilepic || null,
            };
          });
        }
      }

      // FETCH clubs minimal (solo si hay ids)
      const clubsMapLocal = {};
      if (clubIds.size > 0) {
        const ids = Array.from(clubIds).join(",");
        const clubsUrl = `${STRAPI_URL}/api/clubs?filters[id][$in]=${ids}&fields=nombre_club&populate[foto_de_perfil]=foto_de_perfil`;
        const rC = await fetch(clubsUrl);
        if (rC.ok) {
          const jC = await rC.json();
          (jC.data || []).forEach((c) => {
            const a = c.attributes || {};
            clubsMapLocal[c.id] = {
              id: c.id,
              nombre_club: a.nombre_club || null,
              foto_de_perfil: a.foto_de_perfil || null,
            };
          });
        }
      }

      // Guardar en estado (mapas)
      setUsersMap(usersMapLocal);
      setClubsMap(clubsMapLocal);
    } catch (err) {
      console.error("Error fetchTramites:", err);
      setTramites([]);
      setPageCount(1);
      setUsersMap({});
      setClubsMap({});
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filtro, order]);

  // efecto para traer tramites al cargar / cambiar filtros o paginación
  useEffect(() => {
    fetchTramites();
  }, [fetchTramites]);

  // --- UI handlers ---
  const handleFiltroClick = (nuevo) => {
    setFiltro(nuevo);
    setPage(1);
  };

  const handleOrderChange = (e) => {
    setOrder(e.target.value);
    setPage(1);
  };

  // mapping para iconos segun tipo
  const TipoIcon = ({ tipo }) => {
    const style = { fontSize: 18 };
    if (!tipo) return null;
    switch (tipo) {
      case "membresia":
        return <CardMembership sx={{ ...style, color: "primary.main" }} />;
      case "jardinero":
        return <EmojiNature sx={{ ...style, color: "success.main" }} />;
      case "club":
        return <Group sx={{ ...style, color: "secondary.main" }} />;
      case "usuario":
        return <AccountCircle sx={{ ...style, color: "info.main" }} />;
      case "gestion":
        return <ManageAccounts sx={{ ...style, color: "warning.main" }} />;
      default:
        return <CardMembership sx={{ ...style }} />;
    }
  };

  // Helper para obtener nombre e imagen asociada a un trámite
  const getRelatedInfo = (attrs) => {
    // tipo: membresia, jardinero, club, usuario, gestion
    const tipo = (attrs.tipo || "")?.toString?.().toLowerCase?.() || "";

    // default placeholders
    let displayName = "Sin nombre";
    let imageUrl = null;

    if (tipo === "membresia" || tipo === "usuario") {
      // buscar en usersMap por id (attrs.usuario.data.id)
      const usuarioData = attrs.usuario && attrs.usuario.data ? attrs.usuario.data : attrs.usuario;
      const userId = usuarioData ? usuarioData.id || usuarioData : null;
      const u = userId ? usersMap[userId] : null;

      displayName = (u && (u.username || "Usuario sin nombre")) || attrs.usuario?.username || "Usuario sin nombre";
      imageUrl = (u && getMediaUrl(u.profilepic)) || getMediaUrl(attrs.usuario?.data?.attributes?.profilepic) || null;
    } else if (tipo === "club" || tipo === "jardinero") {
      const clubData = attrs.club && attrs.club.data ? attrs.club.data : attrs.club;
      const clubId = clubData ? clubData.id || clubData : null;
      const c = clubId ? clubsMap[clubId] : null;

      displayName = (c && (c.nombre_club || "Club sin nombre")) || attrs.club?.nombre_club || "Club sin nombre";
      imageUrl = (c && getMediaUrl(c.foto_de_perfil)) || getMediaUrl(attrs.club?.data?.attributes?.foto_de_perfil) || null;
    } else {
      // fallback general
      displayName = attrs.titulo || attrs.nombre || "Trámite sin título";
      imageUrl = null;
    }

    return { tipo, displayName, imageUrl };
  };

  // Navegación para botones: /admin/tramites/:verbo/:rfc
  const goTo = (verbo, rfcOrId) => {
    const key = rfcOrId || "no-rfc";
    navigate(`/admin/tramites/${verbo}/${key}`);
  };

  // loader
  if (loading) return <PreLoader />;

  // filtro local por searchTerm (rfc o nombre relacionado)
  const filtered = tramites.filter((t) => {
    if (!searchTerm) return true;
    const attrs = t.attributes || {};
    const { displayName } = getRelatedInfo(attrs);
    const rfc = attrs.rfc || "";
    const term = searchTerm.toLowerCase();
    return (
      String(displayName).toLowerCase().includes(term) ||
      String(rfc).toLowerCase().includes(term)
    );
  });

  return (
    <Box sx={{ width: "100%", px: { xs: 1, sm: 2, md: 4 }, pb: 6 }}>
      {/* Top bar */}
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
            Admin / Cofepris Trámites
          </Typography>

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
              onClick={() => handleFiltroClick("solicitados")}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.2,
                py: 0.5,
                borderRadius: 1,
                bgcolor: filtro === "solicitados" ? "success.main" : "transparent",
                color: filtro === "solicitados" ? "common.white" : "text.primary",
                textTransform: "uppercase",
                fontSize: 12,
                fontWeight: 700,
                boxShadow: filtro === "solicitados" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              }}
            >
              <FactCheck sx={{ fontSize: 16 }} />
              Solicitados
            </Link>

            <Link
              component="button"
              onClick={() => handleFiltroClick("entramite")}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.2,
                py: 0.5,
                borderRadius: 1,
                bgcolor: filtro === "entramite" ? "success.main" : "transparent",
                color: filtro === "entramite" ? "common.white" : "text.primary",
                textTransform: "uppercase",
                fontSize: 12,
                fontWeight: 700,
                boxShadow: filtro === "entramite" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              }}
            >
              <ListAlt sx={{ fontSize: 16 }} />
              En trámite
            </Link>

            <Link
              component="button"
              onClick={() => handleFiltroClick("concluidos")}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.2,
                py: 0.5,
                borderRadius: 1,
                bgcolor: filtro === "concluidos" ? "success.main" : "transparent",
                color: filtro === "concluidos" ? "common.white" : "text.primary",
                textTransform: "uppercase",
                fontSize: 12,
                fontWeight: 700,
                boxShadow: filtro === "concluidos" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              }}
            >
              <CheckCircle sx={{ fontSize: 16 }} />
              Concluidos
            </Link>

            <Link
              component="button"
              onClick={() => handleFiltroClick("cancelados")}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.2,
                py: 0.5,
                borderRadius: 1,
                bgcolor: filtro === "cancelados" ? "success.main" : "transparent",
                color: filtro === "cancelados" ? "common.white" : "text.primary",
                textTransform: "uppercase",
                fontSize: 12,
                fontWeight: 700,
                boxShadow: filtro === "cancelados" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              }}
            >
              <Cancel sx={{ fontSize: 16 }} />
              Cancelados
            </Link>
          </Stack>
        </Stack>

        {/* Search + orden */}
        <Stack direction={isSm ? "column" : "row"} spacing={1} alignItems="center" sx={{ width: { xs: "100%", sm: "auto" } }}>
          <Autocomplete
            freeSolo
            size="small"
            options={filtered.map((t) => {
              const attrs = t.attributes || {};
              const { displayName } = getRelatedInfo(attrs);
              return `${displayName} · ${attrs.rfc || t.id}`;
            })}
            onInputChange={(_, value) => setSearchTerm(value || "")}
            inputValue={searchTerm}
            sx={{
              width: { xs: "100%", sm: 320 },
              bgcolor: "background.paper",
              boxShadow: 1,
              borderRadius: 1,
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Buscar por nombre o RFC..."
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
            <Select size="small" value={order} onChange={handleOrderChange} sx={{ minWidth: 150 }}>
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

      {/* Lista */}
      <Stack spacing={2}>
        <AnimatePresence>
          {filtered.map((tramite) => {
            const attrs = tramite.attributes || {};
            const fecha = attrs.fecha_inicial || attrs.createdAt || null;
            const rfc = attrs.rfc || String(tramite.id);
            const { tipo, displayName, imageUrl } = getRelatedInfo(attrs);

            // avatar final (usa placeholder si no trae)
            const avatarSrc = imageUrl || sinImagen;

            // slug o key para navegación (aquí usamos rfc si existe)
            const keyForNav = rfc;

            // botones condicionales (para 'en trámite' mostrar checar/imprimir/actualizar solo para tipo 'gestion' o 'club')
            const esAccionEspecial = tipo === "gestion" || tipo === "club";

            return (
              <motion.div
                key={tramite.id}
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
                      filtro === "solicitados" ? "warning.main" : "success.main"
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
                      src={avatarSrc}
                      alt={displayName}
                      variant="rounded"
                      sx={{
                        width: { xs: 64, sm: 88 },
                        height: { xs: 64, sm: 88 },
                        borderRadius: 2,
                        bgcolor: "grey.100",
                        boxShadow: 1,
                      }}
                    />
                  </Box>

                  {/* info principal */}
                  <Box sx={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: 15, sm: 17 } }}>
                        {displayName || "Sin nombre"}
                      </Typography>

                      {/* badge con icono tipo */}
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
                        <TipoIcon tipo={tipo} />
                        <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
                          {tipo ? tipo.charAt(0).toUpperCase() + tipo.slice(1) : "Tipo no especificado"}
                        </Typography>
                      </Box>

                      {/* status pequeño */}
                      <Chip label={attrs.status || "Sin status"} size="small" sx={{ ml: 1 }} />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                      RFC: {attrs.rfc || "No especificado"}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      Solicitado: {formatDate(fecha)}
                    </Typography>

                    {/* si hay algún campo adicional de nota lo podrías mostrar aquí */}
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {attrs.descripcion || attrs.observaciones || "Sin descripción"}
                    </Typography>
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
                    {/* Ver (siempre) */}
                    <Tooltip title="Ver">
                      <IconButton
                        color="primary"
                        size={isSm ? "small" : "medium"}
                        onClick={() => goTo("ver", keyForNav)}
                        aria-label={`Ver ${displayName}`}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>

                    {filtro === "solicitados" ? null : (
                      <>
                        {/* Si estamos en 'en trámite' u otras vistas, mostramos botones adicionales segun reglas */}
                        {/* Checar status (solo para tipos gestion o club) */}
                        {esAccionEspecial && (
                          <Tooltip title="Checar status">
                            <IconButton
                              size={isSm ? "small" : "medium"}
                              onClick={() => goTo("checar", keyForNav)}
                              aria-label={`Checar ${displayName}`}
                            >
                              <FactCheck />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* Imprimir documentos (solo gestion o club) */}
                        {esAccionEspecial && (
                          <Tooltip title="Imprimir documentos">
                            <IconButton
                              size={isSm ? "small" : "medium"}
                              onClick={() => goTo("imprimir", keyForNav)}
                              aria-label={`Imprimir ${displayName}`}
                            >
                              <Print />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* Actualizar (solo gestion o club) */}
                        {esAccionEspecial && (
                          <Tooltip title="Actualizar">
                            <IconButton
                              size={isSm ? "small" : "medium"}
                              onClick={() => goTo("actualizar", keyForNav)}
                              aria-label={`Actualizar ${displayName}`}
                            >
                              <Autorenew />
                            </IconButton>
                          </Tooltip>
                        )}
                      </>
                    )}
                  </Box>
                </Paper>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {!filtered.length && (
          <Typography align="center" color="text.secondary">
            No hay trámites para mostrar.
          </Typography>
        )}
      </Stack>

      {/* paginación */}
      {pageCount > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination count={pageCount} page={page} onChange={(_, value) => setPage(value)} color="success" />
        </Box>
      )}
    </Box>
  );
}

/* --- Nota:
 - Asegúrate de que los nombres de campos en Strapi coincidan: rfc, fecha_inicial, status, tipo, usuario, club, profilepic, foto_de_perfil, nombre_club, username.
 - Si algún campo difiere ajusta los nombres en el código.
 - Si prefieres que los users/clubs se obtengan directamente con populate (y evitar la segunda petición), podemos simplificarlo — pero siguiendo tu pedido hice la doble solicitud para traer *solo* los campos necesarios.
*/

import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
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
  FactCheck,
  ListAlt,
  FilterList,
  ArrowDownward,
  ArrowUpward,
  Print,
  Autorenew,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";

import CardMembership from "@mui/icons-material/CardMembership"; // membresía
import EmojiNature from "@mui/icons-material/EmojiNature"; // jardinero
import Group from "@mui/icons-material/Group"; // club
import AccountCircle from "@mui/icons-material/AccountCircle"; // usuario
import ManageAccounts from "@mui/icons-material/ManageAccounts"; // gestión

import { motion, AnimatePresence } from "framer-motion";
import PreLoader from "../../components/PreLoader.jsx";
import { useNavigate } from "react-router-dom";

// placeholder local para cuando no haya imagen
import sinImagen from "../../assets/placeholders/sinimagen.jpg";

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL || "";

/**
 * AdminCofeprisTramites - Versión corregida
 *
 * - Soluciona el bug del filtro "En trámite" que estaba mostrando todo.
 * - Mejora el espaciado de los botones para pantallas grandes.
 * - Sigue las reglas: iconos por tipo, imagen usuario/club, botones condicionales.
 */
export default function AdminCofeprisTramites() {
  const [tramites, setTramites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [pageSize] = useState(8);

  const [filtro, setFiltro] = useState("solicitados"); // solicitados | entramite | concluidos | cancelados
  const [order, setOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");

  // mapas minimal de users y clubs (id -> objeto con fields mínimos)
  const [usersMap, setUsersMap] = useState({});
  const [clubsMap, setClubsMap] = useState({});

  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const bannedStatusesForEnTramite = ["solicitado", "concluido", "cancelado"];

  /**
   * Helper robusto para extraer URL de media desde Strapi (similar al ejemplo original)
   */
  const getMediaUrl = (mediaField) => {
    if (!mediaField) return null;
    const extract = (m) => {
      if (!m) return null;
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
   * Construye la URL de trámites (populate mínimo para obtener ids de relacion)
   */
  const buildTramitesUrl = (page, pageSize, filtro, order) => {
    let url = `${STRAPI_URL}/api/cofepristramites?pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=fecha_inicial:${order}`;

    if (filtro === "solicitados") {
      url += `&filters[status][$eq]=solicitado`;
    } else if (filtro === "entramite") {
      // intento de filtro servidor: excluye los estados comunes
      // NOTA: usamos además filtrado en cliente (ver abajo) para robustez
      url += `&filters[status][$notIn]=solicitado,concluido,cancelado`;
    } else if (filtro === "concluidos") {
      url += `&filters[status][$eq]=concluido`;
    } else if (filtro === "cancelados") {
      url += `&filters[status][$eq]=cancelado`;
    }

    // populate leve para obtener referencias (usuario, club)
    url += `&populate[usuario]=usuario&populate[club]=club`;

    return url;
  };

  /**
   * getRelatedInfo: devuelve tipo, displayName e imageUrl resolviendo con usersMap / clubsMap
   */
  const getRelatedInfo = (attrs) => {
    const tipo = (attrs.tipo || "")?.toString?.().toLowerCase?.() || "";

    let displayName = "Sin nombre";
    let imageUrl = null;

    if (tipo === "membresia" || tipo === "usuario") {
      const usuarioData = attrs.usuario && attrs.usuario.data ? attrs.usuario.data : attrs.usuario;
      const userId = usuarioData ? usuarioData.id || usuarioData : null;
      const u = userId ? usersMap[userId] : null;

      displayName = (u && (u.username || "Usuario sin nombre")) || attrs.usuario?.username || "Usuario sin nombre";
      imageUrl =
        (u && getMediaUrl(u.profilepic)) ||
        getMediaUrl(attrs.usuario?.data?.attributes?.profilepic) ||
        null;
    } else if (tipo === "club" || tipo === "jardinero") {
      const clubData = attrs.club && attrs.club.data ? attrs.club.data : attrs.club;
      const clubId = clubData ? clubData.id || clubData : null;
      const c = clubId ? clubsMap[clubId] : null;

      displayName = (c && (c.nombre_club || "Club sin nombre")) || attrs.club?.nombre_club || "Club sin nombre";
      imageUrl =
        (c && getMediaUrl(c.foto_de_perfil)) ||
        getMediaUrl(attrs.club?.data?.attributes?.foto_de_perfil) ||
        null;
    } else {
      displayName = attrs.titulo || attrs.nombre || "Trámite sin título";
      imageUrl = null;
    }

    return { tipo, displayName, imageUrl };
  };

  /**
   * TipoIcon: icono bonito según tipo
   */
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

  /**
   * fetchTramites:
   * - Trae la página actual desde Strapi con populate mínimo
   * - Luego hace fetch minimal de users y clubs para poblar mapas (solo los campos que necesitamos)
   * - Finalmente aplica un filtrado local extra para asegurar que 'en trámite' realmente excluya los estados baneados
   */
  const fetchTramites = useCallback(async () => {
    setLoading(true);
    try {
      const url = buildTramitesUrl(page, pageSize, filtro, order);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al traer trámites");
      const json = await res.json();
      let entries = json.data || [];
      setPageCount(json.meta?.pagination?.pageCount || 1);

      // --- filtrado adicional en cliente (normaliza status) para 'entramite' ---
      if (filtro === "entramite") {
        entries = entries.filter((entry) => {
          const s = ((entry.attributes && entry.attributes.status) || "").toString().toLowerCase().trim();
          return !bannedStatusesForEnTramite.includes(s);
        });
      } else if (filtro === "solicitados") {
        // normalizar solicitados por si el servidor devolvió algo raro:
        entries = entries.filter((entry) => {
          const s = ((entry.attributes && entry.attributes.status) || "").toString().toLowerCase().trim();
          return s === "solicitado";
        });
      } else if (filtro === "concluidos") {
        entries = entries.filter((entry) => {
          const s = ((entry.attributes && entry.attributes.status) || "").toString().toLowerCase().trim();
          return s === "concluido";
        });
      } else if (filtro === "cancelados") {
        entries = entries.filter((entry) => {
          const s = ((entry.attributes && entry.attributes.status) || "").toString().toLowerCase().trim();
          return s === "cancelado";
        });
      }

      setTramites(entries);

      // Recolectar IDs de usuarios y clubs para traer datos mínimos
      const userIds = new Set();
      const clubIds = new Set();

      entries.forEach((entry) => {
        const attrs = entry.attributes || {};
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

      // Fetch users minimal
      const usersMapLocal = {};
      if (userIds.size > 0) {
        const ids = Array.from(userIds).join(",");
        const usersUrl = `${STRAPI_URL}/api/users?filters[id][$in]=${ids}&fields=username&populate[profilepic]=profilepic`;
        try {
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
        } catch (e) {
          console.warn("No se pudieron cargar users minimal:", e);
        }
      }

      // Fetch clubs minimal
      const clubsMapLocal = {};
      if (clubIds.size > 0) {
        const ids = Array.from(clubIds).join(",");
        const clubsUrl = `${STRAPI_URL}/api/clubs?filters[id][$in]=${ids}&fields=nombre_club&populate[foto_de_perfil]=foto_de_perfil`;
        try {
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
        } catch (e) {
          console.warn("No se pudieron cargar clubs minimal:", e);
        }
      }

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

  useEffect(() => {
    fetchTramites();
  }, [fetchTramites]);

  const handleFiltroClick = (nuevo) => {
    setFiltro(nuevo);
    setPage(1);
  };

  const handleOrderChange = (e) => {
    setOrder(e.target.value);
    setPage(1);
  };

  const goTo = (verbo, rfcOrId) => {
    const key = rfcOrId || "no-rfc";
    navigate(`/admin/tramites/${verbo}/${key}`);
  };

  if (loading) return <PreLoader />;

  // Filtrado local por searchTerm
  const filtered = tramites.filter((t) => {
    if (!searchTerm) return true;
    const attrs = t.attributes || {};
    const { displayName } = getRelatedInfo(attrs);
    const rfc = attrs.rfc || t.id;
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

          <Stack direction="row" spacing={1} sx={{ ml: 1, alignItems: "center", flexWrap: "wrap" }}>
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

            const avatarSrc = imageUrl || sinImagen;
            const keyForNav = rfc;
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
                    p: { xs: 2, sm: 2.5, md: 3 }, // más padding en md
                    alignItems: "center",
                    flexDirection: { xs: "column", sm: "row" },
                    borderLeft: `6px solid ${filtro === "solicitados" ? "warning.main" : "success.main"}`,
                    // para que no pegue con los bordes extremos en pantallas grandes:
                    pr: { xs: 2, sm: 2.5, md: 4 },
                  }}
                >
                  {/* avatar */}
                  <Box sx={{ display: "flex", alignItems: "center", width: { xs: "100%", sm: 120 }, flexShrink: 0, justifyContent: { xs: "flex-start", sm: "center" } }}>
                    <Avatar
                      src={avatarSrc}
                      alt={displayName}
                      variant="rounded"
                      sx={{ width: { xs: 64, sm: 88 }, height: { xs: 64, sm: 88 }, borderRadius: 2, bgcolor: "grey.100", boxShadow: 1 }}
                    />
                  </Box>

                  {/* info principal */}
                  <Box sx={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: 15, sm: 17 } }}>
                        {displayName || "Sin nombre"}
                      </Typography>

                      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.6, px: 1, py: 0.4, borderRadius: 2, bgcolor: "grey.100", color: "text.primary", fontSize: 12, fontWeight: 700, ml: 0.5 }} aria-label={`Tipo: ${tipo}`}>
                        <TipoIcon tipo={tipo} />
                        <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
                          {tipo ? tipo.charAt(0).toUpperCase() + tipo.slice(1) : "Tipo no especificado"}
                        </Typography>
                      </Box>

                      <Chip label={attrs.status || "Sin status"} size="small" sx={{ ml: 1 }} />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                      RFC: {attrs.rfc || "No especificado"}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      Solicitado: {formatDate(fecha)}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {attrs.descripcion || attrs.observaciones || "Sin descripción"}
                    </Typography>
                  </Box>

                  {/* acciones: agrego margin-right y minWidth para que no queden pegados */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: { xs: 1, sm: 1.5 },
                      alignItems: "center",
                      justifyContent: { xs: "flex-end", sm: "flex-end" },
                      width: { xs: "100%", sm: "auto" },
                      pt: { xs: 1, sm: 0 },
                      mr: { xs: 0, sm: 1.5, md: 3 }, // <-- espacio a la derecha para pantallas grandes
                      minWidth: { sm: 120 }, // evita que los botones se amontonen contra el borde
                    }}
                  >
                    <Tooltip title="Ver">
                      <IconButton color="primary" size={isSm ? "small" : "medium"} onClick={() => goTo("ver", keyForNav)} aria-label={`Ver ${displayName}`}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>

                    {/* Si estamos en 'solicitados' no mostramos botones extras */}
                    {filtro !== "solicitados" && (
                      <>
                        {esAccionEspecial && (
                          <Tooltip title="Checar status">
                            <IconButton size={isSm ? "small" : "medium"} onClick={() => goTo("checar", keyForNav)} aria-label={`Checar ${displayName}`}>
                              <FactCheck />
                            </IconButton>
                          </Tooltip>
                        )}

                        {esAccionEspecial && (
                          <Tooltip title="Imprimir documentos">
                            <IconButton size={isSm ? "small" : "medium"} onClick={() => goTo("imprimir", keyForNav)} aria-label={`Imprimir ${displayName}`}>
                              <Print />
                            </IconButton>
                          </Tooltip>
                        )}

                        {esAccionEspecial && (
                          <Tooltip title="Actualizar">
                            <IconButton size={isSm ? "small" : "medium"} onClick={() => goTo("actualizar", keyForNav)} aria-label={`Actualizar ${displayName}`}>
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

/* --- NOTAS RÁPIDAS:
 - Por seguridad y robustez he dejado filtro en la URL **y** filtro adicional en cliente normalizando el status.
 - Si tus estados en la BD usan mayúsculas o espacios (p.e. "Solicitado " o "Concluido"), la normalización los captura.
 - El espaciado se mejoró añadiendo pr y mr y un minWidth en la caja de acciones.
 - Si quieres que la paginación refleje el total REAL después del filtrado en servidor (p.e. que pageCount se reduzca cuando filtramos en cliente),
   puedo implementar una llamada adicional para obtener el total (count) por filtro y recalcular pageCount. ¿Quieres que lo haga también?
*/

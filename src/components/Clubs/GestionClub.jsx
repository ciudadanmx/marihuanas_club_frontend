import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  Avatar,
  Button,
  Chip,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  FactCheck as FactCheckIcon,
  ContentCut as EsquejeIcon,
  LocalFlorist as FlorIcon,
  MoveToInbox as PasarCuradoIcon,
  DeleteSweep as MermaIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useRoles } from "../../Contexts/RolesContext";
import sinImagen from "../../assets/placeholders/sinimagen.jpg";

/**
 * GestionClub
 * - Agrupa plantas por usuario (armario) en 3 secciones: armarios, mallas, closet.
 * - Trae plantas de /api/plantas filtrando por club (si se pasa clubId o viene del contexto).
 * - Para cada planta intenta obtener la foto más reciente desde registrosbitacoras
 *   (registros con tipo = "fotoplanta" y relation plantas incluye la planta).
 * - Si no encuentra imagen en registrosbitacoras usa fallback (galería / media / profilepic).
 *
 * Notas de integración:
 * - getFirstImageAsync: async con cache; consulta registrosbitacoras y devuelve URL o null.
 * - getFallbackImage: sync; extrae primera foto de galerías/fields ya presentes en el objeto.
 * - fetchPlantas: carga rápido con fallbacks y luego rellena las imágenes async sin bloquear render.
 */

 const STRAPI_BASE = (process.env.REACT_APP_STRAPI_URL || "").replace(/\/$/, "");

 function toAbsoluteUrl(url) {
   if (!url) return null;
   if (/^https?:\/\//i.test(url)) return url;
   if (url.startsWith("//")) return window.location.protocol + url;
   if (url.startsWith("/")) {
     return STRAPI_BASE ? `${STRAPI_BASE}${url}` : window.location.origin + url;
   }
   return STRAPI_BASE ? `${STRAPI_BASE}/${url}` : url;
 }

 function pickBestFormat(attrs) {
   if (!attrs) return null;
   const fm = attrs.formats ?? {};
   return (
     fm.thumbnail?.url ??
     fm.small?.url ??
     fm.medium?.url ??
     attrs.url ??
     attrs.location ??
     null
   );
 }

 function getImageUrl(obj) {
   if (!obj) return null;
   const attrs = obj.attributes ?? obj;

   // profilepic / avatar / picture (single media)
   const profile =
     attrs.profilepic ??
     attrs.profile_picture ??
     attrs.avatar ??
     attrs.picture;

   if (profile) {
     const data = profile.data ?? profile;
     const imgAttrs = data?.attributes ?? data;
     const url = pickBestFormat(imgAttrs);
     if (url) return toAbsoluteUrl(url);
   }

   // galerías / media múltiple
   const candidates = [
     attrs.galeria,
     attrs.fotos,
     attrs.media,
     attrs.imagenes,
     attrs.imagen,
   ];

   for (const c of candidates) {
     if (!c) continue;
     const arr = c.data ?? (Array.isArray(c) ? c : null);
     if (!arr || arr.length === 0) continue;
     const first = Array.isArray(arr) ? arr[0] : arr;
     const imgAttrs = first.attributes ?? first;
     const url = pickBestFormat(imgAttrs);
     if (url) return toAbsoluteUrl(url);
   }

   return null;
 }


/* ======================= Config / Colormap ======================= */
const COLOR_MAP = {
  rojo: "#ff5252",
  amarillo: "#ffd54f",
  verde: "#8bc34a",
  azul: "#4fc3f7",
  rosa: "#f48fb1",
  plata: "#c0c0c0",
};
const STRAPI = process.env.REACT_APP_STRAPI_URL || "";

/* ======================= Helpers de imagen ======================= */

/**
 * getFallbackImage(obj)
 * - Sincrónico.
 * - Busca en varios campos (galeria, fotos, media, imagenes, imagen, profilepic)
 * - Devuelve URL absoluta (prefija STRAPI si es relativa) o null.
 */
function getFallbackImage(obj) {
  if (!obj) return null;
  const attrs = obj.attributes ?? obj;

  // 🔥 CASO ESPECIAL: profilepic como media SINGLE
  const singleProfilePic = attrs.profilepic;
  if (singleProfilePic?.url) {
    const url = singleProfilePic.url;
    return url.startsWith("http") ? url : `${STRAPI}${url}`;
  }
  if (singleProfilePic?.data) {
    const imgAttrs = singleProfilePic.data.attributes ?? singleProfilePic.data;
    const url =
      imgAttrs?.formats?.thumbnail?.url ??
      imgAttrs?.formats?.small?.url ??
      imgAttrs?.formats?.medium?.url ??
      imgAttrs?.url ??
      null;
    if (url) return url.startsWith("http") ? url : `${STRAPI}${url}`;
  }

  // 🧠 CASOS GENERALES (galerías, media múltiple, etc)
  const candidates = [
    attrs.galeria,
    attrs.fotos,
    attrs.media,
    attrs.imagenes,
    attrs.imagen,
  ];

  for (const c of candidates) {
    if (!c) continue;
    const data = c.data ?? (Array.isArray(c) ? c : null);
    if (!data) continue;

    const first = Array.isArray(data) ? data[0] : data;
    if (!first) continue;

    const imgAttrs = first.attributes ?? first;
    const url =
      imgAttrs?.formats?.thumbnail?.url ??
      imgAttrs?.formats?.small?.url ??
      imgAttrs?.formats?.medium?.url ??
      imgAttrs?.url ??
      imgAttrs?.location ??
      null;

    if (!url) continue;
    return url.startsWith("http") ? url : `${STRAPI}${url}`;
  }

  return null;
}

/**
 * getFirstImageAsync(planta)
 * - Asíncrono: busca en registrosbitacoras los registros donde plantas incluye la planta,
 *   tipo = "fotoplanta", ordenados por timestamp desc, trae 1 y devuelve la primera media.
 * - Usa cache por plantaId para evitar fetchs repetidos.
 * - Devuelve Promise<string|null>.
 */
const _imageCache = new Map(); // plantaId -> Promise<string|null>
async function getFirstImageAsync(planta) {
  if (!planta) return null;
  const attrs = planta.attributes ?? planta;
  const plantaId = attrs?.id ?? attrs?.uid ?? attrs?.ID ?? null;
  if (!plantaId) return null;

  if (_imageCache.has(plantaId)) {
    return _imageCache.get(plantaId);
  }

  const p = (async () => {
    try {
      // construir consulta Strapi: registrosbitacoras con tipo=fotoplanta y plantas[id]=plantaId
      const filtroPlanta = encodeURIComponent(plantaId);
      const url = `${STRAPI}/api/registrosbitacoras?populate=media&pagination[pageSize]=1&sort=timestamp:desc&filters[tipo][$eq]=fotoplanta&filters[plantas][id][$eq]=${filtroPlanta}`;

      const res = await fetch(url);
      if (!res.ok) {
        // no tirar error, caer al fallback
        return getFallbackImage(planta);
      }

      const json = await res.json();
      const registro = Array.isArray(json.data) ? json.data[0] : json.data;
      if (!registro) return getFallbackImage(planta);

      const mediaField = registro.attributes?.media ?? registro.media ?? null;
      const mediaArray = mediaField?.data ?? (Array.isArray(mediaField) ? mediaField : null);
      if (!mediaArray || mediaArray.length === 0) return getFallbackImage(planta);

      const firstMedia = mediaArray[0];
      const mediaAttrs = firstMedia.attributes ?? firstMedia;
      const urlImg =
        mediaAttrs?.formats?.thumbnail?.url ??
        mediaAttrs?.formats?.small?.url ??
        mediaAttrs?.formats?.medium?.url ??
        mediaAttrs?.url ??
        mediaAttrs?.location ??
        null;
      if (!urlImg) return getFallbackImage(planta);
      return String(urlImg).startsWith("http") ? urlImg : `${STRAPI}${urlImg}`;
    } catch {
      // en caso de cualquier fallo devolvemos fallback
      return getFallbackImage(planta);
    }
  })();

  _imageCache.set(plantaId, p);
  return p;
}

/* ======================= Componente principal ======================= */
export default function GestionClub({ clubId: clubIdProp = null }) {
  // context y theme (siempre en top-level)
  const { membresia } = useRoles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  // club actual (prop tiene prioridad)
  const clubId = clubIdProp ?? membresia?.club?.id ?? membresia?.club ?? null;

  // state
  const [plantas, setPlantas] = useState([]); // cada planta tendrá _mediaUrl, etc.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoria, setCategoria] = useState("armarios");

  const plantasPorArmario = isMobile ? 3 : 6;

  /**
   * fetchPlantas
   * - trae /api/plantas?populate=*&pagination[pageSize]=1000 (filtrando por club si aplica)
   * - normaliza items => { id, ...attributes }
   * - setea inicialmente _mediaUrl usando getFallbackImage (rápido)
   * - luego lanza fetch paralelo con getFirstImageAsync para reemplazar _mediaUrl con la foto más reciente si existe
   */
  const fetchPlantas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${STRAPI_BASE}/api/plantas?pagination[pageSize]=1000`
      url += `&populate=usuario.profilepic,galeria,club`
      if (clubId) {
        url += `&filters[club][id][$eq]=${clubId}`
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al traer plantas desde Strapi");
      const json = await res.json();

      const raw = Array.isArray(json.data) ? json.data : json.data ? [json.data] : [];
      const items = raw
        .map((p) => {
          const attrs = p.attributes ?? p;
          const id = p.id ?? attrs.id ?? null;
          if (!id) return null; // descartamos registros sin id
          return {
            id,
            ...attrs,
            // setear _mediaUrl inicial con fallback (galería propia)
            _mediaUrl: getImageUrl(attrs) ?? null,
          };
        })
        .filter(Boolean);

      // set inicial para render rápido
      setPlantas(items);

      // ahora pedimos las imágenes más recientes desde registrosbitacoras en paralelo
      // limitamos concurrency simple: Promise.allSettled sobre items
      const tasks = items.map((pl) =>
        getFirstImageAsync(pl)
          .then((url) => ({ id: pl.id, url }))
          .catch(() => ({ id: pl.id, url: null }))
      );

      const settled = await Promise.allSettled(tasks);
      // construir map id -> url (usamos solo fulfilled)
      const mediaMap = {};
      settled.forEach((r) => {
        if (r.status === "fulfilled" && r.value) {
          mediaMap[r.value.id] = r.value.url ?? null;
        }
      });

      // mezclar resultados y actualizar state (preservando otras propiedades)
      setPlantas((prev) =>
        prev.map((pl) => {
          const url = mediaMap[pl.id];
          return {
            ...pl,
            _mediaUrl: url ?? pl._mediaUrl ?? null,
          };
        })
      );
    } catch (e) {
      setError(String(e));
      setPlantas([]);
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    fetchPlantas();
  }, [fetchPlantas]);

  /**
   * armariosMap: agrupa plantas por usuario (sin llamadas async aquí)
   * - info.profilepic usa getFallbackImage sobre userAttrs (no async)
   * - plantas ya contienen _mediaUrl poblado desde fetchPlantas (fallback primero, luego reemplazo async)
   */
  const armariosMap = useMemo(() => {
    const map = new Map();

    plantas.forEach((pl) => {
      const usuarioData = pl.usuario?.data ?? pl.usuario ?? pl.owner?.data ?? null;
      const userId = usuarioData?.id ?? "sin-usuario";
      const userAttrs = usuarioData?.attributes ?? usuarioData ?? {};

      if (!map.has(userId)) {
        map.set(userId, {
          id: userId,
          info: {
            username: userAttrs?.username ?? userAttrs?.nombre ?? `Usuario ${userId}`,
            // perfil de usuario viene del fallback (galería/profilepic)
            profilepic: getImageUrl(userAttrs) ?? null,
            email: userAttrs?.email ?? null,
          },
          plantas: [],
        });
      }

      const rawColor =
  typeof pl.color === "string"
    ? pl.color
    : pl.color?.codigo || pl.color?.nombre || pl.codigo_color || "";

const colorKey = rawColor.toString().trim().toLowerCase();
const colorHex = COLOR_MAP[colorKey] || "#e0e0e0";
      const viva = !!pl.viva;
      const secado = !!pl.secado;
      const curado = !!pl.curado;
      const peso = Number(pl.peso ?? pl.grams ?? pl.gramos ?? 0);

      map.get(userId).plantas.push({
        ...pl,
        // usar la imagen que ya esté en el estado (no llamar a async aquí)
        _mediaUrl: pl._mediaUrl ?? null,
        _colorHex: colorHex,
        _flags: { viva, secado, curado },
        _peso: peso,
      });
    });

    return map;
  }, [plantas]);

  /* contadores por categoría */
  const categoriasCounts = useMemo(() => {
    let arm = 0,
      mal = 0,
      clo = 0;
    plantas.forEach((p) => {
      if (p.viva) arm++;
      if (p.secado) mal++;
      if (p.curado) clo++;
    });
    return { armarios: arm, mallas: mal, closet: clo };
  }, [plantas]);

  /* ================= acciones de navegación ================= */
  const handleAgregarRegistro = () => navigate("/plantas/agregar");
  const handleIngresarSemillas = () => navigate("/clubs/miclub/admin/sembrar");
  const handleEntregarFlores = () => navigate("/clubs/miclub/admin/entregar");
  const handleExcedentes = () => navigate("/clubs/miclub/admin/excedentes");

  const handleChecar = (id) => navigate(`/clubs/miclub/admin/checar/${id}`);
  const handleEsquejear = (id) => navigate(`/clubs/miclub/admin/esquejear/${id}`);
  const handleCosechar = (id) => navigate(`/clubs/miclub/admin/cosechar/${id}`);

  const handlePasarACurado = (userId) =>
    navigate(`/plantas/pasar-a-curado?armario=${encodeURIComponent(userId)}`);
  const handleEnviarAMerma = (userId) =>
    navigate(`/plantas/merma?armario=${encodeURIComponent(userId)}`);

  /* ================= Plant Card ================= */
  const PlantCardHorizontal = ({ planta }) => (
    <Paper
      elevation={1}
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "center",
        p: 1,
        borderRadius: 2,
        minWidth: 240,
        maxWidth: 420,
        border: "1px solid rgba(0,0,0,0.06)",
        borderLeft: `6px solid ${planta._colorHex}`, // 👈 DESPUÉS
        backgroundColor: "#fff",
      }}
    >
      <Avatar variant="rounded" src={planta._mediaUrl || sinImagen} sx={{ width: 64, height: 64 }} />
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontWeight: 800 }}>{planta.codigo ?? `Planta ${planta.id}`}</Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {planta.variedad ?? "Variedad"}
        </Typography>
      </Box>

      <Stack direction="row" spacing={0.5}>
        <Tooltip title="Checar">
          <IconButton size="small" onClick={() => handleChecar(planta.id)}>
            <FactCheckIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Esquejear">
          <IconButton size="small" onClick={() => handleEsquejear(planta.id)}>
            <EsquejeIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Cosechar">
          <IconButton size="small" onClick={() => handleCosechar(planta.id)}>
            <FlorIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );

  /* ================= render por armario (Grid responsive) ================= */
  const renderArmarioSection = (user) => {
    let plantasFiltradas = [];
    if (categoria === "armarios") plantasFiltradas = user.plantas.filter((p) => p._flags.viva);
    else if (categoria === "mallas") plantasFiltradas = user.plantas.filter((p) => p._flags.secado);
    else if (categoria === "closet") plantasFiltradas = user.plantas.filter((p) => p._flags.curado);

    if (!plantasFiltradas.length) return null;

    const totalPeso = plantasFiltradas.reduce((s, p) => s + (Number(p._peso) || 0), 0);

    return (
      <Box key={user.id} sx={{ py: 1 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar src={user.info.profilepic || undefined} alt={user.info.username} sx={{ width: 40, height: 40 }} imgProps={{ crossOrigin: "anonymous", referrerPolicy: "no-referrer" }}>
              {user.info.username?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Typography sx={{ fontWeight: 800 }}>{user.info.username}</Typography>
            <Chip label={`${plantasFiltradas.length} plantas`} size="small" sx={{ ml: 1 }} />
            {(categoria === "mallas" || categoria === "closet") && <Chip label={`${totalPeso} g`} size="small" sx={{ ml: 1 }} />}
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mt: { xs: 1, md: 0 } }}>
            <Tooltip title="Agregar registro">
              <IconButton color="primary" onClick={() => navigate(`/plantas/agregar?usuario=${user.id}`)}>
                <EditIcon />
              </IconButton>
            </Tooltip>

            {categoria === "mallas" && (
              <>
                <Tooltip title="Pasar a curado">
                  <IconButton onClick={() => handlePasarACurado(user.id)}>
                    <PasarCuradoIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Enviar a merma">
                  <IconButton onClick={() => handleEnviarAMerma(user.id)}>
                    <MermaIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}

            {categoria === "closet" && (
              <>
                <Tooltip title="Entregar">
                  <IconButton onClick={() => navigate(`/plantas/entregar?usuario=${user.id}`)}>
                    <FlorIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Enviar a merma">
                  <IconButton onClick={() => handleEnviarAMerma(user.id)}>
                    <MermaIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Stack>
        </Stack>

        <Grid container spacing={2}>
          {plantasFiltradas.slice(0, plantasPorArmario).map((p) => (
            <Grid key={p.id} item xs={12} sm={6} md={4} lg={3}>
              {categoria === "armarios" ? (
                <PlantCardHorizontal planta={p} />
              ) : (
                <Paper elevation={1} sx={{ p: 1, borderRadius: 2, border: "1px solid rgba(0,0,0,0.06)" }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar variant="rounded" src={p._mediaUrl || sinImagen} sx={{ width: 48, height: 48 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 800 }}>{p.nombre ?? `Planta ${p.id}`}</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {p.variedad ?? "Variedad"}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Pasar a curado">
                        <IconButton size="small" onClick={() => handlePasarACurado(user.id)}>
                          <PasarCuradoIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Enviar a merma">
                        <IconButton size="small" onClick={() => handleEnviarAMerma(user.id)}>
                          <MermaIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Paper>
              )}
            </Grid>
          ))}

          {user.plantas.length > plantasPorArmario && (
            <Grid item xs="auto" sx={{ display: "flex", alignItems: "center" }}>
              <Chip label={`+${user.plantas.length - plantasPorArmario} más`} />
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  /* ================= render principal ================= */
  return (
    <Box sx={{ width: "100%", px: { xs: 1, sm: 2 }, py: { xs: 1, md: 2 }, bgcolor: "#fff" }}>
      {/* Header */}
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: "#1b5e20" }}>
            Gestión de Club — Plantas
          </Typography>

          {/* barra de enlaces (sin fondo) */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Button onClick={() => setCategoria("armarios")} sx={{ textTransform: "none", fontWeight: categoria === "armarios" ? 800 : 600 }}>
              Armarios <Chip label={categoriasCounts.armarios} size="small" sx={{ ml: 0.5 }} />
            </Button>

            <Button onClick={() => setCategoria("mallas")} sx={{ textTransform: "none", fontWeight: categoria === "mallas" ? 800 : 600 }}>
              Mallas (Secado) <Chip label={categoriasCounts.mallas} size="small" sx={{ ml: 0.5 }} />
            </Button>

            <Button onClick={() => setCategoria("closet")} sx={{ textTransform: "none", fontWeight: categoria === "closet" ? 800 : 600 }}>
              Closet (Curado) <Chip label={categoriasCounts.closet} size="small" sx={{ ml: 0.5 }} />
            </Button>
          </Stack>
        </Stack>

        {/* botones superiores: Agregar -> solo pluma; Ingresar Semillas, Entregar Flores, Excedentes */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Agregar registro">
            <IconButton color="primary" onClick={handleAgregarRegistro} sx={{ borderRadius: 1 }}>
              <EditIcon />
            </IconButton>
          </Tooltip>

          <Button variant="outlined" startIcon={<AddIcon />} onClick={handleIngresarSemillas} sx={{ textTransform: "none" }}>
            Semillas
          </Button>

          <Button variant="outlined" startIcon={<FlorIcon />} onClick={handleEntregarFlores} sx={{ textTransform: "none" }}>
            Entregar flores
          </Button>

          <Tooltip title="Excedentes">
            <IconButton onClick={handleExcedentes}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* loader / error */}
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      {loading && <Typography color="text.secondary" sx={{ mb: 2 }}>Cargando plantas...</Typography>}

      {/* contenido por armarios */}
      {!loading && (
        <Stack spacing={4}>
          {Array.from(armariosMap.values()).map((user) => renderArmarioSection(user))}
          {Array.from(armariosMap.values()).length === 0 && <Typography color="text.secondary">No hay plantas para mostrar en este club.</Typography>}
        </Stack>
      )}
    </Box>
  );
}

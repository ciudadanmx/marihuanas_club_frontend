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
 * GestionClub (RESPONSIVE, Grid)
 * - Mantiene tu lógica original
 * - Hace responsive con Grid
 * - Botón "Agregar Registro" ahora es ICON-ONLY (pluma)
 * - "Filtrar Avanzado" eliminado
 *
 * Nota: si tu colección no se llama /api/plantas cambia la URL en fetchPlantas.
 */

/* color map (tu código) */
const COLOR_MAP = {
  rojo: "#ff5252",
  amarillo: "#ffd54f",
  verde: "#8bc34a",
  azul: "#4fc3f7",
  rosa: "#f48fb1",
  plata: "#c0c0c0",
};

const STRAPI = process.env.REACT_APP_STRAPI_URL || "";

export default function GestionClub({ clubId: clubIdProp = null }) {
  // context & theme
  const { membresia } = useRoles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  // club actual
  const clubId = clubIdProp ?? membresia?.club?.id ?? membresia?.club ?? null;

  // estados
  const [plantas, setPlantas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoria, setCategoria] = useState("armarios");

  const plantasPorArmario = isMobile ? 3 : 6;

  /* ---------------- helper robusto para imagen ---------------- */
  const getFirstImage = (obj) => {
    if (!obj) return null;
    const attrs = obj.attributes ?? obj;

    const candidates = [attrs.galeria, attrs.fotos, attrs.media, attrs.imagenes, attrs.imagen, attrs.profilepic];
    for (const c of candidates) {
      if (!c) continue;
      const data = c.data ?? (Array.isArray(c) ? c : null);
      if (!data) continue;
      const first = Array.isArray(data) ? data[0] : data;
      if (!first) continue;
      const imgAttrs = first.attributes ?? first;
      const url =
        imgAttrs?.formats?.thumbnail?.url ||
        imgAttrs?.formats?.small?.url ||
        imgAttrs?.formats?.medium?.url ||
        imgAttrs?.url ||
        imgAttrs?.location ||
        null;
      if (!url) continue;
      return String(url).startsWith("http") ? url : `${STRAPI}${url}`;
    }
    return null;
  };

  /* ---------------- fetchPlantas (no generar ids aleatorios) ---------------- */
  const fetchPlantas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${STRAPI}/api/plantas?populate=*&pagination[pageSize]=1000`;
      if (clubId) url += `&filters[club][id][$eq]=${clubId}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al traer plantas desde Strapi");
      const json = await res.json();

      const raw = Array.isArray(json.data) ? json.data : json.data ? [json.data] : [];
      const items = raw
        .map((p) => {
          const attrs = p.attributes ?? p;
          const id = p.id ?? attrs.id ?? null;
          if (!id) return null; // DESCARTAR registros sin id
          return { id, ...attrs };
        })
        .filter(Boolean);

      setPlantas(items);
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

  /* ---------------- agrupar por usuario (armario) ---------------- */
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
            profilepic: getFirstImage(userAttrs) ?? null,
            email: userAttrs?.email ?? null,
          },
          plantas: [],
        });
      }

      const colorKey = (pl.color || pl.codigo_color || "").toString().toLowerCase();
      const colorHex = COLOR_MAP[colorKey] || "#e0e0e0";
      const viva = !!pl.viva;
      const secado = !!pl.secado;
      const curado = !!pl.curado;
      const peso = Number(pl.peso ?? pl.grams ?? pl.gramos ?? 0);

      map.get(userId).plantas.push({
        ...pl,
        _mediaUrl: getFirstImage(pl) ?? null,
        _colorHex: colorHex,
        _flags: { viva, secado, curado },
        _peso: peso,
      });
    });

    return map;
  }, [plantas]);

  /* ---------------- contadores ---------------- */
  const categoriasCounts = useMemo(() => {
    let arm = 0, mal = 0, clo = 0;
    plantas.forEach((p) => {
      if (p.viva) arm++;
      if (p.secado) mal++;
      if (p.curado) clo++;
    });
    return { armarios: arm, mallas: mal, closet: clo };
  }, [plantas]);

  /* ---------------- acciones (navegación) ---------------- */
  const handleAgregarRegistro = () => navigate("/plantas/agregar");
  const handleIngresarSemillas = () => navigate("/semillas/ingresar");
  const handleEntregarFlores = () => navigate("/flores/entregar");
  const handleExcedentes = () => navigate("/excedentes");

  const handleChecar = (id) => navigate(`/plantas/checar/${id}`);
  const handleEsquejear = (id) => navigate(`/plantas/esquejar/${id}`);
  const handleCosechar = (id) => navigate(`/plantas/cosechar/${id}`);

  const handlePasarACurado = (userId) => navigate(`/plantas/pasar-a-curado?armario=${encodeURIComponent(userId)}`);
  const handleEnviarAMerma = (userId) => navigate(`/plantas/merma?armario=${encodeURIComponent(userId)}`);

  /* ---------------- Plant Card (horizontal) ---------------- */
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
        borderLeft: `6px solid ${planta._colorHex}`,
        border: "1px solid rgba(0,0,0,0.06)",
        backgroundColor: "#fff",
      }}
    >
      <Avatar variant="rounded" src={planta._mediaUrl || sinImagen} sx={{ width: 64, height: 64 }} />
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontWeight: 800 }}>{planta.nombre ?? `Planta ${planta.id}`}</Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>{planta.variedad ?? "Variedad"}</Typography>
      </Box>

      <Stack direction="row" spacing={0.5}>
        <Tooltip title="Checar"><IconButton size="small" onClick={() => handleChecar(planta.id)}><FactCheckIcon /></IconButton></Tooltip>
        <Tooltip title="Esquejear"><IconButton size="small" onClick={() => handleEsquejear(planta.id)}><EsquejeIcon /></IconButton></Tooltip>
        <Tooltip title="Cosechar"><IconButton size="small" onClick={() => handleCosechar(planta.id)}><FlorIcon /></IconButton></Tooltip>
      </Stack>
    </Paper>
  );

  /* ---------------- render por armario: ahora usando Grid ---------------- */
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
            <Avatar src={user.info.profilepic || undefined} alt={user.info.username} sx={{ width: 40, height: 40 }} />
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
                <Tooltip title="Pasar a curado"><IconButton onClick={() => handlePasarACurado(user.id)}><PasarCuradoIcon /></IconButton></Tooltip>
                <Tooltip title="Enviar a merma"><IconButton onClick={() => handleEnviarAMerma(user.id)}><MermaIcon /></IconButton></Tooltip>
              </>
            )}

            {categoria === "closet" && (
              <>
                <Tooltip title="Entregar"><IconButton onClick={() => navigate(`/plantas/entregar?usuario=${user.id}`)}><FlorIcon /></IconButton></Tooltip>
                <Tooltip title="Enviar a merma"><IconButton onClick={() => handleEnviarAMerma(user.id)}><MermaIcon /></IconButton></Tooltip>
              </>
            )}
          </Stack>
        </Stack>

        {/* Grid responsive para plantas */}
        <Grid
          container
          spacing={2}
        >
          {plantasFiltradas.slice(0, plantasPorArmario).map((p) => (
            <Grid
              key={p.id}
              item
              xs={12}   // 📱 móvil: 1 por línea
              sm={6}    // 📱 tablet: 2 por línea
              md={4}    // 💻 desktop: 3 por línea
              lg={3}
            >
              {categoria === "armarios" ? (
                <PlantCardHorizontal planta={p} />
              ) : (
                <Paper elevation={1} sx={{ p: 1, borderRadius: 2, border: "1px solid rgba(0,0,0,0.06)" }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar variant="rounded" src={p._mediaUrl || sinImagen} sx={{ width: 48, height: 48 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 800 }}>{p.nombre ?? `Planta ${p.id}`}</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>{p.variedad ?? "Variedad"}</Typography>
                    </Box>

                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Pasar a curado"><IconButton size="small" onClick={() => handlePasarACurado(user.id)}><PasarCuradoIcon /></IconButton></Tooltip>
                      <Tooltip title="Enviar a merma"><IconButton size="small" onClick={() => handleEnviarAMerma(user.id)}><MermaIcon /></IconButton></Tooltip>
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

  /* ---------------- render principal ---------------- */
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
            Ingresar semillas
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

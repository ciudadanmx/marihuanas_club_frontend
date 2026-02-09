// SecadoPorUsuarioList.jsx
import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Stack,
  Avatar,
  Chip,
  Paper,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  Edit as EditIcon,
  MoveToInbox as PasarCuradoIcon,
  DeleteSweep as MermaIcon,
  LocalFlorist as FlorIcon,
} from "@mui/icons-material";
import sinImagen from "../../assets/placeholders/sinimagen.jpg";

/**
 * SecadoPorUsuarioList
 * props:
 *  - users: array de objetos tipo user (los items que salen de Array.from(armariosMap.values()))
 *  - onEdit(usuarioId)
 *  - onPasarACurado(usuarioId)
 *  - onEnviarAMerma(usuarioId)
 *  - onEntregar(usuarioId)  (opcional, si lo quieres usar)
 *
 * Comportamiento:
 *  - Filtra por plantas con _flags.secado === true
 *  - Suma Number(pl.gramos_cosechados ?? pl._peso ?? 0)
 *  - Muestra una fila por usuario (avatar, nombre, chip con nro plantas en secado y chip con total en g)
 *  - Botones con las mismas acciones que tenías en la vista de mallas
 */
export default function Secado({
  users = [],
  onEdit = () => {},
  onPasarACurado = () => {},
  onEnviarAMerma = () => {},
  onEntregar = () => {},
}) {
  // pre-filtrar usuarios que tienen al menos 1 planta en secado
  const usersConSecado = useMemo(() => {
    return users
      .map((u) => {
        const plantasSecado = (u.plantas || []).filter((p) => !!p._flags?.secado);
        if (!plantasSecado || plantasSecado.length === 0) return null;

        const totalGramos = plantasSecado.reduce((s, p) => {
          // tomar gramos_cosechados primero (si existe), si no usar fallback a _peso
          const g = Number(p.gramos_cosechados ?? p.gramos ?? p._peso ?? 0) || 0;
          return s + g;
        }, 0);

        return {
          ...u,
          plantasSecado,
          totalGramos,
        };
      })
      .filter(Boolean);
  }, [users]);

  if (usersConSecado.length === 0) {
    return <Typography color="text.secondary">No hay plantas en secado para mostrar.</Typography>;
  }

  return (
    <Stack spacing={3}>
      {usersConSecado.map((user) => (
        <Box key={user.id}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar
                src={user.info?.profilepic || undefined}
                alt={user.info?.username}
                sx={{ width: 40, height: 40 }}
                imgProps={{ crossOrigin: "anonymous", referrerPolicy: "no-referrer" }}
              >
                {user.info?.username?.charAt(0)?.toUpperCase()}
              </Avatar>

              <Typography sx={{ fontWeight: 800 }}>{user.info?.username}</Typography>

              <Chip label={`${user.plantasSecado.length} plantas`} size="small" sx={{ ml: 1 }} />
              <Chip label={`${user.totalGramos} g`} size="small" sx={{ ml: 1 }} />
            </Stack>

            <Stack direction="row" spacing={1} sx={{ mt: { xs: 1, md: 0 } }}>
              <Tooltip title="Agregar registro">
                <IconButton color="primary" onClick={() => onEdit(user.id)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Pasar a curado">
                <IconButton onClick={() => onPasarACurado(user.id)}>
                  <PasarCuradoIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Enviar a merma">
                <IconButton onClick={() => onEnviarAMerma(user.id)}>
                  <MermaIcon />
                </IconButton>
              </Tooltip>

              {/* botón Entregar — lo muestro por si lo querías igual que en closet */}
              <Tooltip title="Entregar">
                <IconButton onClick={() => onEntregar(user.id)}>
                  <FlorIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {/* tarjeta resumen (opcional: muestra la imagen representativa del primer elemento en secado) */}
          <Paper elevation={1} sx={{ p: 1, borderRadius: 2, border: "1px solid rgba(0,0,0,0.06)" }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                variant="rounded"
                src={user.plantasSecado[0]?._mediaUrl || sinImagen}
                sx={{ width: 56, height: 56 }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 800 }}>
                  Total secado: {user.totalGramos} g
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {user.plantasSecado.length} plantas en secado — suma de campo <code>gramos_cosechados</code>
                </Typography>
              </Box>

              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Pasar a curado">
                  <IconButton size="small" onClick={() => onPasarACurado(user.id)}>
                    <PasarCuradoIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Enviar a merma">
                  <IconButton size="small" onClick={() => onEnviarAMerma(user.id)}>
                    <MermaIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Paper>
        </Box>
      ))}
    </Stack>
  );
}

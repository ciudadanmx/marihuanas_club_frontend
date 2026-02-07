import {
  Box,
  Stack,
  Typography,
  Avatar,
  Chip,
  Button,
} from "@mui/material";
import { STRAPI_URL } from "@/utils";

/**
 * ClubHeader
 * - Bloque visual con avatar, nombre y chips
 * - Separado para mantener el componente principal limpio
 */
export default function ClubHeader({ club, reservacion, isSm }) {
  return (
    <Stack direction={isSm ? "column" : "row"} spacing={2} alignItems="center" justifyContent="space-between">
      <Stack direction="row" spacing={2} alignItems="center">
        {/* Foto del club (soporta diferentes shapes de Strapi) */}
        <Avatar
          src={club?.foto_de_perfil?.data?.attributes?.url || club?.foto_de_perfil?.url || ""}
          variant="rounded"
          sx={{ width: 80, height: 80 }}
        />
        <Box>
          <Typography variant="h6" fontWeight={800}>
            {club?.nombre_club || club?.nombre || "Club"}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
            <Chip label={`ID ${club.id || club._id || "-"}`} size="small" />
            <Chip label={reservacion ? "Reservación requerida" : "No requiere reservación"} size="small" />
          </Stack>
        </Box>
      </Stack>

      <Stack direction="row" spacing={1}>
        <Button variant="outlined" size="small" href={`${STRAPI_URL}/clubs/${club?.slug || ""}`} target="_blank">
          Ver público
        </Button>
      </Stack>
    </Stack>
  );
}
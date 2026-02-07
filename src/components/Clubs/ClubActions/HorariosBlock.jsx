/**
 * HorariosBlock
 * - Presenta horarios usando el helper renderHorarios (devuelve JSX)
 */
import {
  Box,
  Typography,
} from "@mui/material";

import { renderHorarios } from "@/utils";

export default function HorariosBlock({ horarios }) {
  const tieneHorarios = horarios && Object.keys(horarios).length > 0;
  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700}>
        Horarios
      </Typography>
      {tieneHorarios ? (
        <Box sx={{ mt: 1 }}>{renderHorarios(horarios)}</Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          No tienen un horario especificado.
        </Typography>
      )}
    </Box>
  );
}

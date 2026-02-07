/**
 * SolicitudForm
 * - Formulario de solicitud (entrada principal)
 * - Componente puro presentacional: recibe handlers y estados por props
 */

import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import { CloudUpload, Clear } from "@mui/icons-material";
import FotosPreview from './FotosPreview';

export default function RegistroForm({
  accion,
  fechaSolicitada,
  setFechaSolicitada,
  numSemillas,
  setNumSemillas,
  onFilesChange,
  previews,
  acepto,
  setAcepto,
  sending,
  handleSubmit,
  clearForm,
  allowedPlants,
  existingPlantCount,
  remainingPlants,
}) {
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            label="Fecha y hora propuesta"
            type="datetime-local"
            value={fechaSolicitada}
            onChange={(e) => setFechaSolicitada(e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
            fullWidth
          />
          <TextField
            label="Número de semillas"
            type="number"
            value={numSemillas}
            onChange={(e) => setNumSemillas(Number(e.target.value))}
            inputProps={{ min: 1 }}
            required
            sx={{ width: { xs: "100%", md: 200 } }}
          />
        </Stack>

        {accion === "ingresarsemillas" && (
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              Fotos (opcional)
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
              <Button variant="contained" component="label" startIcon={<CloudUpload />}>
                Subir fotos
                <input hidden multiple accept="image/*" type="file" onChange={onFilesChange} />
              </Button>
              <FotosPreview previews={previews} />
            </Stack>
          </Box>
        )}

        <Paper variant="outlined" sx={{ p: 2, bgcolor: "background.paper" }}>
          <Typography variant="subtitle2" fontWeight={800}>
            Advertencia / Declaración
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Al solicitar el ingreso de semillas declaras que las semillas son de uso personal. Confirmas que las semillas provienen de tu
            reserva personal (ej. hasta 5 gramos de uso inmediato). Al asistir firmarás un acta que manifiesta el origen y dejarás las
            semillas al cuidado del jardinero, rentándole el espacio. Se separarán 1–4 semillas por planta; una vez germinadas se conservarán 6.
          </Typography>
        </Paper>

        <FormControlLabel
          control={<Checkbox checked={acepto} onChange={(e) => setAcepto(e.target.checked)} />}
          label="He leído y acepto la declaración y procedimiento."
        />

        <Stack direction="row" spacing={1}>
          <Button type="submit" variant="contained" disabled={sending}>
            {sending ? <CircularProgress size={20} color="inherit" /> : accion === "ingresarsemillas" ? "Ingresar semillas" : "Solicitar/Retirar flores"}
          </Button>
          <Button variant="outlined" onClick={clearForm} disabled={sending} startIcon={<Clear />}>
            Limpiar
          </Button>
        </Stack>

        {accion === "ingresarsemillas" && allowedPlants != null && existingPlantCount != null && (
          <Typography variant="caption" color="text.secondary">
            Plantas permitidas: {allowedPlants} — Plantas registradas: {existingPlantCount} — Cupo restante: {remainingPlants}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

// src/Pages/Coowork/AgregarTarea.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTarea } from "../../hooks/useTarea.jsx";
import { useAgencia } from "../../hooks/useAgencia.jsx";
import { FaClipboardList } from "react-icons/fa";
import {
  Typography,
  TextField,
  MenuItem,
  Button,
  Box,
  Divider,
  InputAdornment,
  Paper,
  Slider,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

export default function AgregarTarea() {
  const { enqueueSnackbar } = useSnackbar();
  const { crearTarea, areas, fetchAreas, loading, esEditor } = useTarea();
  const { socios, fetchSocios, fetchSociosJson } = useAgencia();
  const [sociosFull, setSociosFull] = useState([]);

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    agencia: "cdmx",
    tipo: "tarea",
    usuario_email: "",
    area: "",
    enlaces: [],
    pagos_laborys: 0,
    pagos_efectivo: 0,
    minutos_desarrollo: 0,
    fecha_entrega: null,
    vence: false,
    habilitarFechaEntrega: false,
  });

  useEffect(() => {
    fetchSocios("cdmx");
    (async () => {
      const full = await fetchSociosJson("cdmx");
      setSociosFull(full);
    })();
    fetchAreas();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSwitchChange(e) {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
      vence: name === "habilitarFechaEntrega" ? checked : prev.vence,
      fecha_entrega: !checked ? null : prev.fecha_entrega,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const nuevaTarea = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        tipo: formData.tipo,
        agencia: formData.agencia,
        usuario_email: formData.usuario_email,
        enlaces: formData.enlaces,
        pagos_laborys: Number(formData.pagos_laborys),
        pagos_efectivo: Number(formData.pagos_efectivo),
        area: Number(formData.area),
        minutos_desarrollo: formData.minutos_desarrollo,
        fecha_entrega: formData.fecha_entrega,
        vence: formData.vence,
      };
      await crearTarea(nuevaTarea);
      enqueueSnackbar("Tarea creada correctamente", { variant: "success" });
      setFormData({
        titulo: "",
        descripcion: "",
        agencia: "cdmx",
        tipo: "tarea",
        usuario_email: "",
        area: "",
        enlaces: [],
        pagos_laborys: 0,
        pagos_efectivo: 0,
        minutos_desarrollo: 0,
        fecha_entrega: null,
        vence: false,
        habilitarFechaEntrega: false,
      });
    } catch (err) {
      enqueueSnackbar(`Error al crear tarea: ${err.message}`, { variant: "error" });
    }
  }

  if (loading)
    return <p className="text-center mt-6 text-white">Cargando áreas...</p>;

  if (!esEditor)
    return (
      <Paper
        className="text-center p-6 rounded-2xl shadow-md"
        sx={{ bgcolor: "#111", color: "#fff", maxWidth: 500, margin: "40px auto" }}
      >
        <p className="font-medium">Solo los editores pueden agregar tareas.</p>
      </Paper>
    );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#003300",
        p: 3,
      }}
    >
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ width: "100%", maxWidth: 600 }}>
        <Paper
          elevation={6}
          sx={{
            p: 6,
            borderRadius: 3,
            bgcolor: "#002200",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <div
              style={{
                background: "linear-gradient(to bottom right, #fff200, #f5d500)",
                padding: 12,
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FaClipboardList style={{ color: "#000", fontSize: 22 }} />
            </div>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Agregar Tarea
            </Typography>
          </Box>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Título */}
            <TextField
              label="Título"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              fullWidth
              size="small"
              variant="outlined"
              sx={{
                input: { color: "#fff200" },
                label: { color: "#fff200" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#555" },
                  "&:hover fieldset": { borderColor: "#fff200" },
                  "&.Mui-focused fieldset": { borderColor: "#fff200" },
                },
              }}
            />

            {/* Descripción */}
            <TextField
              label="Descripción"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              size="small"
              variant="outlined"
              sx={{
                input: { color: "#fff200" },
                textarea: { color: "#fff200" },
                label: { color: "#fff200" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#555" },
                  "&:hover fieldset": { borderColor: "#fff200" },
                  "&.Mui-focused fieldset": { borderColor: "#fff200" },
                },
              }}
            />

            {/* Usuario */}
            <TextField
              select
              label="Usuario"
              name="usuario_email"
              value={formData.usuario_email}
              onChange={handleChange}
              fullWidth
              size="small"
              variant="outlined"
              sx={{
                input: { color: "#fff200" },
                label: { color: "#fff200" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#555" },
                  "&:hover fieldset": { borderColor: "#fff200" },
                  "&.Mui-focused fieldset": { borderColor: "#fff200" },
                },
                "& .MuiSelect-select": { color: "#fff200" },
              }}
            >
              <MenuItem value="">Selecciona un socio</MenuItem>
              {sociosFull.map((s, idx) => (
                <MenuItem key={idx} value={s.email}>
                  {s.nombre} — {s.email}
                </MenuItem>
              ))}
            </TextField>

            {/* Área */}
            <TextField
              select
              label="Área"
              name="area"
              value={formData.area}
              onChange={handleChange}
              fullWidth
              size="small"
              variant="outlined"
              sx={{
                input: { color: "#fff200" },
                label: { color: "#fff200" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#555" },
                  "&:hover fieldset": { borderColor: "#fff200" },
                  "&.Mui-focused fieldset": { borderColor: "#fff200" },
                },
                "& .MuiSelect-select": { color: "#fff200" },
              }}
            >
              <MenuItem value="">Selecciona un área</MenuItem>
              {areas.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.nombre}
                </MenuItem>
              ))}
            </TextField>

            {/* Tipo */}
            <TextField
              select
              label="Tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              fullWidth
              size="small"
              variant="outlined"
              sx={{
                input: { color: "#fff200" },
                label: { color: "#fff200" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#555" },
                  "&:hover fieldset": { borderColor: "#fff200" },
                  "&.Mui-focused fieldset": { borderColor: "#fff200" },
                },
                "& .MuiSelect-select": { color: "#fff200" },
              }}
            >
              <MenuItem value="tarea">Tarea</MenuItem>
              <MenuItem value="subtarea">Subtarea</MenuItem>
            </TextField>

            {/* Minutos de desarrollo */}
            <Box>
              <Typography sx={{ color: "#fff200", fontWeight: "bold" }}>
                Minutos de desarrollo: {formData.minutos_desarrollo}
              </Typography>
              <Slider
                value={formData.minutos_desarrollo}
                onChange={(_, val) => setFormData(prev => ({ ...prev, minutos_desarrollo: val }))}
                min={0}
                max={480}
                step={5}
                valueLabelDisplay="auto"
                sx={{
                  color: "#fff200",
                  "& .MuiSlider-thumb": { backgroundColor: "#fff200", transition: "0.3s" },
                  "& .MuiSlider-track": { backgroundColor: "#fff200" },
                  "& .MuiSlider-rail": { color: "#555" },
                }}
              />
            </Box>

            {/* Habilitar fecha de entrega */}
            <FormControlLabel
              control={
                <Switch
                  checked={formData.habilitarFechaEntrega}
                  onChange={handleSwitchChange}
                  name="habilitarFechaEntrega"
                  color="warning"
                />
              }
              label="Habilitar fecha de entrega"
              sx={{ color: "#fff200" }}
            />

            {formData.habilitarFechaEntrega && (
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Fecha de entrega"
                  value={formData.fecha_entrega}
                  onChange={(newValue) =>
                    setFormData(prev => ({ ...prev, fecha_entrega: newValue, vence: true }))
                  }
                  renderInput={(params) => (
                    <TextField {...params} size="small" fullWidth sx={{
                      input: { color: "#fff200" },
                      label: { color: "#fff200" },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#555" },
                        "&:hover fieldset": { borderColor: "#fff200" },
                        "&.Mui-focused fieldset": { borderColor: "#fff200" },
                      },
                    }} />
                  )}
                />
              </LocalizationProvider>
            )}

            {/* Pagos Laborys */}
            <TextField
              label="💎 Pagos Laborys"
              name="pagos_laborys"
              value={formData.pagos_laborys}
              onChange={handleChange}
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">💎</InputAdornment>,
                inputProps: { min: 0 },
              }}
              fullWidth
              size="small"
              variant="outlined"
              sx={{
                input: { color: "#fff" },
                label: { color: "#fff200" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#555" },
                  "&:hover fieldset": { borderColor: "#fff200" },
                  "&.Mui-focused fieldset": { borderColor: "#fff200" },
                },
              }}
            />

            {/* Pagos Efectivo */}
            <TextField
              label="💵 Pagos Efectivo"
              name="pagos_efectivo"
              value={formData.pagos_efectivo}
              onChange={handleChange}
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                inputProps: { min: 0 },
              }}
              fullWidth
              size="small"
              variant="outlined"
              sx={{
                input: { color: "#fff" },
                label: { color: "#fff200" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#555" },
                  "&:hover fieldset": { borderColor: "#fff200" },
                  "&.Mui-focused fieldset": { borderColor: "#fff200" },
                },
              }}
            />

            <motion.div whileTap={{ scale: 0.97 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ background: "linear-gradient(to right, #fff200, #f5d500)", color: "#000", fontWeight: "bold" }}
              >
                Guardar Tarea
              </Button>
            </motion.div>
          </form>
        </Paper>
      </motion.div>
    </Box>
  );
}

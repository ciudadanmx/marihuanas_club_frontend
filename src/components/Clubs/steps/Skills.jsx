import React from 'react'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import {
  Box,
  Button,
  Typography,
  Input,
  TextField,
  Checkbox,
  FormControlLabel,
  IconButton,
  Tooltip,
} from "@mui/material";

import { useSnackbar } from "notistack";

const Skills = ({
  form,
  handleFormChange,
  focusedField,
  setFocusedField,
  certificados,
  setCertificados,
  handleCertificadosAdd,
  getCertExt,
  handleCertificadosRemove,
  setForm,
}) => {

  // 🔹 SOLO VISUAL: quitar duplicados (NO toca lógica)
  const certificadosUnicos = Array.isArray(form.certificados_archivos)
    ? form.certificados_archivos.filter((file, index, arr) =>
        index === arr.findIndex(f =>
          f?.name === file?.name && f?.size === file?.size
        )
      )
    : [];

  const { enqueueSnackbar } = useSnackbar();

  const EXT_VALIDAS = ["jpg", "jpeg", "png", "webp", "pdf"];

  return (
    <>
      <Typography variant="h6" mt={4} mb={2}>
        <u>🌱 Habilidades Floristas:</u>
      </Typography>

      <TextField
        fullWidth
        margin="normal"
        label="Si tienes formación, experiencia, capacitaciones y habilidades como jardinero 4:20 descríbelas aquí..."
        name="skills"
        multiline
        minRows={3}
        value={form.skills || ""}
        onChange={handleFormChange}
        onFocus={() => setFocusedField("skills")}
        onBlur={() => setFocusedField(null)}
        color="success"
        helperText={
          focusedField === "skills"
            ? "👉 Ingresa una descripción pública para tu Club."
            : " "
        }
      />

      <FormControlLabel
        control={
          <Checkbox
            name="certificados"
            checked={!!form.certificados}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                certificados: e.target.checked,
              }))
            }
            color="success"
          />
        }
        label="🏅 Agregar Imágenes o Documentos PDF de Certificación"
      />

      {form.certificados && (
        <>
          <br />

          <Tooltip title="Subir Certificaciones de Cultivador@">
            <Button
              variant="contained"
              component="label"
              sx={{
                backgroundColor: "#9c27b0",
                "&:hover": { backgroundColor: "#7b1fa2" },
              }}
            >
              ⬆️ Subir Archivos
              <Input
                type="file"
                name="certificados_archivos"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                inputProps={{
                    accept: ".jpg,.jpeg,.png,.webp,.pdf",
                }}
                multiple
                sx={{ display: "none" }}
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (!files.length) return;

                  for (const file of files) {
                    const ext = file.name.split(".").pop().toLowerCase();
                    if (!EXT_VALIDAS.includes(ext)) {
                      enqueueSnackbar(
                        "❌ Solo se permiten imágenes (JPG, PNG, WEBP) o PDF",
                        { variant: "error" }
                      );
                      e.target.value = null;
                      return;
                    }
                  }

                  // 🔥 ESTA ES LA CLAVE
                  e.persist();
                  handleCertificadosAdd(e);

                  e.target.value = null;
                }}
              />
            </Button>
          </Tooltip>

          {/* ✅ LISTA VISIBLE DE ARCHIVOS */}
          {certificadosUnicos.map((file, index) => (
            <Box
              key={`${file.name}-${index}`}
              sx={{ display: 'flex', alignItems: 'center', mb: 1, mt: 1 }}
            >
              <span style={{ fontSize: 20 }}>
                {getCertExt(file.name) === 'pdf' ? '📄' : '🖼️'}
              </span>

              <Typography sx={{ ml: 1, flex: 1 }}>
                {file.name}
              </Typography>

              <Tooltip title="Eliminar archivo">
                <IconButton
                  size="small"
                  onClick={() => handleCertificadosRemove(index)}
                  sx={{
                    color: '#fff',
                    backgroundColor: '#9c27b0',
                    '&:hover': {
                      backgroundColor: '#7b1fa2',
                      transform: 'scale(1.1)',
                    },
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  }}
                >
                  <DeleteForeverIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
        </>
      )}
    </>
  )
}

export default Skills;

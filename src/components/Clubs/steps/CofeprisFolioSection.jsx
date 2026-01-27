import React from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Tooltip,
  Button,
  Input,
  IconButton,
} from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { useSnackbar } from "notistack";

/**
 * ============================================================
 * CofeprisFolioSection
 * ============================================================
 */
const CofeprisFolioSection = ({
  form,
  handleFormChange,
  setFocusedField,
}) => {

  const { enqueueSnackbar } = useSnackbar();

  const EXT_VALIDAS = ["jpg", "jpeg", "png", "webp", "pdf"];

  return (
    <Box sx={{ pl: 4, pr: 2, pb: 2 }}>

      {/* FOLIO */}
      <TextField
        fullWidth
        margin="normal"
        label="Folio o número de expediente COFEPRIS"
        name="cofepris"
        value={form.cofepris || ""}
        onChange={handleFormChange}
        onFocus={() => setFocusedField("cofepris")}
        onBlur={() => setFocusedField(null)}
        helperText="Puede ser folio de autorización, expediente o resolución."
        color="success"
      />

      {/* TIPO */}
      <TextField
        select
        fullWidth
        margin="normal"
        label="Tipo de resolución"
        name="tipoResolucion"
        value={form.tipoResolucion || ""}
        onChange={handleFormChange}
        color="success"
        SelectProps={{ native: true }}
      >
        <option value=""></option>
        <option value="enproceso">Autorización en trámite ante COFEPRIS</option>
        <option value="cofepris">Autorización directa emitida por COFEPRIS</option>
        <option value="amparo">Amparo para uso personal</option>
        <option value="desconozco">No estoy seguro</option>
      </TextField>

      {/* AÑO */}
      <TextField
        fullWidth
        margin="normal"
        label="Año aproximado del trámite"
        name="anioResolucion"
        value={form.anioResolucion || ""}
        onChange={handleFormChange}
        helperText="Ejemplo: 2021, 2022, 2023…"
        color="success"
      />

      {/* DOCUMENTO */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Documento oficial (imagen o PDF):
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Tooltip title="Sube documento emitido por COFEPRIS (imagen o PDF)">
              <Button
                variant="contained"
                component="label"
                sx={{
                  backgroundColor: "#2e7d32",
                  "&:hover": { backgroundColor: "#1b5e20" },
                }}
              >
                ⬆️ Subir documento COFEPRIS
                <Input
                  type="file"
                  inputProps={{
                    accept: ".jpg,.jpeg,.png,.webp,.pdf",
                  }}
                  name="pdfCofepris"
                  sx={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const ext = file.name.split(".").pop().toLowerCase();

                    if (!EXT_VALIDAS.includes(ext)) {
                      enqueueSnackbar(
                        "❌ Solo se permiten imágenes (JPG, PNG, WEBP) o PDF",
                        { variant: "error" }
                      );
                      e.target.value = null;
                      return;
                    }

                    handleFormChange({
                      target: {
                        name: "pdfCofepris",
                        value: file,
                        type: "file",
                      },
                    });
                  }}
                  
                />
              </Button>
            </Tooltip>

            {/* ✅ ÚNICO render del archivo */}
            {form.pdfCofepris && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mt: 1,
                }}
              >
                <Typography sx={{ flex: 1, color: "success.main" }}>
                  📎 <b>{form.pdfCofepris.name}</b>
                </Typography>

                <Tooltip title="Eliminar archivo">
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleFormChange({
                        target: {
                          name: "pdfCofepris",
                          value: null,
                        },
                      })
                    }
                    sx={{
                      color: "#fff",
                      backgroundColor: "#9c27b0",
                      "&:hover": {
                        backgroundColor: "#7b1fa2",
                        transform: "scale(1.1)",
                      },
                      boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                    }}
                  >
                    <DeleteForeverIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default CofeprisFolioSection;

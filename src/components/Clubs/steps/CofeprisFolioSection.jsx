import React from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
} from "@mui/material";

/**
 * ============================================================
 * CofeprisFolioSection
 * ------------------------------------------------------------
 * Sección reutilizable para:
 *  - Trámites COFEPRIS ya concluidos
 *  - Amparos para uso personal
 *  - Autorizaciones directas
 *
 * Siempre existe:
 *  - Folio / expediente
 *  - PDF de resolución u oficio
 * ============================================================
 */
const CofeprisFolioSection = ({
  form,
  handleFormChange,
  setFocusedField,
}) => {
  return (
    <Box sx={{ pl: 4, pr: 2, pb: 2 }}>

      {/* ============================================
          FOLIO / EXPEDIENTE
      ============================================ */}
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

      {/* ============================================
          TIPO DE RESOLUCIÓN
      ============================================ */}
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
        <option value="amparo">Amparo para uso personal</option>
        <option value="cofepris">Autorización directa COFEPRIS</option>
        <option value="desconozco">No estoy seguro</option>
      </TextField>

      {/* ============================================
          AÑO APROXIMADO
      ============================================ */}
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

      {/* ============================================
          SUBIDA DE PDF (RESOLUCIÓN / OFICIO)
      ============================================ */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Documento oficial (PDF):
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <input
              type="file"
              accept="application/pdf"
              name="pdfCofepris"
              onChange={(e) =>
                handleFormChange({
                  target: {
                    name: "pdfCofepris",
                    value: e.target.files[0],
                    type: "file",
                  },
                })
              }
            />
          </Grid>
        </Grid>

        {form.pdfCofepris && (
          <Typography variant="body2" sx={{ mt: 1, color: "green" }}>
            📄 Archivo cargado: {form.pdfCofepris.name}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default CofeprisFolioSection;

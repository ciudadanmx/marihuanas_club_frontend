import React from 'react'
import {
  Box,
  Divider,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from "@mui/material";

const DetallesCultivo = ({
    tipo,
    cultivoFolioPropio,
    setCultivoFolioPropio,
    form,
    setForm,
    handleFormChange,
}) => {
  return (
    <>
        {tipo.tipo.tipo === "cultivo" && (
            <>
                <Divider sx={{ my: 3, borderColor: "rgba(104, 64, 92, 0.57)" }} />
    
                <Typography variant="h6" mb={2}>
                <u>Permiso COFEPRIS (cultivo)</u>
                </Typography>
    
                <FormGroup>
                <FormControlLabel
                    control={
                    <Checkbox
                        checked={cultivoFolioPropio}
                        color="success"
                        onChange={(e) => {
                        setCultivoFolioPropio(e.target.checked);
                        // también lo guardamos en form si quieres centralizar
                        setForm(prev => ({ ...prev, cultivoFolioPropio: e.target.checked }));
                        }}
                    />
                    }
                    label="✅ Ya cuento con un folio"
                />
    
                {cultivoFolioPropio && (
                    <Box sx={{ pl: 4, pr: 2, pb: 1 }}>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Ingresa el folio de tu trámite"
                        name="cofepris"
                        value={form.cofepris || ""}
                        onChange={handleFormChange}
                        color="success"
                    />
                    </Box>
                )}
                </FormGroup>
            </>
        )}
    </>
  )
}

export default DetallesCultivo
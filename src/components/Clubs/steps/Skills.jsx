import React from 'react'
import {
  Box,
  Button,
  Typography,
  Input,
  TextField,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

const Skills = ({
    form,
    handleFormChange,
    focusedField,
    setFocusedField,
    certificados,
    setCertificados,
    handleDocsAdd,
    getDocExt,
    handleDocRemove,
    setForm,
}) => {
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
                checked={certificados}
                onChange={() => setCertificados(!certificados)}
                color="success"
            />
            }
            label="🏅 Agregar Imágenes o Documentos PDF de Certificación"
        />
    
        {certificados && (
            <>
            {/* IMÁGENES + PDF */}
            <Button
                variant="contained"
                component="label"
                sx={{
                backgroundColor: "#9c27b0",
                "&:hover": { backgroundColor: "#7b1fa2" },
                }}
            >
                ⬆️ Subir Archivos.
                <Input
                type="file"
                name="archivos_certificados"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                multiple
                id="archivos-input"
                onChange={handleDocsAdd}
                sx={{ display: "none" }}
                />
                
            </Button>


            {form.archivos_club?.map((file, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <span style={{ fontSize: 20 }}>
                    {getDocExt(file.name) === 'pdf' ? '📄' : '🖼️'}
                </span>

                    <Typography sx={{ ml: 1, flex: 1 }}>
                        {file.name}
                    </Typography>

                    <Button
                        size="small"
                        onClick={() => handleDocRemove(index)}
                        sx={{ color: '#751460' }}
                    >
                        ✕
                    </Button>
                    </Box>
                ))}
                </>
            )}
        </>
    
  )
}

export default Skills
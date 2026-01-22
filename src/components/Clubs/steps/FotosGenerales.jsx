import React from 'react'
import {
  Box,
  Button,
  Divider,
  Typography,
  Input,
  Grid,
} from "@mui/material";

const FotosGenerales = ({
    handleFileChange,
    form,
    removeFotoClub
}) => {
  return (
    <>
        <Typography variant="h6" mb={2}>
            <u>🖼️ Foto de Portada del Club:</u>
        </Typography>
    
        <Typography variant="body1" mb={2}>
        Selecciona la imagen de portada para el perfil público de tu Club.
        </Typography>

        <Button
        variant="contained"
        component="label"
        sx={{
            backgroundColor: "#9c27b0",
            "&:hover": { backgroundColor: "#7b1fa2" },
        }}
        >
        ⬆️ Subir Foto de Portada:
        <Input
            type="file"
            name="foto_perfil"
            accept="image/*"
            onChange={handleFileChange}
            sx={{ display: "none" }}
        />
        </Button>

        {form?.foto_perfil && (
        <Box mt={2}>
            <Typography
            variant="subtitle2"
            sx={{ fontStyle: "italic", color: "#9c27b0", fontSize: "0.85rem" }}
            >
            Vista previa:
            </Typography>
            <img
            src={URL.createObjectURL(form.foto_perfil)}
            alt="Vista previa perfil"
            style={{
                maxWidth: "100%",
                maxHeight: "200px",
                marginTop: "8px",
                borderRadius: 8,
            }}
            />
        </Box>
        )}

        <Divider sx={{ my: 3, borderColor: "rgba(104, 64, 92, 0.57)" }} />

        <Typography variant="h6" mt={4} mb={2}>
        <u>📸 Fotos de Galería del Club:</u>
        </Typography>

        <Typography
        variant="body1"
        mb={2}
        sx={{ fontStyle: "italic", color: "#59c054ff", fontSize: "0.85rem" }}
        >
        <strong>Éstas son las imágenes que se mostrarán en la ficha de perfil público de tu club...</strong>
        </Typography>

        <Button
        variant="contained"
        component="label"
        sx={{
            backgroundColor: "#9c27b0",
            "&:hover": { backgroundColor: "#7b1fa2" },
        }}
        >
        ⬆️ Subir Fotos.
        <Input
            type="file"
            name="fotos_club"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            sx={{ display: "none" }}
        />
        </Button>

        {form?.foto_perfil && (
        <Box mt={2}>
            <Typography
            variant="subtitle2"
            sx={{ fontStyle: "italic", color: "#9c27b0", fontSize: "0.85rem" }}
            >
            Vista previa:
            </Typography>
            <img
            src={URL.createObjectURL(form.foto_perfil)}
            alt="Vista previa perfil"
            style={{
                maxWidth: "100%",
                maxHeight: "200px",
                marginTop: "8px",
                borderRadius: 8,
            }}
            />
        </Box>
        )}

        {form?.fotos_club?.length > 0 && (
            <Grid container spacing={2} mt={2}>
                {form.fotos_club.map((file, index) => (
                    <React.Fragment key={index}>
                        <Grid item xs={6} sm={4} md={3} position="relative">
                            <img
                                src={URL.createObjectURL(file)}
                                alt={`foto-${index}`}
                                style={{
                                width: "100%",
                                borderRadius: 8,
                                objectFit: "cover",
                                height: "150px",
                                }}
                            />
                            <button
                                onClick={() => removeFotoClub(index)}
                                style={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                background: "rgba(255,255,255,0.8)",
                                border: "none",
                                borderRadius: "50%",
                                padding: 4,
                                cursor: "pointer",
                                }}
                            >
                                <span style={{ color: "#d32f2f" }}>❌ Borrar</span>
                            </button>
                        </Grid>
                    </React.Fragment>
                ))}
            </Grid>
        )}
    </>
  )
}

export default FotosGenerales
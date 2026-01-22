import React from 'react'
import {
  Box,
  Button,
  Divider,
  Typography,
  Input,
  Grid,
  MenuItem,
  TextField,
  Tooltip,
} from "@mui/material";

const FotosGenerales = ({
    handleFileChange,
    form,
    removeFotoClub,
    handleFormChange,
    setForm,
}) => {
  return (
    <>
        <Typography variant="h6" mb={2}>
            <u>🖼️ Foto de Portada del Club:</u>
        </Typography>
    
        <Typography variant="body1" mb={2}>
        Selecciona la imagen de portada para el perfil público de tu Club.
        </Typography>

        <Tooltip title="Sube una imagen de portada desde tu dispositivo" >
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
                ac1pt="image/*"
                onChange={handleFileChange}
                sx={{ display: "none" }}
            />
            </Button>
        </Tooltip>

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

        <Tooltip title="Sube mínimo 2 Fotos para la Galería Pública de tu Club" >
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
        </Tooltip>

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

        {form.tipo_club?.includes("cultivo") && (
            <>
                <Divider sx={{ my: 3, borderColor: "rgba(104, 64, 92, 0.57)" }} />
                
                <Typography variant="h6" mt={4} mb={2}>
                  <u>📸 Fotos de Verificación de las áreas de cultivo:</u>
                </Typography>
        
                <Typography
                  variant="body1"
                  mb={2}
                >
                  Toma en cuenta que los armarios de cultivo son de 1 x 1 m. y que requerirás pasillos por cada fila de armarios, por lo que en una zona de 3 x 3 caben hasta 7 plantas.
                  
                  Toma en cuenta también que uno de los armarios es para tu propio consumo, incluye también este armario e indica en total para cuántos armarios tienes espacio.
                  
                </Typography>
        
                <TextField
                  select
                  label="Número de armarios"
                  fullWidth
                  name="armarios"
                  value={form.armarios || ""}
                  onChange={handleFormChange}
                  margin="normal"
                  color="success"
                  helperText="Número de armarios"
                  sx={{ width: 280 }}
                >
                  {[...Array(11)].map((_, i) => {
                    const val = i + 2;
                    return (
                      <MenuItem key={val} value={val}>
                        {val}
                      </MenuItem>
                    );
                  })}
                </TextField>
        
                <Typography
                  variant="body1"
                  mb={2}
                  sx={{ fontStyle: "italic", color: "#59c054ff", fontSize: "0.85rem" }}
                >
                  <strong>Sube al menos 5 fotos</strong>
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
                    name="documentales"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    sx={{ display: "none" }}
                  />
                </Button>
        
                {form?.documentales && (
                  <Box mt={2}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontStyle: "italic", color: "#9c27b0", fontSize: "0.85rem" }}
                    >
                      Vista previa:
                    </Typography>
                    <img
                      src={URL.createObjectURL(form.documentales)}
                      alt="Vista previa fotos de verificación"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        marginTop: "8px",
                        borderRadius: 8,
                      }}
                    />
                  </Box>
                )}
        
                {form?.documentales?.length > 0 && (
                  <Grid container spacing={2} mt={2}>
                    {form.documentales.map((file, index) => (
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
        )}
        <Divider sx={{ my: 3, borderColor: "rgba(104, 64, 92, 0.57)" }} />
    </>
  )
}

export default FotosGenerales
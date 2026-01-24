import React from 'react'
import {
  Box,
  Button,
  Divider,
  Typography,
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormHelperText,
} from "@mui/material";

const CofeprisSection = ({
    consumoOption,
    selectConsumoOption,
    handleFormChange,
    setFocusedField,
    isActivaMembresia,
    form,
    handleNestedChange,
    user,
    goGeneradorLibre}) => {
  return (
    
        <>
          <Divider sx={{ my: 3, borderColor: "rgba(104, 64, 92, 0.57)" }} />

          <Typography variant="h6" mb={2}>
            <u>Permiso COFEPRIS / Trámite</u>
          </Typography>

          <Typography variant="body2" mb={2} sx={{ color: "#9c27b0" }}>
            Selecciona la opción que corresponda a tu situación.
          </Typography>

          <FormGroup>
            {/* Ya cuento con un folio (controlado por consumoOption) */}
            <FormControlLabel
              control={
                <Checkbox
                  name="opcFolio"
                  checked={consumoOption === "folio"}
                  onChange={() => selectConsumoOption("folio")}
                  color="success"
                />
              }
              label="✅ Ya cuento con un folio"
            />
            {consumoOption === "folio" && (
              <Box sx={{ pl: 4, pr: 2, pb: 1 }}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Ingresa el folio de tu trámite"
                  name="cofepris"
                  value={form.cofepris || ""}
                  onChange={handleFormChange}
                  onFocus={() => setFocusedField("cofepris")}
                  onBlur={() => setFocusedField(null)}
                  helperText="Cuando tengas el folio lo puedes ingresar aquí."
                  color="success"
                />
              </Box>
            )}

            {/* Solicitar gestión - solo si membresía activa.
                Controlado por consumoOption (sin botón; datos guardados en form) */}
            {typeof isActivaMembresia === "function" && isActivaMembresia() ? (
              <>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="opcGestion"
                      checked={consumoOption === "gestion"}
                      onChange={() => selectConsumoOption("gestion")}
                      color="success"
                    />
                  }
                  label="📝 Solicitar la gestión de mi trámite"
                />

                {consumoOption === "gestion" && (
                  <Box sx={{ pl: 4, pr: 2, pb: 2, borderLeft: "3px solid rgba(156,39,176,0.12)" }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Completa los datos para que generemos y gestionemos tu trámite.
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="CURP"
                          fullWidth
                          name="curp"
                          value={form.curp || ""}
                          onChange={handleFormChange}
                          margin="normal"
                          color="success"
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="RFC"
                          fullWidth
                          name="rfc"
                          value={form.rfc || ""}
                          onChange={handleFormChange}
                          margin="normal"
                          color="success"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="subtitle2">Domicilio para el trámite:</Typography>
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Checkbox
                                name="usarDireccionExistente"
                                checked={form.usarDireccionExistente ?? !!form?.direccion}
                                onChange={handleFormChange}
                                color="success"
                              />
                            }
                            label={form?.direccion ? "Usar domicilio que ya tenemos" : "No hay domicilio guardado"}
                          />
                          {(form.direccion && form.usarDireccionExistente) ? `${form.direccion}` : '' }
                        </FormGroup>

                        {!(form.usarDireccionExistente ?? !!form?.direccion) && (
                          <Box sx={{ mt: 1 }}>
                            <Grid container spacing={1}>
                              <Grid item xs={12} sm={8}>
                                <TextField
                                  label="Calle"
                                  fullWidth
                                  margin="dense"
                                  name="calle"
                                  value={form.direccionGestion?.calle || ""}
                                  onChange={handleNestedChange("direccionGestion")}
                                  color="success"
                                />
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <TextField
                                  label="Número"
                                  fullWidth
                                  margin="dense"
                                  name="numero"
                                  value={form.direccionGestion?.numero || ""}
                                  onChange={handleNestedChange("direccionGestion")}
                                  color="success"
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  label="Colonia"
                                  fullWidth
                                  margin="dense"
                                  name="colonia"
                                  value={form.direccionGestion?.colonia || ""}
                                  onChange={handleNestedChange("direccionGestion")}
                                  color="success"
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  label="Municipio / Alcaldía"
                                  fullWidth
                                  margin="dense"
                                  name="municipio"
                                  value={form.direccionGestion?.municipio || ""}
                                  onChange={handleNestedChange("direccionGestion")}
                                  color="success"
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  label="Estado"
                                  fullWidth
                                  margin="dense"
                                  name="estado"
                                  value={form.direccionGestion?.estado || ""}
                                  onChange={handleNestedChange("direccionGestion")}
                                  color="success"
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  label="Código Postal"
                                  fullWidth
                                  margin="dense"
                                  name="cp"
                                  value={form.direccionGestion?.cp || ""}
                                  onChange={handleNestedChange("direccionGestion")}
                                  color="success"
                                />
                              </Grid>
                            </Grid>
                          </Box>
                        )}
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Teléfono de contacto:</Typography>
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Checkbox
                                name="usarWhatsappExistente"
                                checked={form.usarWhatsappExistente ?? !!form?.whatsapp}
                                onChange={handleFormChange}
                                color="success"
                              />
                            }
                            label={form?.whatsapp ? `Usar whatsapp: ${form.whatsapp}` : "No hay whatsapp guardado"}
                          />
                        </FormGroup>
                        {!(form.usarWhatsappExistente ?? !!form?.whatsapp) && (
                          <TextField
                            label="Teléfono (ej. 55xxxxxxxx)"
                            fullWidth
                            margin="dense"
                            name="telefonoGestion"
                            value={form.telefonoGestion || ""}
                            onChange={handleFormChange}
                            color="success"
                          />
                        )}
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Correo electrónico:</Typography>
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Checkbox
                                name="usarEmailExistente"
                                checked={form.usarEmailExistente ?? !!user?.email}
                                onChange={handleFormChange}
                                color="success"
                              />
                            }
                            label={user?.email ? `Usar email: ${user.email}` : "No hay email de usuario"}
                          />
                        </FormGroup>
                        {!(form.usarEmailExistente ?? !!user?.email) && (
                          <TextField
                            label="Email de contacto"
                            fullWidth
                            margin="dense"
                            name="emailGestion"
                            value={form.emailGestion || ""}
                            onChange={handleFormChange}
                            color="success"
                          />
                        )}
                      </Grid>
                    </Grid>

                  </Box>
                )}
              </>
            ) : null}

            {/* Opción por mí mismo (siempre visible) */}
            <FormControlLabel
              control={
                <Checkbox
                  name="opcPorMi"
                  checked={consumoOption === "pormi"}
                  onChange={() => selectConsumoOption("pormi")}
                  color="success"
                />
              }
              label="🔧 Realizar el trámite por mí mismo con las herramientas del sitio"
            />

            {consumoOption === "pormi" && (
              <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Puedes generar tu escrito libre con el generador. Ahí mismo encontrarás el link para agendar cita y las instrucciones paso a paso.
                  Cuando tengas el folio regresa a este formulario y agrégalo en "Ya cuento con un folio".
                </Typography>

                <Button
                  variant="contained"
                  onClick={goGeneradorLibre}
                  sx={{
                    backgroundColor: "#6a1b9a",
                    "&:hover": { backgroundColor: "#4a148c" },
                    color: "#fff",
                  }}
                >
                  ✍️ Ir al Generador de Escrito Libre
                </Button>
              </Box>
            )}

            {(!isActivaMembresia || (typeof isActivaMembresia === "function" && !isActivaMembresia())) && (
              <FormHelperText sx={{ mt: 1 }}>
                Nota: la gestión por parte del equipo sólo está disponible si tu membresía está activa.
              </FormHelperText>
            )}
          </FormGroup>
        </>
      
  )
}

export default CofeprisSection